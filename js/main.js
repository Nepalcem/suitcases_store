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

//-----------------------Body Scripts -----------------//
//----------------------- Load Products from JSON -----------------//
async function loadProducts() {
  try {
    const response = await fetch("assets/data.json");
    if (!response.ok) throw new Error("Failed to load JSON");

    const { data } = await response.json();

    buildProductsLayout(data, "selected", ".selected-list");
    buildProductsLayout(data, "new", ".new-products-list");
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);

//-----------------------SuitCases Carousel -----------------//
document.addEventListener("DOMContentLoaded", function () {
  const sliderTrack = document.querySelector(".slider-track");

  if (!sliderTrack) return;

  // Check if already initialized
  if (sliderTrack.dataset.carouselInitialized === "true") {
    return;
  }

  const originalSlides = sliderTrack.querySelectorAll(".suitcase");
  if (originalSlides.length === 0) return;

  // Prevent slides from shrinking in flex layout
  originalSlides.forEach((slide) => {
    slide.style.flexShrink = "0";
  });

  // Clone slides for seamless infinite loop
  originalSlides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.style.flexShrink = "0";
    sliderTrack.appendChild(clone);
  });

  const allSlides = sliderTrack.querySelectorAll(".suitcase");
  const totalSlides = originalSlides.length;
  let currentIndex = 0;
  const gap = 39; // Gap between slides from CSS

  sliderTrack.dataset.carouselInitialized = "true";

  // Initialize carousel position
  sliderTrack.style.transform = "translateX(0px)";

  function moveCarousel() {
    const firstSlide = allSlides[0];
    const slideWidth = firstSlide.offsetWidth || 296;
    const slideStep = slideWidth + gap;

    currentIndex++;

    const translateX = -currentIndex * slideStep;
    sliderTrack.style.transform = `translateX(${translateX}px)`;

    // When we reach the cloned slides, reset to beginning seamlessly
    if (currentIndex >= totalSlides) {
      setTimeout(() => {
        sliderTrack.style.transition = "none";
        currentIndex = 0;
        sliderTrack.style.transform = "translateX(0px)";

        // Force browser reflow
        sliderTrack.getBoundingClientRect();

        // Re-enable transition
        sliderTrack.style.transition = "";
      }, 400); // CSS transition duration
    }
  }

  // auto-play interval
  setInterval(moveCarousel, 3000);
});

//----------------------- Product markup generation -----------------//
function createProductItem(product, productType) {
  const li = document.createElement("li");
  li.className = "product-item";
  li.id = product.id;
  li.innerHTML = `
      <div class="product-image">
          <a href="product-details.html?id=${product.id}">
            <img src="${product.imageUrl}" alt="${product.name}" />
            <span class="sale-label">Sale</span>
          </a>
        </div>
          <a href="product-details.html?id=${product.id}"><h3>${
    product.name
  }</h3></a>
          <p class="price">$${product.price}</p>
          ${
            productType === "new"
              ? `<button class="btn btn--add-to-cart" onclick="window.location.href='product-details.html?id=${product.id}'">View Product</button>`
              : '<button class="btn btn--add-to-cart">Add to Cart</button>'
          }
          `;

  const button = li.querySelector(".btn--add-to-cart");

  if (productType !== "new") {
    button.addEventListener("click", () => addToCart(product));
  }

  return li;
}

//----------------------- Build Products Layout -----------------//
function buildProductsLayout(productsData, productsType, htmlParent) {
  const productList = document.querySelector(htmlParent);

  if (!productsData || !productsType || !htmlParent || !productList) return;

  const blockMap = {
    selected: "Selected Products",
    new: "New Products Arrival",
    recommended: "You May Also Like",
  };

  const blockName = blockMap[productsType];
  if (!blockName) return;

  const filteredProducts = productsData.filter((product) =>
    product.blocks.includes(blockName)
  );
  filteredProducts.forEach((product) => {
    productList.appendChild(createProductItem(product, productsType));
  });
}


