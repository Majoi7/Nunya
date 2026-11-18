import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = process.argv.find(arg => arg.startsWith('--output='))?.slice(9) || path.join(os.tmpdir(), 'lumimath-lottie-checks');
const fixture = process.argv.includes('--fixture');
const dist = path.join(root, 'dist');
fs.mkdirSync(output, { recursive: true });
const counts = new Map();
const server = createServer((req, res) => {
  const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
  counts.set(pathname, (counts.get(pathname) || 0) + 1);
  if (pathname === '/api/config') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ hasGeminiKey: true, publicUrl: null }));
    return;
  }
  if (pathname === '/api/tutor') {
    req.resume();
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ source: 'gemini', explanation: 'Observe les deux groupes. Compte les objets réunis.', visualStep: 'Additionne les deux quantités.', practicePrompt: 'Combien font 2 + 3 ?', practiceChoices: ['4', '5', '6'], practiceAnswer: '5' }));
    }, 1400);
    return;
  }
  const file = path.resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(dist + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const appUrl = `http://127.0.0.1:${server.address().port}/`;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lumimath-lottie-browser-'));
const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(chromePath, ['--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-default-apps', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let ws, session, sequence = 0;
const pending = new Map();
const exceptions = [], warnings = [], checks = [], requests = [];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function send(method, params = {}, sessionId = session) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result?.value;
}
async function until(expression, label) {
  for (let i = 0; i < 160; i++) {
    try { if (await evaluate(expression)) return; } catch {}
    await wait(100);
  }
  throw new Error(`UI timeout: ${label}`);
}
async function button(text, partial = false) {
  await evaluate(`(() => {
    const b = [...document.querySelectorAll('button')].find(b => ${partial ? 'b.textContent.includes' : 'b.textContent.trim() ==='}${partial ? '(' : ' '}${JSON.stringify(text)}${partial ? ')' : ''});
    if (!b || b.disabled) throw new Error('Button unavailable: ' + ${JSON.stringify(text)});
    b.scrollIntoView({ block: 'center' }); b.click();
  })()`);
  await wait(150);
}
async function click(selector) {
  await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el || el.disabled) throw new Error('Control unavailable'); el.scrollIntoView({ block: 'center' }); el.click(); })()`);
  await wait(120);
}
async function media(reduced = false, forced = false) {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }, { name: 'forced-colors', value: forced ? 'active' : 'none' }] });
}
async function viewport(width = 390, height = 844) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 1024, screenWidth: width, screenHeight: height });
}
async function snapshot(label, screenshot = true) {
  await wait(180);
  const result = await evaluate(`(() => ({ width: innerWidth, height: innerHeight, pageWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1, mainOverflow: [...document.querySelectorAll('main')].some(el => el.scrollWidth > el.clientWidth + 1), icons: [...document.querySelectorAll('[data-lottie]')].map(el => ({ name: el.dataset.lottie, status: el.dataset.lottieStatus, playing: el.dataset.lottiePlaying, svg: Boolean(el.querySelector('.lottie-icon__animation svg')) })) }))()`);
  assert.equal(result.overflow, false, `${label}: page overflow`);
  assert.equal(result.mainOverflow, false, `${label}: content overflow`);
  checks.push({ label, ...result });
  if (screenshot) {
    const image = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(output, `${label}.png`), Buffer.from(image.data, 'base64'));
  }
}
async function iconsReady() { await until(`document.querySelector('[data-lottie-status="ready"]') !== null`, 'Lottie rendering'); }
async function navigate(url) { await send('Page.navigate', { url }); }
async function geometryCheck() {
  await button('Parcours');
  await until(`document.body.innerText.includes('5 chapitres progressifs')`, 'path');
  await button('1. Polygones & Sommets', true);
  await until(`document.body.innerText.includes('Observer les sommets')`, 'geometry');
  await button('Continuer');
  await until(`document.body.innerText.includes('Côtés allumés')`, 'geometry manipulation');
  await evaluate(`document.querySelector('line[stroke="transparent"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))`);
  await until(`document.body.innerText.includes('Côtés allumés : 1/5')`, 'SVG preserved');
  await snapshot('geometry-preserved');
  await click('button[aria-label="Quitter la leçon"]');
}

try {
  const debug = await new Promise((resolve, reject) => {
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error('Chrome startup timeout')), 20000);
    chrome.once('error', reject);
    chrome.stderr.on('data', chunk => { stderr += chunk; const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/); if (match) { clearTimeout(timeout); resolve(match[1]); } });
  });
  ws = new WebSocket(debug);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) { const p = pending.get(message.id); clearTimeout(p.timer); pending.delete(message.id); message.error ? p.reject(new Error(message.error.message)) : p.resolve(message.result); }
    else if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    else if (message.method === 'Runtime.consoleAPICalled' && ['warning', 'error'].includes(message.params.type)) warnings.push(message.params.args.map(a => a.value || a.description || '').join(' '));
    else if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url);
  };
  const target = await send('Target.createTarget', { url: 'about:blank' }, null);
  session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true }, null)).sessionId;
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Network.setBlockedURLs', { urls: ['*://fonts.googleapis.com/*', '*://fonts.gstatic.com/*'] });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  await viewport(); await media();

  if (fixture) {
    await send('Network.setBypassServiceWorker', { bypass: true });
    await navigate('http://127.0.0.1:3000/tests/fixtures/lottie.html');
    await until(`document.querySelector('#replay')`, 'fixture');
    await until(`[...document.querySelectorAll('[data-lottie]')].filter(el => el.getBoundingClientRect().top < innerHeight).every(el => el.dataset.lottieStatus === 'ready')`, 'visible assets loaded');
    await click('#replay'); await wait(250); await snapshot('fixture-playing');
    await wait(2000); await snapshot('fixture-rest');
    const names = await evaluate(`Object.keys(Object.fromEntries([...document.querySelectorAll('[data-lottie]')].map(el => [el.dataset.lottie, true])))`);
    for (const name of names) {
      if (!await evaluate(`Boolean(document.querySelector('#test-' + ${JSON.stringify(name)}))`)) continue;
      await evaluate(`document.querySelector('#test-' + ${JSON.stringify(name)}).scrollIntoView({ block: 'center' })`);
      await until(`document.querySelector('#test-' + ${JSON.stringify(name)} + ' [data-lottie]').dataset.lottieStatus === 'ready'`, `fixture ${name}`);
      const bbox = await evaluate(`(() => { const el = document.querySelector('#test-' + ${JSON.stringify(name)} + ' .lottie-icon__animation svg'); const r = el.getBBox(); return { width: r.width, height: r.height, paths: el.querySelectorAll('path').length }; })()`);
      assert.ok(bbox.width > 0 && bbox.height > 0, `${name}: invisible resting frame`);
      checks.push({ label: `asset-${name}-rest`, ...bbox });
    }
    await evaluate(`window.scrollTo(0,0)`); await wait(300);
    assert.equal(await evaluate(`document.querySelector('#offscreen [data-lottie]').dataset.lottiePlaying`), 'false');
    await click('#pause'); await wait(150);
    assert.equal(await evaluate(`[...document.querySelectorAll('[data-lottie-playing="true"]')].length`), 0);
    await media(true); await wait(200);
    assert.equal(await evaluate(`document.querySelectorAll('.lottie-icon__animation svg').length`), 0);
    await snapshot('fixture-reduced');
    await media(); await wait(400);
    await click('#mount'); await wait(150);
    checks.push({ label: 'unmount-cleanup', remaining: await evaluate(`document.querySelectorAll('[data-lottie]').length`) });
  } else {
    await send('Network.setBypassServiceWorker', { bypass: true });
    await navigate(appUrl);
    await until(`document.body.innerText.includes('Comprendre les maths')`, 'welcome');
    await iconsReady(); await snapshot('welcome-390');
    await button('Commencer'); await until(`document.getElementById('child-name-input')`, 'setup');
    await evaluate(`(() => { const el = document.getElementById('child-name-input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, 'Test'); el.dispatchEvent(new Event('input', { bubbles:true })); })()`);
    await button('C’est parti'); await until(`document.body.innerText.includes('À continuer maintenant')`, 'home');
    await iconsReady(); await snapshot('home-390');
    for (const width of [360, 430, 768, 1440]) { await viewport(width, width === 1440 ? 900 : 844); await snapshot(`home-${width}`); }
    await viewport();
    await button('Parcours'); await until(`document.body.innerText.includes('5 chapitres progressifs')`, 'path');
    await snapshot('path-390');
    await button('Mode libre');
    await button('Défis'); await until(`document.body.innerText.includes('Esprit vif')`, 'challenges'); await snapshot('challenges-390');
    await button('Profil'); await until(`document.body.innerText.includes('Effets sonores')`, 'profile');
    await button('Effets sonores', true); await until(`document.querySelector('[data-lottie="soundOff"][data-lottie-status="ready"]')`, 'sound off');
    await snapshot('profile-sound-off');
    await button('Effets sonores', true); await until(`document.querySelector('[data-lottie="soundOn"][data-lottie-status="ready"]')`, 'sound on');
    await button('Tester sur smartphone (QR Code)', true); await until(`document.querySelector('button[aria-label="Fermer"]')`, 'QR modal'); await snapshot('qr-modal'); await click('button[aria-label="Fermer"]');
    await button('Parcours'); await until(`document.body.innerText.includes('5 chapitres progressifs')`, 'path again');
    await button('1. Réunir deux groupes', true); await until(`document.body.innerText.includes('Voir l’addition')`, 'addition discovery');
    await snapshot('discovery-390'); await button('Continuer'); await until(`document.body.innerText.includes('Panier A')`, 'addition manipulation');
    await button('Panier A (5)', true); await button('Vérifier'); await until(`document.body.innerText.includes('Pas tout à fait')`, 'error feedback');
    await until(`document.querySelector('[data-lottie="error"][data-lottie-status="ready"]')`, 'error animation'); await snapshot('error-feedback');
    await button('Pourquoi ?'); await until(`document.querySelector('[data-lottie="loading"]')`, 'loading state'); await snapshot('tutor-loading');
    await until(`document.body.innerText.includes('Combien font 2 + 3')`, 'mock tutor reply'); await button('5'); await snapshot('practice-success');
    await button('J’ai compris, continuer'); await button('Continuer'); await until(`document.body.innerText.includes('Combien vaut 16 + 14')`, 'question');
    await button('30'); await button('Vérifier'); await until(`document.body.innerText.includes('Bravo !')`, 'success feedback'); await snapshot('success-feedback');
    await button('Continuer'); await until(`document.body.innerText.includes('Quel nombre complète')`, 'application'); await button('14'); await button('Vérifier');
    await until(`document.body.innerText.includes('Voir mon bilan')`, 'final feedback'); await button('Voir mon bilan'); await until(`document.body.innerText.includes('Précision')`, 'result');
    await iconsReady(); await wait(2200); await snapshot('result-390');
    const saved = await evaluate(`JSON.parse(localStorage.getItem('lumimath_brilliant_v2'))`);
    assert.equal(saved.xp, 75); assert.equal(saved.lessonProgress['ch1-n1'].stars, 2); assert.equal(saved.lessonProgress['ch1-n1'].bestAccuracy, 67);
    checks.push({ label: 'progression-unchanged', xp: saved.xp, stars: saved.lessonProgress['ch1-n1'].stars, accuracy: saved.lessonProgress['ch1-n1'].bestAccuracy });
    await button('Revoir mes erreurs (1)'); await until(`document.body.innerText.includes('Ta réponse : 1')`, 'review'); await snapshot('review-390'); await button('Retour au parcours');
    await geometryCheck();
    await button('Profil'); await until(`document.body.innerText.includes('Changer de classe')`, 'profile grade'); await button('6e'); await button('Parcours');
    await button('1. Lignes et colonnes', true); await until(`document.body.innerText.includes('Voir la multiplication')`, 'multiplication'); await button('Continuer'); await until(`document.body.innerText.includes('Construis la grille')`, 'grid');
    await snapshot('multiplication-390'); await viewport(360); await snapshot('multiplication-360');
    const targets = await evaluate(`['Plus de lignes','Plus de colonnes','1 lignes par 1 colonnes'].map(label => { const b = document.querySelector('button[aria-label="' + label + '"]'); const r = b.getBoundingClientRect(); return { label, width:r.width, height:r.height }; })`);
    targets.forEach(t => { assert.ok(t.width >= 44 && t.height >= 44, `${t.label}: target`); }); checks.push({ label:'touch-targets', targets });
    await viewport(); await click('button[aria-label="Quitter la leçon"]'); await button('Accueil');
    // Live preference updates destroy players, and restore stable icon fallbacks.
    await media(true); await wait(250); await snapshot('reduced-motion'); assert.equal(await evaluate(`document.querySelectorAll('.lottie-icon__animation svg').length`), 0);
    await media(false, true); await wait(250); await snapshot('forced-colors'); assert.equal(await evaluate(`document.querySelectorAll('.lottie-icon__animation svg').length`), 0);
    await media(); await iconsReady();
    // Keyboard tab focus must stay on the real button, never on animation SVG.
    await evaluate(`document.querySelector('nav button').focus()`);
    const keyboard = await evaluate(`({ tag:document.activeElement.tagName, outline:getComputedStyle(document.activeElement).outlineStyle, decorative:document.querySelectorAll('[data-lottie][aria-hidden="true"]').length, focusableSvg:document.querySelectorAll('.lottie-icon__animation svg[tabindex="0"]').length })`);
    assert.equal(keyboard.tag, 'BUTTON'); assert.equal(keyboard.focusableSvg, 0); checks.push({label:'keyboard-semantics', ...keyboard});
    // Fresh load with broken local JSON and runtime must retain functioning labels/buttons.
    await send('Network.setBlockedURLs', { urls: ['*://fonts.googleapis.com/*','*://fonts.gstatic.com/*','*/assets/*.json','*lottie_light*'] });
    await navigate(appUrl); await until(`document.body.innerText.includes('À continuer maintenant')`, 'fallback home'); await wait(1200); await snapshot('load-failure-fallback');
    assert.ok(await evaluate(`document.querySelectorAll('[data-lottie-status="fallback"]').length`) > 0);
    await button('Profil'); await until(`document.body.innerText.includes('Changer de classe')`, 'fallback profile navigation');
    await send('Network.setBlockedURLs', { urls: ['*://fonts.googleapis.com/*','*://fonts.gstatic.com/*'] });
    // Check Workbox actually precaches the local assets, including first-use screens offline.
    await send('Network.setBypassServiceWorker', { bypass: false }); await navigate(appUrl);
    await until(`navigator.serviceWorker.controller !== null`, 'service worker control');
    await until(`(async () => { const keys = await caches.keys(); const cache = await caches.open(keys.find(key => key.includes('precache'))); const entries = await cache.keys(); return entries.filter(entry => /\/assets\/.*\.json$/.test(new URL(entry.url).pathname)).length === 18; })()`, '18 JSON cached');
    await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 }); await navigate(appUrl);
    await until(`document.body.innerText.includes('Mode hors-ligne actif')`, 'offline shell'); await iconsReady(); await snapshot('offline-home');
    await button('Profil'); await until(`document.querySelector('[data-lottie="soundOn"][data-lottie-status="ready"]')`, 'offline first-use profile'); await snapshot('offline-profile');
    await send('Network.emulateNetworkConditions', { offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1 });
  }
  assert.deepEqual(exceptions, [], 'JavaScript errors');
  assert.deepEqual(warnings, [], 'Console warnings/errors');
  const report = { passed: true, scope: fixture ? 'Local fixture via development server, Chrome CDP' : 'Production build, Chrome CDP, local API stub; no Gemini call or physical-device test', checks, javascriptExceptions: exceptions, consoleWarnings: warnings, requests: [...new Set(requests)], staticJsonRequests: [...counts].filter(([url]) => url.endsWith('.json')) };
  fs.writeFileSync(path.join(output, fixture ? 'fixture-results.json' : 'results.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed:true, checks:checks.length, output, warnings: warnings.length, exceptions:exceptions.length }, null, 2));
} catch (error) {
  const report = { passed:false, error:error.message, checks, exceptions, warnings, document: ws?.readyState === WebSocket.OPEN ? await evaluate(`({readyState:document.readyState,text:document.body?.innerText.slice(0,1800)})`).catch(() => null) : null };
  fs.writeFileSync(path.join(output, fixture ? 'fixture-results.json' : 'results.json'), JSON.stringify(report, null, 2));
  console.error(JSON.stringify(report, null, 2)); process.exitCode = 1;
} finally {
  server.closeAllConnections(); server.close();
  if (ws?.readyState === WebSocket.OPEN) { try { await send('Browser.close', {}, null); } catch {} ws.close(); }
  await wait(400); if (chrome.exitCode === null) chrome.kill();
  try { fs.rmSync(profile, { recursive:true, force:true }); } catch {}
}
