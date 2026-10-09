import { TextPipe } from '../i18n/text.pipe';
import { Component } from '@angular/core';
@Component({
  selector: 'app-footer',
  imports: [TextPipe],
  styleUrl: './footer.component.css',
  template: `<footer class="footer" [attr.aria-label]="'Site alt bilgisi' | t">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a class="brand" href="#main" [attr.aria-label]="'Randevu ana bölüme dön' | t"><span aria-hidden="true">{{ "r." | t }}</span> {{ "randevu" | t }}</a>
          <p>{{ "İşinize zaman," | t }}<br><strong>{{ "gününüze düzen." | t }}</strong></p>
          <span class="brand-description">{{ "Randevuyla hizmet veren işletmeler için" | t }}<br>{{ "planlama ve otomasyon." | t }}</span>
        </div>
        <nav class="footer-links" aria-labelledby="footer-links-title">
          <h2 id="footer-links-title">{{ "Keşfedin" | t }}</h2>
          <a href="#features">{{ "Özellikler" | t }}</a>
          <a href="#how">{{ "Nasıl çalışır?" | t }}</a>
          <a href="#faq">{{ "Sık sorulan sorular" | t }}</a>
          <a href="#request">{{ "İletişim ve talep" | t }}</a>
        </nav>
        <div class="footer-contact">
          <h2>{{ "Bir sonraki adımı planlayalım." | t }}</h2>
          <p>{{ "İşletmenizin ihtiyaçlarını paylaşın." | t }} <br>{{ "Size uygun düzeni birlikte konuşalım." | t }}</p>
          <a class="footer-cta" href="#request">{{ "İhtiyacınızı paylaşın" | t }}</a>
        </div>
      </div>
      <div class="footer-bottom"><small>© {{ ( year ) | t }} {{ "Randevu" | t }}</small><span>{{ "Randevu yönetimi · Ekip planlama · Otomasyon" | t }}</span><a href="#main">{{ "Başa dön" | t }}</a></div>
    </div>
  </footer>`,
})
export class FooterComponent { readonly year = new Date().getFullYear(); }
