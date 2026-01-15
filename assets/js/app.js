const PRODUCTS = [
  // Clothing
  {
    id: "HL-TEE-001",
    name: "Harbourline Essential Tee",
    category: "clothing",
    price: 18.00,
    moq: 5,
    badge: "BEST SELLER",
    img: "https://images.unsplash.com/photo-1520975958225-83a2d7b95753?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "HL-HOOD-002",
    name: "Harbourline Heavyweight Hoodie",
    category: "clothing",
    price: 39.00,
    moq: 5,
    badge: "NEW",
    img: "https://images.unsplash.com/photo-1520975682031-a1b5e2cbe8b2?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "HL-WORK-003",
    name: "Harbourline Workwear Shorts",
    category: "clothing",
    price: 29.00,
    moq: 5,
    badge: "HOT",
    img: "https://images.unsplash.com/photo-1520975747564-6c55c4c1b2a1?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "HL-TEE-004",
    name: "Harbourline Long Sleeve Tee",
    category: "clothing",
    price: 22.00,
    moq: 5,
    badge: "STOCKED",
    img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=70",
  },

  // Phone Cases
  {
    id: "HL-CASE-101",
    name: "Harbourline Impact Case — Black",
    category: "cases",
    price: 9.50,
    moq: 10,
    badge: "BEST SELLER",
    img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "HL-CASE-102",
    name: "Harbourline Clear Shield Case",
    category: "cases",
    price: 8.50,
    moq: 10,
    badge: "NEW",
    img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "HL-CASE-103",
    name: "Harbourline Matte Grip Case",
    category: "cases",
    price: 9.00,
    moq: 10,
    badge: "HOT",
    img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=70",
  },
  {
    id: "HL-CASE-104",
    name: "Harbourline Pattern Case — Wave",
    category: "cases",
    price: 9.25,
    moq: 10,
    badge: "STOCKED",
    img: "https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?auto=format&fit=crop&w=1200&q=70",
  },
];

const el = (sel) => document.querySelector(sel);
const els = (sel) => [...document.querySelectorAll(sel)];

const grid = el("#productGrid");
const searchInput = el("#searchInput");
const cartBtn = el("#cartBtn");
const drawer = el("#drawer");
const drawerOverlay = el("#drawerOverlay");
const closeCart = el("#closeCart");
const cartItemsEl = el("#cartItems");
const cartCountEl = el("#cartCount");
const subtotalEl = el("#cartSubtotal");
const checkoutBtn = el("#checkoutBtn");
const clearCartBtn = el("#clearCartBtn");
const yearEl = el("#year");

const navToggle = el("#navToggle");
const mobileNav = el("#mobileNav");

yearEl.textContent = new Date().getFullYear();

let state = {
  category: "all",
  q: "",
  cart: loadCart(),
};

function money(n){
  return new Intl.NumberFormat("en-AU", { style:"currency", currency:"AUD" }).format(n);
}

function saveCart(){
  localStorage.setItem("hl_cart", JSON.stringify(state.cart));
}
function loadCart(){
  try{
    return JSON.parse(localStorage.getItem("hl_cart")) || {};
  }catch{
    return {};
  }
}

function cartCount(){
  return Object.values(state.cart).reduce((a,b)=>a+b,0);
}
function cartSubtotal(){
  return Object.entries(state.cart).reduce((sum, [id, qty])=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function setCartCountUI(){
  cartCountEl.textContent = cartCount();
}

function openDrawer(){
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  renderCart();
}
function closeDrawer(){
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
}

function renderProducts(){
  const q = state.q.trim().toLowerCase();
  const filtered = PRODUCTS.filter(p=>{
    const catOk = state.category === "all" ? true : p.category === state.category;
    const qOk = q ? p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) : true;
    return catOk && qOk;
  });

  if(filtered.length === 0){
    grid.innerHTML = `
      <div style="grid-column:1/-1; padding:16px; border:1px solid rgba(255,255,255,.10); border-radius:18px; background:rgba(255,255,255,.04)">
        No results. Try a different keyword or clear filters.
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p=>`
    <article class="product" data-id="${p.id}">
      <div class="product__media" style="background-image:url('${p.img}')">
        <div class="badge2">${p.badge}</div>
        <button class="quickAdd" data-add="${p.id}">+ Quick Add</button>
      </div>
      <div class="product__meta">
        <div class="product__title">${p.name}</div>
        <div class="product__row">
          <div>
            <div class="price">${money(p.price)}</div>
            <div class="sub">MOQ: ${p.moq} • SKU: ${p.id}</div>
          </div>
          <button class="btn btn--ghost" data-add="${p.id}" style="padding:10px 12px;border-radius:14px;">Add</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart(){
  const items = Object.entries(state.cart)
    .map(([id, qty])=>{
      const p = PRODUCTS.find(x=>x.id===id);
      if(!p) return null;
      return { ...p, qty };
    })
    .filter(Boolean);

  if(items.length === 0){
    cartItemsEl.innerHTML = `
      <div style="padding:12px; border:1px dashed rgba(255,255,255,.14); border-radius:18px; color:rgba(232,238,247,.75)">
        Your cart is empty. Add products using “Quick Add”.
      </div>
    `;
  } else {
    cartItemsEl.innerHTML = items.map(p=>`
      <div class="cartItem">
        <div class="cartItem__img" style="background-image:url('${p.img}')"></div>
        <div>
          <div class="cartItem__title">${p.name}</div>
          <div class="cartItem__meta">${money(p.price)} • MOQ ${p.moq} • ${p.id}</div>
          <div class="qty">
            <button data-dec="${p.id}" aria-label="Decrease quantity">−</button>
            <span>${p.qty}</span>
            <button data-inc="${p.id}" aria-label="Increase quantity">+</button>
            <button data-rm="${p.id}" style="margin-left:auto;border-color:rgba(239,68,68,.35)">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  subtotalEl.textContent = money(cartSubtotal());
  setCartCountUI();
}

function addToCart(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;

  // Wholesale behavior: first add jumps to MOQ if empty
  const current = state.cart[id] || 0;
  const next = current === 0 ? p.moq : current + 1;
  state.cart[id] = next;

  saveCart();
  setCartCountUI();
}

function incCart(id){
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  renderCart();
}
function decCart(id){
  const cur = state.cart[id] || 0;
  const next = Math.max(0, cur - 1);
  if(next === 0) delete state.cart[id];
  else state.cart[id] = next;
  saveCart();
  renderCart();
}
function rmCart(id){
  delete state.cart[id];
  saveCart();
  renderCart();
}

function clearCart(){
  state.cart = {};
  saveCart();
  renderCart();
}

function wireEvents(){
  // Filters
  els(".chip").forEach(ch=>{
    ch.addEventListener("click", ()=>{
      els(".chip").forEach(x=>x.classList.remove("is-active"));
      ch.classList.add("is-active");
      state.category = ch.dataset.category;
      renderProducts();
    });
  });

  // Collection tiles filter
  els(".tile").forEach(tile=>{
    tile.addEventListener("click", (e)=>{
      const f = tile.getAttribute("data-filter");
      if(!f) return;
      state.category = f;
      els(".chip").forEach(x=>{
        x.classList.toggle("is-active", x.dataset.category === f);
      });
      renderProducts();
    });
  });

  // Search
  if(searchInput){
    searchInput.addEventListener("input", (e)=>{
      state.q = e.target.value || "";
      renderProducts();
    });
  }

  // Product add buttons (event delegation)
  grid.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-add]");
    if(!btn) return;
    addToCart(btn.dataset.add);
  });

  // Cart controls
  cartBtn.addEventListener("click", openDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);
  closeCart.addEventListener("click", closeDrawer);

  cartItemsEl.addEventListener("click", (e)=>{
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    const rm = e.target.closest("[data-rm]");
    if(inc) return incCart(inc.dataset.inc);
    if(dec) return decCart(dec.dataset.dec);
    if(rm) return rmCart(rm.dataset.rm);
  });

  checkoutBtn.addEventListener("click", ()=>{
    const subtotal = cartSubtotal();
    if(subtotal <= 0){
      alert("Cart is empty. Add products first.");
      return;
    }
    alert(
      "Checkout placeholder:\n\nNext step is connecting this to your invoicing / WhatsApp / email workflow.\n\nFor now, call +61 430 223 276 to request an invoice."
    );
  });

  clearCartBtn.addEventListener("click", clearCart);

  // Mobile nav
  navToggle.addEventListener("click", ()=>{
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    mobileNav.hidden = isOpen;
  });
}

function init(){
  renderProducts();
  setCartCountUI();
  wireEvents();
}

init();
