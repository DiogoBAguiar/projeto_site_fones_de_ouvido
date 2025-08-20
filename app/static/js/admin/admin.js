// admin.js
// Este script lida com a lógica do painel de administração.
// Refatorado para buscar dados de forma dinâmica de todos os endpoints da API.

document.addEventListener('DOMContentLoaded', () => {

    // Endpoints da API para o dashboard e painel de administração
    const API_DASHBOARD_URL = window.location.origin + '/api/dashboard/';
    const API_PRODUCTS_URL = window.location.origin + '/api/admin/products';
    const API_USERS_URL = window.location.origin + '/api/admin/users';
    const API_BRANDS_URL = window.location.origin + '/api/admin/brands';
    const API_FILTERS_URL = window.location.origin + '/api/admin/filters';
    
    // Variável global para armazenar os filtros do back-end
    let allFilters = [];

    // Seletores de elementos do DOM
    const kpiCardsContainer = document.getElementById('kpi-cards');
    const recentSalesTbody = document.querySelector('#recent-sales tbody');
    const tabButtons = document.querySelectorAll('.tab-trigger');
    const productsTbody = document.getElementById('products-tbody');
    const brandsTbody = document.getElementById('brands-tbody');
    const usersTbody = document.getElementById('users-tbody');
    const addProductForm = document.getElementById('add-product-form');
    const manageFiltersForm = document.getElementById('manage-filters-form');
    const filterNameInput = document.getElementById('filter-name');
    const filterTypeSelect = document.getElementById('filter-type');
    const activeFiltersList = document.getElementById('active-filters-list');
    const modalMessage = document.getElementById('modal-message');
    const productImageInput = document.getElementById('product-image');
    const imagePreviewsContainer = document.getElementById('product-image-previews-container');
    
    // Novos seletores para o novo layout de filtros
    const filtersProductContainer = document.getElementById('filters-product-container');


    // Funções de renderização
    /**
     * Renderiza os cartões de KPI (Key Performance Indicators).
     * @param {Array<Object>} kpis - Um array de objetos de KPI.
     */
    function renderKPIs(kpis) {
        kpiCardsContainer.innerHTML = '';
        const iconMap = {
            'totalRevenue': 'fas fa-money-bill-wave',
            'subscriptions': 'fas fa-user-plus',
            'sales': 'fas fa-shopping-cart',
            'activeNow': 'fas fa-users'
        };

        kpis.forEach(kpi => {
            const iconClass = iconMap[kpi.metric] || 'fas fa-chart-bar';
            const colorClass = kpi.changeType === 'increase' ? 'green' : 'red';
            
            kpiCardsContainer.innerHTML += `
                <div class="kpi-card card ${colorClass}">
                    <div class="icon"><i class="${iconClass}"></i></div>
                    <p class="value">${kpi.value}</p>
                    <p class="label">${kpi.description}</p>
                </div>
            `;
        });
    }

    /**
     * Renderiza a tabela de vendas recentes.
     * @param {Array<Object>} sales - Um array de objetos de vendas.
     */
    function renderSalesTable(sales) {
        recentSalesTbody.innerHTML = '';
        sales.forEach(sale => {
            recentSalesTbody.innerHTML += `
                <tr>
                    <td>${sale.email}</td>
                    <td>${sale.amount}</td>
                </tr>
            `;
        });
    }
    
    /**
     * Renderiza a tabela de produtos.
     * @param {Array<Object>} products - Um array de objetos de produtos.
     */
    function renderProductsTable(products) {
        productsTbody.innerHTML = '';
        products.forEach(product => {
            productsTbody.innerHTML += `
                <tr>
                    <td><img src="${product.images[0] || 'https://placehold.co/80x80?text=Sem+Imagem'}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 0.5rem; border: 2px solid var(--borda-claro);"></td>
                    <td>${product.name}</td>
                    <td>R$ ${product.price.toFixed(2).replace('.', ',')}</td>
                    <td>${product.status}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn edit" data-item-id="${product.id}" data-item-name="${product.name}">Editar</button>
                            <button class="table-action-btn delete" data-item-id="${product.id}" data-item-name="${product.name}">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    /**
     * Renderiza a tabela de marcas.
     * @param {Array<Object>} brands - Um array de objetos de marcas.
     */
    function renderBrandsTable(brands) {
        brandsTbody.innerHTML = '';
        brands.forEach(brand => {
            brandsTbody.innerHTML += `
                <tr>
                    <td>${brand.name}</td>
                    <td>
                        <div class="table-actions">
                            <button class="table-action-btn edit" data-item-name="${brand.name}">Editar</button>
                            <button class="table-action-btn delete" data-item-name="${brand.name}">Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    /**
     * Renderiza a tabela de usuários.
     * @param {Array<Object>} users - Um array de objetos de usuários.
     */
    function renderUsersTable(users) {
        usersTbody.innerHTML = '';
        users.forEach(user => {
            usersTbody.innerHTML += `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.date_joined}</td>
                </tr>
            `;
        });
    }
    
    /**
     * Renderiza os filtros ativos no painel "Gerenciar Filtros".
     * @param {Array<Object>} filters - Um array de objetos de filtros.
     */
    function renderActiveFilters(filters) {
        activeFiltersList.innerHTML = '';
        filters.forEach(filter => {
            const filterTag = document.createElement('div');
            filterTag.classList.add('selected-filter-tag');
            filterTag.innerHTML = `
                <span>${filter.name}</span>
                <button class="remove-btn" data-filter-id="${filter.id}" data-filter-name="${filter.name}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            activeFiltersList.appendChild(filterTag);
        });
    }

    /**
     * Renderiza a lista de filtros no novo layout de filtros com checkboxes.
     */
    function renderProductFiltersCheckboxes() {
        filtersProductContainer.innerHTML = '';
        const filtersByType = allFilters.reduce((acc, filter) => {
            (acc[filter.type] = acc[filter.type] || []).push(filter);
            return acc;
        }, {});

        const order = ['brand', 'type', 'color', 'connectivity'];
        order.forEach(filterType => {
            if (filtersByType[filterType] && filtersByType[filterType].length > 0) {
                const filterGroup = document.createElement('div');
                filterGroup.classList.add('filter-selection-group');
                const title = document.createElement('label');
                title.classList.add('filter-selection-group-title');
                title.textContent = `${filterType.charAt(0).toUpperCase() + filterType.slice(1)}:`;
                filterGroup.appendChild(title);
                
                const checkboxContainer = document.createElement('div');
                checkboxContainer.classList.add('checkbox-container');
                filtersByType[filterType].forEach(filter => {
                    const checkboxWrapper = document.createElement('div');
                    checkboxWrapper.classList.add('checkbox-wrapper');
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `filter-${filter.id}`;
                    checkbox.name = filterType;
                    checkbox.value = filter.id;
                    
                    const label = document.createElement('label');
                    label.htmlFor = `filter-${filter.id}`;
                    label.textContent = filter.name;

                    checkboxWrapper.appendChild(checkbox);
                    checkboxWrapper.appendChild(label);
                    checkboxContainer.appendChild(checkboxWrapper);
                });
                filterGroup.appendChild(checkboxContainer);
                filtersProductContainer.appendChild(filterGroup);
            }
        });
        
        // Adiciona os event listeners aos checkboxes
        document.querySelectorAll('#product-filters-container input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filterId = parseInt(e.target.value);
                const filter = allFilters.find(f => f.id === filterId);

                if (filter) {
                    if (e.target.checked) {
                        // Lógica para garantir seleção única de 'brand'
                        if (filter.type === 'brand') {
                            // Desmarca outros checkboxes de 'brand'
                            document.querySelectorAll(`#product-filters-container input[name="brand"]:checked`).forEach(otherCheckbox => {
                                if (otherCheckbox.value !== e.target.value) {
                                    otherCheckbox.checked = false;
                                }
                            });
                            // Remove outras marcas da lista de selecionados
                            selectedFiltersForProduct = selectedFiltersForProduct.filter(f => f.type !== 'brand');
                        }
                        selectedFiltersForProduct.push(filter);
                    } else {
                        // Remove o filtro se for desmarcado
                        selectedFiltersForProduct = selectedFiltersForProduct.filter(f => f.id !== filter.id);
                    }
                }
            });
        });
    }

    // Lógica para carregar os dados das APIs
    async function fetchDashboardData(timeRange = '30d') {
        try {
            const response = await fetch(`${API_DASHBOARD_URL}?timeRange=${timeRange}`);
            if (!response.ok) {
                throw new Error('Erro ao buscar dados do dashboard.');
            }
            const data = await response.json();
            
            renderKPIs(data.kpis);
            renderSalesTable(data.recentSales);
        } catch (error) {
            exibirMensagem(`Não foi possível carregar os dados do dashboard: ${error.message}`, 'danger');
            console.error(error);
        }
    }

    async function fetchProductsAndUsersAndBrands() {
        try {
            const productsResponse = await fetch(API_PRODUCTS_URL);
            const productsData = await productsResponse.json();
            if (productsResponse.ok) {
                renderProductsTable(productsData);
            }
            
            const usersResponse = await fetch(API_USERS_URL);
            const usersData = await usersResponse.json();
            if (usersResponse.ok) {
                renderUsersTable(usersData);
            }

            const brandsResponse = await fetch(API_BRANDS_URL);
            const brandsData = await brandsResponse.json();
            if (brandsResponse.ok) {
                renderBrandsTable(brandsData);
            }
        } catch (error) {
            exibirMensagem(`Não foi possível carregar as tabelas: ${error.message}`, 'danger');
            console.error(error);
        }
    }

    async function fetchAndRenderFilters() {
        try {
            const response = await fetch(API_FILTERS_URL);
            if (!response.ok) {
                throw new Error('Erro ao buscar filtros.');
            }
            const filters = await response.json();
            allFilters = filters; // Armazena os filtros na variável global
            renderActiveFilters(filters);
            renderProductFiltersCheckboxes(); // Renderiza os filtros para o formulário de produto
        } catch (error) {
            exibirMensagem(`Não foi possível carregar os filtros: ${error.message}`, 'danger');
            console.error(error);
        }
    }
    
    // Funções de feedback e utilitárias
    function exibirMensagem(message, type = 'info') {
        if (!modalMessage) return;
        modalMessage.textContent = message;
        modalMessage.className = `modal-message ${type}`;
        modalMessage.style.display = 'block';
        setTimeout(() => {
            modalMessage.style.display = 'none';
        }, 3000);
    }
    
    // Adiciona o event listener para a exclusão de filtros
    activeFiltersList.addEventListener('click', async (e) => {
        const targetBtn = e.target.closest('.remove-btn');
        if (targetBtn) {
            const filterId = targetBtn.dataset.filterId;
            const filterName = targetBtn.dataset.filterName;
            if (confirm(`Tem certeza que deseja excluir o filtro "${filterName}"?`)) {
                try {
                    const response = await fetch(`${API_FILTERS_URL}/${filterId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (response.ok) {
                        exibirMensagem(result.message, 'success');
                        fetchAndRenderFilters(); // Recarrega os filtros
                        fetchProductsAndUsersAndBrands(); // Atualiza tabelas
                    } else {
                        exibirMensagem(result.error, 'danger');
                    }
                } catch (error) {
                    exibirMensagem('Erro de conexão ao tentar excluir o filtro.', 'danger');
                    console.error(error);
                }
            }
        }
    });

    // Lida com a submissão do formulário de adicionar filtro
    manageFiltersForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const filterData = {
            name: filterNameInput.value.trim(),
            type: filterTypeSelect.value
        };
        
        if (!filterData.name) {
            exibirMensagem('O nome do filtro não pode estar vazio.', 'danger');
            return;
        }

        try {
            const response = await fetch(API_FILTERS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filterData)
            });

            const result = await response.json();

            if (response.ok) {
                exibirMensagem(result.message, 'success');
                manageFiltersForm.reset();
                fetchAndRenderFilters(); // Recarrega os filtros
                fetchProductsAndUsersAndBrands(); // Atualiza a tabela de marcas
            } else {
                exibirMensagem(result.error, 'danger');
            }
        } catch (error) {
            exibirMensagem('Erro de conexão ao tentar adicionar o filtro.', 'danger');
            console.error(error);
        }
    });
    
    // Lida com a submissão do formulário de adicionar produto
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Extrai os filtros selecionados
        const selectedFilterIds = Array.from(document.querySelectorAll('#product-filters-container input[name="filters"]:checked')).map(checkbox => parseInt(checkbox.value));
        const selectedBrand = allFilters.find(f => selectedFilterIds.includes(f.id) && f.type === 'brand');

        const formData = new FormData();
        const productData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            description: document.getElementById('product-description').value,
            status: document.getElementById('product-status').value,
            brand: selectedBrand ? selectedBrand.name : null,
            filters: selectedFilterIds
        };
        
        if (!productData.brand) {
            exibirMensagem('Por favor, selecione uma marca para o produto.', 'danger');
            return;
        }

        formData.append('product_data', JSON.stringify(productData));
        
        const images = document.getElementById('product-image').files;
        for (let i = 0; i < images.length; i++) {
            formData.append('images', images[i]);
        }
        
        try {
            const response = await fetch(API_PRODUCTS_URL, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                exibirMensagem(result.message, 'success');
                addProductForm.reset();
                if (imagePreviewsContainer) {
                    imagePreviewsContainer.innerHTML = '';
                    imagePreviewsContainer.classList.add('hidden');
                }
                // Desmarca todos os checkboxes após o envio
                document.querySelectorAll('#product-filters-container input[name="filters"]').forEach(checkbox => {
                    checkbox.checked = false;
                });
                fetchProductsAndUsersAndBrands(); // Atualiza todas as tabelas
            } else {
                exibirMensagem(result.error, 'danger');
            }
        } catch (error) {
            exibirMensagem('Erro de conexão ao tentar adicionar o produto.', 'danger');
            console.error(error);
        }
    });
    
    // Lida com a exclusão de produtos
    productsTbody.addEventListener('click', async (e) => {
        const targetBtn = e.target;
        if (targetBtn.classList.contains('delete')) {
            const productId = targetBtn.dataset.itemId;
            const productName = targetBtn.dataset.itemName;
            if (confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
                try {
                    const response = await fetch(`${API_PRODUCTS_URL}/${productId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    if (response.ok) {
                        exibirMensagem(result.message, 'success');
                        fetchProductsAndUsersAndBrands();
                    } else {
                        exibirMensagem(result.error, 'danger');
                    }
                } catch (error) {
                    exibirMensagem('Erro de conexão ao tentar excluir o produto.', 'danger');
                    console.error(error);
                }
            }
        }
    });
    
    // Lidar com a pré-visualização de imagens
    if (productImageInput) {
        productImageInput.addEventListener('change', (e) => {
            imagePreviewsContainer.innerHTML = '';
            const files = e.target.files;
            if (files.length > 0) {
                imagePreviewsContainer.classList.remove('hidden');
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        imagePreviewsContainer.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                imagePreviewsContainer.classList.add('hidden');
            }
        });
    }

    // Inicialização do Dashboard
    function initDashboard() {
        fetchDashboardData();
        fetchProductsAndUsersAndBrands();
        fetchAndRenderFilters();
    }

    // Adiciona listeners para os botões de tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            fetchDashboardData(button.dataset.value);
        });
    });

    initDashboard();
});
