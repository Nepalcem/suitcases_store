class CartManager {
  #discountRate = 0.1;
  #shipping = 30;
  constructor(storageKey = "cart-products") {
    this.storageKey = storageKey;
    this.cart = JSON.parse(localStorage.getItem(this.storageKey)) || [];
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: this.cart }));
  }

  add(product, quantity = 1) {
    const existing = this.cart.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({ product, quantity });
    }
    this.save();
  }

  remove(productId) {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
    this.save();
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find((i) => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) this.remove(productId);
      else this.save();
    }
  }

  clear() {
    this.cart = [];
    this.save();
  }

  getTotal() {
    const total = this.cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    return total;
  }

  getDiscount() {
    const total = this.getTotal();
    return total >= 3000 ? Number((total * this.#discountRate).toFixed(2)) : 0;
  }
  getFinaPrice() {
    return this.getTotal() + this.#shipping - this.getDiscount();
  }

  checkoutSuccessPopup() {
    const checkoutPopup = document.getElementById("checkout-popup");

    if (!checkoutPopup) return;

    checkoutPopup.style.display = "flex";

    checkoutPopup.addEventListener("click", (e) => {
      if (e.target === checkoutPopup) checkoutPopup.style.display = "none";
    });
  }

  renderGrid(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = ""; 

    if (this.cart.length === 0) {
      container.innerHTML = `<p style="text-align:center;">Your cart is empty</p>`;
      return;
    }

    // --- Create headers element ---
    const headersDiv = document.createElement("div");
    headersDiv.classList.add("cart-grid-headers");
    headersDiv.innerHTML = `
    <div>Image</div>
    <div>Product Name</div>
    <div>Price</div>
    <div>Quantity</div>
    <div>Total</div>
    <div>Delete</div>
  `;
    container.appendChild(headersDiv);

    // Render each cart item
    this.cart.forEach((item) => {
      const total = item.product.price * item.quantity;

      // one-row-one-grid
      const row = document.createElement("div");
      row.classList.add("cart-grid");
      row.classList.add("cart-row");

      row.innerHTML = `
    <div><img src="../${item.product.imageUrl}" alt="${
        item.product.name
      }" class="cart-image" /></div>
    <div class="cart-product-name"><a href="product-details.html?id=${
      item.product.id
    }">${item.product.name}</a></div>
    <div class="cart-product-price">$${item.product.price.toFixed(2)}</div>

   <div class="quantity">
      <button type="button" class="btn-quantity minus">−</button>
      <input type="number" class="quantity-input" id="${
        item.product.id
      }-quantity-input" min="1" value="${item.quantity}" readonly>
      <button type="button" class="btn-quantity plus">+</button>
  </div>

    <div class="cart-product-price">$${total.toFixed(2)}</div>
    <div><button class="cart-delete"><img src="../assets/images/cart/delete-icon.png" /></button></div>
  `;

      row.querySelector(".quantity").addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-quantity")) return;

        const input = row.querySelector(".quantity-input");
        let qty = Number(input.value);

        if (e.target.classList.contains("plus")) {
          qty += 1;
        } else if (e.target.classList.contains("minus")) {
          qty = Math.max(1, qty - 1);
        }

        input.value = qty;
        this.updateQuantity(item.product.id, qty);
        this.renderGrid(containerSelector);
      });

      // delete
      row.querySelector(".cart-delete").addEventListener("click", () => {
        this.remove(item.product.id);
        this.renderGrid(containerSelector);
      });

      container.appendChild(row);
    });

    const totalDiv = document.createElement("div");
    totalDiv.classList.add("cart-grand-total");
    totalDiv.innerHTML = `
    <div class="cart-buttons">
        <button class="btn btn--cart-page btn-continue">CONTINUE SHOPPING</button>
        <button class="btn btn--cart-page btn-clear">CLEAR SHOPPING CART</button>
    </div>
    <div class="cart-total">
        <div class="total-row">
            <p>Sub Total</p>
            <p>$${this.getTotal()}</p>
        </div>
        ${
          this.getTotal().toFixed(2) >= 3000
            ? `
            <div class="total-row">
            <p>Discount</p>
            <p>$${this.getDiscount()}</p>
        </div> `
            : ``
        }
        <div class="total-row">
            <p>Shipping</p>
            <p>$${this.#shipping}</p>
        </div>
        <div class="total-row">
            <p>Total</p>
            <p>$${this.getFinaPrice()}</p>
        </div>
        <button class="btn btn--checkout-page">Checkout</button>
    </div>`;

    container.appendChild(totalDiv);

    const clearCartBtn = totalDiv.querySelector(".btn-clear");
    const cartContinueBtn = totalDiv.querySelector(".btn-continue");
    const checkoutBtn = totalDiv.querySelector(".btn--checkout-page");
    clearCartBtn.addEventListener("click", () => {
      this.clear();
    });
    cartContinueBtn.addEventListener("click", () => {
      window.location.href = "catalog.html";
    });
    checkoutBtn.addEventListener("click", () => {
      this.checkoutSuccessPopup();
      this.clear();
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const cartManager = new CartManager();

  cartManager.renderGrid(".cart-container");

  // Listen to updates globally
  window.addEventListener("cartUpdated", () => {
    cartManager.renderGrid(".cart-container");
  });
});
