import { TextPipe } from '../i18n/text.pipe';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { PreferencesComponent } from './preferences.component';
@Component({
  selector: 'app-header',
  imports: [TextPipe, PreferencesComponent],
  styleUrl: './header.component.css',
  template: `<header class="header-shell" [class.compact]="compact()" (focusout)="onFocusOut($event)">
    <div class="container site-header">
      <a href="#main" class="brand" [attr.aria-label]="'Randevu ana bölüm' | t" (click)="closeMenu()"><span aria-hidden="true">{{ "r." | t }}</span> {{ "randevu" | t }}</a>
      <nav class="desktop-nav" [attr.aria-label]="'Ana menü' | t">
        <a href="#features">{{ "Özellikler" | t }}</a><a href="#how">{{ "Nasıl çalışır?" | t }}</a><a href="#faq">{{ "Sık sorulanlar" | t }}</a>
      </nav>
      <div class="header-actions">
        <app-preferences class="desktop-preferences" />
        <span class="demo-scene">
        <a class="button small demo-button" href="#request" (click)="closeMenu()">
          <span class="desktop-label">{{ "Demo Talebi Oluştur" | t }}</span><span class="mobile-label">{{ "Demo Talebi" | t }}</span>
        </a>
          <svg class="watch-arm" viewBox="0 0 100 54" aria-hidden="true" focusable="false">
            <!-- A tailored cuff, a hand and an analogue watch; decorative only. -->
            <path d="M0 12 37 15 40 42 0 46Z" fill="#142b50"/>
            <path d="m0 17 34 2M0 41l34-3" stroke="#2c4364" stroke-width="1"/>
            <path d="m34 16 12 1v23l-10 2Z" fill="#f8fafc" stroke="#c6d3e3" stroke-width=".8"/>
            <path d="M44 20c9 0 15 0 21-3l7-4c3-2 6 1 4 4l-4 5 16 1c5 0 8 3 7 6l-2 7c-1 5-5 7-10 6l-18-3-21-2Z" fill="#d9b69d" stroke="#b89076" stroke-width=".8" stroke-linejoin="round"/>
            <path d="m77 27 16 1m-16 4 15 1m-15 4 13 1m-23-15 5-1" stroke="#bb947b" stroke-width=".8" stroke-linecap="round"/>
            <path d="M52 16h11v27H52Z" fill="#8798ad"/>
            <path d="M53 17h9m-9 3h9m-9 19h9m-9 3h9" stroke="#c9d2df" stroke-width="1"/>
            <rect x="46" y="18" width="23" height="23" rx="8" fill="#dce3eb" stroke="#71839d" stroke-width="1"/>
            <path d="M69 27v5" stroke="#71839d" stroke-width="2" stroke-linecap="round"/>
            <circle cx="57.5" cy="29.5" r="9" fill="#fff"/>
            <path d="M57.5 22v1m0 13v1M50 29.5h1m13 0h1" stroke="#71839d" stroke-width="1.2"/>
            <path class="watch-hour" d="M57.5 29.5v-4" fill="none" stroke="#142b50" stroke-width="2" stroke-linecap="round"/>
            <path class="watch-minute" d="M57.5 29.5v-6" fill="none" stroke="#365a8c" stroke-width="1.3" stroke-linecap="round"/>
            <circle cx="57.5" cy="29.5" r="1.3" fill="#142b50"/>
            <circle cx="39" cy="35" r="1.5" fill="#71839d"/>
          </svg>
        </span>
        <button class="menu-toggle" type="button" [attr.aria-expanded]="menuOpen()" aria-controls="mobile-menu" [attr.aria-label]="(menuOpen() ? 'Menüyü kapat' : 'Menüyü aç') | t" (click)="toggleMenu()">
          <span class="menu-lines" [class.open]="menuOpen()" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>
      </div>
      <nav id="mobile-menu" class="mobile-nav" [attr.aria-label]="'Mobil menü' | t" [hidden]="!menuOpen()">
        <a href="#features" (click)="navigate('features')">{{ "Özellikler" | t }}</a>
        <a href="#how" (click)="navigate('how')">{{ "Nasıl çalışır?" | t }}</a>
        <a href="#faq" (click)="navigate('faq')">{{ "Sık sorulanlar" | t }}</a>
        <div class="mobile-preferences"><app-preferences /></div>
      </nav>
    </div>
  </header>`,
})
export class HeaderComponent {
  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);
  readonly menuOpen = signal(false);
  readonly compact = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.compact.set(window.scrollY > 40);
  }

  toggleMenu() { this.menuOpen.update(open => !open); }
  closeMenu() { this.menuOpen.set(false); }

  navigate(id: string) {
    this.closeMenu();
    // Move focus out of the hidden menu without disrupting anchor scrolling.
    const section = document.getElementById(id);
    section?.setAttribute('tabindex', '-1');
    section?.focus({ preventScroll: true });
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (!this.menuOpen()) return;
    this.closeMenu();
    this.element.nativeElement.querySelector<HTMLButtonElement>('.menu-toggle')?.focus();
  }

  @HostListener('document:pointerdown', ['$event'])
  onOutsideClick(event: PointerEvent) {
    if (!this.element.nativeElement.contains(event.target as Node)) this.closeMenu();
  }

  onFocusOut(event: FocusEvent) {
    if (event.relatedTarget && !this.element.nativeElement.contains(event.relatedTarget as Node)) this.closeMenu();
  }

  @HostListener('window:resize')
  onResize() { if (window.innerWidth > 1040) this.closeMenu(); }
}
