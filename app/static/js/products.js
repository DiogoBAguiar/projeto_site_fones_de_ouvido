// Este código foi corrigido para buscar os produtos da API do Flask.

let currentPage = 1;
const productsPerPage = 12;
let selectedPrice = 10000; // Preço máximo padrão
let selectedTypes = [];
let selectedBrands = [];

// Variável global para armazenar os produtos do backend
let products = [];
const API_PRODUCTS_URL = window.location.origin + "/products";

/**
 * Busca os produtos da API e renderiza a lista.
 */
async function fetchProducts() {
    try {
        const response = await fetch(API_PRODUCTS_URL);
        if (!response.ok) {
            throw new Error('Erro ao buscar produtos da API.');
        }
        products = await response.json();
        updateProductList();
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        const productList = document.getElementById('productList');
        productList.innerHTML = `<p class="text-center text-gray-500">Não foi possível carregar os produtos. Tente novamente mais tarde.</p>`;
    }
}

function displayProducts(page, filteredProducts = products) {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    if (filteredProducts.length === 0) {
        productList.innerHTML = `<p class="text-center text-gray-500">Nenhum produto encontrado com os filtros aplicados.</p>`;
        return;
    }

    filteredProducts.slice(startIndex, endIndex).forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        
        // Cria o link que envolve o conteúdo do produto
        const link = document.createElement('a');
        link.href = `/products-details?id=${product.id}`;
        link.innerHTML = `
            <img src="${product.images[0] || 'https://via.placeholder.com/100'}" alt="${product.name}">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
            </div>
        `;
        
        // Adiciona o link ao produto
        productDiv.appendChild(link);
        
        // Adiciona o botão "Adicionar ao Carrinho"
        const button = document.createElement('button');
        button.classList.add('add-to-cart');
        button.innerText = "Adicionar ao Carrinho";
        button.onclick = (event) => {
            event.stopPropagation(); // Impede que o clique no botão ative o link
            // TODO: Implementar lógica para adicionar ao carrinho aqui
            // A sua lógica atual está no index.js, precisa ser integrada aqui.
        };
        
        productDiv.appendChild(button);
        productList.appendChild(productDiv);
    });
}

function displayPagination(filteredProducts = products) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const pageCount = Math.ceil(filteredProducts.length / productsPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.innerText = i;
        button.onclick = () => {
            currentPage = i;
            displayProducts(currentPage, filteredProducts);
        };
        pagination.appendChild(button);
    }
}

function updatePriceDisplay() {
    const priceRange = document.getElementById('priceRange');
    const priceDisplay = document.getElementById('priceDisplay');
    priceDisplay.textContent = `R$ ${priceRange.value}`;
    selectedPrice = priceRange.value;
    updateProductList();
}

function updateProductList() {
    const filteredProducts = products.filter(product => {
        const price = product.price;
        const matchesPrice = price <= selectedPrice;
        // As lógicas de tipo e marca dependem de como você as armazena no banco de dados.
        // A lógica abaixo é baseada nos dados mockados originais.
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
        const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
        return matchesPrice && matchesType && matchesBrand;
    });
    
    displayProducts(1, filteredProducts);
    displayPagination(filteredProducts);
}

document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            if (this.value.startsWith("Tipo")) {
                selectedTypes.push(this.value);
            } else {
                selectedBrands.push(this.value);
            }
        } else {
            if (this.value.startsWith("Tipo")) {
                selectedTypes = selectedTypes.filter(type => type !== this.value);
            } else {
                selectedBrands = selectedBrands.filter(brand => brand !== this.value);
            }
        }
        updateProductList();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updatePriceDisplay(); // Inicializa o preço exibido
});
