const state = {
  perfumes: [],
  segment: "Todos",
  gender: "Todos",
  query: "",
};

const grid = document.querySelector("#product-grid");
const emptyState = document.querySelector("#empty-state");
const clearFiltersButton = document.querySelector("#clear-filters");
const searchInput = document.querySelector("#search");
const dialog = document.querySelector("#product-dialog");
const dialogContent = document.querySelector("#dialog-content");
const finderForm = document.querySelector("#finder-form");
const finderResults = document.querySelector("#finder-results");
let currentRecommendations = [];

const normalize = (value) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function productCard(perfume) {
  return [
    '<article class="product-card" data-product-id="' + perfume.id + '" role="button" tabindex="0" aria-label="Ver ' + perfume.name + ' de ' + perfume.brand + '">',
    '  <div class="product-image-wrap">',
    '    <img src="' + perfume.image + '" alt="' + perfume.name + ' de ' + perfume.brand + '" loading="lazy" decoding="async" />',
    "  </div>",
    '  <div class="product-meta">',
    '    <span class="product-brand">' + perfume.brand + "</span>",
    "    <h3>" + perfume.name + "</h3>",
    "    <p>" + perfume.gender + " · " + perfume.segment + "</p>",
    "  </div>",
    "</article>",
  ].join("");
}

function getFilteredPerfumes() {
  const query = normalize(state.query);
  return state.perfumes.filter((perfume) => {
    const matchesSegment =
      state.segment === "Todos" || perfume.segment === state.segment;
    const matchesGender =
      state.gender === "Todos" ||
      perfume.gender === state.gender ||
      (perfume.gender === "Unisex" &&
        (state.gender === "Hombre" || state.gender === "Mujer"));
    const haystack = normalize(
      [perfume.name, perfume.brand, perfume.profile, perfume.segment, perfume.gender].join(" ")
    );
    return matchesSegment && matchesGender && (!query || haystack.includes(query));
  });
}

function renderCatalog() {
  const filtered = getFilteredPerfumes();
  grid.innerHTML = filtered.map(productCard).join("");
  grid.hidden = filtered.length === 0;
  emptyState.hidden = filtered.length !== 0;
  clearFiltersButton.hidden =
    state.segment === "Todos" && state.gender === "Todos" && !state.query;
}

function setFilter(type, value) {
  state[type] = value;
  document.querySelectorAll('[data-filter="' + type + '"]').forEach((button) => {
    const selected = button.dataset.value === value;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderCatalog();
}

function clearFilters() {
  state.query = "";
  searchInput.value = "";
  setFilter("segment", "Todos");
  setFilter("gender", "Todos");
}

function openProduct(perfume) {
  if (!perfume) return;
  dialogContent.innerHTML = [
    '<div class="dialog-image"><img src="' + perfume.image + '" alt="' + perfume.name + ' de ' + perfume.brand + '" /></div>',
    '<div class="dialog-info">',
    '  <span class="dialog-id">' + perfume.id + " · " + perfume.segment + "</span>",
    '  <span class="dialog-brand">' + perfume.brand + "</span>",
    "  <h2>" + perfume.name + "</h2>",
    '  <p class="dialog-concentration">' + perfume.concentration + "</p>",
    '  <p class="dialog-profile">' + perfume.profile + "</p>",
    '  <div class="dialog-tags"><span>' + perfume.gender + "</span><span>" + perfume.occasion + "</span></div>",
    '  <span class="demo-note">Vista demostrativa · Sin contacto comercial</span>',
    "</div>",
  ].join("");
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function openRequestedProduct() {
  const requestedId = new URLSearchParams(window.location.search).get("perfume");
  if (!requestedId) return;
  const perfume = state.perfumes.find(
    (item) => normalize(item.id) === normalize(requestedId)
  );
  if (perfume) openProduct(perfume);
}

function closeProduct() {
  dialog.close();
  document.body.classList.remove("dialog-open");
}

function handleCardActivation(event) {
  const card = event.target.closest("[data-product-id]");
  if (!card) return;
  if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
  if (event.type === "keydown") event.preventDefault();
  openProduct(state.perfumes.find((perfume) => perfume.id === card.dataset.productId));
}

function renderRecommendations(perfumes, showAll = false) {
  const visiblePerfumes = showAll ? perfumes : perfumes.slice(0, 3);
  const showAllButton =
    !showAll && perfumes.length > 3
      ? '<button class="finder-show-all" type="button" data-show-all-recommendations>Ver todas las coincidencias · ' + perfumes.length + "</button>"
      : "";
  const collapseButton = showAll
    ? '<button class="finder-show-all finder-collapse" type="button" data-collapse-recommendations>Volver a las 3 destacadas</button>'
    : "";
  finderResults.hidden = false;
  finderResults.classList.toggle("is-expanded", showAll);
  finderResults.innerHTML =
    "<h3>Estas pueden ir con vos</h3><div class=\"finder-result-list\">" +
    visiblePerfumes
      .map(
        (perfume) =>
          '<button class="finder-result" type="button" data-product-id="' + perfume.id + '">' +
          '<img src="' + perfume.image + '" alt="" loading="lazy" />' +
          "<span><strong>" + perfume.name + "</strong><small>" + perfume.brand + " · " + perfume.profile + "</small></span>" +
          '<span aria-hidden="true">→</span></button>'
      )
      .join("") +
    "</div>" +
    showAllButton +
    collapseButton;
  finderResults.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.setAttribute("aria-pressed", String(button.classList.contains("active")));
  button.addEventListener("click", () =>
    setFilter(button.dataset.filter, button.dataset.value)
  );
});

document.querySelectorAll("[data-segment-jump]").forEach((button) => {
  button.addEventListener("click", () => {
    setFilter("segment", button.dataset.segmentJump);
    document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
  });
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderCatalog();
});

clearFiltersButton.addEventListener("click", clearFilters);
document.querySelector("#empty-clear").addEventListener("click", clearFilters);
grid.addEventListener("click", handleCardActivation);
grid.addEventListener("keydown", handleCardActivation);
finderResults.addEventListener("click", (event) => {
  if (event.target.closest("[data-show-all-recommendations]")) {
    renderRecommendations(currentRecommendations, true);
    return;
  }
  if (event.target.closest("[data-collapse-recommendations]")) {
    renderRecommendations(currentRecommendations);
    return;
  }
  handleCardActivation(event);
});

document.querySelector(".dialog-close").addEventListener("click", closeProduct);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeProduct();
});
dialog.addEventListener("close", () =>
  document.body.classList.remove("dialog-open")
);

finderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(finderForm);
  const gender = form.get("finder-gender");
  const mood = form.get("finder-mood");
  currentRecommendations = state.perfumes.filter((perfume) => {
      const genderMatch =
        gender === "Unisex"
          ? perfume.gender === "Unisex"
          : perfume.gender === gender || perfume.gender === "Unisex";
      return genderMatch && perfume.moods.includes(mood);
    });
  renderRecommendations(currentRecommendations);
});

window.addEventListener(
  "scroll",
  () =>
    document
      .querySelector("[data-header]")
      .classList.toggle("scrolled", window.scrollY > 30),
  { passive: true }
);

fetch("data/perfumes.json")
  .then((response) => {
    if (!response.ok) throw new Error("No se pudo cargar el catálogo.");
    return response.json();
  })
  .then((perfumes) => {
    state.perfumes = perfumes;
    renderCatalog();
    openRequestedProduct();
  })
  .catch(() => {
    grid.innerHTML =
      '<div class="empty-state"><h3>No pudimos cargar el catálogo.</h3><p>Volvé a intentarlo en unos minutos.</p></div>';
  });
