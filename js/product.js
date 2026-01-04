//---------------------- Header Scripts --------------------//
//Hamburger menu activation
const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".main-nav");

hamburger.addEventListener("click", () => {
  nav.classList.toggle("active");
  hamburger.classList.toggle("active");
});

//header stickup drop-shadow
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 10) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

//------------------- User Account Popup -----------------//
const userLink = document.getElementById("user-account");
const popup = document.getElementById("user-popup");

userLink.addEventListener("click", (e) => {
  e.preventDefault();
  popup.style.display = "flex";
});

popup.addEventListener("click", (e) => {
  if (e.target === popup) popup.style.display = "none";
});

//------------------- Login Form Validation -----------------//
const form = document.getElementById("login-form");
const email = document.getElementById("user-email");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!emailRegex.test(email.value.trim())) {
    alert("Please enter a valid email address.");
    email.focus();
    return;
  }

  if (password.value.trim().length < 6) {
    alert("Password must be at least 6 characters.");
    password.focus();
    return;
  }

  popup.style.display = "none";
  this.reset();
});

togglePassword.addEventListener("click", () => {
  const isHidden = password.type === "password";
  password.type = isHidden ? "text" : "password";
});

//------------------- Cart Counter -----------------//
// Get initial cart state
let cart = JSON.parse(localStorage.getItem("cart-products")) || [];
renderCart(cart);

// Listen for cart changes from any script
window.addEventListener("cartUpdated", (event) => {
  cart = event.detail;
  renderCart(cart);
});

function renderCart(cartItems) {
  const cartCount = document.querySelector(".cart-counter");

  if (!cartCount) return;

  const totalQty = cartItems.reduce((acc, el) => acc + el.quantity, 0);

  cartCount.textContent = totalQty ?? "";
  cartCount.style.display = totalQty ? "inline-flex" : "none";
}

//------------------- Active Nav Link -----------------//
const currentPage = window.location.pathname.split("/").pop();
const links = document.querySelectorAll(".main-nav a");

links.forEach((link) => {
  const href = link.getAttribute("href");
  const linkPage = href.split("/").pop();
  if (linkPage === currentPage) {
    link.classList.add("active");
  }
});

//------------------------ Add to Cart Function -----------------//
function addToCart(product, quantity = 1) {
  const cart = JSON.parse(localStorage.getItem("cart-products")) || [];
  const existing = cart.find((item) => item.product.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }

  localStorage.setItem("cart-products", JSON.stringify(cart));

  window.dispatchEvent(new CustomEvent("cartUpdated", { detail: cart }));
}

//----------------------- Product Page Body Scripts -----------------//
//Recommended product markup generation
function createProductItem(product) {
  const li = document.createElement("li");
  li.className = "product-item";
  li.id = product.id;
  li.innerHTML = `
      <div class="product-image">
          <a href="product-details.html?id=${product.id}">
            <img src="../${product.imageUrl}" alt="${product.name}" />
            <span class="sale-label">Sale</span>
          </a>
        </div>
          <a href="product-details.html?id=${product.id}"><h3>${product.name}</h3></a>
          <p class="price">$${product.price}</p>
          <button class="btn btn--add-to-cart">Add to Cart</button>
        `;

  const button = li.querySelector(".btn--add-to-cart");

  if (button) {
    button.addEventListener("click", () => addToCart(product));
  }

  return li;
}

//Recommended products generation
function getRecommendedProducts(productsData) {
  const randomProducts = [];
  const max = productsData.length;

  while (randomProducts.length < 4) {
    const index = Math.floor(Math.random() * max);
    const product = productsData[index];

    if (!randomProducts.includes(product)) {
      randomProducts.push(product);
    }
  }

  return randomProducts;
}

async function loadProducts() {
  const id = new URLSearchParams(location.search).get("id");
  const productPlaceHolder = document.querySelector(".product-placeholder");
  const recommendedPlaceHolder = document.querySelector(
    ".recommended-products"
  );

  try {
    const response = await fetch("../assets/data.json");
    if (!response.ok) throw new Error("Failed to load JSON");

    const { data } = await response.json();
    const product = data.filter((product) => product.id === id)[0];
    if (!product) {
      //show some fallback to return to the store
    }
    //single product build
    productPlaceHolder.appendChild(buildProductLayout(product));

    //recommended products build
    const recommendedProducts = getRecommendedProducts(data);
    recommendedProducts.forEach((randomProduct) => {
      recommendedPlaceHolder.appendChild(createProductItem(randomProduct));
    });
  } catch (err) {
    console.error(err);
  }
}

function fullStar() {
  return `
    <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.26648 0.552932C7.34952 0.386788 7.47719 0.247054 7.63518 0.149392C7.79317 0.0517301 7.97524 0 8.16098 0C8.34672 0 8.52879 0.0517301 8.68678 0.149392C8.84477 0.247054 8.97244 0.386788 9.05548 0.552932L10.7695 3.98593C10.8436 4.13421 10.9534 4.26174 11.089 4.35705C11.2247 4.45236 11.3819 4.51245 11.5465 4.53193L15.4385 4.99193C15.6302 5.01462 15.8113 5.09234 15.9598 5.21569C16.1084 5.33904 16.218 5.50276 16.2756 5.68707C16.3331 5.87138 16.336 6.06841 16.284 6.25435C16.232 6.44029 16.1273 6.60721 15.9825 6.73493L13.2045 9.18593C13.0728 9.30223 12.974 9.45119 12.9182 9.61779C12.8624 9.78439 12.8514 9.96276 12.8865 10.1349L13.6145 13.7119C13.652 13.8968 13.6365 14.0886 13.5697 14.2651C13.5029 14.4415 13.3876 14.5955 13.237 14.7092C13.0864 14.8228 12.9067 14.8916 12.7187 14.9075C12.5307 14.9234 12.342 14.8857 12.1745 14.7989L8.62148 12.9619C8.47933 12.8883 8.32158 12.8499 8.16148 12.8499C8.00139 12.8499 7.84363 12.8883 7.70148 12.9619L4.14648 14.7999C3.97895 14.8867 3.79028 14.9244 3.60227 14.9085C3.41426 14.8926 3.23458 14.8238 3.08398 14.7102C2.93339 14.5965 2.81803 14.4425 2.75123 14.2661C2.68443 14.0896 2.66892 13.8978 2.70648 13.7129L3.43448 10.1359C3.46952 9.96376 3.45858 9.78539 3.40275 9.61879C3.34692 9.45218 3.24819 9.30323 3.11648 9.18693L0.338482 6.73593C0.193686 6.60821 0.0889622 6.44129 0.0369568 6.25535C-0.0150486 6.06941 -0.0121117 5.87238 0.0454129 5.68807C0.102938 5.50376 0.21259 5.34004 0.361128 5.21669C0.509667 5.09334 0.69074 5.01562 0.882482 4.99293L4.77448 4.53293C4.9391 4.51345 5.0963 4.45336 5.23193 4.35805C5.36756 4.26274 5.47737 4.13521 5.55148 3.98693L7.26648 0.552932Z" fill="#F5B423"/>
    </svg>
  `;
}

function emptyStar() {
  return `
    <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.26648 0.552932C7.34952 0.386788 7.47719 0.247054 7.63518 0.149392C7.79317 0.0517301 7.97524 0 8.16098 0C8.34672 0 8.52879 0.0517301 8.68678 0.149392C8.84477 0.247054 8.97244 0.386788 9.05548 0.552932L10.7695 3.98593C10.8436 4.13421 10.9534 4.26174 11.089 4.35705C11.2247 4.45236 11.3819 4.51245 11.5465 4.53193L15.4385 4.99193C15.6302 5.01462 15.8113 5.09234 15.9598 5.21569C16.1084 5.33904 16.218 5.50276 16.2756 5.68707C16.3331 5.87138 16.336 6.06841 16.284 6.25435C16.232 6.44029 16.1273 6.60721 15.9825 6.73493L13.2045 9.18593C13.0728 9.30223 12.974 9.45119 12.9182 9.61779C12.8624 9.78439 12.8514 9.96276 12.8865 10.1349L13.6145 13.7119C13.652 13.8968 13.6365 14.0886 13.5697 14.2651C13.5029 14.4415 13.3876 14.5955 13.237 14.7092C13.0864 14.8228 12.9067 14.8916 12.7187 14.9075C12.5307 14.9234 12.342 14.8857 12.1745 14.7989L8.62148 12.9619C8.47933 12.8883 8.32158 12.8499 8.16148 12.8499C8.00139 12.8499 7.84363 12.8883 7.70148 12.9619L4.14648 14.7999C3.97895 14.8867 3.79028 14.9244 3.60227 14.9085C3.41426 14.8926 3.23458 14.8238 3.08398 14.7102C2.93339 14.5965 2.81803 14.4425 2.75123 14.2661C2.68443 14.0896 2.66892 13.8978 2.70648 13.7129L3.43448 10.1359C3.46952 9.96376 3.45858 9.78539 3.40275 9.61879C3.34692 9.45218 3.24819 9.30323 3.11648 9.18693L0.338482 6.73593C0.193686 6.60821 0.0889622 6.44129 0.0369568 6.25535C-0.0150486 6.06941 -0.0121117 5.87238 0.0454129 5.68807C0.102938 5.50376 0.21259 5.34004 0.361128 5.21669C0.509667 5.09334 0.69074 5.01562 0.882482 4.99293L4.77448 4.53293C4.9391 4.51345 5.0963 4.45336 5.23193 4.35805C5.36756 4.26274 5.47737 4.13521 5.55148 3.98693L7.26648 0.552932Z" fill="#E9E9ED"/>
    </svg>
  `;
}

function renderRating(rating) {
  const fullCount = Math.round(rating);
  const emptyCount = 5 - fullCount;

  let html = "";

  for (let i = 0; i < fullCount; i++) {
    html += fullStar();
  }
  for (let i = 0; i < emptyCount; i++) {
    html += emptyStar();
  }

  return html;
}

function buildProductLayout(product) {
  const element = document.createElement("div");
  element.className = "product-layout";
  element.innerHTML = `
    <div class="product-left-column">
     <img class="product-main-image" src="../${product.imageUrl}" alt="${
    product.name
  }" />
     <ul class="product-thumbnails-carousel">
        <li>
            <img class="product-thumbnail" src="../assets/images/products/product-secondary-thumbnail-1.png" alt="${
              product.name
            }" />
        </li>
        <li>
            <img class="product-thumbnail" src="../assets/images/products/product-secondary-thumbnail-2.png" alt="${
              product.name
            }" />
        </li>
        <li>
            <img class="product-thumbnail" src="../assets/images/products/product-secondary-thumbnail-3.png" alt="${
              product.name
            }" />
        </li>
        <li>
            <img class="product-thumbnail" src="../assets/images/products/product-secondary-thumbnail-4.png" alt="${
              product.name
            }" />
        </li>

     </ul>
    </div>
    <div class="product-right-column">
      <h3 class="product-title">${product.name}</h2>
        <div class="product-rating">
            <div class="product-stars">${renderRating(product.rating)}</div>
            <p class="reviews-amount">(1 Clients Review)</p>
        </div>
        <p class="product-price">$${product.price}</p>
          <div class="product-description"> 
            <p>
                The new Global Explorer Max Comfort Suitcase Pro
                 is a bold reimagining of travel essentials, 
                 designed to elevate every journey. Made with at least 30% 
                 recycled materials, its lightweight yet impact-resistant 
                 shell combines ecoconscious innovation with rugged durability.
            </p>
            <p>
                The ergonomic handle and GlideMotion spinner wheels ensure effortless  
                mobility while making a statement in sleek design. Inside, the modular  
                compartments and adjustable straps keep your belongings secure and 
                neatly organized, no matter the destination.
            </p>
          </div>
          <div class="product-attributes">
            <div class="product-size">
                <label for="sizes">Size:</label>
                    <select name="sizes" id="sizes" class="select-styled">
                        <option value="" disabled selected>Choose option</option>
                        <option value="${product.size}">${product.size}</option>
                    </select>
            </div>
            <div class="product-color">
                <label for="colors">Color:</label>
                    <select name="colors" id="colors" class="select-styled">
                        <option value="" disabled selected>Choose option</option>
                        <option value="${product.color}">${
    product.color
  }</option>
                    </select>
            </div>
            <div class="product-category">
                <label for="categories">Category:</label>
                    <select name="categories" id="categories" class="select-styled">
                        <option value="" disabled selected>Choose option</option>
                        <option value="${product.category}">${
    product.category
  }</option>
                    </select>
            </div>
            <div class="addtocart-block">
              <div class="quantity">
                  <button type="button" class="btn-quantity minus">−</button>
                  <input type="number" class="quantity-input" id="quantity-input" min="1" value="1" readonly>
                  <button type="button" class="btn-quantity plus">+</button>
              </div>
              <button class="btn btn--product-addtocart">Add To Cart</button>
            </div>
            <div class="payment-options">
              <p>
              Payment:
              </p>
              <img src="../assets/images/product-page/visa-pay-logo.png" alt="Visa"/>
              <img src="../assets/images/product-page/american-express-logo.png" alt="american express"/>
              <img src="../assets/images/product-page/master-card-logo.png" alt="master card"/>
              <img src="../assets/images/product-page/paypal-logo.png" alt="paypal"/>
            </div>
          </div>
        
    </div>`;

  const button = element.querySelector(".btn--product-addtocart");

  if (button) {
    button.addEventListener("click", () => {
      const quantityInput = Number(
        element.querySelector(".quantity-input").value
      );
      addToCart(product, quantityInput);
    });
  }

  return element;
}

document.addEventListener("DOMContentLoaded", loadProducts);

//Quantity input script & Event Listener
function quantityUpdate(event) {
  if (event.target.closest(".btn-quantity.plus")) {
    const input = event.target
      .closest(".quantity")
      .querySelector(".quantity-input");
    input.value = Number(input.value) + 1;
  }

  if (event.target.closest(".btn-quantity.minus")) {
    const input = event.target
      .closest(".quantity")
      .querySelector(".quantity-input");
    input.value = Math.max(1, Number(input.value) - 1);
  }
}

document.addEventListener("click", quantityUpdate);

//Tabs script
const buttons = document.querySelectorAll(".tab-button");
const contents = document.querySelectorAll(".tab-content");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons and contents
    buttons.forEach((b) => b.classList.remove("active"));
    contents.forEach((c) => c.classList.remove("active"));

    // Add active to clicked button and its content
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
  });
});

//Review form
document.getElementById("review-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const message = document.getElementById("form-message");

  // SIMPLE VALIDATION
  const ratingSelected = document.querySelector('input[name="rating"]:checked');
  const review = document.getElementById("review-textarea").value.trim();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const checkbox = document.getElementById("terms").checked;

  if (!ratingSelected || !review || !name || !email || !checkbox) {
    message.textContent =
      "Please fill in all required fields(Including Stars Rating :) ).";
    message.className = "form-message error";
    return;
  }

  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!emailRegex.test(email)) {
    message.textContent = "Please enter a valid email address.";
    message.className = "form-message error";
    return;
  }

  message.textContent = "Your review has been submitted successfully!";
  message.className = "form-message success";

  this.reset();
});
