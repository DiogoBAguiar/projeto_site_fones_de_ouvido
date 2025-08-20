// products.js
// Este script lida com a lógica da página de listagem de produtos.
// Refatorado para usar a API de produtos do Flask e renderização dinâmica.

let currentPage = 1;
const productsPerPage = 12;
let selectedPrice = 10000; // Preço máximo padrão
let selectedTypes = [];
let selectedBrands = [];

// Variável global para armazenar os produtos do back-end
let products = [];
// Variável global para armazenar os filtros do back-end
let filters = [];

const API_PRODUCTS_URL = window.location.origin + "/api/products";
const API_FILTERS_URL = window.location.origin + "/api/admin/filters"; // Usamos a API de admin para buscar todos os filtros

const priceRange = document.getElementById('priceRange');
const priceDisplay = document.getElementById('priceDisplay');
const productList = document.getElementById('productList');
const pagination = document.getElementById('pagination');
const typeFiltersContainer = document.getElementById('type-filters');
const brandFiltersContainer = document.getElementById('brand-filters');

/**
 * Busca os produtos e filtros da API e renderiza a lista.
 */
async function fetchData() {
    try {
        const productsResponse = await fetch(API_PRODUCTS_URL);
        if (!productsResponse.ok) {
            throw new Error('Erro ao buscar produtos da API.');
        }
        products = await productsResponse.json();

        const filtersResponse = await fetch(API_FILTERS_URL);
        if (!filtersResponse.ok) {
            throw new Error('Erro ao buscar filtros da API.');
        }
        filters = await filtersResponse.json();
        
        // Renderiza os filtros de marca e tipo com base nos dados do CSV
        renderFilters();
        updateProductList();
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if (productList) {
            productList.innerHTML = `<p class="text-center text-gray-500">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>`;
        }
    }
}

/**
 * Renderiza os checkboxes de filtro dinamicamente.
 */
function renderFilters() {
    typeFiltersContainer.innerHTML = '';
    brandFiltersContainer.innerHTML = '';
    
    // Obtém os filtros de tipo e marca
    const typeFilters = filters.filter(f => f.type === 'type');
    const brandFilters = filters.filter(f => f.type === 'brand');

    typeFilters.forEach(filter => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${filter.name}"> ${filter.name}`;
        typeFiltersContainer.appendChild(label);
    });

    brandFilters.forEach(filter => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" value="${filter.name}"> ${filter.name}`;
        brandFiltersContainer.appendChild(label);
    });
    
    // Re-adiciona os event listeners após a renderização
    document.querySelectorAll('#filters-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateProductList);
    });
}

/**
 * Exibe os produtos na página, com paginação.
 * @param {number} page - O número da página atual.
 * @param {Array<Object>} filteredProducts - A lista de produtos filtrados.
 */
function displayProducts(page, filteredProducts) {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    productList.innerHTML = '';

    if (filteredProducts.length === 0) {
        productList.innerHTML = `<p class="text-center text-gray-500">Nenhum produto encontrado com os filtros aplicados.</p>`;
        return;
    }

    filteredProducts.slice(startIndex, endIndex).forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        
        const link = document.createElement('a');
        link.href = `/products-details/${product.id}`;
        link.innerHTML = `
            <img src="${product.images[0] || 'https://placehold.co/100'}" alt="${product.name}">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            </div>
        `;
        
        productDiv.appendChild(link);
        productList.appendChild(productDiv);
    });
}

/**
 * Renderiza os botões de paginação.
 * @param {Array<Object>} filteredProducts - A lista de produtos filtrados.
 */
function displayPagination(filteredProducts) {
    if (!pagination) return;
    pagination.innerHTML = '';
    const pageCount = Math.ceil(filteredProducts.length / productsPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.onclick = () => {
            currentPage = i;
            displayProducts(currentPage, filteredProducts);
            // Atualiza a classe 'active'
            document.querySelectorAll('.pagination button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        pagination.appendChild(button);
    }
}

/**
 * Atualiza a exibição do preço e o valor do filtro.
 */
function updatePriceDisplay() {
    if (!priceRange || !priceDisplay) return;
    const value = priceRange.value;
    priceDisplay.textContent = `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    selectedPrice = parseFloat(value);
    updateProductList();
}

/**
 * Filtra a lista de produtos e atualiza a exibição.
 */
function updateProductList() {
    selectedTypes = Array.from(document.querySelectorAll('#type-filters input[type="checkbox"]:checked')).map(cb => cb.value);
    selectedBrands = Array.from(document.querySelectorAll('#brand-filters input[type="checkbox"]:checked')).map(cb => cb.value);
    
    const filteredProducts = products.filter(product => {
        const matchesPrice = product.price <= selectedPrice;
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        return matchesPrice && matchesType && matchesBrand;
    });
    
    currentPage = 1; // Reseta para a primeira página ao filtrar
    displayProducts(currentPage, filteredProducts);
    displayPagination(filteredProducts);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    if (priceRange) {
        priceRange.addEventListener('input', updatePriceDisplay);
        priceRange.addEventListener('change', updateProductList); // Atualiza na soltura do slider
    }
    // Inicializa o valor exibido do slider
    updatePriceDisplay();
});
