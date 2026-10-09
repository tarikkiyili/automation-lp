import * as z from 'zod/mini';

export const services = [
  { value: 'appointments', label: 'Randevu yönetimi' },
  { value: 'reminders', label: 'Hatırlatma otomasyonu' },
  { value: 'team', label: 'Ekip ve vardiya planlama' },
  { value: 'branches', label: 'Çoklu şube yönetimi' },
  { value: 'resources', label: 'Oda ve ekipman planlama' },
  { value: 'classes', label: 'Grup seansları ve dersler' },
  { value: 'waitlist', label: 'Bekleme listesi yönetimi' },
  { value: 'integrations', label: 'Takvim ve yazılım bağlantıları' },
  { value: 'reporting', label: 'Raporlama ve iş takibi' },
  { value: 'migration', label: 'Veri aktarımı ve kurulum' },
  { value: 'complete', label: 'Kapsamlı çözüm danışmanlığı' },
  { value: 'other', label: 'Diğer / Birlikte belirleyelim' },
];

// Both the browser and API use these rules. The API always validates independently.
export const requestSchema = z.strictObject({
  name: z.string().check(z.trim(), z.minLength(2, 'İsim en az 2 karakter olmalı.'), z.maxLength(80, 'İsim en fazla 80 karakter olabilir.')),
  surname: z.string().check(z.trim(), z.minLength(2, 'Soyisim en az 2 karakter olmalı.'), z.maxLength(80, 'Soyisim en fazla 80 karakter olabilir.')),
  email: z.string().check(z.trim(), z.toLowerCase(), z.maxLength(254, 'E-posta çok uzun.'), z.email('Geçerli bir e-posta adresi girin.')),
  service: z.enum(services.map(service => service.value), { error: 'Bir hizmet seçin.' }),
  description: z.string().check(z.trim(), z.minLength(10, 'Açıklama en az 10 karakter olmalı.'), z.maxLength(2000, 'Açıklama en fazla 2000 karakter olabilir.')),
});

export function fieldErrors(error) {
  return Object.fromEntries(error.issues.map(issue => [issue.path[0] ?? 'form', issue.message]));
}
