/**
 * Serves the built Angular app from ../dist/ using the same path layout as gulp `express`.
 * The version directory must match the one in dist/index.html (window.TAIGA_VERSION).
 * (Running `npx gulp express` in a new process can pick a new version id and break asset URLs.)
 */
const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');

const distRoot = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distRoot, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const m = indexHtml.match(/window\.TAIGA_VERSION\s*=\s*'([^']+)'/);
if (!m) {
  console.error('Could not read TAIGA_VERSION from dist/index.html');
  process.exit(1);
}
const v = m[1];
const app = express();
app.use(compression());

app.use(`/${v}/js`, express.static(path.join(distRoot, v, 'js')));
app.use(`/${v}/styles`, express.static(path.join(distRoot, v, 'styles')));
app.use(`/${v}/images`, express.static(path.join(distRoot, v, 'images')));
app.use(`/${v}/emojis`, express.static(path.join(distRoot, v, 'emojis')));
app.use(`/${v}/svg`, express.static(path.join(distRoot, v, 'svg')));
app.use(`/${v}/partials`, express.static(path.join(distRoot, v, 'partials')));
app.use(`/${v}/fonts`, express.static(path.join(distRoot, v, 'fonts')));
app.use(`/${v}/locales`, express.static(path.join(distRoot, v, 'locales')));
app.use(`/${v}/maps`, express.static(path.join(distRoot, v, 'maps')));
app.use(`/${v}/ckeditor-translations`, express.static(path.join(distRoot, v, 'ckeditor-translations')));
app.use(`/${v}/highlightjs-languages`, express.static(path.join(distRoot, v, 'highlightjs-languages')));
app.use('/plugins', express.static(path.join(distRoot, 'plugins')));
app.use('/conf.json', express.static(path.join(distRoot, 'conf.json')));

app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

const port = Number(process.env.ANGULAR_PORT || 9001);
app.listen(port, '0.0.0.0', () => {
  console.log(`[angular-static-server] dist=${distRoot} version=${v} port=${port}`);
});
