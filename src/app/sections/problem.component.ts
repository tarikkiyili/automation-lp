import { TextPipe } from '../i18n/text.pipe';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';

@Component({
  selector: 'app-problem',
  imports: [TextPipe],
  styleUrl: './problem.component.css',
  template: `<section class="problem-band" aria-labelledby="problem-title">
    <div class="container">
      <div class="section-intro"><div><p class="eyebrow">{{ "İŞİNİZE ODAKLANMANIZ İÇİN" | t }}</p>
        <h2 id="problem-title">{{ "Daha az takip." | t }}<br><em>{{ "Daha düzenli bir gün." | t }}</em></h2></div>

      </div>
      <div class="slider" role="region" [attr.aria-roledescription]="'slayt gösterisi' | t" [attr.aria-label]="'Randevu yönetimi çözümleri' | t" (keydown)="onKey($event)" (touchstart)="touchStart($event)" (touchend)="touchEnd($event)">
        <div class="slider-controls"><div class="slide-dots" role="group" [attr.aria-label]="'Slayt seçimi' | t">
          @for (slide of slides; track slide.id; let i = $index) {<button type="button" class="slide-dot" [class.selected]="active() === i" [attr.aria-current]="active() === i ? 'true' : null" [attr.aria-label]="(slide.title | t) + ' ' + ('slaydını göster' | t)" (click)="select(i)"><span></span></button>}
        </div><span class="slide-counter" aria-live="polite" aria-atomic="true">0{{ ( active() + 1 ) | t }} <span>/ 03</span></span><div class="slide-arrows"><button type="button" [attr.aria-label]="'Önceki slayt' | t" (click)="move(-1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg></button><button type="button" [attr.aria-label]="'Sonraki slayt' | t" (click)="move(1)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg></button></div></div>
        <div class="slide-window" [class.played]="visible()">
          @for (slide of [slides[active()]]; track slide.id) {
            <article class="solution-card" role="group" [attr.aria-roledescription]="'slayt' | t" [attr.aria-label]="(active() + 1) + ' / 3: ' + (slide.title | t)">
              <div class="card-copy"><span class="category">{{ ( slide.category ) | t }}</span><h3>{{ ( slide.title ) | t }}</h3><p>{{ ( slide.description ) | t }}</p><span class="card-benefit"><span aria-hidden="true">✓</span> {{ ( slide.benefit ) | t }}</span></div>
              <div class="scene" [class]="'scene scene-' + slide.id" role="img" [attr.aria-label]="(slide.visualLabel) | t">
                @switch (slide.id) {
                  @case ('calendar') {
                    <div class="calendar-visual" aria-hidden="true">
                      <div class="date-header"><span>{{ "RANDEVU TAKVİMİ" | t }}</span><span>{{ "EKİM" | t }}</span></div>
                      <div class="calendar-paper"><span class="binding left"></span><span class="binding right"></span>
                        <div class="date-page next-page"><span>{{ "EKİM" | t }}</span><strong>25</strong><small>{{ "Yeni bir gün, hazır bir plan." | t }}</small></div>
                        <div class="date-page turning-page"><span>{{ "EKİM" | t }}</span><strong>24</strong><small>{{ "Her şey takviminizde." | t }}</small></div>
                      </div>
                      <div class="calendar-receipt"><span class="receipt-check">✓</span><div><strong>{{ "Ön görüşme" | t }}</strong><span>{{ "Deniz · 14.00" | t }}</span></div><span class="receipt-status">{{ "Planlandı" | t }}</span></div>
                    </div>
                  }
                  @case ('reminder') {
                    <div class="reminder-visual" aria-hidden="true">
                      <div class="reminder-clock"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="20"/><path class="clock-hand" d="M24 24V11"/><path d="m24 24 8 5"/></svg></div>
                      <div class="reminder-card"><div class="reminder-top"><span class="bell"><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></svg></span><div><strong>{{ "Randevu hatırlatması" | t }}</strong><small>{{ "Deniz için" | t }}</small></div><span class="now">{{ "Şimdi" | t }}</span></div>
                        <p>{{ "Yarın saat 14.00 için randevunuz bulunuyor." | t }}</p>
                        <div class="confirmation"><span class="sent">{{ "Hatırlatma iletildi" | t }}</span><span class="confirmed"><span>✓</span> {{ "Randevu onaylandı" | t }}</span></div>
                      </div><span class="delivery-line"></span>
                    </div>
                  }
                  @case ('reschedule') {
                    <div class="reschedule-visual" aria-hidden="true"><div class="date-header"><span>{{ "GÜNLÜK PROGRAM" | t }}</span><span>{{ "25 EKİM" | t }}</span></div>
                      <div class="time-grid"><div class="slot"><span>14.00</span><div></div></div><div class="slot"><span>14.45</span><div></div></div><div class="slot"><span>15.30</span><div></div></div>
                        <div class="moving-booking"><div><strong>{{ "Deniz" | t }}</strong><span>{{ "Ön görüşme · 30 dk" | t }}</span></div><span class="booking-check">✓</span></div>
                      </div><div class="reschedule-status"><span>✓</span> {{ "Yeni saat takvime işlendi." | t }}</div>
                    </div>
                  }
                }
              </div>
            </article>
          }
        </div>

      </div>
    </div>
  </section>`,
})
export class ProblemComponent {
  readonly active = signal(0);
  readonly visible = signal(false);
  readonly slides = [
    { id: 'calendar', category: 'MERKEZİ TAKİP', title: 'Her yeni güne, düzenli bir başlangıç.', description: 'Randevularınızı tek takvimde toplayın. Günler değişse de ekibinizin planı net kalsın.', benefit: 'Tüm randevular tek bir yerde.', visualLabel: 'Takvim yaprağı 24 Ekim’den 25 Ekim’e dönüyor; planlanmış randevu takvimde kalıyor.' },
    { id: 'reminder', category: 'OTOMATİK HATIRLATMA', title: 'Siz hatırlatmadan, onlar hatırlasın.', description: 'Müşterilerinizi otomatik hatırlatmalarla bilgilendirin. Mesaj takibi yerine hizmetinize zaman ayırın.', benefit: 'Zamanında bildirim, daha az takip.', visualLabel: 'Saat ilerliyor, randevu hatırlatması geliyor ve onay işareti beliriyor.' },
    { id: 'reschedule', category: 'ESNEK PLANLAMA', title: 'Plan değişsin, düzeniniz değişmesin.', description: 'Randevuyu uygun bir saate taşıyın. Ekibiniz değişen planı tek takvimden takip etsin.', benefit: 'Değişen saatlere kolayca uyum sağlayın.', visualLabel: 'Randevu 14.00’ten 15.30’a taşınıyor ve yeni saat onaylanıyor.' },
  ];
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private touchX = 0;
  private touchY = 0;
  constructor() {
    afterNextRender(() => {
      const observer = new IntersectionObserver(([entry]) => this.visible.set(entry.isIntersecting), { threshold: .25 });
      observer.observe(this.host.nativeElement.querySelector('.slide-window')!);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
  select(index: number) { this.active.set(index); }
  move(direction: number) { this.select((this.active() + direction + this.slides.length) % this.slides.length); }
  onKey(event: KeyboardEvent) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    this.move(event.key === 'ArrowRight' ? 1 : -1);
  }
  touchStart(event: TouchEvent) { this.touchX = event.changedTouches[0].clientX; this.touchY = event.changedTouches[0].clientY; }
  touchEnd(event: TouchEvent) {
    const dx = event.changedTouches[0].clientX - this.touchX;
    const dy = event.changedTouches[0].clientY - this.touchY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) this.move(dx < 0 ? 1 : -1);
  }
}
