// products.js
// Lógica específica para a página de listagem de produtos.

document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const productsPerPage = 12; // Define o máximo de produtos por página
    let selectedPrice = 0;
    let selectedTypes = [];
    let selectedBrands = [];
    let selectedColors = [];
    let selectedConnectivities = [];
    let allProducts = [];
    let allFilters = [];

    const API_PRODUCTS_URL = "/api/products";
    const API_FILTERS_URL = "/api/admin/filters";

    const priceRange = document.getElementById('priceRange');
    const priceDisplay = document.getElementById('priceDisplay');
    const enablePriceFilter = document.getElementById('enablePriceFilter');
    const productList = document.getElementById('productList');
    const pagination = document.getElementById('pagination');
    const typeFiltersContainer = document.getElementById('type-filters');
    const brandFiltersContainer = document.getElementById('brand-filters');
    const colorFiltersContainer = document.getElementById('color-filters');
    const connectivityFiltersContainer = document.getElementById('connectivity-filters');
    const filterSections = document.querySelectorAll('.filter-section');

    async function fetchData() {
        try {
            const [productsResponse, filtersResponse] = await Promise.all([
                fetch(API_PRODUCTS_URL),
                fetch(API_FILTERS_URL)
            ]);

            if (!productsResponse.ok) throw new Error('Erro ao buscar produtos.');
            if (!filtersResponse.ok) throw new Error('Erro ao buscar filtros.');

            allProducts = await productsResponse.json();
            allFilters = await filtersResponse.json();
            
            setupPriceFilter();
            renderFilters();
            updateProductList();
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            if (productList) {
                productList.innerHTML = `<p>Não foi possível carregar os produtos.</p>`;
            }
        }
    }

    function setupPriceFilter() {
        if (allProducts.length > 0) {
            const maxPrice = Math.ceil(Math.max(...allProducts.map(p => p.price)));
            priceRange.max = maxPrice;
            priceRange.value = maxPrice;
            selectedPrice = maxPrice;
            updatePriceDisplay();
        }
    }

    function renderFilters() {
        const containers = {
            type: typeFiltersContainer,
            brand: brandFiltersContainer,
            color: colorFiltersContainer,
            connectivity: connectivityFiltersContainer
        };

        Object.values(containers).forEach(c => c.innerHTML = '');

        const filtersByType = allFilters.reduce((acc, filter) => {
            if (!acc[filter.type]) acc[filter.type] = [];
            acc[filter.type].push(filter);
            return acc;
        }, {});

        for (const type in containers) {
            const section = document.getElementById(`${type}-filters-section`);
            const container = containers[type];
            const filters = filtersByType[type] || [];

            if (filters.length === 0) {
                if(section) section.style.display = 'none';
            } else {
                filters.forEach(filter => {
                    container.innerHTML += `<label><input type="checkbox" value="${filter.name}"> ${filter.name}</label>`;
                });
            }
        }
        
        document.querySelectorAll('.filters input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.id !== 'enablePriceFilter') {
                checkbox.addEventListener('change', updateProductList);
            }
        });
    }

    function displayProducts(page, filteredProducts) {
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        productList.innerHTML = '';

        if (filteredProducts.length === 0) {
            productList.innerHTML = `<p>Nenhum produto encontrado com os filtros aplicados.</p>`;
            return;
        }

        filteredProducts.slice(startIndex, endIndex).forEach(product => {
            const productArticle = document.createElement('article');
            productArticle.classList.add('product-card');
            productArticle.innerHTML = `
                <a href="/products-details/${product.id}">
                    <div class="product-image-wrapper">
                        <img src="${product.images[0] || 'https://placehold.co/400x400/111111/FFFFFF?text=Decibell'}" alt="${product.name}">
                    </div>
                    <h2 class="product-name">${product.name}</h2>
                    <p class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                    <span class="details-link">Saiba mais &rarr;</span>
                </a>
            `;
            productList.appendChild(productArticle);
        });
    }

    function displayPagination(filteredProducts) {
        pagination.innerHTML = '';
        const pageCount = Math.ceil(filteredProducts.length / productsPerPage);

        if (pageCount <= 1) return;

        for (let i = 1; i <= pageCount; i++) {
            const button = document.createElement('button');
            button.innerText = i;
            if (i === currentPage) button.classList.add('active');
            button.addEventListener('click', () => {
                currentPage = i;
                displayProducts(currentPage, filteredProducts);
                document.querySelectorAll('.pagination button').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pagination.appendChild(button);
        }
    }

    function updatePriceDisplay() {
        const value = priceRange.value;
        priceDisplay.textContent = `Até R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    }

    function updateProductList() {
        selectedTypes = Array.from(document.querySelectorAll('#type-filters input:checked')).map(cb => cb.value);
        selectedBrands = Array.from(document.querySelectorAll('#brand-filters input:checked')).map(cb => cb.value);
        selectedColors = Array.from(document.querySelectorAll('#color-filters input:checked')).map(cb => cb.value);
        selectedConnectivities = Array.from(document.querySelectorAll('#connectivity-filters input:checked')).map(cb => cb.value);
        selectedPrice = parseFloat(priceRange.value);
        const isPriceFilterActive = enablePriceFilter.checked;
        
        const filteredProducts = allProducts.filter(product => {
            const productFilterNames = product.filter_names || [];
            
            const matchesPrice = !isPriceFilterActive || product.price <= selectedPrice;
            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
            const matchesType = selectedTypes.length === 0 || selectedTypes.some(type => productFilterNames.includes(type));
            const matchesColor = selectedColors.length === 0 || selectedColors.some(color => productFilterNames.includes(color));
            const matchesConnectivity = selectedConnectivities.length === 0 || selectedConnectivities.some(conn => productFilterNames.includes(conn));

            return matchesPrice && matchesBrand && matchesType && matchesColor && matchesConnectivity;
        });
        
        currentPage = 1;
        displayProducts(currentPage, filteredProducts);
        displayPagination(filteredProducts);
    }

    enablePriceFilter.addEventListener('change', () => {
        priceRange.disabled = !enablePriceFilter.checked;
        updateProductList();
    });

    priceRange.addEventListener('input', updatePriceDisplay);
    priceRange.addEventListener('change', updateProductList);

    // Fecha outros <details> quando um é aberto
    filterSections.forEach(section => {
        section.addEventListener('toggle', (event) => {
            if (event.target.open) {
                filterSections.forEach(otherSection => {
                    if (otherSection !== event.target) {
                        otherSection.open = false;
                    }
                });
            }
        });
    });

    // Fecha o <details> aberto se clicar fora
    document.addEventListener('click', (e) => {
        const openSection = document.querySelector('.filter-section[open]');
        if (openSection && !openSection.contains(e.target)) {
            openSection.open = false;
        }
    });

    fetchData();
});
