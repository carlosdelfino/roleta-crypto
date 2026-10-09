export function getRange(min, max, decimals = 0) {
  const scale = 10 ** decimals;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 4 || !Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < min) throw new Error('Informe valores válidos: o máximo deve ser maior ou igual ao mínimo.');
  const lo = Math.ceil(min * scale - 1e-8), hi = Math.floor(max * scale + 1e-8);
  const count = hi - lo + 1;
  if (!Number.isSafeInteger(lo) || !Number.isSafeInteger(hi) || lo > hi || count > 4294967296) throw new Error('Intervalo muito grande ou incompatível com as casas decimais escolhidas.');
  return { lo, hi, count, scale, decimals };
}
export function randomValue(range, cryptoSource = globalThis.crypto) {
  const limit = Math.floor(4294967296 / range.count) * range.count;
  const buffer = new Uint32Array(1);
  do { cryptoSource.getRandomValues(buffer); } while (buffer[0] >= limit);
  return (range.lo + buffer[0] % range.count) / range.scale;
}
export function getLink(value) {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Use um link completo começando com https:// ou http://.');
  return url.href;
}
