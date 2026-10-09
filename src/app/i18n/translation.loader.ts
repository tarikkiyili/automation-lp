import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { TranslocoLoader, Translation } from '@jsverse/transloco';
@Injectable({providedIn: 'root'})
export class TranslationLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  getTranslation(lang: string) {
    return this.http.get<Translation>(`/i18n/${lang === 'en' ? 'en' : 'tr'}.json`).pipe(timeout(5000));
  }
}
