# Proje planı

## MongoDB ve Vercel — 9 Ekim 2026
- Uygulama varsayılanı MongoDB Atlas oldu; SQLite sadece açıkça seçilen yerel/eski test desteği olarak kaldı. Mevcut SQLite kayıtları otomatik taşınmadı.
- Gerçek Atlas bağlantısı, eşzamanlı tekrar koruması, kalıcılık, hata akışı ve 24 tarayıcı testi doğrulandı. 12 Node + 52 yerel tarayıcı testi de geçti.
- Vercel yapılandırması hazır; ortam değişkenlerinin platforma girilmesi ve canlı dağıtım/kalıcılık kontrolü bekliyor. Gizli değerler yalnızca Git dışı .env içindedir.

## Güncel durum — 8 Ekim 2026
- Kapsam artık randevuyla çalışan tüm işletmelerdir; aşağıdaki salon odaklı ilk kararlar tarihçedir.
- Transloco TR/EN, açık/koyu tema ve kalıcı tercihler tamamlandı. Kontroller mobil menüde de çalışır.
- 12 Node testi, üretim build'i ve 48 masaüstü/mobil tarayıcı testi geçti. Dil, tema ve kayıt/hata/tekrar akışları doğrulandı. Güncel kurulum ve kapsam README'dedir.
- Canlı URL, kalıcı diskli barındırma, özel depo ve değerlendirici erişimi hâlâ dış teslim adımlarıdır. Resmî sayaç, aktif çalışma süresi ve kişisel katkı beyanını kullanıcı tamamlamalıdır.

## Slider ve sunum dili — 6 Ekim 2026
- Sorun/çözüm artık üç slaytlı yapı; kart başlıkları ve açıklamaları kart içinde. Takvim yaprağı (24→25), hatırlatma/onay ve saat taşıma animasyonları var.
- Ürün dili tercih edildi; kurgusal adların “Demo” öneki kaldırıldı. Formda tek kısa test verisi bildirimi korunuyor; yayın ve gerçek entegrasyonlar hâlâ ayrı teslim işleri.

## Tema güncellemesi — 6 Ekim 2026
- Son onaylanan palet: ana mavi `#365A8C`, hover `#29466F`, açık zemin `#EDF2F8`, lacivert `#142B50`.
- Kullanıcı genel tema için mavi ve lacivert seçti. Yeşil tema yerini lacivert metinlere, mavi butonlara ve açık mavi yüzeylere bıraktı.
- Sonraki tasarım çalışması bölüm bölüm ilerleyecek; ilk aday ana bölüm (hero).

## Güncel kararlar — 5 Ekim 2026
- Önceki Akış fikri yerine: Randevu, kuaför/berber/güzellik salonlarına yönelik kurgusal randevu otomasyonu hizmeti.
- Tek sayfa; üst menü, ana bölüm, sorun/çözüm, özellikler, nasıl çalışır, SSS, demo talep formu ve alt bölüm.
- Form salon müşterisinin randevusu değil, salon sahibinin hizmet talebi içindir.
- Angular 21 + Node.js 24 + Express 5; kalıcı SQLite dosyası. Küçük tek sunuculu demo için PostgreSQL yerine SQLite seçildi.
- Componentler, API, ortak doğrulama, testler ve dokümantasyon oluşturuldu. Nihai AI tasarım görseli henüz gelmedi.
- Canlı yayın, özel depo/değerlendirici erişimi, resmî sayaç bilgisi ve kişisel katkı beyanı hâlâ açık.
- Aşağıdaki ilk plan maddeleri tarihçe olarak saklanmıştır; güncel kararlar önceliklidir.

## Amaç ve kapsam
- Kurgusal bir teknoloji hizmeti için mobil ve masaüstü uyumlu tek sayfalık açılış sayfası ve çalışan talep formu.
- Çok sayfalı site, kullanıcı hesabı, ödeme veya yönetim paneli gerekmiyor.
- Önerilen hizmet: Akış, küçük işletmeler için görev otomasyonu. İsim henüz kesinleşmedi.
- Form: isim, e-posta, hizmet seçimi ve açıklama.
- İstemci ve sunucuda doğrulama; gönderiliyor, başarı ve hata durumları.
- Başarı yalnızca veritabanı kaydı tamamlandığında gösterilecek.
- Kayıtlar sunucuda kalıcı saklanacak. Yalnızca kurgusal test verileri kullanılacak.

## Kullanıcı tercihleri
- Ön yüz: Angular.
- Sunucu: Node.js. Sunucu çatısı ve veritabanı henüz kesinleşmedi.
- Önce AI ile görsel tasarım referansı oluşturulması, sonra kodla uygulanması önerildi. Henüz görsel üretimi başlatılmadı.

## Uygulama ve doğrulama
- Önce kapsam ve veri modeli; sonra sayfa/form; ardından API ve kalıcı kayıt.
- Geçerli kayıt, geçersiz alanlar, doğrudan API isteği, kayıt hatası, tekrar gönderim, mobil görünüm ve klavye kullanımı kontrol edilecek.
- Canlı ortamda uçtan uca kayıt doğrulanacak.
- Veritabanı sırları istemciye gönderilmeyecek; kayıtlar herkese açık listelenmeyecek.

## Teslim
- Canlı URL ve yalnızca değerlendiricinin erişebileceği kaynak kodu.
- README.md: kurulum, testler, ortam değişkenleri, yayın, bilinen eksikler ve varsa şablon kaynakları.
- AI_LOG.md: kullanılan AI araçları, önemli promptlar, kabul/değişiklik kararları ve gerçekten yapılan doğrulamalar. Bu planlama da kayda dahil edilecek.
- Gerçek aktif çalışma süresi dürüstçe belirtilecek; başlangıç efor tahmini 3–4 saat.
- Resmî başlangıç için son tarih: 30 Ekim 2026 23.59, İstanbul saati. Başlangıçtan itibaren 24 saat; durdurulamaz.
- Resmî sayacın başlatılıp başlatılmadığı bilinmiyor. Planlama veya bu dosyanın oluşturulması resmî başlangıcın kanıtı değildir.

## Açık konular
- Resmî başlatma mekanizması ve sayacın durumu.
- Yayın sağlayıcısı, kalıcı veritabanı ve mevcut hesaplar.
- Değerlendiriciye özel kaynak kodu erişim yöntemi.
