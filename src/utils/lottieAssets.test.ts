import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { loadAnimationData, prepareAnimationData } from './lottieAssets';
import type { LottieAnimationData } from '../types/animations';

const folder = new URL('../assets/animations/', import.meta.url);
const readJson = async (file: string) => JSON.parse(await readFile(new URL(file, folder), 'utf8'));

test('18 assets locaux, sourcés et sans images/expressions externes', async () => {
  const sources = await readJson('sources.json');
  assert.equal(sources.length, 18);
  for (const source of sources) {
    assert.match(source.source, /^https:\/\/lottiefiles\.com\/free-animation\//);
    assert.equal(source.license, 'Lottie Simple License (FL 9.13.21)');
    const bytes = await readFile(new URL(source.file, folder));
    assert.equal(bytes.length, source.bytes, `${source.id}: poids de l'asset`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, `${source.id}: empreinte de l'asset`);
    const data = JSON.parse(bytes.toString('utf8'));
    assert.ok(data.fr > 0 && data.w > 0 && data.h > 0 && data.op > data.ip);
    assert.ok(data.layers.length > 0);
    const visit = (value: unknown) => {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach(visit); return; }
      const node = value as Record<string, unknown>;
      assert.notEqual(typeof node.x, 'string', `${source.id}: expression`);
      assert.notEqual(typeof node.p, 'string', `${source.id}: image externe`);
      Object.values(node).forEach(visit);
    };
    visit(data);
  }
});

test('la coloration clone les données sans modifier la géométrie ni la source', async () => {
  const data: LottieAnimationData = await readJson('success.json');
  const before = JSON.stringify(data);
  const result = prepareAnimationData(data, 'monochrome', '#FFFFFF', '#FFFFFF');
  assert.notEqual(result, data);
  assert.equal(JSON.stringify(data), before);
  assert.deepEqual((result.layers[0] as any).shapes[0].it[0].ks, (data.layers[0] as any).shapes[0].it[0].ks);
  assert.deepEqual((result.layers[0] as any).shapes[0].it[1].c.k, [1, 1, 1, 1]);
});

test('les couleurs héritées du bouton sont acceptées en rgb()', async () => {
  const data: LottieAnimationData = await readJson('success.json');
  const result = prepareAnimationData(data, 'monochrome', 'rgb(21, 128, 61)', '#22C55E');
  assert.deepEqual((result.layers[0] as any).shapes[0].it[1].c.k, [21 / 255, 128 / 255, 61 / 255, 1]);
});

test('les sources multicolores sont clonées sans recoloration additionnelle', async () => {
  const data: LottieAnimationData = await readJson('star.json');
  const result = prepareAnimationData(data, 'original', '#111827', '#111827');
  assert.notEqual(result, data);
  assert.deepEqual(result, data);
});

test('chargement mutualisé, rejet de JSON invalide et nouvel essai après un échec', async () => {
  const realFetch = globalThis.fetch;
  const data = await readJson('success.json');
  let requests = 0;
  globalThis.fetch = async () => { requests++; return new Response(JSON.stringify(data), { status: 200 }); };
  try {
    const first = loadAnimationData('/test-shared.json');
    const second = loadAnimationData('/test-shared.json');
    assert.equal(first, second);
    assert.deepEqual(await first, data);
    assert.equal(requests, 1);
    globalThis.fetch = async () => new Response('{}', { status: 200 });
    await assert.rejects(loadAnimationData('/test-retry.json'), /Invalid animation/);
    globalThis.fetch = async () => new Response(JSON.stringify(data), { status: 200 });
    assert.deepEqual(await loadAnimationData('/test-retry.json'), data);
    globalThis.fetch = async () => new Response('Not found', { status: 404 });
    await assert.rejects(loadAnimationData('/test-missing.json'), /unavailable/);
  } finally { globalThis.fetch = realFetch; }
});
