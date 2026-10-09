import { TextPipe } from './i18n/text.pipe';
import { Component } from '@angular/core';
import { HeaderComponent } from './sections/header.component';
import { HeroComponent } from './sections/hero.component';
import { FeaturesComponent } from './sections/features.component';
import { HowItWorksComponent } from './sections/how-it-works.component';
import { FaqComponent } from './sections/faq.component';
import { FooterComponent } from './sections/footer.component';
import { RequestFormComponent } from './request-form/request-form.component';

@Component({
  selector: 'app-root',
  imports: [TextPipe, HeaderComponent, HeroComponent, FeaturesComponent, HowItWorksComponent, FaqComponent, FooterComponent, RequestFormComponent],
  template: `
    <a class="skip-link" href="#main">{{ "İçeriğe geç" | t }}</a>
    <app-header />
    <main id="main">
      <app-hero class="ambient-pattern" /><app-features /><app-how-it-works class="ambient-pattern" /><app-faq class="ambient-pattern" /><app-request-form />
    </main>
    <app-footer class="ambient-pattern" />
  `,
})
export class AppComponent {}
