const $ = id => document.getElementById(id);
const money = n => (Number(n) || 0).toLocaleString('pl-PL', {
  style: 'currency',
  currency: 'PLN'
});
const val = id => Math.max(0, Number($(id).value) || 0);

const load = () => {
  try {
    return JSON.parse(localStorage.getItem('birtech_orders') || '[]');
  } catch {
    return [];
  }
};
const save = a => localStorage.setItem('birtech_orders', JSON.stringify(a));

function calc() {
  const area = val('area');
  const net = area * val('price');
  const vatAmount = net * val('vat') / 100;
  const gross = net + vatAmount;
  const cost = val('material') + val('labor') + val('fuel') + val('other');
  const profit = net - cost;
  const margin = net ? profit / net * 100 : 0;

  $('net').textContent = money(net);
  $('gross').textContent = money(gross);
  $('cost').textContent = money(cost);
  $('profit').textContent = money(profit);
  $('margin').textContent = 'Marża: ' +
    margin.toLocaleString('pl-PL', { maximumFractionDigits: 1 }) + '%';
  $('summary').textContent =
    `${area} m² · piana ${$('foam').value.toLowerCase()} · ${val('thickness')} cm · ${$('scope').value}`;
  $('offerPrice').textContent = money(gross) + ' brutto';

  return {
    area, net, vatAmount, gross, cost, profit, margin,
    price: val('price'),
    vat: val('vat'),
    thickness: val('thickness')
  };
}

[
  'area', 'price', 'vat', 'material', 'labor',
  'fuel', 'other', 'foam', 'thickness', 'scope'
].forEach(id => $(id).addEventListener('input', calc));

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[c]);
}

function formatDate(date) {
  return date.toLocaleDateString('pl-PL');
}

function render() {
  const a = load();
  $('count').textContent = a.length;

  $('list').innerHTML = a.length
    ? a.map(o => `
      <article class="order">
        <button class="delete" data-id="${o.id}">Usuń</button>
        <b>${esc(o.customer || 'Klient bez nazwy')} · ${money(o.gross)} brutto</b>
        <p>${esc(o.address || 'Brak adresu')} · ${o.area} m² · ${o.thickness} cm</p>
        <p>${esc(o.foam)} · ${esc(o.scope)} · ${formatDate(new Date(o.date))}</p>
        <p>Koszt ${money(o.cost)} · szacowany zysk ${money(o.profit)}</p>
        ${o.phone ? '<p>Tel. ' + esc(o.phone) + '</p>' : ''}
      </article>
    `).join('')
    : '<p class="fine">Brak zleceń. Wypełnij kalkulator i zapisz pierwsze zlecenie.</p>';

  $('list').querySelectorAll('[data-id]').forEach(b => {
    b.onclick = () => {
      if (confirm('Usunąć zlecenie?')) {
        save(load().filter(o => o.id !== Number(b.dataset.id)));
        render();
      }
    };
  });
}

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
  const c = calc();
  const o = {
    id: Date.now(),
    date: new Date().toISOString(),
    customer: $('customer').value,
    phone: $('phone').value,
    address: $('address').value,
    foam: $('foam').value,
    scope: $('scope').value,
    ...c
  };
  save([o, ...load()]);
  render();
  document.querySelector('[data-tab="orders"]').click();
};

function printOffer() {
  const c = calc();
  const now = new Date();
  const expiry = new Date(now);
  expiry.setDate(expiry.getDate() + 14);

  const customer = $('customer').value.trim();
  const phone = $('phone').value.trim();
  const address = $('address').value.trim();
  const foamType = $('foam').value;
  const product = foamType === 'Otwartokomórkowa'
    ? 'Omega Pur OK-12E'
    : 'Omega Pur ZK-35';

  const clientName = customer || '........................................';
  const scope = $('scope').value;
  const description = [
    'Usługa natryskowego wykonania izolacji pianą PUR w uzgodnionym zakresie.',
    'Zabezpieczenie okien, ścian, podłóg i innych powierzchni narażonych na zabrudzenie natryskiem.',
    'Przygotowanie stanowiska roboczego w zakresie niezbędnym do wykonania natrysku.'
  ];

  const w = window.open('', '_blank');
  if (!w) {
    alert('Przeglądarka zablokowała okno wydruku. Zezwól na wyskakujące okna dla tej strony i spróbuj ponownie.');
    return;
  }

  w.document.write(`<!doctype html>
<html lang="pl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Oferta BIRTECH — ${esc(clientName)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font: 11pt Arial, sans-serif; color: #202820; line-height: 1.45; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #287747; padding-bottom: 14px; }
  .brand { font-size: 25pt; font-weight: 800; letter-spacing: 1px; color: #205d38; }
  .subtitle { font-size: 9pt; letter-spacing: 1px; }
  .company { font-size: 9pt; text-align: right; }
  h1 { font-size: 23pt; margin: 24px 0 4px; }
  h2 { font-size: 13pt; color: #205d38; margin: 22px 0 8px; }
  .muted { color: #626b63; font-size: 9pt; }
  .meta { display: flex; justify-content: space-between; gap: 20px; margin-top: 14px; }
  .client { background: #f3f6f3; padding: 12px; margin-top: 18px; border-radius: 5px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 9px 8px; border-bottom: 1px solid #dce3dc; text-align: left; vertical-align: top; }
  th { background: #f0f4f0; font-size: 9pt; }
  .num { text-align: right; white-space: nowrap; }
  .totals { width: 65%; margin-left: auto; margin-top: 15px; }
  .totals td { border: 0; padding: 4px 8px; }
  .grand { font-size: 15pt; font-weight: bold; color: #205d38; border-top: 2px solid #287747 !important; }
  ul { padding-left: 20px; }
  li { margin: 5px 0; }
  .terms { font-size: 9pt; }
  footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #dce3dc; font-size: 9pt; color: #626b63; }
  .sign { display: flex; justify-content: space-between; margin-top: 40px; }
  .sign div { width: 42%; border-top: 1px solid #7b837b; padding-top: 6px; font-size: 9pt; }
  .printbar { margin: 20px 0; }
  .printbar button { padding: 10px 18px; cursor: pointer; }
  @media print { .printbar { display: none; } }
</style>
</head>
<body>
<div class="printbar"><button onclick="window.print()">Drukuj / Zapisz jako PDF</button></div>
<header>
  <div>
    <div class="brand">BIRTECH</div>
    <div class="subtitle">IZOLACJE NATRYSKOWE PUR</div>
  </div>
  <div class="company">
    <b>BIRTECH — Jakub Bir</b><br>
    ul. Parkowa 12/12, 83-300 Kartuzy<br>
    Tel. 536 899 440<br>
    NIP: 589-200-38-60
  </div>
</header>

<h1>Oferta na wykonanie izolacji</h1>
<div class="muted">Izolacja natryskowa pianą poliuretanową PUR</div>

<div class="meta">
  <div><b>Data wystawienia:</b> ${formatDate(now)}<br>
  <b>Oferta ważna do:</b> ${formatDate(expiry)}</div>
  <div><b>Zakres prac:</b> ${esc(scope)}</div>
</div>

<div class="client">
  <b>Oferta dla:</b><br>
  ${esc(clientName)}<br>
  ${address ? 'Adres / miejscowość: ' + esc(address) + '<br>' : ''}
  ${phone ? 'Telefon: ' + esc(phone) : ''}
</div>

<h2>1. Przedmiot oferty</h2>
<table>
  <thead><tr><th>Usługa / produkt</th><th>Parametry</th><th class="num">Powierzchnia</th></tr></thead>
  <tbody><tr>
    <td>Izolacja natryskowa pianą PUR<br><b>${esc(product)}</b></td>
    <td>${esc(foamType)}<br>Grubość: ${c.thickness} cm</td>
    <td class="num">${c.area.toLocaleString('pl-PL')} m²</td>
  </tr></tbody>
</table>

<h2>2. Zakres usługi — cena obejmuje</h2>
<ul>${description.map(x => '<li>' + esc(x) + '</li>').join('')}</ul>

<h2>3. Zestawienie ceny</h2>
<table>
  <thead><tr><th>Pozycja</th><th class="num">Cena</th></tr></thead>
  <tbody>
    <tr><td>Powierzchnia</td><td class="num">${c.area.toLocaleString('pl-PL')} m²</td></tr>
    <tr><td>Cena jednostkowa netto</td><td class="num">${money(c.price)} / m²</td></tr>
  </tbody>
</table>
<table class="totals">
  <tr><td>Wartość netto</td><td class="num">${money(c.net)}</td></tr>
  <tr><td>VAT (${c.vat}%)</td><td class="num">${money(c.vatAmount)}</td></tr>
  <tr><td class="grand">Do zapłaty brutto</td><td class="num grand">${money(c.gross)}</td></tr>
</table>

<h2>4. Informacje dodatkowe</h2>
<div class="terms">
  Przygotowanie i naprawa podłoża, a także wykonanie lub zapewnienie szczeliny wentylacyjnej, nie są objęte niniejszą ofertą, chyba że strony uzgodnią inaczej na piśmie. Powierzchnie przeznaczone do natrysku powinny być przygotowane do wykonania prac. Zakres nieujęty w ofercie wymaga odrębnego uzgodnienia.
  <br><br>
  Termin realizacji zostanie uzgodniony z klientem. Oferta jest ważna do wskazanej powyżej daty.
</div>

<div class="sign">
  <div>Podpis wykonawcy</div>
  <div>Akceptacja oferty przez klienta</div>
</div>

<footer>
  BIRTECH — Jakub Bir · Izolacje natryskowe pianą PUR · Kartuzy
</footer>
<script>
  window.onload = () => setTimeout(() => window.print(), 350);
</script>
</body>
</html>`);
  w.document.close();
}

$('print').onclick = printOffer;

$('export').onclick = () => {
  const u = URL.createObjectURL(new Blob(
    [JSON.stringify(load(), null, 2)],
    { type: 'application/json' }
  ));
  const a = document.createElement('a');
  a.href = u;
  a.download = 'birtech-zlecenia.json';
  a.click();
  URL.revokeObjectURL(u);
};

calc();
render();
