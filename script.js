/* ---------- data ---------- */
const BRANDS = ["McDonald's", "Burger King", "Mostaza"];
const NAME_PARTS = {
  "McDonald's": ["McCombo Doble", "Cuarto de Libra", "McPollo Crocante", "Big Doble Queso", "McNuggets Burger", "Triple Cheddar", "McClásica", "Doble Bacon Melt"],
  "Burger King": ["Whopper Furioso", "Doble Carne Fuego", "King Bacon XL", "Crispy Chicken King", "Triple Stack", "Cheddar Lover", "BK Clásica", "Angry Doble"],
  "Mostaza": ["Mostaza Clásica", "Doble Cheddar Criolla", "Pollo Crispy Mostaza", "Triple Bacon Mostaza", "Mega Combo Fuego", "Barbacoa Doble", "Criolla XL", "Cheddar Melt"]
};
const BUN_COLORS = ["#E8A94B", "#D98C3B", "#F0B85E"];
const PATTY = "#5A3A22";
const CHEESE = "#FFC72C";

function money(n){ return "$" + n.toLocaleString("es-AR"); }

function burgerSVG(seed){
  const bun = BUN_COLORS[seed % BUN_COLORS.length];
  const hasCheese = seed % 2 === 0;
  const hasLettuce = seed % 3 !== 0;
  const hasTomato = seed % 4 !== 1;
  return `
  <svg width="118" height="118" viewBox="0 0 120 120">
    <ellipse cx="60" cy="96" rx="42" ry="10" fill="${bun}"/>
    <rect x="18" y="80" width="84" height="14" rx="7" fill="${PATTY}"/>
    ${hasLettuce ? `<path d="M14 78 q10 -14 24 -2 q10 -12 24 0 q10 -12 24 0 q12 -12 24 2 v6 h-96 z" fill="#7DA843"/>` : ""}
    ${hasTomato ? `<rect x="20" y="70" width="80" height="9" rx="4" fill="#D9432B"/>` : ""}
    ${hasCheese ? `<path d="M16 64 l88 0 l-8 14 l-72 0 z" fill="${CHEESE}"/>` : ""}
    <rect x="18" y="52" width="84" height="14" rx="7" fill="${PATTY}"/>
    <path d="M14 52 q0 -30 46 -30 q46 0 46 30 z" fill="${bun}"/>
    <circle cx="42" cy="30" r="2.4" fill="#fff3d6"/>
    <circle cx="60" cy="24" r="2.4" fill="#fff3d6"/>
    <circle cx="78" cy="30" r="2.4" fill="#fff3d6"/>
    <circle cx="50" cy="34" r="2.2" fill="#fff3d6"/>
    <circle cx="70" cy="34" r="2.2" fill="#fff3d6"/>
  </svg>`;
}

function starSVG(){
  return `<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L10 15l-5.6 3.1 1.4-6.3L1 8.5l6.4-.6z"/></svg>`;
}
function heartSVG(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6c-1.9-1.9-5-1.9-6.9 0L12 5.5l-1.9-1.9c-1.9-1.9-5-1.9-6.9 0-1.9 1.9-1.9 5 0 6.9L12 19.3l8.8-8.8c1.9-1.9 1.9-5 0-6.9z"/></svg>`;
}

function buildProducts(){
  const items = [];
  let id = 0;
  BRANDS.forEach((brand) => {
    NAME_PARTS[brand].forEach((name, i) => {
      const was = 3000 + ((id * 733) % 6000);
      const disc = 40 + ((id * 17) % 55); // 40-94%
      const now = Math.round(was * (1 - disc/100) / 50) * 50;
      const rating = (3.9 + ((id * 13) % 11) / 10).toFixed(1);
      const sold = 200 + ((id * 97) % 4000);
      items.push({
        id: id, brand, name, was, now, disc,
        rating: parseFloat(rating), sold,
        tag: disc > 70 ? "SOLO HOY" : (i % 3 === 0 ? "ENVÍO GRATIS" : null)
      });
      id++;
    });
  });
  return items;
}

const PRODUCTS = buildProducts();
const cart = {}; // id -> qty

/* ---------- chips ---------- */
const chipbar = document.getElementById("chipbar");
const chips = ["Todas", ...BRANDS, "Ofertas del día"];
let activeChip = "Todas";
chips.forEach(c => {
  const el = document.createElement("button");
  el.className = "chip" + (c === activeChip ? " active" : "");
  el.textContent = c;
  el.onclick = () => { activeChip = c; renderChips(); renderGrid(); };
  chipbar.appendChild(el);
});
function renderChips(){
  [...chipbar.children].forEach(el => el.classList.toggle("active", el.textContent === activeChip));
}

/* ---------- grid ---------- */
const grid = document.getElementById("grid");
const sortSelect = document.getElementById("sortSelect");

function filteredSorted(){
  let list = PRODUCTS.slice();
  if (activeChip === "Ofertas del día") list = list.filter(p => p.disc > 70);
  else if (activeChip !== "Todas") list = list.filter(p => p.brand === activeChip);

  const mode = sortSelect.value;
  if (mode === "cheap") list.sort((a,b) => a.now - b.now);
  else if (mode === "disc") list.sort((a,b) => b.disc - a.disc);
  else list.sort((a,b) => b.sold - a.sold);
  return list;
}

function renderGrid(){
  const list = filteredSorted();
  grid.innerHTML = list.map(p => `
    <div class="card">
      <div class="card-media">
        <span class="badge-off">-${p.disc}%</span>
        <button class="badge-fav" onclick="this.classList.toggle('active')">${heartSVG()}</button>
        ${burgerSVG(p.id)}
        ${p.tag ? `<span class="badge-tag">${p.tag}</span>` : ""}
      </div>
      <div class="card-body">
        <span class="brand">${p.brand}</span>
        <span class="pname">${p.name}</span>
        <div class="price-row">
          <span class="price-now">${money(p.now)}</span>
          <span class="price-was">${money(p.was)}</span>
        </div>
        <div class="meta-row">
          <span class="stars">${starSVG()} ${p.rating}</span>
          <span>${p.sold.toLocaleString("es-AR")} vendidas</span>
        </div>
        <button class="add-btn" id="add-${p.id}" onclick="addToCart(${p.id})">Agregar</button>
      </div>
    </div>
  `).join("");
}

sortSelect.onchange = renderGrid;
renderGrid();

/* ---------- cart ---------- */
const cartCountEl = document.getElementById("cartCount");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const drawerBody = document.getElementById("drawerBody");
const drawerTotal = document.getElementById("drawerTotal");

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  const btn = document.getElementById("add-" + id);
  btn.textContent = "¡Sumado!";
  btn.classList.add("added");
  setTimeout(() => { btn.textContent = "Agregar"; btn.classList.remove("added"); }, 900);
  renderCart();
}

function renderCart(){
  const ids = Object.keys(cart);
  const totalQty = ids.reduce((s,id) => s + cart[id], 0);
  cartCountEl.textContent = totalQty;

  if (ids.length === 0){
    drawerBody.innerHTML = `<p class="drawer-empty">Todavía no agregaste nada. ¡Tenés hambre y no lo sabés!</p>`;
    drawerTotal.textContent = money(0);
    return;
  }
  let total = 0;
  drawerBody.innerHTML = ids.map(id => {
    const p = PRODUCTS[id];
    const qty = cart[id];
    total += p.now * qty;
    return `
      <div class="drawer-item">
        <div class="di-thumb">${burgerSVG(p.id).replace('width="118" height="118"','width="30" height="30"')}</div>
        <span class="di-name">${p.name} ${qty > 1 ? "x" + qty : ""}</span>
        <span class="di-price">${money(p.now * qty)}</span>
      </div>`;
  }).join("");
  drawerTotal.textContent = money(total);
}

document.getElementById("cartBtn").onclick = () => { drawer.classList.add("show"); overlay.classList.add("show"); };
document.getElementById("closeDrawer").onclick = closeDrawer;
overlay.onclick = closeDrawer;
function closeDrawer(){ drawer.classList.remove("show"); overlay.classList.remove("show"); }

/* ---------- popup 4: métodos de pago ---------- */
const payModal = document.getElementById("payModal");
const payModalBox = document.getElementById("payModalBox");
const payTotal = document.getElementById("payTotal");
const payOriginalHTML = payModalBox.innerHTML;

function bindPayModalHandlers(){
  document.getElementById("closePay").onclick = () => closeModal(payModal);
  document.getElementById("confirmPay").onclick = confirmPayHandler;
}

function confirmPayHandler(){
  const chosen = payModalBox.querySelector('input[name="pay"]:checked');
  const label = chosen ? chosen.closest(".pay-option").querySelector("b").textContent : "tu medio de pago";
  payModalBox.innerHTML = `
    <div class="pay-success">
      <div class="check">✓</div>
      <h3 class="display" style="font-size:22px; margin:0;">¡Pedido confirmado!</h3>
      <p class="sub" style="margin-top:4px;">Vas a pagar con <b>${label}</b>. Tu grasa llega en 30-40 minutos.</p>
      <button class="modal-cta" id="closeSuccess">Volver al catálogo</button>
    </div>`;
  document.getElementById("closeSuccess").onclick = () => {
    closeModal(payModal);
    for (const k in cart) delete cart[k];
    renderCart();
    setTimeout(() => {
      payModalBox.innerHTML = payOriginalHTML;
      bindPayModalHandlers();
    }, 300);
  };
}

bindPayModalHandlers();

document.querySelector(".checkout-btn").onclick = () => {
  const ids = Object.keys(cart);
  if (ids.length === 0){
    drawerBody.innerHTML = `<p class="drawer-empty">Agregá algo antes de pagar, ¡no podés pagar el aire!</p>`;
    return;
  }
  let total = 0;
  ids.forEach(id => total += PRODUCTS[id].now * cart[id]);
  payTotal.textContent = money(total);
  closeDrawer();
  openModal(payModal);
};

/* ---------- helper: generic modal open/close ---------- */
function openModal(el){ el.classList.add("show"); }
function closeModal(el){ el.classList.remove("show"); }

/* ---------- popup 1: bienvenida ---------- */
const welcomeModal = document.getElementById("welcomeModal");
setTimeout(() => openModal(welcomeModal), 1200);
document.getElementById("closeWelcome").onclick = () => closeModal(welcomeModal);
document.getElementById("skipWelcome").onclick = () => closeModal(welcomeModal);
document.getElementById("claimWelcome").onclick = () => closeModal(welcomeModal);
document.getElementById("copyCoupon").onclick = function(){
  navigator.clipboard?.writeText("GRASA15");
  this.textContent = "¡Copiado!";
  this.classList.add("copied");
  setTimeout(() => { this.textContent = "Copiar código"; this.classList.remove("copied"); }, 1800);
};

/* ---------- popup 2: ruleta ---------- */
const wheelModal = document.getElementById("wheelModal");
const wheelDisc = document.getElementById("wheelDisc");
const wheelResult = document.getElementById("wheelResult");
const spinBtn = document.getElementById("spinBtn");
let spun = false;
document.getElementById("wheelFab").onclick = () => openModal(wheelModal);
document.getElementById("closeWheel").onclick = () => closeModal(wheelModal);
const wheelPrizes = ["10% OFF", "Envío gratis", "20% OFF", "Seguí participando", "2x1 en papas", "15% OFF"];
spinBtn.onclick = function(){
  if (spun) { closeModal(wheelModal); return; }
  spun = true;
  const idx = Math.floor(Math.random() * wheelPrizes.length);
  const sliceDeg = 360 / wheelPrizes.length;
  const target = 360 * 5 + (idx * sliceDeg) + sliceDeg/2;
  wheelDisc.style.transform = `rotate(${target}deg)`;
  wheelResult.textContent = "";
  spinBtn.textContent = "Girando...";
  setTimeout(() => {
    wheelResult.textContent = "🎉 " + wheelPrizes[idx];
    spinBtn.textContent = "Cerrar";
  }, 3300);
};

/* ---------- popup 3: exit intent ---------- */
const exitModal = document.getElementById("exitModal");
let exitShown = false;
document.addEventListener("mouseout", (e) => {
  if (!e.relatedTarget && e.clientY <= 0 && !exitShown && !welcomeModal.classList.contains("show")){
    exitShown = true;
    openModal(exitModal);
  }
});
document.getElementById("closeExit").onclick = () => closeModal(exitModal);
document.getElementById("claimExit").onclick = () => closeModal(exitModal);
document.getElementById("copyExitCoupon").onclick = function(){
  navigator.clipboard?.writeText("NOTEVAYAS20");
  this.textContent = "¡Copiado!";
  this.classList.add("copied");
  setTimeout(() => { this.textContent = "Copiar código"; this.classList.remove("copied"); }, 1800);
};

/* ---------- social proof toasts ---------- */
const toastStack = document.getElementById("toastStack");
const CITIES = ["Rosario", "Mar del Plata", "Córdoba", "La Plata", "Mendoza", "San Miguel de Tucumán", "Salta", "Bahía Blanca"];
const NAMES = ["Fede", "Male", "Nico", "Cami", "Juan", "Sofi", "Tomás", "Vale", "Lucas", "Agus"];
function spawnToast(){
  const p = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const mins = 1 + Math.floor(Math.random() * 14);
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `
    <span class="t-emoji">🍔</span>
    <span>
      <b>${name} de ${city} compró ${p.name}</b>
      <span class="t-sub">hace ${mins} min · ${p.brand}</span>
    </span>`;
  toastStack.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 400);
  }, 4200);
}
setTimeout(spawnToast, 4000);
setInterval(spawnToast, 7000);

/* ---------- countdown ---------- */
let remaining = 2*3600 + 14*60 + 59;
setInterval(() => {
  remaining = Math.max(0, remaining - 1);
  const h = Math.floor(remaining/3600);
  const m = Math.floor((remaining%3600)/60);
  const s = remaining%60;
  document.getElementById("t-h").textContent = String(h).padStart(2,"0");
  document.getElementById("t-m").textContent = String(m).padStart(2,"0");
  document.getElementById("t-s").textContent = String(s).padStart(2,"0");
}, 1000);
