/* Modesta · Vanilla JavaScript, sin dependencias.
 * Completa el número con código de país y solo dígitos (sin + ni espacios).
 * Si se deja vacío, WhatsApp permite elegir el destinatario del mensaje.
 * Los perfiles y solicitudes son locales: no constituyen autenticación ni pedidos confirmados.
 */
const STORE_CONFIG = Object.freeze({
  whatsappNumber: "",
  instagramUrl: "",
  currency: "USD",
  locale: "es-US",
  shippingFee: 0, // El costo real de envío se acuerda por WhatsApp; no se cobra aquí.
});

(() => {
  "use strict";

  const PRODUCTS = [
    {
      id: "luna",
      name: "Cartera Luna",
      price: 48,
      category: "carteras",
      categoryName: "Carteras",
      image: "assets/collection.png",
      colors: ["Arena", "Negro"],
      badge: "Favorito",
      short: "Un clásico para acompañarte todos los días.",
      description:
        "Una silueta versátil, de líneas limpias y con espacio para tus esenciales. Llévala contigo de la mañana a la noche. Consulta materiales, medidas y disponibilidad del color al preparar tu pedido.",
    },
    {
      id: "aldea",
      name: "Bolso Aldea",
      price: 62,
      category: "carteras",
      categoryName: "Carteras",
      image: "assets/collection.png",
      colors: ["Chocolate", "Negro"],
      badge: "Nuevo",
      short: "Espacio para todo lo que hace tu día.",
      description:
        "Un bolso amplio con un estilo relajado y elegante. Su formato práctico lo convierte en un compañero ideal para tus planes diarios. Consulta materiales, medidas y disponibilidad del color por WhatsApp.",
    },
    {
      id: "aura",
      name: "Aros Aura",
      price: 18,
      category: "accesorios",
      categoryName: "Accesorios",
      image: "assets/collection.png",
      colors: ["Dorado", "Plateado"],
      short: "Un toque de luz, sin decir demasiado.",
      description:
        "Aros de inspiración minimalista que completan un look sencillo o uno especial. Elige tu acabado favorito. Consulta tamaño, composición y cuidados antes de confirmar tu compra.",
    },
    {
      id: "sol",
      name: "Lentes Sol",
      price: 26,
      category: "accesorios",
      categoryName: "Accesorios",
      image: "assets/collection.png",
      colors: ["Carey", "Negro"],
      short: "La actitud está en los pequeños detalles.",
      description:
        "Un diseño de lentes con carácter para sumar a tus días al aire libre. Consulta las medidas, el tipo de lente y la protección disponible con nuestro equipo antes de confirmar el pedido.",
    },
    {
      id: "urbano",
      name: "Bandolera Urbana",
      price: 38,
      category: "hombres",
      categoryName: "Hombres",
      image: "assets/collection.png",
      colors: ["Negro", "Oliva"],
      short: "Tus esenciales, siempre cerca.",
      description:
        "Una bandolera práctica para llevar lo que necesitas con libertad de movimiento. Un diseño sobrio que combina fácilmente. Consulta dimensiones, materiales y disponibilidad antes de confirmar tu pedido.",
    },
    {
      id: "mini",
      name: "Mini mochila",
      price: 32,
      category: "ninos",
      categoryName: "Niños/Niñas",
      image: "assets/collection.png",
      colors: ["Rosa", "Arena"],
      badge: "Pequeños favoritos",
      short: "Para sus primeras grandes aventuras.",
      description:
        "Una mochila de tamaño pequeño y espíritu divertido para acompañar los planes de los más pequeños. Consulta dimensiones, composición y edad recomendada antes de confirmar la compra.",
    },
    {
      id: "onda",
      name: "Pulsera Onda",
      price: 16,
      category: "accesorios",
      categoryName: "Accesorios",
      image: "assets/collection.png",
      colors: ["Dorado", "Plateado"],
      short: "Sutil, especial y muy tuya.",
      description:
        "Una pulsera de líneas suaves que puedes usar sola o combinar con tus favoritos. Elige tu acabado y consulta talla, composición y cuidados para confirmar que sea perfecta para ti.",
    },
    {
      id: "alma",
      name: "Cartera Alma",
      price: 54,
      category: "carteras",
      categoryName: "Carteras",
      image: "assets/collection.png",
      colors: ["Crema", "Negro"],
      short: "Esa pieza que eleva cualquier momento.",
      description:
        "Una cartera de silueta elegante para tus salidas y ocasiones especiales. Un básico que se integra a tu estilo con naturalidad. Consulta materiales, medidas y disponibilidad del color por WhatsApp.",
    },
  ];
  const PRODUCT_MAP = new Map(PRODUCTS.map((product) => [product.id, product]));
  const STORAGE = {
    cart: "modesta.cart.v1",
    profile: "modesta.profile.v1",
    orders: "modesta.orders.v1",
  };
  const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
    bag: '<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
  };
  const icon = (name) =>
    `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.arrow}</svg>`;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHTML = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  const productPhoto = (product, extraClass = "") =>
    `<span class="product-photo photo-${product.id} ${extraClass}" role="img" aria-label="${escapeHTML(product.name)}, color ${escapeHTML(product.colors[0])}"></span>`;
  const normalize = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  const money = (value) =>
    new Intl.NumberFormat(STORE_CONFIG.locale, {
      style: "currency",
      currency: STORE_CONFIG.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  const clamp = (value) =>
    Math.min(
      99,
      Math.max(
        1,
        Number.isFinite(Number(value)) ? Math.floor(Number(value)) : 1,
      ),
    );
  let storageAvailable = true;

  function readStorage(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  }
  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      if (storageAvailable)
        toast(
          "Tu navegador no permite guardar datos. El carrito funciona durante esta visita.",
        );
      storageAvailable = false;
    }
  }
  function readCart() {
    const stored = readStorage(STORAGE.cart, []);
    if (!Array.isArray(stored)) return [];
    return stored.slice(0, 100).reduce((items, item) => {
      if (!item || typeof item !== "object") return items;
      const product = PRODUCT_MAP.get(item.id);
      if (
        !product ||
        !product.colors.includes(item.color) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      )
        return items;
      const existing = items.find(
        (entry) => entry.id === item.id && entry.color === item.color,
      );
      if (existing)
        existing.quantity = clamp(existing.quantity + item.quantity);
      else
        items.push({
          id: product.id,
          color: item.color,
          quantity: item.quantity,
        });
      return items;
    }, []);
  }
  function readProfile() {
    const stored = readStorage(STORAGE.profile, null);
    if (
      !stored ||
      typeof stored.name !== "string" ||
      typeof stored.contact !== "string"
    )
      return null;
    return {
      name: stored.name.slice(0, 80),
      contact: stored.contact.slice(0, 120),
      addresses: Array.isArray(stored.addresses)
        ? stored.addresses
            .filter(
              (address) =>
                address &&
                typeof address.address === "string" &&
                typeof address.reference === "string",
            )
            .slice(0, 8)
            .map((address) => ({
              address: address.address.slice(0, 500),
              reference: address.reference.slice(0, 250),
            }))
        : [],
    };
  }
  let cart = readCart();
  let profile = readProfile();
  let orders = readStorage(STORAGE.orders, []);
  if (!Array.isArray(orders)) orders = [];
  orders = orders
    .filter(
      (order) =>
        order &&
        typeof order.id === "string" &&
        typeof order.date === "string" &&
        Number.isFinite(order.total) &&
        typeof order.summary === "string",
    )
    .slice(0, 20);
  let activeCategory = "all";
  let searchTerm = "";
  let detail = null;
  let toastTimeout;

  function toast(message) {
    const target = $("#toast");
    if (!target) return;
    clearTimeout(toastTimeout);
    target.textContent = message;
    target.classList.add("is-visible");
    target.hidden = false;
    toastTimeout = setTimeout(() => {
      target.classList.remove("is-visible");
      target.hidden = true;
    }, 4200);
  }

  function syncDialogScroll() {
    document.body.classList.toggle(
      "dialog-open",
      $$("dialog[open]").length > 0,
    );
  }
  function openDialog(id) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    dialog.showModal();
    syncDialogScroll();
  }
  function closeDialog(id) {
    document.getElementById(id)?.close();
    syncDialogScroll();
  }

  function renderProducts() {
    const query = normalize(searchTerm);
    const filtered = PRODUCTS.filter(
      (product) =>
        (activeCategory === "all" || product.category === activeCategory) &&
        normalize(
          `${product.name} ${product.short} ${product.categoryName}`,
        ).includes(query),
    );
    $("#products-grid").innerHTML = filtered
      .map(
        (product) => `
      <article class="product-card">
        <div class="product-image-wrap">
          <button class="product-image-button" type="button" data-product="${product.id}" aria-label="Ver ${product.name}">
            ${productPhoto(product)}
          </button>
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
          <button class="product-quick-view" type="button" data-product="${product.id}" aria-label="Ver detalles de ${product.name}">${icon("arrow")}</button>
        </div>
        <div class="product-info">
          <p class="product-category">${product.categoryName}</p>
          <div class="product-title-row"><h3 class="product-title"><button type="button" data-product="${product.id}">${product.name}</button></h3><span class="product-price">${money(product.price)}</span></div>
          <p class="product-description">${product.short}</p>
          <button type="button" class="product-add" data-add="${product.id}">Agregar al carrito ${icon("plus")}</button>
        </div>
      </article>`,
      )
      .join("");
    $("#empty-catalog").hidden = filtered.length > 0;
    $("#results-count").textContent =
      `${filtered.length} ${filtered.length === 1 ? "pieza" : "piezas"}${query ? ` para “${searchTerm.trim()}”` : " para descubrir"}`;
    const currencyNote = document.createElement("span");
    currencyNote.textContent = " · Precios en USD";
    $("#results-count").append(currencyNote);
    $$("[data-category]").forEach((button) => {
      const selected = button.dataset.category === activeCategory;
      button.classList.toggle("is-active", selected);
      button.classList.toggle("active", selected);
      if (button.tagName === "BUTTON")
        button.setAttribute("aria-pressed", String(selected));
      else if (selected) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  function showProduct(id) {
    const product = PRODUCT_MAP.get(id);
    if (!product) return;
    detail = { id: product.id, color: product.colors[0], quantity: 1 };
    $("#product-detail").innerHTML = `
      <div class="product-modal-grid">
        <div class="product-modal-image">${productPhoto(product)}</div>
        <div class="product-modal-info">
          <p class="eyebrow">${product.categoryName} · Modesta</p>
          <h2 id="product-dialog-title">${product.name}</h2>
          <p class="detail-price">${money(product.price)} <span>USD</span></p>
          <p class="detail-description">${product.description}</p>
          <fieldset class="color-fieldset"><legend>Color <span id="selected-color">${product.colors[0]}</span></legend>
            <div class="color-options">${product.colors.map((color, index) => `<button type="button" class="color-option ${index === 0 ? "is-active" : ""}" data-color="${color}" aria-pressed="${index === 0}">${color}</button>`).join("")}</div>
          </fieldset>
          <div class="detail-bottom"><div><label for="detail-quantity">Cantidad</label><div class="quantity-control"><button type="button" data-detail-quantity="-1" aria-label="Restar cantidad">${icon("minus")}</button><input id="detail-quantity" type="number" min="1" max="99" value="1" inputmode="numeric" aria-label="Cantidad"><button type="button" data-detail-quantity="1" aria-label="Sumar cantidad">${icon("plus")}</button></div></div>
          <button class="button button-dark" type="button" id="detail-add">${icon("bag")} Agregar al carrito</button></div>
          <p class="detail-note">Sin registro. Coordina el pago y la entrega por WhatsApp.</p>
        </div>
      </div>`;
    openDialog("product-dialog");
  }

  function addToCart(id, color, quantity = 1) {
    const product = PRODUCT_MAP.get(id);
    if (!product) return;
    const selectedColor = product.colors.includes(color)
      ? color
      : product.colors[0];
    const existing = cart.find(
      (item) => item.id === id && item.color === selectedColor,
    );
    if (existing) existing.quantity = clamp(existing.quantity + quantity);
    else cart.push({ id, color: selectedColor, quantity: clamp(quantity) });
    persistCart();
    toast(`${product.name} · ${selectedColor} agregado al carrito`);
  }
  function persistCart() {
    saveStorage(STORAGE.cart, cart);
    renderCart();
  }
  function cartTotal() {
    return cart.reduce(
      (total, item) => total + PRODUCT_MAP.get(item.id).price * item.quantity,
      0,
    );
  }
  function renderCart() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    $("#cart-count").textContent = count;
    $("#cart-open")?.setAttribute(
      "aria-label",
      `Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`,
    );
    $("#cart-items").innerHTML = cart
      .map((item, index) => {
        const product = PRODUCT_MAP.get(item.id);
        return `<article class="cart-item">
        ${productPhoto(product, "cart-item-image")}
        <div class="cart-item-details"><h3 class="cart-item-name">${product.name}</h3><p class="cart-item-meta">${item.color} · ${money(product.price)} c/u</p>
          <div class="cart-item-bottom"><div class="quantity-control"><button type="button" data-cart-change="${index}" data-delta="-1" aria-label="Restar ${product.name}" ${item.quantity === 1 ? "disabled" : ""}>${icon("minus")}</button><span aria-label="Cantidad">${item.quantity}</span><button type="button" data-cart-change="${index}" data-delta="1" aria-label="Sumar ${product.name}" ${item.quantity === 99 ? "disabled" : ""}>${icon("plus")}</button></div><span class="cart-item-price">${money(product.price * item.quantity)}</span></div>
        </div><button type="button" class="remove-item" data-cart-remove="${index}" aria-label="Eliminar ${product.name} del carrito">${icon("trash")}</button>
      </article>`;
      })
      .join("");
    $("#cart-empty").hidden = cart.length > 0;
    $("#checkout-content").hidden = cart.length === 0;
    $("#cart-subtotal").textContent = money(cartTotal());
    $("#cart-total").textContent = money(cartTotal());
  }
  function showCart() {
    if (profile) {
      if (!$("#customer-name").value) $("#customer-name").value = profile.name;
      if (!$("#customer-contact").value)
        $("#customer-contact").value = profile.contact;
    }
    renderAddresses();
    syncDelivery();
    openDialog("cart-dialog");
  }
  function syncDelivery() {
    const delivery = $('input[name="delivery"]:checked')?.value !== "pickup";
    $("#delivery-fields").hidden = !delivery;
    $("#delivery-address").required = delivery;
    $("#delivery-address").disabled = !delivery;
    $("#delivery-reference").disabled = !delivery;
    if ($("#save-address")) $("#save-address").disabled = !delivery || !profile;
    $("#shipping-note").textContent = delivery
      ? "A coordinar · no incluido"
      : "Sin costo · punto a coordinar";
  }
  function renderAddresses() {
    const addresses = profile?.addresses || [];
    const select = $("#saved-address");
    const previous = select.value;
    select.replaceChildren(new Option("Ingresar una nueva dirección", ""));
    addresses.forEach((address, index) =>
      select.add(new Option(address.address, String(index))),
    );
    select.value = previous;
    $("#saved-address-wrap").hidden = addresses.length === 0;
    const save = $("#save-address");
    if (save) {
      const label = save.closest("label");
      if (label) label.hidden = !profile;
      save.disabled = !profile;
    }
  }

  function contactIsValid(value) {
    return (
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
      (/^[+\d\s().-]{7,25}$/.test(value) &&
        value.replace(/\D/g, "").length >= 7)
    );
  }
  function whatsappURL(message) {
    const phone = STORE_CONFIG.whatsappNumber.replace(/\D/g, "");
    return `https://wa.me/${phone ? phone : ""}?text=${encodeURIComponent(message)}`;
  }
  function openWhatsApp(message) {
    window.open(whatsappURL(message), "_blank", "noopener,noreferrer");
  }
  function checkout(event) {
    event.preventDefault();
    if (!cart.length) return;
    const form = $("#checkout-form");
    const nameInput = $("#customer-name");
    const contactInput = $("#customer-contact");
    const addressInput = $("#delivery-address");
    nameInput.value = nameInput.value.trim();
    contactInput.value = contactInput.value.trim();
    addressInput.value = addressInput.value.trim();
    contactInput.setCustomValidity(
      contactIsValid(contactInput.value)
        ? ""
        : "Escribe un correo válido o un teléfono de al menos 7 dígitos.",
    );
    if (!form.reportValidity()) return;
    const pickup = $('input[name="delivery"]:checked')?.value === "pickup";
    const reference = $("#delivery-reference").value.trim();
    const total = cartTotal();
    const lines = cart.map((item) => {
      const product = PRODUCT_MAP.get(item.id);
      return `• ${product.name} (${item.color})\n  ${item.quantity} × ${money(product.price)} = ${money(product.price * item.quantity)}`;
    });
    const message = [
      "¡Hola, Modesta! ✨ Quiero hacer este pedido:",
      "",
      ...lines,
      "",
      `Subtotal: ${money(total)} ${STORE_CONFIG.currency}`,
      `Total de productos: ${money(total)} ${STORE_CONFIG.currency}`,
      pickup
        ? "Entrega: retiro en tienda / punto de entrega (por coordinar)."
        : "Entrega: envío a domicilio. Costo de envío por coordinar; no incluido en el total.",
      ...(pickup
        ? []
        : [
            `Dirección: ${addressInput.value}`,
            ...(reference ? [`Referencias: ${reference}`] : []),
          ]),
      "",
      `Nombre: ${nameInput.value}`,
      `Contacto: ${contactInput.value}`,
      "",
      "¿Me confirman la disponibilidad, el pago y la entrega?",
    ].join("\n");
    if (profile) {
      if (
        !pickup &&
        $("#save-address")?.checked &&
        !profile.addresses.some(
          (item) =>
            item.address === addressInput.value && item.reference === reference,
        )
      ) {
        profile.addresses = [
          { address: addressInput.value, reference },
          ...profile.addresses,
        ].slice(0, 8);
        saveStorage(STORAGE.profile, profile);
        renderAddresses();
      }
      orders.unshift({
        id: `MOD-${Date.now().toString(36).toUpperCase()}`,
        date: new Date().toISOString(),
        total,
        summary: cart
          .map(
            (item) =>
              `${PRODUCT_MAP.get(item.id).name} (${item.color}) × ${item.quantity}`,
          )
          .join(" · "),
      });
      orders = orders.slice(0, 20);
      saveStorage(STORAGE.orders, orders);
    }
    openWhatsApp(message);
    toast(
      "Solicitud preparada. Envía el mensaje en WhatsApp para coordinar tu pedido.",
    );
  }

  function renderAccount() {
    $("#account-label").textContent = profile
      ? profile.name.split(" ")[0]
      : "Mi cuenta";
    if (!profile) {
      $("#account-content").innerHTML = `
        <p class="eyebrow">A tu manera</p><h2 id="account-dialog-title">Tu espacio Modesta</h2>
        <p class="account-intro">Guarda tus direcciones y tus solicitudes en este navegador. Comprar como invitado siempre está disponible.</p>
        <form class="account-form" id="profile-form">
          <label for="profile-name">Tu nombre<input id="profile-name" name="name" autocomplete="name" maxlength="80" required placeholder="¿Cómo te llamas?"></label>
          <label for="profile-contact">Correo o teléfono<input id="profile-contact" name="contact" autocomplete="email" maxlength="120" required placeholder="Tu correo o número de teléfono"></label>
          <button type="submit" class="button button-dark">Crear mi perfil local ${icon("arrow")}</button>
        </form>
        <p class="privacy-note">Este perfil se guarda solo en este dispositivo, sin contraseña ni autenticación. No uses un dispositivo compartido. No se envía ningún dato hasta que decidas compartir tu pedido por WhatsApp.</p>
        <button class="text-link" type="button" data-close="account-dialog">Prefiero seguir como invitado</button>`;
      return;
    }
    $("#account-content").innerHTML = `
      <p class="eyebrow">Tu espacio Modesta</p><h2 id="account-dialog-title">Hola, ${escapeHTML(profile.name.split(" ")[0])}.</h2>
      <p class="account-intro">${escapeHTML(profile.contact)}<br>Tu perfil está guardado en este navegador.</p>
      <h3 class="account-section-title">Direcciones guardadas</h3>
      ${profile.addresses.length ? `<ul class="address-list">${profile.addresses.map((address, index) => `<li><span>${escapeHTML(address.address)}${address.reference ? `<small>${escapeHTML(address.reference)}</small>` : ""}</span><button type="button" class="remove-item" data-remove-address="${index}" aria-label="Eliminar dirección ${index + 1}">${icon("trash")}</button></li>`).join("")}</ul>` : '<p class="muted">Puedes guardar una dirección al preparar tu pedido.</p>'}
      <h3 class="account-section-title">Mis solicitudes</h3>
      <p class="privacy-note">Las solicitudes preparadas aquí no confirman envío, pago ni disponibilidad. Confirma tu pedido con la tienda por WhatsApp.</p>
      ${orders.length ? `<ul class="order-list">${orders.map((order) => `<li><div><strong>${escapeHTML(order.id)}</strong><span class="order-status">Solicitud preparada</span></div><p>${escapeHTML(order.summary.slice(0, 1000))}</p><div><time datetime="${escapeHTML(order.date)}">${escapeHTML(formatDate(order.date))}</time><strong>${money(order.total)}</strong></div></li>`).join("")}</ul>` : '<p class="muted">Tus próximas solicitudes aparecerán aquí.</p>'}
      <button type="button" class="text-link" id="profile-logout">Eliminar perfil y datos guardados de este dispositivo</button>`;
  }
  function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Fecha no disponible"
      : new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(date);
  }
  function saveProfile(event) {
    event.preventDefault();
    const name = $("#profile-name");
    const contact = $("#profile-contact");
    name.value = name.value.trim();
    contact.value = contact.value.trim();
    contact.setCustomValidity(
      contactIsValid(contact.value)
        ? ""
        : "Escribe un correo válido o un teléfono de al menos 7 dígitos.",
    );
    if (!event.target.reportValidity()) return;
    profile = { name: name.value, contact: contact.value, addresses: [] };
    saveStorage(STORAGE.profile, profile);
    renderAccount();
    toast("Tu perfil local está listo. Puedes comprar sin iniciar sesión.");
  }

  function initialize() {
    renderProducts();
    renderCart();
    renderAccount();
    renderAddresses();
    syncDelivery();
    $("#whatsapp-config-note").hidden = Boolean(
      STORE_CONFIG.whatsappNumber.replace(/\D/g, ""),
    );
    $$("[data-instagram], #instagram-link").forEach((link) => {
      if (
        /^https:\/\/(www\.)?instagram\.com\//i.test(STORE_CONFIG.instagramUrl)
      ) {
        link.href = STORE_CONFIG.instagramUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.removeAttribute("aria-disabled");
      } else if (link.hasAttribute("data-instagram")) {
        link.removeAttribute("href");
        link.setAttribute("aria-disabled", "true");
        link.title = "El enlace de Instagram estará disponible próximamente";
      }
    });
    $("#search-form").addEventListener("submit", (event) => {
      event.preventDefault();
      document
        .getElementById("catalogo")
        ?.scrollIntoView({ behavior: "smooth" });
    });
    $("#search-input").addEventListener("input", (event) => {
      searchTerm = event.target.value.slice(0, 120);
      renderProducts();
    });
    $("#checkout-form").addEventListener("submit", checkout);
    $("#customer-contact").addEventListener("input", (event) =>
      event.target.setCustomValidity(""),
    );
    $("#saved-address").addEventListener("change", (event) => {
      const address = profile?.addresses[Number(event.target.value)];
      if (event.target.value !== "" && address) {
        $("#delivery-address").value = address.address;
        $("#delivery-reference").value = address.reference;
      } else {
        $("#delivery-address").value = "";
        $("#delivery-reference").value = "";
      }
    });
    $$('input[name="delivery"]').forEach((input) =>
      input.addEventListener("change", syncDelivery),
    );
    $$("dialog").forEach((dialog) => {
      dialog.addEventListener("close", syncDialogScroll);
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          closeDialog(dialog.id);
      });
    });
    document.addEventListener("submit", (event) => {
      if (event.target.id === "profile-form") saveProfile(event);
    });
    document.addEventListener("input", (event) => {
      if (event.target.id === "profile-contact")
        event.target.setCustomValidity("");
      if (event.target.id === "detail-quantity" && detail)
        detail.quantity = clamp(event.target.value);
    });
    document.addEventListener("change", (event) => {
      if (event.target.id === "detail-quantity" && detail)
        event.target.value = detail.quantity = clamp(event.target.value);
    });
    document.addEventListener("click", (event) => {
      const target = event.target.closest("button, a");
      if (!target) return;
      if (target.dataset.close) closeDialog(target.dataset.close);
      if (target.id === "cart-open" || target.hasAttribute("data-open-cart"))
        showCart();
      if (target.id === "account-open") {
        renderAccount();
        openDialog("account-dialog");
      }
      if (target.dataset.product) showProduct(target.dataset.product);
      if (target.dataset.add) addToCart(target.dataset.add);
      if (target.hasAttribute("data-category")) {
        activeCategory = target.dataset.category;
        renderProducts();
        $("#main-nav").classList.remove("is-open");
        $("#mobile-menu-toggle").setAttribute("aria-expanded", "false");
      }
      if (target.dataset.action === "clear-filters") {
        activeCategory = "all";
        searchTerm = "";
        $("#search-input").value = "";
        renderProducts();
      }
      if (target.dataset.color && detail) {
        detail.color = target.dataset.color;
        $("#selected-color").textContent = detail.color;
        $$(".color-option").forEach((button) => {
          const active = button.dataset.color === detail.color;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
      }
      if (target.dataset.detailQuantity && detail) {
        detail.quantity = clamp(
          detail.quantity + Number(target.dataset.detailQuantity),
        );
        $("#detail-quantity").value = detail.quantity;
      }
      if (target.id === "detail-add" && detail)
        addToCart(detail.id, detail.color, detail.quantity);
      if (target.hasAttribute("data-cart-change")) {
        const item = cart[Number(target.dataset.cartChange)];
        if (item) {
          item.quantity = clamp(item.quantity + Number(target.dataset.delta));
          persistCart();
        }
      }
      if (target.hasAttribute("data-cart-remove")) {
        cart.splice(Number(target.dataset.cartRemove), 1);
        persistCart();
        toast("Producto eliminado del carrito");
      }
      if (target.hasAttribute("data-whatsapp")) {
        event.preventDefault();
        openWhatsApp(
          "¡Hola, Modesta! ✨ Me gustaría recibir más información sobre sus productos.",
        );
      }
      if (target.id === "mobile-menu-toggle") {
        const expanded = target.getAttribute("aria-expanded") === "true";
        target.setAttribute("aria-expanded", String(!expanded));
        $("#main-nav").classList.toggle("is-open", !expanded);
      }
      if (target.hasAttribute("data-remove-address") && profile) {
        profile.addresses.splice(Number(target.dataset.removeAddress), 1);
        saveStorage(STORAGE.profile, profile);
        renderAccount();
        renderAddresses();
      }
      if (target.id === "profile-logout") {
        profile = null;
        orders = [];
        saveStorage(STORAGE.profile, null);
        saveStorage(STORAGE.orders, []);
        $("#customer-name").value = "";
        $("#customer-contact").value = "";
        $("#delivery-address").value = "";
        $("#delivery-reference").value = "";
        if ($("#save-address")) $("#save-address").checked = false;
        renderAccount();
        renderAddresses();
        toast("Perfil y solicitudes eliminados de este dispositivo.");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        $("#main-nav").classList.remove("is-open");
        $("#mobile-menu-toggle").setAttribute("aria-expanded", "false");
      }
    });
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE.cart || event.key === null) {
        cart = readCart();
        renderCart();
      }
      if (event.key === STORAGE.profile || event.key === null) {
        profile = readProfile();
        renderAccount();
        renderAddresses();
      }
    });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
