const $ = id => document.getElementById(id);
const money = n => (Number(n) || 0).toLocaleString("pl-PL", {
  style: "currency", currency: "PLN"
});
const profiles = {
  open: {
    label: "Otwartokomórkowa",
    product: "Omega Pur OK-12E",
    price: 8300,
    m3: 37.5
  },
  closed: {
    label: "Zamkniętokomórkowa",
    product: "Omega Pur ZK-35",
    price: 9400,
    m3: 10
  }
};
const STORE = "birtech_orders";
let current = {};
let currentId = null;

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function save(data) {
  localStorage.setItem(STORE, JSON.stringify(data));
}
function val(id) {
  return $(id)?.value ?? "";
}
function num(id) {
  return Math.max(0, Number(val(id)) || 0);
}
function datePL(date = new Date()) {
  return date.toLocaleDateString("pl-PL");
}
function profile() {
  return profiles[val("foam")] || profiles.open;
}
function calculate() {
  const p = profile();
  const area = num("area");
  const thickness = num("thickness");
  const price = num("price");
  const volume = area * thickness / 100;
  const sets = p.m3 ? volume / p.m3 : 0;
  const setsBuy = Math.ceil(sets);
  const materialCost = sets * p.price;
  const net = area * price;
  const vat = num("vat");
  const vatAmount = net * vat / 100;
  const gross = net + vatAmount;
  const cost = materialCost + num("labor") + num("fuel") + num("other");
  const profit = net - cost;
  const margin = net ? profit / net * 100 : 0;

  current = {
    id: currentId || Date.now(),
    date: new Date().toISOString(),
    customer: val("customer").trim(),
    phone: val("phone").trim(),
    address: val("address").trim(),
    email: val("email").trim(),
    clientNip: val("clientNip").trim(),
    area, thickness, price, vat, vatAmount, net, gross,
    materialCost, cost, profit, margin, volume, sets, setsBuy,
    foam: p.label, product: p.product,
    scope: val("scope") || "Poddasze"
  };

  $("material").value = materialCost.toFixed(2);
  $("setsUsed").textContent = sets.toFixed(2);
  $("setsBuy").textContent = setsBuy;
  $("volumeUsed").textContent = `Objętość: ${volume.toFixed(2)} m³`;
  $("materialProfile").textContent =
    `${p.product} · zestaw ${money(p.price)}`;
  $("net").textContent = money(net);
  $("gross").textContent = money(gross);
  $("cost").textContent = money(cost);
  $("profit").textContent = money(profit);
  $("margin").textContent = `Marża od netto: ${margin.toFixed(1)}%`;
  $("summary").textContent =
    `${area} m² · ${p.label} · ${p.product} · ${thickness} cm`;
  $("offerPrice").textContent = `${money(gross)} brutto`;
  return current;
}
function saveOrder() {
  const order = calculate();
  const all = load();
  const index = all.findIndex(item => item.id === order.id);
  if (index >= 0) all[index] = order;
  else all.unshift(order);
  save(all);
  currentId = order.id;
  renderOrders();
  alert("Zlecenie zapisane w tej przeglądarce.");
}
function renderOrders() {
  const all = load();
  $("count").textContent = all.length;
  $("list").innerHTML = "";
  if (!all.length) {
    $("list").textContent = "Brak zapisanych zleceń.";
    return;
  }
  all.forEach(order => {
    const card = document.createElement("article");
    card.className = "order-card";
    const title = document.createElement("h3");
    title.textContent = order.customer || "Klient bez nazwy";
    const info = document.createElement("p");
    info.textContent =
      `${datePL(new Date(order.date))} · ${order.area} m² · ${order.thickness} cm · ${money(order.gross)}`;
    const loadButton = document.createElement("button");
    loadButton.textContent = "Otwórz";
    loadButton.type = "button";
    loadButton.onclick = () => {
      currentId = order.id;
      [
        "customer", "phone", "address", "email", "clientNip",
        "area", "thickness", "price", "vat", "labor", "fuel", "other"
      ].forEach(id => {
        if ($(id) && order[id] !== undefined) $(id).value = order[id];
      });
      $("foam").value = order.product === profiles.closed.product ? "closed" : "open";
      $("scope").value = order.scope || "Poddasze";
      calculate();
      document.querySelector('[data-tab="calc"]').click();
    };
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Usuń";
    deleteButton.type = "button";
    deleteButton.onclick = () => {
      if (!confirm("Usunąć to zlecenie?")) return;
      save(load().filter(item => item.id !== order.id));
      renderOrders();
    };
    card.append(title, info, loadButton, deleteButton);
    $("list").append(card);
  });
}
function offerHTML(order) {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 14);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const logo = new URL(
    "WhatsApp%20Image%202026-10-25%20at%2019.42.20.jpeg",
    location.href
  ).href;
  return `<!doctype html>
<html lang="pl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Oferta BIRTECH</title>
<style>
@page{size:A4;margin:17mm}
body{font:14px Arial,sans-serif;color:#202420;line-height:1.5}
header{display:flex;align-items:center;gap:18px;border-bottom:4px solid #39d414;padding-bottom:14px}
header img{width:105px;height:105px;object-fit:contain}
h1{font-size:25px;margin:0;color:#151515}
.green{color:#27a80c;font-weight:bold}
.meta{display:flex;justify-content:space-between;margin:22px 0}
section{margin:22px 0}
table{width:100%;border-collapse:collapse}
td,th{border-bottom:1px solid #ddd;padding:9px;text-align:left}
th{background:#f1f5ef}
.total{margin-left:auto;width:280px}
.total td:last-child{text-align:right}
.grand{font-size:20px;font-weight:bold;color:#198c09}
footer{margin-top:35px;border-top:1px solid #ccc;padding-top:12px;font-size:11px;color:#555}
@media print{button{display:none}}
</style></head><body>
<header><img src="${logo}" alt="Logo BIRTECH">
<div><h1>BIRTECH</h1><div class="green">IZOLACJE NATRYSKOWE PIANĄ PUR</div>
<div>Jakub Bir · Kartuzy</div><div>Tel. 536 899 440</div>
<div>NIP 589-200-38-60</div></div></header>
<div class="meta"><div><b>OFERTA NA IZOLACJĘ PUR</b><br>Data: ${datePL()}<br>Ważna do: ${datePL(expiry)}</div>
<div><b>Dla:</b><br>${esc(order.customer || "................................")}<br>
${esc(order.address)}<br>${esc(order.phone)}</div></div>
<section><h2>Zakres oferty</h2>
<p>Usługa: izolacja natryskowa pianą PUR — ${esc(order.scope)}.</p>
<p>Produkt: <b>${esc(order.product)}</b> (${esc(order.foam)}).</p>
<p>Powierzchnia: <b>${order.area} m²</b><br>Grubość: <b>${order.thickness} cm</b></p>
</section>
<section><h2>Wycena</h2>
<table><thead><tr><th>Usługa</th><th>Powierzchnia</th><th>Cena netto/m²</th><th>Netto</th></tr></thead>
<tbody><tr><td>Izolacja pianą PUR</td><td>${order.area} m²</td>
<td>${money(order.price)}</td><td>${money(order.net)}</td></tr></tbody></table>
<table class="total"><tr><td>Netto</td><td>${money(order.net)}</td></tr>
<tr><td>VAT ${order.vat}%</td><td>${money(order.vatAmount)}</td></tr>
<tr class="grand"><td>Brutto</td><td>${money(order.gross)}</td></tr></table>
</section>
<section><h2>Cena obejmuje</h2>
<ul><li>Natrysk piany PUR w uzgodnionym zakresie.</li>
<li>Zabezpieczenie okien, ścian, podłóg i innych powierzchni narażonych na zabrudzenie natryskiem.</li>
<li>Przygotowanie miejsca pracy do wykonania natrysku.</li>
<li>Uporządkowanie miejsca pracy po zakończeniu usługi.</li></ul></section>
<section><p>Dziękujemy za zainteresowanie ofertą BIRTECH.</p>
<p>Akceptacja oferty: ........................................</p></section>
<footer>BIRTECH — Jakub Bir · Izolacje natryskowe pianą PUR · tel. 536 899 440 · ul. Parkowa 12/12, 83-300 Kartuzy</footer>
<script>window.onload=()=>setTimeout(()=>window.print(),500);<\/script>
</body></html>`;
}
function printOffer() {
  const order = calculate();
  const popup = window.open("", "_blank");
  if (!popup) {
    alert("Przeglądarka zablokowała okno. Zezwól na wyskakujące okna i spróbuj ponownie.");
    return;
  }
  popup.document.open();
  popup.document.write(offerHTML(order));
  popup.document.close();
}
function messageText(order) {
  return `Dzień dobry${order.customer ? " " + order.customer : ""}, przesyłam ofertę BIRTECH na izolację pianą PUR. Zakres: ${order.scope}. Produkt: ${order.product}. Powierzchnia: ${order.area} m², grubość: ${order.thickness} cm. Cena brutto: ${money(order.gross)}. Oferta ważna 14 dni. BIRTECH — Izolacje natryskowe pianą PUR, tel. 536 899 440.`;
}
function share(type) {
  const order = calculate();
  const message = messageText(order);
  if (type === "email") {
    location.href = `mailto:${encodeURIComponent(order.email || "")}?subject=${encodeURIComponent("Oferta BIRTECH — izolacja PUR")}&body=${encodeURIComponent(message + "\n\nPełną ofertę PDF zapisz przyciskiem „Zapisz / udostępnij PDF” i dołącz do wiadomości.")}`;
  } else if (type === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  } else if (type === "sms") {
    location.href = `sms:?&body=${encodeURIComponent(message)}`;
  }
}
function exportOrders() {
  const blob = new Blob([JSON.stringify(load(), null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "birtech-zlecenia.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.querySelectorAll("[data-tab]").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    $("calc").classList.toggle("hidden", button.dataset.tab !== "calc");
    $("orders").classList.toggle("hidden", button.dataset.tab !== "orders");
  });
});
$("form").addEventListener("submit", event => {
  event.preventDefault();
  saveOrder();
});
["area", "thickness", "price", "vat", "material", "labor", "fuel", "other", "foam", "scope"].forEach(id => {
  $(id)?.addEventListener("input", calculate);
  $(id)?.addEventListener("change", calculate);
});
$("print").addEventListener("click", printOffer);
$("emailSend").addEventListener("click", () => share("email"));
$("whatsappSend").addEventListener("click", () => share("whatsapp"));
$("smsSend").addEventListener("click", () => share("sms"));
$("export").addEventListener("click", exportOrders);
calculate();
renderOrders();
