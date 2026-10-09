import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { translationKey } from '../shared/translation-key.js';
import { requestSchema, services } from '../shared/request-schema.js';
import { FAQ_ENTRIES } from '../src/app/sections/faq.data.ts';
const tr=JSON.parse(fs.readFileSync('src/i18n/tr.json','utf8'));
const en=JSON.parse(fs.readFileSync('src/i18n/en.json','utf8'));
function translated(text) {const key=translationKey(text);assert.equal(tr[key],text);assert.equal(typeof en[key],'string',`Missing English: ${text}`);assert.ok(en[key].trim());}
test('all FAQ answers, categories and keywords have both translations',()=>{
  for(const item of FAQ_ENTRIES) for(const field of ['question','answer','category','keywords']) translated(item[field]);
});
test('services and all string validation errors have both translations',()=>{
  for(const service of services)translated(service.label);
  for(const value of [
    {name:'',surname:'',email:'wrong',service:'invalid',description:''},
    {name:'a'.repeat(81),surname:'a'.repeat(81),email:'a'.repeat(255)+'@example.com',service:'appointments',description:'a'.repeat(2001)},
  ]) {const result=requestSchema.safeParse(value);assert.equal(result.success,false);for(const issue of result.error.issues)translated(issue.message);}
});
