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
     * Renderiza os filtros ativos.
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

    async function fetchProductsAndUsers() {
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
            renderActiveFilters(filters);
        } catch (error) {
            exibirMensagem(`Não foi possível carregar os filtros: ${error.message}`, 'danger');
            console.error(error);
        }
    }

    // Lida com a submissão do formulário de adicionar produto
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const productData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            description: document.getElementById('product-description').value,
            status: document.getElementById('product-status').value,
            brand: 'Decibell' // Exemplo: Em um projeto real, isso viria de um input
        };
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
                fetchProductsAndUsers();
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
                        fetchProductsAndUsers();
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
                fetchAndRenderFilters(); // Atualiza a lista de filtros
            } else {
                exibirMensagem(result.error, 'danger');
            }
        } catch (error) {
            exibirMensagem('Erro de conexão ao tentar adicionar o filtro.', 'danger');
            console.error(error);
        }
    });

    // Lida com a exclusão de filtros
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
                        fetchAndRenderFilters();
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

    // Inicialização do Dashboard
    function initDashboard() {
        fetchDashboardData();
        fetchProductsAndUsers();
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
