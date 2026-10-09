import { afterNextRender, Injectable, Injector, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { translationKey } from '../../../shared/translation-key.js';

export type Language = 'tr' | 'en';
export type Theme = 'light' | 'dark';
@Injectable({providedIn: 'root'})
export class PreferencesService {
  private readonly transloco = inject(TranslocoService);
  private readonly injector = inject(Injector);
  private themeTimer?: ReturnType<typeof setTimeout>;
  readonly language = signal<Language>('tr');
  readonly theme = signal<Theme>('light');
  readonly loading = signal(false);
  readonly error = signal('');
  private read(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } }
  private save(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Preferences still work without storage. */ } }
  async init() {
    const storedTheme = this.read('randevu.theme');
    this.setTheme(storedTheme === 'dark' ? 'dark' : 'light', false);
    const lang = this.read('randevu.language') === 'en' ? 'en' : 'tr';
    await this.setLanguage(lang, false);
  }
  async setLanguage(language: Language, persist = true) {
    if (this.loading()) return;
    this.loading.set(true); this.error.set('');
    let fade: Animation | undefined;
    const root = document.querySelector<HTMLElement>('app-root');
    try {
      await firstValueFrom(this.transloco.load(language));
      const animate = persist && language !== this.language() && root && !document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (animate) {
        fade = root.animate([{opacity: 1}, {opacity: 0}], {duration: 140, easing: 'ease-in', fill: 'forwards'});
        await fade.finished;
      }
      this.transloco.setActiveLang(language);
      this.language.set(language);
      document.documentElement.lang = language;
      document.title = language === 'tr' ? 'Randevu — İşinize zaman ayırın' : 'Randevu — Make time for your business';
      document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'tr' ? 'İşletmeniz için randevu yönetimi, ekip planlama ve otomasyon.' : 'Appointment management, team scheduling and automation for your business.');
      if (persist) this.save('randevu.language', language);
      if (animate) {
        await new Promise<void>(resolve => afterNextRender(() => resolve(), {injector: this.injector}));
        fade?.cancel();
        fade = root.animate([{opacity: 0}, {opacity: 1}], {duration: 220, easing: 'ease-out'});
        await fade.finished;
      }
    } catch {
      this.error.set(this.language() === 'tr' ? 'Dil yüklenemedi. Tekrar deneyin.' : 'Unable to load the language. Please retry.');
    } finally { fade?.cancel(); this.loading.set(false); }
  }
  setTheme(theme: Theme, persist = true) {
    clearTimeout(this.themeTimer);
    const animate = persist && theme !== this.theme() && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.toggle('theme-transition', animate);
    if (animate) {
      void document.documentElement.offsetWidth;
      this.themeTimer = setTimeout(() => document.documentElement.classList.remove('theme-transition'), 380);
    }
    this.theme.set(theme); document.documentElement.dataset['theme'] = theme;
    document.documentElement.style.colorScheme = theme;
    if (persist) this.save('randevu.theme', theme);
  }
  toggleTheme() { this.setTheme(this.theme() === 'light' ? 'dark' : 'light'); }
  t(value: unknown): string {
    this.language();
    if (value == null) return '';
    const text = String(value);
    const key = translationKey(text);
    const dictionary = this.transloco.getTranslation(this.language());
    return dictionary[key] == null ? text : this.transloco.translate(key, {}, this.language());
  }
}
