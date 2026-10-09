import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { inject, isDevMode, provideAppInitializer } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { AppComponent } from './app/app.component';
import { TranslationLoader } from './app/i18n/translation.loader';
import { PreferencesService } from './app/i18n/preferences.service';
bootstrapApplication(AppComponent, { providers: [
  provideHttpClient(),
  provideTransloco({config: {availableLangs: ['tr', 'en'], defaultLang: 'tr', failedRetries: 1, reRenderOnLangChange: true, prodMode: !isDevMode()}, loader: TranslationLoader}),
  provideAppInitializer(() => inject(PreferencesService).init()),
] }).catch(console.error);
