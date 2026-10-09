import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { requestSchema, fieldErrors } from '../shared/request-schema.js';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

export function createApp({ store, publicOrigin, trustProxyHops = 0, limit = 10, logger = console, staticDir = resolve('dist/randevu/browser') }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxyHops);
  app.use(helmet({ contentSecurityPolicy: { directives: {
    "script-src": ["'self'"], "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", 'data:'], "connect-src": ["'self'"],
    "upgrade-insecure-requests": publicOrigin?.startsWith('https:') ? [] : null,
  } } }));
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.get('/api/health', async (_req, res) => {
    try { await store.ping?.(); return res.json({ status: 'ok' }); }
    catch { return res.status(503).json({ status: 'unavailable' }); }
  });
  app.post('/api/requests', rateLimit({
    windowMs: 60_000, limit, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { message: 'Çok fazla deneme yaptınız. Bir dakika sonra yeniden deneyin.' },
  }), (req, res, next) => {
    if (publicOrigin && req.get('origin') && req.get('origin') !== publicOrigin) {
      return res.status(403).json({ message: 'Bu kaynaktan gönderime izin verilmiyor.' });
    }
    if (!req.is('application/json')) return res.status(415).json({ message: 'JSON biçiminde veri gönderin.' });
    next();
  }, express.json({ limit: '16kb' }), async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(422).json({ message: 'Alanları kontrol edin.', errors: fieldErrors(parsed.error) });
    const key = req.get('idempotency-key');
    if (!key || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key)) {
      return res.status(400).json({ message: 'Geçerli bir gönderim kimliği gerekli.' });
    }
    try {
      const saved = await store.save(parsed.data, key);
      if (saved.conflict) return res.status(409).json({ message: 'Gönderim kimliği başka bir talep için kullanılmış.' });
      return res.status(saved.replayed ? 200 : 201).json({ id: saved.id, message: 'Demo talebiniz kaydedildi.' });
    } catch {
      logger.error('Request persistence failed.'); // Never log request contents or personal data.
      return res.status(503).json({ message: 'Talep şu anda kaydedilemiyor. Bilgilerinizi koruduk; tekrar deneyin.' });
    }
  });
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Uç nokta bulunamadı.' }));
  if (existsSync(staticDir)) app.use(express.static(staticDir));
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'İstek boyutu çok büyük.' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Geçersiz JSON.' });
    logger.error('Unexpected server error.');
    return res.status(500).json({ message: 'Beklenmeyen sunucu hatası.' });
  });
  return app;
}
