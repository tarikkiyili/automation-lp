import fs from 'node:fs';
import { translationKey } from '../shared/translation-key.js';
const catalog = JSON.parse(fs.readFileSync('src/i18n/catalog.json','utf8'));
const tr={},en={};
for(const entry of catalog) {
 if(typeof entry.tr !== 'string' || !entry.tr.trim() || typeof entry.en !== 'string' || !entry.en.trim()) throw new Error('Both languages require nonempty copy');
 const key=translationKey(entry.tr);
 if(key in tr)throw new Error(`Duplicate translation key: ${entry.tr}`);
 tr[key]=entry.tr;en[key]=entry.en;
}
fs.writeFileSync('src/i18n/tr.json',JSON.stringify(tr,null,2)+'\n');
fs.writeFileSync('src/i18n/en.json',JSON.stringify(en,null,2)+'\n');
console.log(`Generated ${catalog.length} translations per language.`);
