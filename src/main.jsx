import QRCode from 'qrcode';
import { getRange, randomValue, getLink } from './draw.js';
import './style.css';

import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function App() {
useEffect(() => {

const $ = id => document.getElementById(id);
const wheel = document.querySelector('.wheel');
let range, rotation = 0, busy = false, history = [], qrVersion = 0, linkTimer;
const format = (value, decimals = Number($('decimals').value)) => value.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
function readRange() { return getRange(Number($('min').value), Number($('max').value), Number($('decimals').value)); }
function renderWheel() {
  range = readRange();
  const n = Math.min(range.count, 24), angle = 360 / n;
  const point = (r, a) => [300 + r * Math.cos(a * Math.PI / 180), 300 + r * Math.sin(a * Math.PI / 180)];
  let markup = '<circle cx="300" cy="300" r="296" fill="#cfa965"/>';
  for (let i = 0; i < n; i++) {
    const a = -90 + i * angle, start = point(278, a), end = point(278, a + angle);
    const value = (range.lo + Math.round(i * (range.count - 1) / Math.max(1, n - 1))) / range.scale;
    markup += n === 1 ? '<circle cx="300" cy="300" r="278" fill="#0d6853"/>' : `<path d="M300 300 L${start} A278 278 0 ${angle > 180 ? 1 : 0} 1 ${end} Z" fill="${i === 0 ? '#0d6853' : i % 2 ? '#ad2c36' : '#141c20'}" stroke="#bba477" stroke-width="1.5"/>`;
    markup += `<text x="300" y="61" transform="rotate(${i * angle + angle / 2} 300 300)" text-anchor="middle" fill="#fff4db" font-size="${n > 16 ? 17 : 21}" font-family="Georgia" font-weight="bold">${format(value)}</text>`;
  }
  markup += '<circle cx="300" cy="300" r="200" fill="none" stroke="#dfbe7d" stroke-width="3"/><circle cx="300" cy="300" r="285" fill="none" stroke="#6b4d27" stroke-width="5"/>';
  wheel.innerHTML = markup;
  $('range-label').textContent = `Entre ${format(range.lo / range.scale)} e ${format(range.hi / range.scale)}, incluindo os extremos`;
}
function drawQR(link) {
  const { size, data } = QRCode.create(link, { errorCorrectionLevel: 'M' }).modules;
  const cover = 0.9, clip = 0.7071 - 0.5 / cover;
  const margin = Math.max(4, Math.ceil(clip * size / (1 - 2 * clip)));
  const total = size + margin * 2, px = 360, s = px / total;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = px;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, px, px);
  const cell = i => (margin + i) * s;
  const finder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  const dot = (r, c) => r >= 0 && c >= 0 && r < size && c < size && data[r * size + c] && !finder(r, c);
  const round = (x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };
  ctx.fillStyle = '#000';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (!dot(r, c)) continue;
    const x = cell(c), y = cell(r);
    ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s / 2, 0, Math.PI * 2); ctx.fill();
    if (dot(r, c + 1)) ctx.fillRect(x + s / 2, y, s, s);
    if (dot(r + 1, c)) ctx.fillRect(x, y + s / 2, s, s);
  }
  for (const [r0, c0] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    const x = cell(c0), y = cell(r0);
    round(x, y, 7 * s, 7 * s, 2.2 * s); ctx.fill();
    ctx.fillStyle = '#fff'; round(x + s, y + s, 5 * s, 5 * s, 1.5 * s); ctx.fill();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(x + 3.5 * s, y + 3.5 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
  }
  return canvas;
}
function updateQR() {
  const version = ++qrVersion;
  $('qr').hidden = true;
  try {
    const canvas = drawQR(getLink($('link').value.trim()));
    if (version !== qrVersion) return;
    $('qr').width = canvas.width; $('qr').height = canvas.height;
    $('qr').getContext('2d').drawImage(canvas, 0, 0); $('qr').hidden = false;
    $('error').textContent = '';
  } catch { if (version === qrVersion) $('error').textContent = 'Informe um link http:// ou https:// válido. Links muito extensos devem ser encurtados.'; }
}
for (const id of ['min', 'max', 'decimals']) $(id).addEventListener('input', () => { if (busy) return; try { renderWheel(); $('error').textContent = ''; } catch (e) { $('error').textContent = e.message; } });
$('link').addEventListener('input', () => { ++qrVersion; $('qr').hidden = true; clearTimeout(linkTimer); linkTimer = setTimeout(updateQR, 200); });
$('settings').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  try { renderWheel(); getLink($('link').value.trim()); } catch (e) { $('error').textContent = e.message; return; }
  busy = true; $('error').textContent = ''; document.querySelectorAll('#settings input, #settings select, #spin').forEach(el => el.disabled = true);
  $('spin').firstElementChild.textContent = 'SORTEANDO…'; $('result-label').textContent = 'A ROLETA ESTÁ GIRANDO'; $('result').textContent = '…';
  const value = randomValue(range), decimals = range.decimals;
  const n = Math.min(range.count, 24), position = range.count === 1 ? 0 : Math.round((value * range.scale - range.lo) * (n - 1) / (range.count - 1));
  // For large intervals labels are samples; replace the selected segment with the exact draw.
  wheel.querySelectorAll('text')[position].textContent = format(value, decimals);
  const target = (360 - (position + 0.5) * 360 / n) % 360;
  const next = rotation + 360 * 6 + ((target - rotation % 360 + 360) % 360);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animation = wheel.animate([{ transform: `rotate(${rotation}deg)` }, { transform: `rotate(${next}deg)` }], { duration: reduced ? 100 : 5200, easing: 'cubic-bezier(.12,.7,.12,1)', fill: 'forwards' });
  await animation.finished; rotation = next; wheel.style.transform = `rotate(${rotation}deg)`; animation.cancel();
  $('result').textContent = format(value, decimals); $('result-label').textContent = 'VALOR SORTEADO';
  history.unshift({ value, decimals, time: new Date() }); history = history.slice(0, 6); renderHistory();
  busy = false; document.querySelectorAll('#settings input, #settings select, #spin').forEach(el => el.disabled = false); $('spin').firstElementChild.textContent = 'GIRAR NOVAMENTE';
});
function renderHistory() {
  $('history').replaceChildren();
  if (!history.length) { const li = document.createElement('li'); li.className = 'empty'; li.textContent = 'Seu primeiro resultado aparecerá aqui.'; $('history').append(li); }
  history.forEach((entry, i) => { const li = document.createElement('li'); const number = document.createElement('span'); number.textContent = `#${String(history.length - i).padStart(2, '0')}`; const value = document.createElement('strong'); value.textContent = format(entry.value, entry.decimals); const time = document.createElement('time'); time.textContent = entry.time.toLocaleTimeString('pt-BR'); li.append(number, value, time); $('history').append(li); });
}
$('clear').onclick = () => { history = []; renderHistory(); };
renderWheel(); updateQR();

}, []);
return (<>

<header><a className="brand" href="./"><span className="brand-icon">✦</span> ROLETA<span>CRYPTO</span></a><span className="tag">SORTEIO AO VIVO</span></header>
<main><section className="stage"><h1>Um giro.<br /><em>Ganhe um Brinde.</em></h1>
<div className="wheel-wrap"><div className="pointer"></div><div className="wheel-frame"><svg className="wheel" viewBox="0 0 600 600" aria-hidden="true"></svg><div className="qr-center"><canvas id="qr" aria-label="QR Code do link informado"></canvas></div></div></div>
<div className="wheel-note"><span className="dot"></span> QR Code fixo para escanear durante o giro</div></section>
<aside><div className="panel"><div className="eyebrow">PERSONALIZE SUA RODADA</div><h2>Prepare o sorteio</h2><form id="settings"><div className="field-row"><label>Valor mínimo<input id="min" type="number" min="0" step="any" defaultValue="1" required /></label><label>Valor máximo<input id="max" type="number" min="0" step="any" defaultValue="100" required /></label></div><label>Casas decimais<select id="decimals"><option value="0">0 · valores inteiros</option><option value="2">2 · centésimos</option><option value="4">4 · frações de cripto</option></select></label><label>Link do QR Code<input id="link" type="url" defaultValue="https://hubagentic.space" placeholder="https://seusite.com" required /></label><p className="hint">O código é atualizado automaticamente e abre exatamente este link.</p><p id="error" role="alert"></p><button id="spin" type="submit"><span>GIRAR ROLETA</span><span>↗</span></button></form>
<div className="result" aria-live="polite" aria-atomic="true"><span id="result-label">PRONTO PARA A PRIMEIRA RODADA</span><strong id="result">—</strong><small id="range-label">Entre 1 e 100, incluindo os extremos</small></div></div>
<div className="history-head"><h3>Últimos sorteios</h3><button id="clear" type="button">Limpar</button></div><ol id="history"><li className="empty">Seu primeiro resultado aparecerá aqui.</li></ol><p className="footnote">Sorteio local com aleatoriedade criptográfica. O QR Code compartilha um link; a roleta não realiza transferências.</p></aside></main><footer><span>ROLETA CRYPTO</span><span>Seu próximo resultado começa com um giro.</span></footer>
</>);
}
createRoot(document.getElementById('app')).render(<App />);
