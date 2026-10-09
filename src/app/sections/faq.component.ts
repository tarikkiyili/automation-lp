import { PreferencesService } from '../i18n/preferences.service';
import { TextPipe } from '../i18n/text.pipe';
import { afterNextRender, Component, computed, effect, untracked, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { FaqAccordionDirective } from './faq-accordion.directive';
import { FAQ_ENTRIES, FEATURED_FAQ_IDS } from './faq.data';

function normalize(text: string): string {
  return text.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}


@Component({
  selector: 'app-faq',
  imports: [TextPipe, FaqAccordionDirective],
  styleUrl: './faq.component.css',
  template: `<section id="faq" class="container section faq" aria-labelledby="faq-title">
    <div class="faq-intro"><p class="eyebrow">{{ "MERAK ETTİKLERİNİZ" | t }}</p><h2 id="faq-title">{{ "Sık Sorulan Sorular" | t }}</h2></div>
    <div class="faq-search">
      <label for="faq-search-input">{{ "Sorular içinde ara" | t }}</label>
      <div class="search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
        <input #searchInput id="faq-search-input" type="search" autocomplete="off" maxlength="160"
          [value]="query()" [placeholder]="placeholder()" aria-controls="faq-results"
          (input)="onInput(searchInput.value)" (focus)="onFocus()" (blur)="onBlur()" (compositionstart)="composing = true" (compositionend)="onCompositionEnd(searchInput.value)">
        @if (query()) { <button type="button" class="clear-search" [attr.aria-label]="'Aramayı temizle' | t" (click)="clearSearch(); searchInput.focus()">×</button> }
      </div>

    </div>
    <div class="results-heading"><h3>{{ ( searching() ? 'Arama sonuçları' : 'En çok merak edilenler' ) | t }}</h3>
      <p aria-live="polite" aria-atomic="true">@if (searching()) { {{ results().length }} {{ 'yanıt bulundu' | t }} }</p></div>
    <div id="faq-results" class="faq-results">
      @for (item of visibleResults(); track item.id) {
        <details [faqExpanded]="openQuestion() === item.id" (faqToggle)="toggleQuestion(item.id)">
          <summary><span>{{ ( item.question ) | t }}</span><span class="expand-icon" aria-hidden="true"></span></summary>
          <div class="answer"><p>{{ ( item.answer ) | t }}</p></div>
        </details>
      } @empty {
        <div class="empty-results"><h3>{{ "Bu aramada bir yanıt bulamadık." | t }}</h3><p>{{ "Daha kısa veya farklı kelimeler deneyin. Sorunuzu talep formunda da paylaşabilirsiniz." | t }}</p>
          <button type="button" class="reset-search" (click)="clearSearch(); searchInput.focus()">{{ "Sık sorulanlara dön" | t }}</button></div>
      }
    </div>
    @if (visibleResults().length < results().length) { <button type="button" class="load-more" (click)="limit.set(limit() + 8)">{{ "Daha fazla yanıt göster" | t }} <span aria-hidden="true">+</span></button> }
    <p class="faq-footer"><a href="#request">{{ "Sorunuzu iletmek için tıklayın." | t }}</a></p>
  </section>`,
})
export class FaqComponent {
  private readonly preferences = inject(PreferencesService);
  private readonly searchIndex = computed(() => FAQ_ENTRIES.map(entry => {
    const question = this.preferences.t(entry.question);
    const answer = this.preferences.t(entry.answer);
    return { entry, title: normalize(question), text: normalize(`${question} ${answer} ${this.preferences.t(entry.keywords)} ${this.preferences.t(entry.category)} ${entry.keywords}`) };
  }));
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly query = signal('');
  readonly openQuestion = signal<number | null>(null);
  private readonly settledQuery = signal('');
  readonly limit = signal(8);
  readonly searching = computed(() => normalize(this.settledQuery()).length > 0);
  readonly results = computed(() => {
    const tokens = normalize(this.settledQuery()).split(' ').filter(Boolean);
    if (!tokens.length) return FEATURED_FAQ_IDS.map(id => FAQ_ENTRIES[id]);
    return this.searchIndex().filter(item => tokens.every(token => item.text.includes(token)))
      .map(item => ({ entry: item.entry, score: tokens.filter(token => item.title.includes(token)).length }))
      .sort((a, b) => b.score - a.score || a.entry.id - b.entry.id).map(item => item.entry);
  });
  readonly visibleResults = computed(() => this.results().slice(0, this.limit()));
  private get defaultPlaceholder() { return this.preferences.t('Aklınızdaki soruyu yazın…'); }
  readonly placeholder = signal(this.defaultPlaceholder);
  private get phrases() { return [this.defaultPlaceholder, ...['Örnek: Randevu iptal süresi', 'Örnek: Google Takvim', 'Örnek: Fiyatlandırma'].map(s => this.preferences.t(s))]; }
  private searchTimer?: ReturnType<typeof setTimeout>;
  private animationTimer?: ReturnType<typeof setTimeout>;
  private focused = false;
  private inView = false;
  private reducedMotion = false;
  private phraseIndex = 0;
  private characterIndex = 0;
  private deleting = false;
  composing = false;

  constructor() {
    effect(() => { this.preferences.language(); untracked(() => this.restartPlaceholder()); });
    afterNextRender(() => {
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion = motion.matches;
      const observer = new IntersectionObserver(([entry]) => { this.inView = entry.isIntersecting; this.restartPlaceholder(); });
      observer.observe(this.element.nativeElement);
      const onMotion = () => { this.reducedMotion = motion.matches; this.restartPlaceholder(); };
      const onVisibility = () => this.restartPlaceholder();
      motion.addEventListener('change', onMotion);
      document.addEventListener('visibilitychange', onVisibility);
      this.destroyRef.onDestroy(() => {
        observer.disconnect(); motion.removeEventListener('change', onMotion);
        document.removeEventListener('visibilitychange', onVisibility);
      });
    });
    this.destroyRef.onDestroy(() => { clearTimeout(this.searchTimer); clearTimeout(this.animationTimer); });
  }

  onInput(value: string) {
    this.query.set(value);
    this.openQuestion.set(null);
    clearTimeout(this.searchTimer);
    clearTimeout(this.animationTimer);
    this.placeholder.set(this.defaultPlaceholder);
    if (this.composing) return;
    if (!value.trim()) { this.settledQuery.set(''); this.limit.set(8); return; }
    this.searchTimer = setTimeout(() => { this.settledQuery.set(value); this.limit.set(8); }, 250);
  }
  onCompositionEnd(value: string) { this.composing = false; this.onInput(value); }
  toggleQuestion(id: number) { this.openQuestion.update(current => current === id ? null : id); }
  clearSearch() { this.composing = false; this.onInput(''); }
  onFocus() { this.focused = true; this.restartPlaceholder(); }
  onBlur() { this.focused = false; this.restartPlaceholder(); }

  private restartPlaceholder() {
    clearTimeout(this.animationTimer);
    this.placeholder.set(this.defaultPlaceholder);
    if (this.focused || this.query() || this.reducedMotion || !this.inView || document.hidden) return;
    this.phraseIndex = 0; this.characterIndex = this.defaultPlaceholder.length; this.deleting = true;
    this.animationTimer = setTimeout(() => this.animatePlaceholder(), 2200);
  }
  private animatePlaceholder() {
    const phrase = this.phrases[this.phraseIndex];
    this.characterIndex += this.deleting ? -1 : 1;
    this.placeholder.set(phrase.slice(0, this.characterIndex));
    let delay = this.deleting ? 35 : 75;
    if (this.characterIndex === 0) { this.deleting = false; this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length; delay = 350; }
    else if (this.characterIndex === phrase.length && !this.deleting) { this.deleting = true; delay = 2200; }
    this.animationTimer = setTimeout(() => this.animatePlaceholder(), delay);
  }
}
