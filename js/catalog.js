
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
const currenNavtPage = window.location.pathname.split("/").pop();
const links = document.querySelectorAll(".main-nav a");

links.forEach((link) => {
  const href = link.getAttribute("href");
  const linkPage = href.split("/").pop();
  if (linkPage === currenNavtPage) {
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

//initial values
const itemsPerPage = 12;
let currentData = [];
let defaultData = [];
let setsData = [];
let currentPage = 1;
let currentSorting = "default";
let activeFilters = {
  size: "",
  color: "",
  category: "",
  sales: false,
};


async function loadProducts() {
  try {
    const response = await fetch("../assets/data.json");
    if (!response.ok) throw new Error("Failed to load JSON");

    const { data } = await response.json();
    currentData = data;
    setsData = data;

    fillFilters(currentData); 
    renderSets(setsData); 

    defaultData = [...currentData];

    applyFiltersAndSorting(); 
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadProducts);


// Build products layout
function buildProductsLayout(productsData, htmlParent) {
  if (!productsData || !htmlParent) return;

  const productList = document.querySelector(htmlParent);
  if (!productList) return;

  productList.innerHTML = ""; // clear previous items

  productsData.forEach((product) => {
    productList.appendChild(createProductItem(product));
  });
}

// Render pagination buttons
function renderPagination(totalPages) {
  const paginationContainer = document.querySelector(".pagination");
  if (!paginationContainer) return;

  paginationContainer.innerHTML = "";

  // Previous button
  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.classList.add("prev-btn");
    prevBtn.addEventListener("click", () => renderPage(currentPage - 1));
    paginationContainer.appendChild(prevBtn);
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.classList.add("pagination-item");
    if (i === currentPage) {
      pageBtn.disabled = true;
      pageBtn.classList.add("pagination-current");
    }
    pageBtn.addEventListener("click", () => renderPage(i));
    paginationContainer.appendChild(pageBtn);
  }

  // Next button
  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("next-btn");
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", () => renderPage(currentPage + 1));
    paginationContainer.appendChild(nextBtn);
  }
}

//product markup generation
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
  button.addEventListener("click", () => addToCart(product));

  return li;
}

//Add product to Cart and Fire Global Window event
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

//Search function
const searchInput = document.getElementById("model-search");
const searchIcon = document.querySelector(".search-icon");

async function runSearch() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return;

  console.log("Searching for:", query);
  try {
    const response = await fetch("../assets/data.json");
    if (!response.ok) throw new Error("Failed to load JSON");

    const { data } = await response.json();

    const searchResult = data.find((el) =>
      el.name.toLowerCase().trim().split(" ").includes(query)
    );

    if (searchResult) {
      window.location.href = `product-details.html?id=${searchResult.id}`;
    } else {
      searchErrorPopup();
    }
  } catch (err) {
    console.error(err);
  }
}

searchIcon.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runSearch();
  }
});

function searchErrorPopup() {
  const searchPopup = document.getElementById("search-popup");

  if (!searchPopup) return;

  searchPopup.style.display = "flex";

  searchPopup.addEventListener("click", (e) => {
    if (e.target === searchPopup) searchPopup.style.display = "none";
  });
}

//Random sets render
function renderSets(data) {
  const colorSets = groupByColor(data);

  const container = document.querySelector(".sets-list");
  container.innerHTML = "";

  const randomColors = Object.keys(colorSets)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  randomColors.forEach((color) => {
    const items = colorSets[color];

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    const avgRating =
      items.reduce((sum, item) => sum + item.rating, 0) / items.length;
    const starsHTML = renderRating(avgRating);

    const setHTML = `
      <li class="set-item">
        <img 
          src="../assets/images/catalog/${color}-sets.png" 
          alt="${color} set"
          class="set-image"
        >
        <div class="set-info">
        <p class="set-name">${color.toUpperCase()} Set of products</p>
        <p class="set-desc">Lorem ipsum dolor sit amet.</p>

        <div class="set-rating">
          ${starsHTML}
        </div>

        <p class="set-price">$${totalPrice}</p>
        </div>
      </li>
    `;

    container.insertAdjacentHTML("beforeend", setHTML);
  });
}

function groupByColor(arr) {
  return arr.reduce((acc, item) => {
    if (!acc[item.color]) {
      acc[item.color] = [];
    }
    acc[item.color].push(item);
    return acc;
  }, {});
}

function fullStar() {
  return `
    <svg width="12" height="11" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.26648 0.552932C7.34952 0.386788 7.47719 0.247054 7.63518 0.149392C7.79317 0.0517301 7.97524 0 8.16098 0C8.34672 0 8.52879 0.0517301 8.68678 0.149392C8.84477 0.247054 8.97244 0.386788 9.05548 0.552932L10.7695 3.98593C10.8436 4.13421 10.9534 4.26174 11.089 4.35705C11.2247 4.45236 11.3819 4.51245 11.5465 4.53193L15.4385 4.99193C15.6302 5.01462 15.8113 5.09234 15.9598 5.21569C16.1084 5.33904 16.218 5.50276 16.2756 5.68707C16.3331 5.87138 16.336 6.06841 16.284 6.25435C16.232 6.44029 16.1273 6.60721 15.9825 6.73493L13.2045 9.18593C13.0728 9.30223 12.974 9.45119 12.9182 9.61779C12.8624 9.78439 12.8514 9.96276 12.8865 10.1349L13.6145 13.7119C13.652 13.8968 13.6365 14.0886 13.5697 14.2651C13.5029 14.4415 13.3876 14.5955 13.237 14.7092C13.0864 14.8228 12.9067 14.8916 12.7187 14.9075C12.5307 14.9234 12.342 14.8857 12.1745 14.7989L8.62148 12.9619C8.47933 12.8883 8.32158 12.8499 8.16148 12.8499C8.00139 12.8499 7.84363 12.8883 7.70148 12.9619L4.14648 14.7999C3.97895 14.8867 3.79028 14.9244 3.60227 14.9085C3.41426 14.8926 3.23458 14.8238 3.08398 14.7102C2.93339 14.5965 2.81803 14.4425 2.75123 14.2661C2.68443 14.0896 2.66892 13.8978 2.70648 13.7129L3.43448 10.1359C3.46952 9.96376 3.45858 9.78539 3.40275 9.61879C3.34692 9.45218 3.24819 9.30323 3.11648 9.18693L0.338482 6.73593C0.193686 6.60821 0.0889622 6.44129 0.0369568 6.25535C-0.0150486 6.06941 -0.0121117 5.87238 0.0454129 5.68807C0.102938 5.50376 0.21259 5.34004 0.361128 5.21669C0.509667 5.09334 0.69074 5.01562 0.882482 4.99293L4.77448 4.53293C4.9391 4.51345 5.0963 4.45336 5.23193 4.35805C5.36756 4.26274 5.47737 4.13521 5.55148 3.98693L7.26648 0.552932Z" fill="#F5B423"/>
    </svg>
  `;
}

function emptyStar() {
  return `
    <svg width="12" height="11" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
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

//Filters view
const btn = document.getElementById("toggle-btn");
const section = document.getElementById("filters");

btn.addEventListener("click", () => {
  const isOpen = section.classList.toggle("open");
  btn.textContent = isOpen ? "Hide Filters" : "Show Filters";
});

//Insert data into filter select's from JSON
function fillFilters(data) {
  const sizeSelect = document.getElementById("size-select");
  const colorSelect = document.getElementById("color-select");
  const categorySelect = document.getElementById("category-select");

  const sizes = [...new Set(data.map((item) => item.size))];
  const colors = [...new Set(data.map((item) => item.color))];
  const categories = [...new Set(data.map((item) => item.category))];

  function fillSelect(select, values) {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  fillSelect(sizeSelect, sizes);
  fillSelect(colorSelect, colors);
  fillSelect(categorySelect, categories);
}

// Render specific page
function renderPage(page) {
  const totalItems = document.querySelector(".paginated-total");
  const showingItems = document.querySelector(".paginated-items");

  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  if (page < 1) {
    page = 1;
  }
  if (page > totalPages) page = totalPages;
  currentPage = page;

  
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedData = currentData.slice(start, end);

 
  showingItems.textContent = `${
    currentPage > 1 ? itemsPerPage * (page - 1) + 1 : "1"
  }-${currentPage > 1 ? currentData.length : itemsPerPage * currentPage} `;
  totalItems.textContent = currentData.length;
  buildProductsLayout(paginatedData, ".catalog-list");
  renderPagination(totalPages);
}

//Main Filtering and Sorting Function
function applyFiltersAndSorting() {
  let filteredData = [...defaultData];

  // Filters
  if (activeFilters.size) {
    filteredData = filteredData.filter(
      (item) => item.size === activeFilters.size
    );
  }
  if (activeFilters.color) {
    filteredData = filteredData.filter(
      (item) => item.color === activeFilters.color
    );
  }
  if (activeFilters.category) {
    filteredData = filteredData.filter(
      (item) => item.category === activeFilters.category
    );
  }
  if (activeFilters.sales) {
    filteredData = filteredData.filter((item) => item.salesStatus === true);
  }

  // Sorting
  switch (currentSorting) {
    case "price-asc":
      filteredData.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredData.sort((a, b) => b.price - a.price);
      break;
    case "popularity-desc":
      filteredData.sort((a, b) => b.popularity - a.popularity);
      break;
    case "rating-desc":
      filteredData.sort((a, b) => b.rating - a.rating);
      break;
    case "default":
      break;
  }

  currentData = filteredData;
  currentPage = 1;
  renderPage(currentPage);
}

//Filtering and Sorting Listeners
document.getElementById("size-select").addEventListener("change", (e) => {
  activeFilters.size = e.target.value;
  applyFiltersAndSorting();
});

document.getElementById("color-select").addEventListener("change", (e) => {
  activeFilters.color = e.target.value;
  applyFiltersAndSorting();
});

document.getElementById("category-select").addEventListener("change", (e) => {
  activeFilters.category = e.target.value;
  applyFiltersAndSorting();
});

document.getElementById("sales-radio").addEventListener("change", (e) => {
  activeFilters.sales = e.target.checked;
  applyFiltersAndSorting();
});

document.getElementById("clear-filters").addEventListener("click", () => {
  activeFilters = { size: "", color: "", category: "", sales: false };
  document.getElementById("size-select").value = "";
  document.getElementById("color-select").value = "";
  document.getElementById("category-select").value = "";
  document.getElementById("sales-radio").checked = false;

  applyFiltersAndSorting();
});

document.getElementById("sort-select").addEventListener("change", (e) => {
  currentSorting = e.target.value;
  applyFiltersAndSorting();
});