import { TextPipe } from '../i18n/text.pipe';
﻿import { Component } from '@angular/core';
@Component({
  selector: 'app-how-it-works',
  imports: [TextPipe],
  styleUrl: './how-it-works.component.css',
  template: `<section id="how" class="how-section-wrap" aria-labelledby="how-title">
    <div class="container"><div class="how-surface">
      <div class="how-heading"><div><p class="eyebrow">{{ "NASIL ÇALIŞIR?" | t }}</p><h2 id="how-title">{{ "İşletmenizin düzeni." | t }}<br><em>{{ "Üç adımda." | t }}</em></h2></div><p>{{ "Karmaşık süreçlere gerek yok." | t }} <br>{{ "İşinize uygun bir başlangıç yapın." | t }}</p></div>
      <ol class="journey">
        @for (step of steps; track step.title; let i = $index) {
          <li><div class="step-marker"><span>0{{ ( i + 1 ) | t }}</span><div aria-hidden="true"></div></div><span class="step-label">{{ ( step.label ) | t }}</span><h3>{{ ( step.title ) | t }}</h3><p>{{ ( step.description ) | t }}</p></li>
        }
      </ol>
      <div class="how-bottom"><span>{{ "İlk adım, işletmenizi tanımak." | t }}</span><a href="#request">{{ "Birlikte planlayalım" | t }}</a></div>
    </div></div>
  </section>`,
})
export class HowItWorksComponent {
  readonly steps = [
    { label: 'TANIYALIM', title: 'İşletmenizi anlatın.', description: 'Ekibinizi, çalışma biçiminizi ve ihtiyaçlarınızı belirleyin. Süreci sizin düzeninizden yola çıkarak şekillendirelim.' },
    { label: 'PLANLAYALIM', title: 'Size uygun akışı kuralım.', description: 'Hizmet sürelerini, uygun saatleri ve hatırlatmaları tanımlayın. Randevu akışınız işletmenize uyum sağlasın.' },
    { label: 'YÖNETİN', title: 'Gününüze odaklanın.', description: 'Randevuları ve değişiklikleri tek yerden takip edin. Ekibiniz planını bilsin, siz hizmetinize zaman ayırın.' },
  ];
}
