# Randevu

**İşletmeniz için daha düzenli bir takvim, işinize daha fazla zaman.**

Randevuyla çalışan işletmelere yönelik kurgusal hizmet tanıtımı ve çalışan talep formu. Angular 21, Node.js 24, Express 5 ve MongoDB Atlas kullanır. Form **hizmet talebi** kaydeder; gerçek müşteri randevusu oluşturmaz. Yalnızca kurgusal veri kullanın: `Deniz Örnek`, `fictional@example.com`.

Geliştirici: [tarikkiyili](https://github.com/tarikkiyili) · [Canlı site](https://automation-lp-blond.vercel.app/).

Canlı kontrol: arayüz çalışıyor; API sağlık kontrolü ve form gönderimi 503 dönüyor. Canlı kayıt doğrulanmadı; Vercel sunucu başlangıcı/ortam ayarları düzeltilmelidir.

## Özellikler

- Mobil ve masaüstü uyumlu tek sayfa; sabit navbar ve mobil menü.
- Türkçe/İngilizce dil desteği, açık/koyu tema ve saklanan kullanıcı tercihleri.
- Animasyonlu takvim sunumu, çözüm slider'ı ve etkileşimli özellik kartları.
- 60 soruluk, sunucu isteği göndermeyen SSS araması.
- İstemci/sunucu doğrulamalı talep formu; gönderim, başarı ve hata durumları.
- MongoDB Atlas'ta kalıcı kayıt ve eşzamanlı tekrar gönderimlere karşı çift kayıt koruması.

## Teknolojiler

| Katman | Seçim |
| --- | --- |
| Arayüz | Angular 21, TypeScript, CSS |
| Dil desteği | Transloco |
| API | Node.js 24, Express 5 |
| Kalıcı veri | MongoDB Atlas, resmî Node.js sürücüsü |
| Doğrulama | İstemci ve sunucuda ortak Zod Mini şeması |
| Test | Node test runner, Playwright |
| Yayın hedefi | Vercel: statik Angular + Node Functions |

## Kurulum

Node **24.13+ / 24.x**, npm 11 gerekir. Sürümler package-lock.json ile sabitlenir.

Yeni npm sürümleri için `allowScripts`, Angular derleme bağımlılıkları olan @parcel/watcher, esbuild, lmdb ve msgpackr-extract paketlerinin incelenen sürümlerine kurulum betiği izni verir. Paket sürümü değişirse izin yeniden incelenmelidir; tüm paketlere genel izin verilmez.

```powershell
npm ci
# İlk kurulumda; mevcut .env dosyanız varsa üzerine yazmayın.
Copy-Item .env.example .env
# .env dosyasında MONGODB_URI ve MONGODB_DB_NAME değerlerini doldurun.
npm run dev
```

Linux/macOS: `cp .env.example .env`. Tek komut Angular'ı http://localhost:4200, API'yi http://127.0.0.1:3000 üzerinde başlatır. `/api` geliştirme proxy'sinden geçer. `.env` değişince API'yi yeniden başlatın.

Üretim derlemesini yerelde çalıştırma:

```powershell
npm run build
npm start
```

http://localhost:3000 üzerinde Angular ve API birlikte sunulur. `npm start` mevcut derlemeyi kullanır; kaynak değişikliklerinde yeniden build gerekir. Canlı yayında `ng serve` kullanılmaz.

## Mimari ve veri akışı

- `src/app/sections/`: navbar, hero, slider, özellik kartları, süreç, SSS ve footer.
- `src/app/request-form/`: reactive form ve HTTP servisi.
- `shared/request-schema.js`: iki tarafta bağımsız çalıştırılan ortak Zod Mini kuralları.
- `server/app.js`: Express API, güvenlik başlıkları ve sınırlar.
- `server/mongo-store.js`: MongoDB bağlantı havuzu ve atomik, kalıcı kayıt.
- `server/runtime.js`: ortam ayarları, veritabanı seçimi ve uygulama kurulumu.
- `api/requests.js`, `api/health.js`: Vercel Functions girişleri.
- `server/database.js`: çevrimdışı testler/eski kayıtlar için açıkça seçilen SQLite desteği; Atlas hatasında otomatik geri dönüş değildir.
- `src/app/i18n/`: Transloco ve dil/tema tercihleri.

Form → istemci doğrulaması → POST → sunucu doğrulaması → MongoDB majority yazma onayı → 201 → başarı mesajı. Hata durumunda değerler korunur. Gönderim anahtarı MongoDB belgesinin benzersiz `_id` alanıdır; eşzamanlı tekrarlar da tek belge oluşturur. Aynı içerikle tekrar gönderimde mevcut kayıt 200 ile döner; farklı içerik 409 döndürür. Yanıt kaybından sonra tekrar çift kayıt oluşturmaz. Sayfa yenilemede gönderim anahtarı korunmaz; yeni gönderim yeni taleptir.

İsim/soyisim ayrı ayrı 2–80, açıklama 10–2000 karakterdir. E-posta geçerli biçimde ve en fazla 254 karakter; hizmet izin verilen 12 değerden biridir. Metinler kırpılır, e-posta küçük harfe çevrilir, ek alanlar reddedilir. Önceki SQLite dosyaları yerelde korunur; Atlas'a otomatik taşınmaz.

`POST /api/requests`: JSON gövde `{name,surname,email,service,description}` ve UUID v4 `Idempotency-Key` başlığı gerekir. 201 kayıt, 200 tekrar, 400 bozuk JSON/anahtar, 403 kaynak reddi, 409 çakışma, 413 gövde sınırı, 415 içerik tipi, 422 doğrulama, 429 hız sınırı, 503 kayıt hatası. Sağlık kontrolü: `GET /api/health`. Herkese açık kayıt listeleme API'si yoktur.

## Dil ve tema

Transloco ile TR/EN; sayfa, 60 SSS, form seçenekleri, hata/başarı metinleri, erişilebilir etiketler ve metadata çevrilir. Dil değişimi form değerlerini silmez. Mobil kontroller hamburger menüsündedir.

Çeviri kaynağı `src/i18n/catalog.json`. `npm run i18n:build` kararlı metin anahtarlarıyla tr.json/en.json üretir. Şablonlardaki Türkçe kaynak `t` pipe'ından geçer; yeni/değişen metin kataloğa da eklenmelidir. `npm run build` sözlükleri otomatik üretir; geliştirmede katalog düzenlemesinden sonra `npm run i18n:build` çalıştırın. Boş/çakışan çeviriler derlemeyi durdurur.

Sözlükler HttpClient ile `/i18n/{tr,en}.json` üzerinden gerektiğinde yüklenir ve oturumda önbelleklenir. Zaman aşımı 5 saniye, otomatik tekrar sayısı birdir. Hata halinde mevcut dil korunur ve yeniden deneme sunulur. İlk yükleme başarısızsa Türkçe kaynak metinlere dönülür.

Dil varsayılanı Türkçe, tema varsayılanı açıktır; işletim sisteminin koyu tercihi otomatik uygulanmaz. Kullanıcının kaydettiği dil ve tema seçimleri localStorage'da korunur; saklama engellense de mevcut oturumda çalışır. Yerel `theme-init.js` temayı ilk çizimden önce uygular. Dil değişirken içerik kısa bir solma geçişiyle yenilenir; tema renkleri 320 ms içinde geçiş yapar. Azaltılmış hareket tercihinde bu animasyonlar uygulanmaz.

SSS araması seçili dilde yerel içerikte 250 ms debounce ile çalışır; API isteği göndermez. Üç varsayılan soru, sekizer sonuç ve tek açık cevap vardır. Hazır metin eşleşmesidir; üretken AI yanıtı değildir.

## Güvenlik ve ortam

İzin verilen alanlarla belge yazımı, 16 KB JSON sınırı, Helmet/CSP, aynı origin API, hatalarda iç ayrıntıların gizlenmesi ve varsayılan IP başına dakikada 10 gönderim uygulanır. `script-src 'self'` korunur. Form içeriği/bağlantı sırları loglanmaz. Origin kontrolü bot koruması/kimlik doğrulaması yerine geçmez. Hız sınırı süreç belleğindedir; Vercel instance'ları arasında ortak değildir. Gerekirse Vercel Firewall veya paylaşılan limiter eklenmelidir.

| Değişken | Varsayılan / açıklama |
| --- | --- |
| PORT | 3000 |
| HOST | 127.0.0.1; barındırma için 0.0.0.0 |
| DATABASE_DRIVER | mongodb; sqlite yalnızca açıkça seçilen yerel/eski kullanım |
| MONGODB_URI | Gizli Atlas bağlantı dizesi; yalnızca sunucuda |
| MONGODB_DB_NAME | randevu |
| MONGODB_TEST_DB_NAME | randevu_test; entegrasyon testi için ayrı veritabanı |
| MONGODB_E2E_DB_NAME | randevu_e2e_test; Atlas tarayıcı testleri için ayrı veritabanı |
| DATABASE_PATH | Yalnızca SQLite seçilirse yerel dosya yolu |
| PUBLIC_ORIGIN | Canlı HTTPS origin'i; sonda / olmadan |
| TRUST_PROXY_HOPS | 0; yalnızca gerçek proxy sayısına göre ayarlayın |
| REQUESTS_PER_MINUTE | 10; yoğun E2E koşumunda 1000 |

Atlas verileri uygulamanın yerel diskinden bağımsız saklar; Vercel'de disk/volume gerekmez. `requests` koleksiyonunda `_id`, `id`, form alanları ve `createdAt` bulunur. Uygulama veritabanına uygun `readWrite` yetkili Atlas kullanıcısı ve Network Access ayarı gerekir. Bağlantı havuzu sıcak instance içinde tekrar kullanılır; en fazla 5 bağlantı ve sonlu zaman aşımı uygulanır. `.env`, `.vercel`, yerel veritabanları ve test çıktıları Git dışında tutulur. Yedek/saklama politikası ayrıca kurulmalıdır.

Form etiketleri, bağlı hata açıklamaları, hatalı alana odak, gönderim kilidi, canlı durum bildirimi, klavye kontrolleri ve azaltılmış hareket desteği vardır. Hero duraklatılabilir. SVG karakter ve el dekoratiftir.

## Testler

```powershell
npx playwright install chromium
npm run check
npm run test:mongo
npm run test:e2e:mongo
npm audit
```

`check`: Node testleri → sözlük/Angular derlemesi → Playwright; başarısız aşamada durur. Ayrı komutlar: `npm test`, `npm run build`, `npm run test:e2e`. Linux CI için `npx playwright install --with-deps chromium`.

12 Node testi (10 API/veritabanı, 2 çeviri kapsamı) ve masaüstü/mobil Chromium'da 52 tarayıcı senaryosu vardır. Kapsam: kalıcılık, migration, tüm servisler, doğrulama, hız sınırı, SQL metni, idempotency, TR/EN, tema, tercih saklama, dil yükleme hatası, gerçek kayıt, yanıt kaybı/tekrar, geçersiz başarı yanıtı, alan hataları, menü, SSS, slider ve animasyonlar. Son koşum sonucu AI_LOG.md'dedir.

API testleri geçici veritabanı, E2E ayrı `data/e2e.sqlite` kullanır. Yalnızca kurgusal kayıt oluşturulur. 503/422/429 ve ağ kesintisi kontrollü simülasyonlardır; gözlenmiş canlı arıza değildir. Hız sınırı ayrı API testinde düşük eşikle doğrulanır.

`npm run check` Atlas hesabı gerektirmeyen yerel test paketidir. `test:mongo` gerçek Atlas üzerinde doğrulama, altı eşzamanlı tekrar, çakışma, bağlantıyı kapatıp yeniden açınca kalıcılık ve hata durumunu test eder; yalnızca kendi ürettiği kayıtları temizler. `test:e2e:mongo` form/tercih testlerini gerçek Atlas API'siyle çalıştırır; kurgusal kayıtlar ayrı E2E veritabanında kalır. İki test veritabanı adı `_test` ile bitmeli ve uygulama veritabanından farklı olmalıdır. Bu testler `.env` okur; bağlantı sırları çıktıya yazılmaz.

Üretim paketi yaklaşık 375 KB ham / 96 KB tahmini transfer; 600 KB uyarı bütçesinin altında. İngilizce koyu görünüm 320/390/1100/1440 px genişlikte yatay taşma olmadan kontrol edildi. Son audit sonucu 0 bilinen açık. Bunlar canlı ortam doğrulaması yerine geçmez.

## Canlı yayın ve teslimde kalanlar

Kaynak kod [özel GitHub deposunda](https://github.com/tarikkiyili/automation-lp) tutulur. [Vercel yayını](https://automation-lp-blond.vercel.app/) açıldı; arayüz 200, API 503 döndüğü için canlı form ve kalıcılık doğrulaması bekliyor. Değerlendiriciye ayrıca depo erişimi verilmelidir. GitHub Actions testleri başarılı; Docker çalışması doğrulanmadı.

Vercel kurulumu:

1. Özel Git deposunu Vercel'e aktarın; proje kökü bu klasör, Node sürümü 24.x olsun. `vercel.json` Angular build ve output ayarlarını içerir.
2. Environment Variables'a `DATABASE_DRIVER=mongodb`, `MONGODB_URI`, `MONGODB_DB_NAME=randevu`, `REQUESTS_PER_MINUTE=10` ekleyin. URI hiçbir Angular environment dosyasına yazılmaz. Önizleme ortamı için ayrı test veritabanı kullanın.
3. Atlas Network Access'te Vercel'in bağlantısını sağlayacak ağ kurallarını belirleyin; kullanıcıya gereken veritabanı yetkisini verin. Yerel DNS SRV sorgusu çalışmıyorsa Atlas'ın standart `mongodb://` bağlantı biçimi kullanılabilir; TLS kapatılmaz. Vercel'de önerilen SRV adresi ayrıca sınanmalıdır.
4. Yayın adresi kesinleşince `PUBLIC_ORIGIN=https://PROJENIZ.vercel.app` ekleyip yeniden dağıtın. Proxy ayarını sağlayıcının gerçek topolojisine göre doğrulayın; `TRUST_PROXY_HOPS` değerini tahmin ederek genişletmeyin.
5. `/api/health` 200, gerçek form kaydı, hata akışı, kayıt kalıcılığı ve değerlendiricinin URL erişimini kontrol edin. Deployment Protection değerlendiriciyi engelliyorsa uygun erişim tanımlayın.

İki API dosyası Node Vercel Functions olarak çalışır; Angular çıktısı CDN'den sunulur. Statik güvenlik başlıkları vercel.json'da, API başlıkları Express'te tanımlıdır. SQLite Vercel runtime'da açıkça reddedilir. [Vercel Node runtime](https://vercel.com/docs/functions/runtimes/node-js).

Alternatif Docker kurulumu:

```sh
docker build -t randevu .
docker run -d --name randevu -p 3000:3000 --env-file .env -e HOST=0.0.0.0 randevu
```

HTTPS/proxy kurulmalı; canlı form kaydı ve yeniden başlatma/dağıtım sonrası kalıcılık doğrulanmalı. Özel depoya değerlendirici erişimi verilmeli; `.env`, veritabanı ve kişisel veriler paylaşılmamalı.

Resmî başlangıç en geç **30 Ekim 2026 23.59 İstanbul**; başlangıçtan itibaren kesintisiz 24 saat. Uygulama resmî sayacı yönetmez. Başlangıç zamanı, gerçek aktif çalışma süresi, kişisel katkı ve geçmiş proje açıklamasını kullanıcı tamamlamalıdır; bu bilgiler uydurulmadı.

## Bilinen sınırlar ve kaynaklar

Gerçek takvim/SMS/e-posta, hesap, yönetim paneli ve ödeme kapsam dışıdır. Talepler MongoDB'ye kaydedilir; bildirim gönderilmez. Otomatik yedekleme, CAPTCHA ve veri silme otomasyonu yoktur. Kurgusal kayıtlar değerlendirme sonrası temizlenmelidir.

Safari/Firefox, fiziksel telefon ve ekran okuyucuyla kapsamlı denetim yapılmadı; mobil test Chromium emülasyonudur. Node 24.13 `node:sqlite` için deneysel özellik uyarısı verir; sürüm yükseltmelerinde testler tekrarlanmalıdır.

Hazır tema/şablon veya harici karakter kütüphanesi kullanılmadı; arayüz ve SVG'ler projede üretildi. Angular derleme araçları kullanıldı. Referanslar: [Transloco](https://jsverse.gitbook.io/transloco/), [Zod Mini](https://zod.dev/packages/mini), [Node SQLite](https://nodejs.org/api/sqlite.html). AI kararları ve gerçek hata kayıtları: [AI_LOG.md](AI_LOG.md).
