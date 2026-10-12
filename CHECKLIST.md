# Teslim kontrol listesi

Bu liste mevcut doğrulanmış durumu gösterir; resmî sayacı başlatmaz ve aktif çalışma süresi beyanı değildir.

## Tamamlananlar

- [x] Kurgusal hizmetin hedefini ve faydasını anlatan mobil/masaüstü tek sayfa.
- [x] İsim, soyisim, e-posta, hizmet seçimi ve açıklama formu.
- [x] İstemci ve sunucu doğrulaması; gönderiliyor, başarı ve hata durumları.
- [x] Başarı yalnızca kayıt onayıyla; hata halinde değerleri koruma ve tekrar gönderim koruması.
- [x] MongoDB Atlas'ta kalıcı kayıt; yalnızca kurgusal test verisi.
- [x] Temel güvenlik, erişilebilir etiketler, klavye ve azaltılmış hareket desteği.
- [x] Ek özellikler: TR/EN, açık/koyu tema, mobil menü ve yerel SSS araması.
- [x] README, AI_LOG ve güvenli .env.example.
- [x] Özel GitHub deposuna kaynak kod gönderimi.
- [x] Yerelde 12 Node + 52 tarayıcı testi ve üretim derlemesi.
- [x] Gerçek Atlas ile 1 entegrasyon + 24 tarayıcı testi.
- [x] GitHub Actions: 12 Node + 52 tarayıcı testi ve üretim derlemesi başarılı.
- [x] Son npm audit: 0 bilinen açık; Git dışı .env ve sır kontrolü.

CI kanıtı: https://github.com/tarikkiyili/automation-lp/actions/runs/38249598712

## Kalan zorunlu teslim işleri

- [x] Canlı HTTPS arayüz yayını: https://automation-lp-blond.vercel.app/.
- [ ] Vercel API başlangıç hatasını çöz: health ve form şu anda 503. Ortam değişkenleri/Atlas ağ erişimini doğrula.
- [ ] Canlı HTTPS URL'de form, hata akışı ve yeniden dağıtım sonrası kayıt kalıcılığını kontrol et.
- [ ] Özel depoya değerlendirici erişimi ver ve doğrula.
- [x] README'ye canlı URL ve gözlenen API engeli eklendi.
- [ ] Teslim öncesi sır kontrolünü tekrarla ve nihai commit kimliğini kaydet.
- [ ] Canlı URL, kaynak kod bağlantısı ve commit kimliğini başvuru sistemine teslim et.

## Kullanıcı tarafından tamamlanacak bilgiler

- [ ] Resmî başlangıç ve teslim zamanı; başlatıldıktan sonra kesintisiz 24 saat. En geç başlangıç: 30 Ekim 2026 23.59 İstanbul.
- [ ] Gerçek aktif çalışma süresi; oturum süreleri ölçülmedi.
- [ ] README/AI_LOG incelemesi, gerçek kişisel katkı ve geçmiş proje açıklaması.
- [ ] Başvuruda ayrı yazılı problem çözme soruları varsa yanıtları.

Gerçek randevu motoru, SMS/e-posta, hesap, ödeme ve yönetim paneli bu görev için zorunlu değil. Docker, fiziksel telefon, Safari/Firefox ve ekran okuyucuyla kapsamlı doğrulama yapılmadı. Canlı dağıtım tamamlanmadan proje teslim edilmiş sayılmaz.
