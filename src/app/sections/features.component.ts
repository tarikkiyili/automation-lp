import { TextPipe } from '../i18n/text.pipe';
import { afterNextRender, ChangeDetectorRef, Component, computed, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { ProblemComponent } from './problem.component';

@Component({
  selector: 'app-features',
  imports: [TextPipe, ProblemComponent],
  styleUrl: './features.component.css',
  template: `<app-problem />
    <div class="ambient-pattern">
    <section id="features" class="container feature-section" aria-labelledby="features-title">
      <div class="feature-intro">
        <p class="eyebrow">{{ "İŞİNİZİN ARKA PLANINDA" | t }}</p>
        <h2 id="features-title">{{ "Küçük detaylar." | t }}<br><em>{{ "Büyük bir rahatlık." | t }}</em></h2>
        <p>{{ "Randevunun öncesini, sonrasını ve aradaki tüm değişiklikleri düşünün. Her adımda işinizi kolaylaştıran bir düzen." | t }}</p>
      </div>
      <div class="feature-deck-area">
        <p class="deck-hint" [class.interacted]="interacted()"><svg viewBox="0 0 28 28" aria-hidden="true"><circle class="tap-ring" cx="12" cy="8" r="6"/><path class="tap-hand" d="M10 17V8a2 2 0 0 1 4 0v6l2-1 3 1 3 2v5l-3 4h-7l-6-7a2 2 0 0 1 3-2l1 1Z"/></svg><span class="desktop-hint">{{ "Bir kart seçin, detaylarını keşfedin." | t }}</span><span class="mobile-hint">{{ "Bir karta dokunun, detayları keşfedin." | t }}</span></p>
        <div class="feature-deck" [attr.aria-label]="'İşletmeniz için özellik kartları' | t">
          @for (feature of orderedFeatures(); track feature.label; let position = $index) {
            <article class="deck-card" [attr.data-card]="feature.index" [class.front]="active() === feature.index" [style.--position]="position" [style.z-index]="position + 1">
              <h3 class="card-tab"><button type="button" [id]="'deck-tab-' + feature.index" [attr.aria-expanded]="active() === feature.index" [attr.aria-controls]="'deck-detail-' + feature.index" (click)="select(feature.index)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="feature.path"/></svg><span>{{ ( feature.label ) | t }}</span><span class="expand-mark" aria-hidden="true">{{ ( active() === feature.index ? '−' : '+' ) | t }}</span>
              </button></h3>
              <div class="deck-detail" [id]="'deck-detail-' + feature.index" [hidden]="active() !== feature.index" role="region" [attr.aria-labelledby]="'deck-tab-' + feature.index">
                <span class="feature-kicker">{{ ( feature.kicker ) | t }}</span><p class="deck-title">{{ ( feature.title ) | t }}</p><p class="deck-description">{{ ( feature.description ) | t }}</p>
              </div>
            </article>
          }
        </div>
      </div>
    </section></div>`,
})
export class FeaturesComponent {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private motions: Animation[] = [];
  constructor() {
    this.destroyRef.onDestroy(() => this.motions.forEach(motion => motion.cancel()));
    afterNextRender(() => {
      const hint = this.host.nativeElement.querySelector('.deck-hint')!;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) { hint.classList.add('hint-ready'); observer.disconnect(); }
      }, { threshold: .5 });
      observer.observe(hint);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
  readonly active = signal(0);
  readonly interacted = signal(false);
  readonly orderedFeatures = computed(() => this.features.map((feature, index) => ({ ...feature, index })).sort((a, b) => Number(a.index === this.active()) - Number(b.index === this.active())));
  select(index: number) {
    this.interacted.set(true);
    if (index === this.active()) return;
    const cards = Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('.deck-card'));
    // Capture the current visual position, including any interrupted animation.
    const before = new Map(cards.map(card => [card, card.getBoundingClientRect()]));
    this.motions.forEach(motion => motion.cancel());
    this.motions = [];
    this.active.set(index);
    this.changeDetector.detectChanges();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    for (const card of cards) {
      const from = before.get(card)!;
      const to = card.getBoundingClientRect();
      const position = Number(card.style.getPropertyValue('--position'));
      const step = window.innerWidth <= 680 ? 52 : 56;
      const endY = position * step;
      const startY = endY + from.top - to.top;
      const dx = from.left - to.left;
      const scale = from.width / to.width;
      const selected = Number(card.dataset['card']) === index;
      const lift = window.innerWidth <= 680 ? 18 : 26;
      const frames: Keyframe[] = selected ? [
        { offset: 0, transform: `translate(${dx}px, ${startY}px) scaleX(${scale})`, boxShadow: '0 5px 14px #142b500c' },
        { offset: .28, transform: `translate(${dx - 3}px, ${startY - lift}px) scale(1.018) rotate(-.6deg)`, boxShadow: '0 26px 48px #142b502b' },
        { offset: .78, transform: `translate(0, ${endY + 4}px) scale(1.004)`, boxShadow: '0 20px 38px #142b5020' },
        { offset: 1, transform: `translateY(${endY}px)`, boxShadow: '0 16px 36px #142b5010' },
      ] : [
        { offset: 0, transform: `translate(${dx}px, ${startY}px) scaleX(${scale})` },
        { offset: .72, transform: `translateY(${endY - 3}px) scale(.996)` },
        { offset: 1, transform: `translateY(${endY}px) scale(1)` },
      ];
      this.motions.push(card.animate(frames, {
        duration: selected ? 760 : 620,
        delay: selected ? 0 : 55 + position * 25,
        easing: 'cubic-bezier(.22,.61,.36,1)',
        fill: 'backwards',
      }));
    }
  }
  readonly features = [
    { label: 'Online randevu', kicker: 'HER AN ERİŞİLEBİLİR', title: 'Randevu almak kolaylaşır.', description: 'Müşterileriniz uygun gün ve saati kendileri seçer. Siz telefon ve mesaj trafiğiyle bölünmeden işinize devam edersiniz.', path: 'M8 3v4m8-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1ZM8 14h2m4 0h2m-8 3h2' },
    { label: 'Otomatik hatırlatma', kicker: 'ZAMANINDA İLETİŞİM', title: 'Hatırlatmalar sizi beklemez.', description: 'Randevu öncesi bilgilendirmeler belirlediğiniz akışla iletilir. Her müşteri için yeniden mesaj hazırlamanız gerekmez.', path: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4' },
    { label: 'Ekip takvimi', kicker: 'EKİP İÇİN NETLİK', title: 'Herkes planını bilir.', description: 'Çalışanların uygun saatleri ve randevuları aynı yerde toplanır. Günlük iş yükünü görür, görev dağılımını daha rahat planlarsınız.', path: 'M3 4h18v16H3ZM3 9h18M9 9v11m6-11v11M7 2v4m10-4v4' },
    { label: 'Esnek planlama', kicker: 'DEĞİŞİKLİKLERE HAZIR', title: 'Günün akışı korunur.', description: 'İptal ve saat değişikliklerini tek yerden yönetin. Planlar değiştiğinde ekibiniz güncel programa kolayca ulaşsın.', path: 'M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4' },
  ];
}
