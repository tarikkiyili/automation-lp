# AI kullanım kaydı

Bu belge günlük oturum dökümü yerine önemli yönlendirmeleri, kararları ve doğrulamaları özetler. Teknik işlem tarihleri aktif çalışma süresini göstermez; oturum süreleri ölçülmedi. Gerçek aktif süre ve kişisel katkı beyanı geliştirici tarafından tamamlanmalıdır.

## Kullanılan araçlar

OpenAI Codex; planlama, Angular/Node kodu, SVG/CSS düzenlemeleri, test ve dokümantasyon desteği için kullanıldı. Terminal, Playwright ve resmî teknik belgelerle doğrulama yapıldı. Alt ajan kullanılmadı. Bu kayıt AI desteğiyle hazırlanmıştır; kişisel katkı beyanı değildir. Hazır tema veya harici karakter kütüphanesi kullanılmadı.

## Önemli yönlendirmeler ve kararlar

- “Angular ve Node.js altyapısını oluştur, componentleri ve gerekli dokümanları hazırla.” Kullanıcının teknoloji tercihi uygulandı; ilk Next.js önerisi kullanılmadı. Randevu yönetimi fikri seçildi; salon odaklı anlatım daha sonra tüm randevulu işletmelere genişletildi.
- Tek sayfa ve hizmet talebi formu kararlaştırıldı. Form gerçek müşteri randevusu oluşturmaz. Gerçek SMS, ödeme ve yönetim paneli kapsam dışında tutuldu.
- “Mavi ve lacivert”, mobil hamburger, animasyonlu hero, üst üste özellik kartları ve profesyonel footer istekleri uygulandı. Tekrarlanan takvim panelleri kaldırıldı. SVG karakter ve saatli el, kullanıcı görsel geri bildirimleriyle düzenlendi. Azaltılmış hareket ve klavye desteği korundu.
- “İsim soyisim yan yana”, kapsamlı hizmet seçimi ve sabit boyutlu açıklama istendi. İki ad alanı ve 12 hizmet seçeneği ortak doğrulama şemasına eklendi.
- Çok sayıda soruda canlı arama isteği için veritabanı/API yerine 60 soruluk yerel içerik ve 250 ms debounce seçildi. Varsayılan üç soru ve tek açık cevap davranışı uygulandı; üretken AI yanıtı kullanılmadı.
- “Transloco aracılığıyla Türkçe ve İngilizce; koyu ve açık tema; form ve sunucuyu kontrol et.” Tüm metinler, form durumları ve erişilebilir etiketler çevrildi. Dinamik import yerine zaman aşımı/yeniden deneme destekli HttpClient sözlük yükleyicisi seçildi. Tercihler localStorage'da saklanır. Kullanıcının sonraki isteğiyle varsayılan tema açık yapıldı; dil/tema geçişleri yumuşatıldı.
- Başlangıçtaki SQLite seçimi Vercel hedefi nedeniyle değiştirildi. PostgreSQL alternatifi değerlendirildi; kullanıcının MongoDB tercihi uygulandı. SQLite yalnızca açıkça seçilen yerel test/eski kullanım seçeneğidir; Atlas hatasında otomatik geri dönüş yoktur.
- İstemci ve sunucu ortak Zod Mini şemasını ayrı ayrı çalıştırır. Başarı yanıtı MongoDB yazma onayından sonra verilir. Benzersiz gönderim anahtarı eşzamanlı tekrarlarda çift kaydı önler. Bağlantı sırları istemciye ve dokümanlara eklenmedi.
- Ortak Zod ithalatı yerine Zod Mini kullanılarak başlangıç paketi yaklaşık 813 KB'den 375 KB'ye indirildi; boyut uyarı eşiği yükseltilmedi.

## Bulunan gerçek sorunlar ve çözümleri

- Angular'ın kritik CSS optimizasyonundaki inline onload, CSP tarafından engellendiği için üretim stilleri yüklenmiyordu. CSP gevşetilmeden inlineCritical kapatıldı; görsel stil kontrolleri eklendi.
- İlk ElementRef türü ve otomatik şablon dönüşümündeki TypeScript hataları derlemede yakalanıp düzeltildi. Eksik çeviri denetimi boş İngilizce cümle parçasını yakaladı; tam cümle çevirisine geçildi.
- Koyu temada bileşen stilleri global renkleri geçiyordu; okunurluk düzeltildi. CTA'daki renk/hareket CSS değişkeni ad çakışması kolun düğme arkasından görünmesine yol açıyordu; değişkenler ayrıldı.
- Sunucu 422 yanıtından sonra devre dışı alanlara erken odak veriliyordu. Odak render sonrasına taşındı; mobil/masaüstü testlerle doğrulandı.
- Yerel DNS SRV sorgusu ECONNREFUSED döndürdü. Standart TLS MongoDB bağlantısıyla ping ve yazma başarılı oldu. Vercel ağ bağlantısı ayrıca doğrulanmalıdır.
- Geliştirme portunu eski önizleme süreci kullanıyordu. İlgili süreç kapatıldı; sunucu başarı mesajı gerçek listening olayına taşındı ve port çakışması hatası açıklayıcı hale getirildi.
- İlk GitHub push başarılıydı; CI backend testlerine ulaşmadan npm ci aşamasında durdu. Kilit dosyasındaki eksik @emnapi/core/runtime kayıtları temiz klasörde CI npm sürümüyle tamamlandı. Linux kurulum çözümlemesi ve ardından uzak CI başarılı oldu.
- Bağımlılık taraması uyarıları uyumlu güncellemeler/override ile giderildi. Son npm audit sonucu 0 bilinen açık; bu sonuç tüm olası güvenlik sorunlarının yokluğu iddiası değildir.

## Doğrulama sonucu

- Yerel npm run check: 12 Node testi, üretim derlemesi ve 52 masaüstü/mobil Chromium testi geçti.
- Gerçek Atlas: 1 kapsamlı entegrasyon testi ve 24 form/tercih tarayıcı testi geçti. Altı eşzamanlı gönderim tek belge oluşturdu; bağlantıyı kapatıp açınca kayıt korundu. Ayrı test veritabanlarında yalnızca kurgusal veri kullanıldı.
- Hatalı alanlar, yanıt kaybından sonra tekrar, geçersiz başarı yanıtı, ağ hatası, 422/429/503, tema/dil saklama ve sözlük yükleme hataları sınandı. Kontrollü hata senaryoları canlıda yaşanmış arıza olarak gösterilmez.
- 320/390/1100/1440 px görünümleri, taşma ve koyu tema incelendi. Mobil testler Chromium emülasyonudur; fiziksel cihaz/Safari/ekran okuyucu kapsamlı denetimi yapılmadı.
- GitHub Actions: 12 Node testi, üretim derlemesi ve 52 tarayıcı testi başarılı. [Başarılı koşum](https://github.com/tarikkiyili/automation-lp/actions/runs/38249598712), kod commit'i: df38563680b721f69c3948fb23eb57ea1f68aa36.
- Git dışı .env ve teslim dosyalarında sır kontrolü yapıldı. Docker ve gerçek Vercel yayını henüz doğrulanmadı; yerel başarı canlı yayın kanıtı değildir.

## Açık teslim işleri

Kullanıcının paylaştığı npm install-scripts uyarısı için dört Angular derleme bağımlılığının kaynak betikleri ve bağımlılık ağacı incelendi. npm 11.21.0 install-scripts approve ile yalnızca mevcut sürümler package.json allowScripts alanına eklendi. Ayrı temiz klasörde npm ci uyarısız tamamlandı ve 0 bilinen açık raporladı; kurulum izinleri genel olarak açılmadı. Resmî kaynak: https://docs.npmjs.com/cli/v11/commands/npm-install-scripts/.

Son yeniden dağıtım sonrası mevcut kaydın kontrolü, değerlendirici depo erişimi, nihai URL/commit teslimi. Resmî başlangıç zamanı, gerçek aktif çalışma süresi ve geçmiş proje/kişisel katkı açıklaması kullanıcı tarafından tamamlanmalıdır.

## Canlı yayın kontrolü

Son yeniden kontrolde eksik MONGODB_URI ayarı ve yeniden dağıtım sonrası API çalıştı: health 200, kurgusal form kaydı 201 ve arayüzde gerçek başarı mesajı. Aynı anahtarla tekrar 200 ve aynı kimlik; farklı içerik 409; geçersiz e-posta 422 döndü. Atlas'ta kayıt kimliğiyle sorgu tam bir belge buldu; MongoClient kapatılıp yeniden bağlanınca belge korundu. 1440/390 px'de taşma ve JavaScript hatası görülmedi; mobil dil/tema tercihleri yeniden yüklemede korundu. Yeniden dağıtımdan sonra bu başarılı kaydın kontrolü ayrıca bekliyor. Aşağıdaki ilk kontrol başarısızlığı tarihçe olarak tutulur.

Vercel istek özetleri başlangıç hatasının nedenini göstermiyordu. Handler'a yalnızca önceden tanımlı sabit hata mesajlarını loglayan tanılama eklendi; ham hata, stack veya ortam değeri loglanmaz. Eksik URI, geçersiz ayarlar ve Atlas bağlantı hatası ayrıştırılabilir; istemci yanıtı genel 503 olarak kalır.

Kullanıcının paylaştığı https://automation-lp-blond.vercel.app/ Playwright ile kontrol edildi. Arayüz HTTP 200; 1440/390 px'de yatay taşma ve JavaScript çalışma hatası görülmedi. Mobil menü, TR/EN geçişi, tema saklama ve istemci doğrulaması çalıştı. API health ve kurgusal form gönderimi 503 döndü; form başarı göstermedi ve alanları korudu. API runtime kurulmadan reddedildiği için canlı sunucu doğrulaması, tekrar koruması ve kalıcılık bu koşumda doğrulanamadı. Aynı Atlas yerel bağlantısında ping başarılıydı; Vercel ortam ayarları/ağ erişimi ve Function logları incelenmelidir. Bu gerçek canlı engel teslim checklist'ine eklendi.

Referanslar: [Transloco](https://jsverse.gitbook.io/transloco/), [Zod Mini](https://zod.dev/packages/mini), [MongoDB sürücüsü](https://www.mongodb.com/docs/drivers/node/current/crud/insert/), [Vercel Node runtime](https://vercel.com/docs/functions/runtimes/node-js).
