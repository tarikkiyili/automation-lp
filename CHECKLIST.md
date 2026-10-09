# Teslim kontrol listesi

Durum: 9 Ekim 2026. Kaynak: kullanıcının görev metni ve ekran görüntüleri, yerel proje, README, AI_LOG ve Git kontrolü. Bu dosya resmî başlangıç/teslim işlemi yapmaz. İşaretlenmeyen kişisel/başvuru maddelerinin durumu kullanıcıdan doğrulanmalıdır.

## İstenen ürün — yerelde tamamlananlar

- [x] Kurgusal teknoloji hizmeti, hedef kitle ve çözülen sorun: işletmeler için randevu otomasyonu.
- [x] Mobil/masaüstü uyumlu tek sayfalık tanıtım ve bölüm bağlantıları.
- [x] İsim, soyisim, e-posta, hizmet seçimi ve açıklama içeren form.
- [x] İstemci ve sunucuda ayrı doğrulama.
- [x] Gönderiliyor, başarı ve hata durumları; gönderim sırasında tekrar tıklama engeli.
- [x] Başarı yalnızca sunucu kayıt onayıyla gösteriliyor.
- [x] MongoDB Atlas'ta kalıcı kayıt; bağlantıyı kapatıp açma ve eşzamanlı tekrar testi. SQLite yalnızca yerel/eski test seçeneğidir.
- [x] Hatalarda form bilgilerini koruma; yanıt kaybından sonra aynı anahtarla tekrar gönderimde çift kaydı önleme.
- [x] Testlerde kurgusal veri; arayüzde yalnızca kurgusal veri kullanımı notu.
- [x] Temel güvenlik: parametreli SQL, gövde sınırı, hız sınırı, Helmet/CSP, origin kontrolü.
- [x] Klavye kullanımı, form etiketleri, hata odağı, canlı durum bildirimi, azaltılmış hareket.

## Ek olarak tamamlananlar

- [x] Transloco Türkçe/İngilizce, form ve SSS çevirileri dahil.
- [x] Açık/koyu tema; varsayılan açık; kaydedilmiş kullanıcı tercihlerini koruma.
- [x] Dil ve tema değişim animasyonları.
- [x] Mobil menü, sabit navbar, animasyonlu hero, slider, özellik kartları ve footer.
- [x] 60 soruluk yerel SSS araması; arama için sunucu isteği yok.

## Dokümantasyon ve doğrulama

- [x] README: kurulum, mimari/kararlar, testler, ortam değişkenleri, bilinen sınırlar ve şablon durumu.
- [x] AI_LOG: araç, önemli yönlendirmeler, kabul/değişiklik kararları, gerçek hatalar ve doğrulama kayıtları.
- [x] Üretim derlemesi başarılı; son derleme bütçe uyarısı vermiyor.
- [x] 8 Ekim: 12 Node ve o tarihteki 48 tarayıcı testi birlikte geçti.
- [x] 9 Ekim son değişiklik: ilgili 18 navigasyon/tercih testi geçti. Mevcut toplam tarayıcı testi 52; tamamı son revizyonda birlikte yeniden çalıştırılmadı.
- [x] Son bağımlılık taramasında 0 bilinen açık; bu sonuç önceki koşuma aittir, bugün tekrar taranmadı.
- [x] 9 Ekim mevcut sürümde tam kontrol: 12 Node + 52 tarayıcı testi ve üretim derlemesi geçti; npm audit 0 bilinen açık. Vercel/veritabanı uyarlamasından sonra ilgili kontroller tekrar yapılmalı.
- [ ] Kullanıcının README/AI_LOG incelemesi; kendi karar ve katkı anlatımını tamamlaması.
- [ ] Başvurudaki ayrı yazılı problem çözme soruları varsa yanıtlarını tamamla. Soruların tamamı henüz görülmedi; README'nin bunların yerine geçtiği varsayılmıyor.

## Zorunlu teslim adımları — henüz tamamlanmadı

- [x] Barındırma tercihi: Vercel (9 Ekim).
- [x] Vercel için MongoDB Atlas seçildi; Node API, bağlantı havuzu, ortam örnekleri ve Functions girişleri uyarlandı.
- [x] Gerçek Atlas üzerinde entegrasyon testi ve 24 masaüstü/mobil form/tercih testi geçti. Tüm yerel 12 Node + 52 tarayıcı testi de geçti.
- [ ] Vercel'e ortam değişkenlerini tanımla, Atlas ağ erişimini doğrula ve yayınla.
- [ ] HTTPS canlı URL oluştur; localhost canlı teslim adresi değildir.
- [ ] Canlı form kaydı, hata davranışı ve yeniden başlatma/dağıtım sonrası kalıcılığı kontrol et.
- [x] Özel uzak Git deposu oluşturuldu: https://github.com/tarikkiyili/automation-lp. Kaynak gönderimi bu sürümün Git commit/push adımıyla takip edilir.
- [ ] Değerlendirici erişimini ver ve doğrula.
- [ ] `.env`, veritabanı ve test çıktılarının teslim deposunda olmadığını son kez kontrol et.
- [ ] Canlı yayın doğrulamasından sonraki nihai teslim commit kimliğini kaydet (`git rev-parse HEAD`). Uzak depo `origin`, çalışma dalı `main` olarak bağlandı; mevcut GitHub README geçmişi korundu.
- [ ] Canlı URL, kaynak kod bağlantısı ve commit kimliğini başvuru sistemine teslim et.

## Kullanıcıdan doğrulanması/tamamlanması gerekenler

- [ ] Başvuru/deneyim/yaklaşım alanları tamamlandı mı?
- [ ] Resmî 24 saatlik sayaç başlatıldı mı? Başlangıç ve son teslim zamanını kaydet. Görselin güncel sayaç durumunu temsil ettiği varsayılmıyor.
- [ ] Gerçek aktif çalışma süresini dürüstçe belirt.
- [ ] Geçmiş proje ve kişisel katkını gerçek örneklerle açıkla.
- [ ] Kodun veri akışını ve kararlarını kendi sözlerinle anlatabilecek şekilde incele.

Görev metnine göre en geç başlangıç: 30 Ekim 2026, 23.59 İstanbul. Başlatıldıktan sonra 24 saat durdurulamaz. Bu liste sayacı başlatmaz/sıfırlamaz.

## Zorunlu olmayan veya kapsam dışı kalanlar

- Gerçek randevu motoru, SMS/e-posta gönderimi, hesap, yönetim paneli ve ödeme yapılmadı; landing page ve talep formu görevi için zorunlu değil.
- Dockerfile ve CI tanımı hazır; Docker/uzak CI çalışması doğrulanmadı. Bunları seçersek ayrıca kontrol edeceğiz.
- Fiziksel mobil cihaz, Safari/Firefox ve ekran okuyucuyla kapsamlı kontrol yapılmadı; mevcut mobil test Chromium emülasyonu.
- Otomatik yedekleme, CAPTCHA ve otomatik veri temizleme yok; canlı barındırmaya göre değerlendirilmeli.

Önerilen sıra: son kişisel içerik/kod incelemesi → son testler → özel depo ve yayın → canlı kalıcılık kontrolü → nihai commit kimliği ve teslim.
