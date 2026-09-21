// Достаёт редактируемую страницу из standalone-брендбука.
//
// «BAYERN Brand Book (standalone).html» — самораспаковывающийся архив: сама вёрстка лежит
// в теге <script type="__bundler/template"> как JSON-строка, а картинки, шрифты и React —
// в <script type="__bundler/manifest"> как base64. Править standalone-файл руками нельзя:
// это одна строка на 121 КБ с экранированными кавычками.
//
// Запуск из корня проекта:
//   node tools/brandbook/unpack.mjs
//
// Кладёт вёрстку в tools/brandbook/template.html — её и редактируем.
// Обратно: node tools/brandbook/pack.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SRC = path.join(ROOT, 'BAYERN Brand Book (standalone).html');
const OUT = path.join(ROOT, 'tools/brandbook/template.html');

const lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/);
const at = (type) => {
  const i = lines.findIndex((l) => l.includes(`<script type="__bundler/${type}">`));
  if (i < 0) throw new Error(`не найден блок ${type}`);
  return i + 1; // содержимое — следующая строка
};

const template = JSON.parse(lines[at('template')]);
fs.writeFileSync(OUT, template);

const manifest = JSON.parse(lines[at('manifest')]);
const pages = template.split('data-screen-label=').length - 1;
console.log(`${path.relative(ROOT, OUT)} — ${template.length} символов, страниц: ${pages}`);
console.log(`вложений в манифесте: ${Object.keys(manifest).length} (картинки, шрифты, React)`);
