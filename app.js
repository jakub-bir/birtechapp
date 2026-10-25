const $ = id => document.getElementById(id);
const money = n => (Number(n) || 0).toLocaleString('pl-PL', {
  style: 'currency',
  currency: 'PLN'
});
const val = id => Math.max(0, Number($(id).value) || 0);

const profiles = {
  open: {
    label: 'Otwartokomórkowa',
    product: 'Omega Pur OK-12E',
    price: 8300,
    m3: 37.5,
    basis: '150 m² przy 25 cm'
  },
  closed: {
    label: 'Zamkniętokomórkowa',
    product: 'Omega Pur ZK-35',
    price: 9400,
    m3: 10,
    basis: '200 m² przy 5 cm'
  }
};

const load = () => {
  try {
    return JSON.parse(localStorage.getItem('birtech_orders') || '[]');
  } catch {
    return [];
  }
};

const save = a => localStorage.setItem('birtech_orders', JSON.stringify(a));

const esc = s => String(s || '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

function calc() {
  const area = val('area');
const thickness = val('thickness');
  const price = val('price');
  const vat = val('vat');
  const p = profiles[$('foam').value];

  const volume = area * thickness / 100;
  const sets = volume / p.m3;
  const material = sets * p.price;
  const net = area * price;
  const vatAmount = net * vat / 100;
  const gross = net + vatAmount;
  const cost = material + val('labor') + val('fuel') + val('other');
  const profit = net - cost;
  const margin = net ? profit / net * 100 : 0;

  $('material').value = material.toFixed(2);
  $('setsUsed').textContent =
    sets.toLocaleString('pl-PL', { maximumFractionDigits: 2 }) + ' zest.';
  $('setsBuy').textContent = Math.ceil(sets) + ' zest.';
  $('volumeUsed').textContent =
    volume.toLocaleString('pl-PL', { maximumFractionDigits: 2 }) +
    ' m³ · ' + money(material);
  $('materialProfile').textContent = money(p.price) + ' / zestaw · ' + p.basis;
  $('net').textContent = money(net);
  $('gross').textContent = money(gross);
  $('cost').textContent = money(cost);
  $('profit').textContent = money(profit);
  $('margin').textContent =
    'Marża: ' + margin.toLocaleString('pl-PL', { maximumFractionDigits: 1 }) + '%';
  $('summary').textContent =
    `${area} m² · ${p.label.toLowerCase()} · ${thickness} cm · ${$('scope').value}`;
  $('offerPrice').textContent = money(gross) + ' brutto';

  return {
    area, thickness, price, vat, vatAmount, net, gross,
    materialCost: material, cost, profit, margin, volume, sets,
    setsBuy: Math.ceil(sets), foam: p.label, product: p.product,
    scope: $('scope').value, customer: $('customer').value,
    phone: $('phone').value, address: $('address').value,
    email: $('email').value, clientNip: $('clientNip').value
  };
}

/* Pełna oferta w dotychczasowym stylu BIRTECH */
function offer(o) {
  const d = new Date();
  const expiry = new Date(d);
  expiry.setDate(d.getDate() + 14);

  const date = x => x.toLocaleDateString('pl-PL');
  const logo = new URL(
    'WhatsApp%20Image%202026-10-25%20at%2019.42.20.jpeg',
    location.href
  ).href;

  return `<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Oferta BIRTECH</title>
<style>
@page { size: A4; margin: 10mm; }
* { box-sizing: border-box; }
body {
  font: 9.5pt Arial, sans-serif;
  color: #222;
  line-height: 1.3;
  margin: 0;
}
.head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
  border-bottom: 3px solid #287747;
  padding-bottom: 10px;
  margin-bottom: 12px;
}
.logo {
  display: block;
  width: 105px;
  height: 105px;
  object-fit: contain;
  flex-shrink: 0;
}
.brand-block {
  min-width: 0;
}
.brand {
  font-size: 25pt;
  color: #287747;
  font-weight: bold;
}
.tag {
  font-size: 8pt;
  font-weight: bold;
  letter-spacing: .3px;
  margin: 3px 0 8px;
}
.company {
  text-align: left;
  font-size: 8.5pt;
  line-height: 1.45;
}
.title { font-size: 19pt; margin: 12px 0 3px; }
.sub { margin: 0 0 8px; }
p { margin: 7px 0; }
.client {
  border: 1px solid #bbb;
  padding: 8px;
  margin: 9px 0;
  break-inside: avoid;
}
h3 { color: #287747; font-size: 11pt; margin: 0 0 5px; }
.section { margin: 10px 0; break-inside: avoid; }
table { width: 100%; border-collapse: collapse; margin: 5px 0; }
td, th { padding: 5px 7px; border-bottom: 1px solid #ddd; text-align: left; }
.right { text-align: right; }
ul { margin: 5px 0; padding-left: 19px; }
li { margin: 3px 0; }
.total { width: 62%; margin-left: auto; }
.total tr:last-child { font-size: 13pt; font-weight: bold; }
.total tr:last-child td { border-top: 2px solid #287747; }
.signs { display: flex; gap: 35px; margin-top: 20px; break-inside: avoid; }
.sign { width: 50%; border-top: 1px solid #777; padding-top: 5px; font-size: 8.5pt; }
.foot { border-top: 1px solid #ddd; margin-top: 12px; padding-top: 6px; font-size: 8pt; }
@media screen {
  body { max-width: 800px; margin: 20px auto; padding: 18px; }
}
</style>
</head>
<body>
<div class="head">
  <img class="logo" src="${logo}" alt="Logo BIRTECH"
    onerror="this.style.display='none'">
  <div class="brand-block">
    <div class="brand">BIRTECH</div>
    <div class="tag">IZOLACJE NATRYSKOWE PIANĄ PUR</div>
    <div class="company">
      <b>Jakub Bir · Kartuzy</b><br>
      Tel. 536 899 440<br>
      NIP 589-200-38-60
    </div>
  </div>
</div>

<h1 class="title">Oferta na wykonanie izolacji</h1>
<p class="sub">Izolacja natryskowa pianą poliuretanową PUR</p>
<p>
  <b>Data wystawienia:</b> ${date(d)}
  &nbsp; <b>Oferta ważna do:</b> ${date(expiry)}<br>
  <b>Zakres prac:</b> ${esc(o.scope)}
</p>

<div class="client">
  <h3>Dane klienta i inwestycji</h3>
  <b>Klient:</b> ${esc(o.customer) || '........................................'}<br>
  <b>Adres inwestycji:</b> ${esc(o.address) || '........................................'}<br>
 <b>Telefon:</b> ${esc(o.phone)}<br>
<b>E-mail:</b> ${esc(o.email)}<br>
  ${o.clientNip ? '<b>NIP:</b> ' + esc(o.clientNip) : ''}
</div>

<div class="section">
  <h3>1. Przedmiot oferty</h3>
  <table>
    <tr><td>Usługa / produkt</td><td><b>Izolacja natryskowa pianą PUR</b><br>${esc(o.product)}</td></tr>
    <tr><td>Rodzaj piany</td><td>${esc(o.foam)}</td></tr>
    <tr><td>Grubość izolacji</td><td>${o.thickness} cm</td></tr>
    <tr><td>Powierzchnia</td><td>${o.area} m²</td></tr>
  </table>
</div>

<div class="section">
  <h3>2. Zakres usługi — cena obejmuje</h3>
  <ul>
    <li>Wykonanie izolacji natryskowej pianą PUR na uzgodnionej powierzchni i grubości.</li>
    <li>Zastosowanie uzgodnionego produktu Omega Pur.</li>
    <li>Zabezpieczenie powierzchni narażonych na zabrudzenie podczas natrysku.</li>
    <li>Przygotowanie stanowiska roboczego w zakresie niezbędnym do wykonania natrysku.</li>
    <li>Posprzątanie stanowiska pracy po zakończeniu natrysku.</li>
  </ul>
</div>

<div class="section">
  <h3>3. Zestawienie ceny</h3>
  <table>
    <tr><td>Powierzchnia</td><td class="right">${o.area} m²</td></tr>
    <tr><td>Cena jednostkowa netto</td><td class="right">${money(o.price)} / m²</td></tr>
    <tr><td>Wartość netto</td><td class="right">${money(o.net)}</td></tr>
    <tr><td>VAT (${o.vat}%)</td><td class="right">${money(o.vatAmount)}</td></tr>
  </table>
  <table class="total">
    <tr><td>Do zapłaty brutto</td><td class="right">${money(o.gross)}</td></tr>
  </table>
</div>

<p>Termin realizacji zostanie uzgodniony z klientem. Oferta jest ważna do wskazanej powyżej daty.</p>

<div class="signs">
  <div class="sign">Podpis wykonawcy</div>
  <div class="sign">Akceptacja oferty przez klienta</div>
</div>

<div class="foot">
  BIRTECH — Jakub Bir · Izolacje natryskowe pianą PUR · Kartuzy · 536 899 440
</div>
</body>
</html>`;
}

/* Otwiera ofertę do wydruku lub zapisania jako PDF */
function printOffer() {
  const w = window.open('', '_blank');

  if (!w) {
    alert('Przeglądarka zablokowała nowe okno. Zezwól na wyskakujące okna i spróbuj ponownie.');
    return;
  }

  w.document.open();
  w.document.write(offer(calc()));
  w.document.close();

  w.onload = () => {
    setTimeout(() => {
      w.focus();
      w.print();
    }, 500);
  };
}

function msg(o) {
  return `Dzień dobry${o.customer ? ' ' + o.customer : ''}, przesyłam ofertę BIRTECH na izolację pianą PUR.
Zakres: ${o.scope}.
Produkt: ${o.product}.
Powierzchnia: ${o.area} m², grubość: ${o.thickness} cm.
Cena brutto: ${money(o.gross)}.
Oferta ważna 14 dni.
BIRTECH — Izolacje natryskowe pianą PUR, tel. 536 899 440.`;
}

/* Udostępnianie treści wiadomości — PDF wysyła się osobno */
function share(type) {
  const o = calc();
  const t = msg(o);
  const phone = String(o.phone || '').replace(/[^\d+]/g, '');

  if (type === 'email') {
    const subject = 'Oferta BIRTECH — izolacja PUR';
    location.href =
      `mailto:${encodeURIComponent(o.email || '')}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(t + '\n\nPełną ofertę PDF można dołączyć po zapisaniu jej na urządzeniu.')}`;
  }

  if (type === 'whatsapp') {
    const number = phone.replace(/\D/g, '');
    const url = number
      ? `https://wa.me/${number}?text=${encodeURIComponent(t)}`
      : `https://wa.me/?text=${encodeURIComponent(t)}`;
    window.open(url, '_blank');
  }

  if (type === 'sms') {
    const separator = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? '&' : '?';
    location.href = `sms:${phone}${separator}body=${encodeURIComponent(t)}`;
  }
}

/* Zapisane zlecenia */
function render() {
  const a = load();
  $('count').textContent = a.length;

  $('list').innerHTML = a.length
    ? a.map(o => `
      <article class="order">
        <button class="delete" data-id="${o.id}">Usuń</button>
        <b>${esc(o.customer || 'Klient bez nazwy')} · ${money(o.gross)} brutto</b>
        <p>${esc(o.address || 'Brak adresu')} · ${o.area} m² · ${o.thickness} cm</p>
        <p>${esc(o.product || o.foam)} · ${esc(o.scope)}</p>
        <p>Materiał ${money(o.materialCost ?? 0)} · szacowany zysk ${money(o.profit)}</p>
      </article>
    `).join('')
    : '<p class="fine">Brak zapisanych zleceń.</p>';

  $('list').querySelectorAll('[data-id]').forEach(b => {
    b.onclick = () => {
      if (confirm('Usunąć zlecenie?')) {
        save(load().filter(o => o.id !== Number(b.dataset.id)));
        render();
      }
    };
  });
}

[
  'area', 'price', 'vat', 'material', 'labor', 'fuel', 'other',
  'foam', 'thickness', 'scope', 'customer', 'phone', 'address',
  'email', 'clientNip'
].forEach(id => $(id).addEventListener('input', calc));

document.querySelectorAll('[data-tab]').forEach(b => {
  b.onclick = () => {
    document.querySelectorAll('[data-tab]').forEach(x =>
      x.classList.toggle('active', x === b)
    );
    $('calc').classList.toggle('hidden', b.dataset.tab !== 'calc');
    $('orders').classList.toggle('hidden', b.dataset.tab !== 'orders');
  };
});

$('form').onsubmit = e => {
  e.preventDefault();
  const o = { id: Date.now(), date: new Date().toISOString(), ...calc() };
  save([o, ...load()]);
  render();
  alert('Zlecenie zapisane.');
};

$('print').onclick = printOffer;
$('emailSend').onclick = () => share('email');
$('whatsappSend').onclick = () => share('whatsapp');
$('smsSend').onclick = () => share('sms');

$('export').onclick = () => {
  const blob = new Blob([JSON.stringify(load(), null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'birtech-zlecenia.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

calc();
render();
