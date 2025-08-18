const products = [
    { id: 1, name: "Produto 1", price: "R$ 100", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/S%C5%82uchawki_referencyjne_K-701_firmy_AKG.jpg/250px-S%C5%82uchawki_referencyjne_K-701_firmy_AKG.jpg", type: "Tipo 1", brand: "Marca 1" },
    { id: 2, name: "Produto 2", price: "R$ 200", img: "https://via.placeholder.com/100", type: "Tipo 2", brand: "Marca 2" },
    { id: 3, name: "Produto 3", price: "R$ 300", img: "https://via.placeholder.com/100", type: "Tipo 3", brand: "Marca 3" },
    { id: 4, name: "Produto 4", price: "R$ 400", img: "https://via.placeholder.com/100", type: "Tipo 4", brand: "Marca 4" },
    { id: 5, name: "Produto 5", price: "R$ 500", img: "https://via.placeholder.com/100", type: "Tipo 1", brand: "Marca 5" },
    { id: 6, name: "Produto 6", price: "R$ 600", img: "https://via.placeholder.com/100", type: "Tipo 2", brand: "Marca 6" },
    { id: 7, name: "Produto 7", price: "R$ 700", img: "https://via.placeholder.com/100", type: "Tipo 3", brand: "Marca 7" },
    { id: 8, name: "Produto 8", price: "R$ 800", img: "https://via.placeholder.com/100", type: "Tipo 4", brand: "Marca 8" },
    { id: 9, name: "Produto 9", price: "R$ 900", img: "https://via.placeholder.com/100", type: "Tipo 1", brand: "Marca 1" },
    { id: 10, name: "Produto 10", price: "R$ 1000", img: "https://via.placeholder.com/100", type: "Tipo 2", brand: "Marca 2" },
    { id: 11, name: "Produto 11", price: "R$ 1100", img: "https://via.placeholder.com/100", type: "Tipo 3", brand: "Marca 3" },
    { id: 12, name: "Produto 12", price: "R$ 1200", img: "https://via.placeholder.com/100", type: "Tipo 4", brand: "Marca 4" },
    { id: 13, name: "Produto 13", price: "R$ 1300", img: "https://via.placeholder.com/100", type: "Tipo 1", brand: "Marca 5" },
    { id: 14, name: "Produto 14", price: "R$ 1400", img: "https://via.placeholder.com/100", type: "Tipo 2", brand: "Marca 6" },
    { id: 15, name: "Produto 15", price: "R$ 1500", img: "https://via.placeholder.com/100", type: "Tipo 3", brand: "Marca 7" },
    { id: 16, name: "Produto 16", price: "R$ 1600", img: "https://via.placeholder.com/100", type: "Tipo 4", brand: "Marca 8" },
    // Adicione mais produtos conforme necessário
];

let currentPage = 1;
const productsPerPage = 12;
let selectedPrice = 10000; // Preço máximo padrão
let selectedTypes = [];
let selectedBrands = [];

function displayProducts(page, filteredProducts = products) {
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    filteredProducts.slice(startIndex, endIndex).forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        
        // Cria o link que envolve o conteúdo do produto
        const link = document.createElement('a');
        link.href = `/products-details?id=${product.id}`; // Altere para o link desejado
        link.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">${product.price}</div>
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
            // Adicione a lógica para adicionar ao carrinho aqui
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
        const price = parseFloat(product.price.replace('R$ ', '').replace('.', '').replace(',', '.'));
        const matchesPrice = price <= selectedPrice;
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

displayProducts(currentPage);
displayPagination();
updatePriceDisplay(); // Inicializa o preço exibido