import { Component, inject } from '@angular/core';
import { TextPipe } from '../i18n/text.pipe';
import { PreferencesService } from '../i18n/preferences.service';
@Component({
 selector: 'app-preferences', imports: [TextPipe],
 template: `<div class="preferences" role="group" [attr.aria-label]="'Dil ve görünüm' | t">
   <button type="button" class="language-toggle" [disabled]="prefs.loading()" [attr.aria-label]="('Dili değiştir' | t) + ': ' + (prefs.language() === 'tr' ? 'English' : 'Türkçe')" (click)="prefs.setLanguage(prefs.language() === 'tr' ? 'en' : 'tr')">
     <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z"/></svg><span>{{ prefs.language() === 'tr' ? 'TR' : 'EN' }}</span>
   </button><span class="divider" aria-hidden="true"></span>
   <button type="button" class="theme-toggle" [attr.aria-label]="(prefs.theme() === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç') | t" (click)="prefs.toggleTheme()">
     @if (prefs.theme() === 'light') {<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14a8 8 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z"/></svg>}
     @else {<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>}
     <span class="theme-label">{{ (prefs.theme() === 'light' ? 'Açık tema' : 'Koyu tema') | t }}</span>
   </button>
   @if(prefs.error()) {<span class="preference-error" aria-live="polite">{{ prefs.error() }}</span>}
 </div>`,
 styles: `:host{display:block}.preferences{position:relative;display:flex;align-items:center;gap:4px}button{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:44px;padding:8px;border:0;border-radius:7px;background:transparent;color:var(--muted);font:inherit;font-size:12px;font-weight:600;cursor:pointer}button:hover{background:var(--surface-soft);color:var(--ink)}button:disabled{cursor:wait;opacity:.6}svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.divider{height:18px;width:1px;background:var(--line)}.theme-label{display:none}.preference-error{position:absolute;top:100%;right:0;background:var(--paper);color:var(--error);padding:10px;width:210px;font-size:12px;border:1px solid var(--line);border-radius:8px;z-index:2}@media(max-width:1040px){.preferences{justify-content:space-between}button{padding-inline:12px}.theme-label{display:inline}.divider{display:none}}`,
})
export class PreferencesComponent { readonly prefs = inject(PreferencesService); }
