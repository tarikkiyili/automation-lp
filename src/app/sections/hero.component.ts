import { TextPipe } from '../i18n/text.pipe';
import { afterNextRender, Component, DestroyRef, ElementRef, inject, signal } from '@angular/core';
@Component({
  selector: 'app-hero',
  imports: [TextPipe],
  styleUrl: './hero.component.css',
  template: `<section class="container hero" aria-labelledby="hero-title">
    <div><p class="eyebrow">{{ "İŞLETMENİZ İÇİN RANDEVU OTOMASYONU" | t }}</p>
      <h1 id="hero-title">{{ "Randevularınızı yönetin." | t }}<br><em>{{ "İşletmenize zaman ayırın." | t }}</em></h1>
      <p class="lead">{{ "Randevularınızı ve ekibinizin takvimini tek bir yerden yönetin. Otomatik hatırlatmalarla günlük takip işlerini azaltın, hizmetinize odaklanın." | t }}</p>
      <div class="actions"><a class="button" href="#request">{{ "Demo talebi oluştur" | t }}</a><a class="text-link" href="#how">{{ "Nasıl çalışır?" | t }}</a></div>
      <p class="muted hero-note">{{ "Randevuyla hizmet veren işletmeler için." | t }}</p>
    </div>
    <div class="calendar-scene" [class.motion-paused]="paused() || !visible()"><div class="calendar" role="region" [attr.aria-label]="'Kurgusal günlük randevu takvimi; animasyonlar temsili test verisidir.' | t">
      <div class="calendar-heading"><span class="brand">{{ "randevu" | t }}</span><button class="motion-toggle" type="button" [attr.aria-pressed]="paused()" [attr.aria-label]="'Takvim animasyonunu duraklat' | t" (click)="paused.set(!paused())">{{ ( paused() ? 'Devam et' : 'Duraklat' ) | t }}</button></div>
      <div class="calendar-date"><div><span class="eyebrow">{{ "GÜNLÜK PLAN" | t }}</span><h2>{{ "Randevulara genel bakış." | t }}</h2></div><span aria-hidden="true">✳</span></div>
      <div class="schedule-window"><div class="schedule-list" [class.arriving]="arriving()" aria-live="off">
        @for (item of appointments(); track item.id; let first = $first) {
          <div class="schedule-row" [class.new-row]="first && arriving()">
            <div class="time">{{ ( item.time ) | t }}</div>
            <div class="appointment" [class.light]="item.light"><strong>{{ ( item.title ) | t }} · {{ ( item.name ) | t }}</strong><span>{{ "Sorumlu:" | t }} {{ ( item.owner ) | t }} · {{ ( item.duration ) | t }} {{ "dk" | t }}</span>@if (first && arriving()) {<small class="new-label">{{ "Yeni randevu" | t }}</small>}</div>
          </div>
        }
      </div></div>
      <div class="notification"><span aria-hidden="true">✓</span><div><strong>{{ "Otomatik randevu hatırlatması" | t }}</strong></div></div>
    </div><p class="scene-caption">{{ "Randevularınız ve ekibinizin programı tek bir takvimde." | t }}</p></div>
  </section>`,
})
export class HeroComponent {
  readonly paused = signal(false);
  readonly visible = signal(false);
  readonly arriving = signal(false);
  readonly appointments = signal([
    { id: 0, time: '09.00', title: 'Ön görüşme', name: 'Deniz', owner: 'Ece', duration: 45, light: false },
    { id: 1, time: '10.00', title: 'Danışmanlık', name: 'Ada', owner: 'Can', duration: 60, light: true },
    { id: 2, time: '11.00', title: 'Hizmet randevusu', name: 'Yağmur', owner: 'Ece', duration: 90, light: false },
  ]);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      let count = 3;
      let settle: ReturnType<typeof setTimeout> | undefined;
      let firstArrival: ReturnType<typeof setTimeout> | undefined;
      let timer: ReturnType<typeof setInterval> | undefined;
      let started = false;
      const addAppointment = () => {
        if (this.paused() || !this.visible() || motion.matches || document.hidden) return;
        const examples = [
          { time: '13.30', title: 'Ön görüşme', name: 'Selin', owner: 'Can', duration: 30, light: false },
          { time: '14.00', title: 'Danışmanlık', name: 'Arda', owner: 'Ece', duration: 60, light: true },
          { time: '15.30', title: 'Hizmet randevusu', name: 'Duru', owner: 'Can', duration: 45, light: false },
        ];
        const next = { ...examples[(count - 3) % examples.length], id: count++ };
        this.arriving.set(true);
        this.appointments.update(items => [next, ...items.slice(0, 2)]);
        settle = setTimeout(() => this.arriving.set(false), 1800);
      };
      const observer = new IntersectionObserver(([entry]) => {
        this.visible.set(entry.isIntersecting);
        if (entry.isIntersecting && !started) {
          started = true;
          firstArrival = setTimeout(() => {
            addAppointment();
            timer = setInterval(addAppointment, 3000);
          }, 800);
        }
      }, { threshold: .15 });
      observer.observe(this.host.nativeElement.querySelector('.calendar-scene')!);
      this.destroyRef.onDestroy(() => { clearInterval(timer); clearTimeout(firstArrival); clearTimeout(settle); observer.disconnect(); });
    });
  }
}
