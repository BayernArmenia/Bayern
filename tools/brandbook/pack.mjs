// Собирает standalone-брендбук обратно из tools/brandbook/template.html.
//
// Меняет ровно одну строку исходного файла — содержимое <script type="__bundler/template">.
// Манифест (картинки, шрифты, React) не трогается, поэтому файл остаётся самодостаточным.
//
// Запуск из корня проекта:
//   node tools/brandbook/pack.mjs           # собрать
//   node tools/brandbook/pack.mjs --check   # проверить круг: распаковать → собрать → сравнить
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DOC = path.join(ROOT, 'BAYERN Brand Book (standalone).html');
const TPL = path.join(ROOT, 'tools/brandbook/template.html');
const check = process.argv.includes('--check');

const original = fs.readFileSync(DOC, 'utf8');
const eol = original.includes('\r\n') ? '\r\n' : '\n';
const lines = original.split(/\r?\n/);
const i = lines.findIndex((l) => l.includes('<script type="__bundler/template">'));
if (i < 0) throw new Error('не найден блок template');

const template = check ? JSON.parse(lines[i + 1]) : fs.readFileSync(TPL, 'utf8');
// Экранируем «/» в закрывающих тегах: иначе первый же </script> внутри строки
// закроет сам блок <script type="__bundler/template"> и файл развалится.
lines[i + 1] = JSON.stringify(template).replace(/<\//g, '<\\u002F');
const out = lines.join(eol);

if (check) {
  console.log(out === original ? 'круг сходится: файл байт в байт тот же' : 'РАСХОЖДЕНИЕ: сборка не совпала с исходником');
  process.exit(out === original ? 0 : 1);
}

fs.writeFileSync(DOC, out);
const pages = template.split('data-screen-label=').length - 1;
console.log(`${path.basename(DOC)} собран — страниц: ${pages}, ${out.length} символов`);
