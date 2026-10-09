import test from 'node:test';
import assert from 'node:assert/strict';
import { getRange, randomValue, getLink } from '../src/draw.js';
const source = (...values) => ({ getRandomValues(buffer) { buffer[0] = values.shift(); return buffer; } });
test('includes both endpoints and supports a single value', () => {
  const range = getRange(1, 100);
  assert.equal(randomValue(range, source(0)), 1);
  assert.equal(randomValue(range, source(99)), 100);
  assert.equal(randomValue(getRange(7, 7), source(42)), 7);
});
test('decimal values use discrete fixed precision', () => {
  assert.equal(randomValue(getRange(0.01, 0.03, 2), source(2)), 0.03);
  assert.equal(getRange(1.001, 1.019, 2).count, 1);
});
test('rejection sampling excludes biased tail', () => {
  assert.equal(randomValue(getRange(0, 9), source(4294967295, 9)), 9);
});
test('rejects invalid and oversized intervals', () => {
  for (const args of [[3, 1], [-1, 2], [NaN, 4], [0, Infinity], [0, 4294967296], [0.001, 0.009, 2], [1, 2, 5]]) assert.throws(() => getRange(...args));
});
test('only web links are accepted', () => {
  assert.equal(getLink('https://hubagentic.space'), 'https://hubagentic.space/');
  for (const link of ['javascript:alert(1)', 'file:///tmp/foo', 'texto']) assert.throws(() => getLink(link));
});
