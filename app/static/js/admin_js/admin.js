// Este código foi corrigido para se comunicar com a nova API do Flask para o Dashboard.

// ==============================================================================
// FUNÇÕES DE MANIPULAÇÃO DE DADOS
// ==============================================================================

/**
 * Simula um atraso de rede. É útil para imitar a latência de uma chamada real para uma API
 * e para testar como a UI se comporta durante o carregamento.
 * @param {number} ms - O tempo em milissegundos para esperar.
 * @returns {Promise<void>} Uma Promise que resolve após o tempo especificado.
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Endpoints da nova API do Dashboard
const API_DASHBOARD_URL = window.location.origin + "/api/dashboard";
const API_PRODUCTS_URL = window.location.origin + "/api/produtos";

// Objeto que armazena os ícones em formato SVG puro.
const icons = {
    DollarSign: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    Users: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    CreditCard: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></rect></svg>`,
    Activity: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
};

// Variável para armazenar os dados de produtos.
let products = [];

// ==============================================================================
// FUNÇÕES DE RENDERIZAÇÃO
// ==============================================================================

/**
 * Renderiza os cartões de KPI (Indicadores de Desempenho) com os dados fornecidos.
 * @param {object} data - O objeto com os dados dos KPIs.
 */
const renderKpiCards = (data) => {
    const kpiContainer = document.getElementById('kpi-cards');
    kpiContainer.innerHTML = `
        <div class="card kpi-card">
            <div class="header">
                <h3>Receita Total</h3>
                <div class="h-4 w-4 text-gray-500">${icons.DollarSign}</div>
            </div>
            <div class="value">${data.totalRevenue.value}</div>
            <p class="${data.totalRevenue.changeType === 'increase' ? 'change-increase' : 'change-decrease'}">
                ${data.totalRevenue.change} <span class="text-gray-500 ml-1">${data.totalRevenue.description}</span>
            </p>
        </div>
        <div class="card kpi-card">
            <div class="header">
                <h3>Inscrições</h3>
                <div class="h-4 w-4 text-gray-500">${icons.Users}</div>
            </div>
            <div class="value">${data.subscriptions.value}</div>
            <p class="${data.subscriptions.changeType === 'increase' ? 'change-increase' : 'change-decrease'}">
                ${data.subscriptions.change} <span class="text-gray-500 ml-1">${data.subscriptions.description}</span>
            </p>
        </div>
        <div class="card kpi-card">
            <div class="header">
                <h3>Vendas</h3>
                <div class="h-4 w-4 text-gray-500">${icons.CreditCard}</div>
            </div>
            <div class="value">${data.sales.value}</div>
            <p class="${data.sales.changeType === 'increase' ? 'change-increase' : 'change-decrease'}">
                ${data.sales.change} <span class="text-gray-500 ml-1">${data.sales.description}</span>
            </p>
        </div>
        <div class="card kpi-card">
            <div class="header">
                <h3>Ativos Agora</h3>
                <div class="h-4 w-4 text-gray-500">${icons.Activity}</div>
            </div>
            <div class="value">${data.activeNow.value}</div>
            <p class="${data.activeNow.changeType === 'increase' ? 'change-increase' : 'change-decrease'}">
                ${data.activeNow.change} <span class="text-gray-500 ml-1">${data.activeNow.description}</span>
            </p>
        </div>
    `;
};

/**
 * Renderiza o gráfico de barras de analytics.
 * @param {Array<object>} data - O array de objetos com os dados do gráfico.
 */
const renderAnalyticsChart = (data) => {
    const chartContainer = document.getElementById('analytics-chart');
    if (!data || data.length === 0) {
        chartContainer.innerHTML = `<h3 class="text-lg font-semibold">Analytics</h3><p class="text-center text-gray-500 mt-4">Nenhum dado de analytics disponível.</p>`;
        return;
    }
    const maxTotal = Math.max(...data.map(item => item.total));
    chartContainer.innerHTML = `
        <h3 class="text-lg font-semibold">Analytics</h3>
        <div class="analytics-chart-wrapper">
            ${data.map(item => `
                <div class="analytics-chart-bar" style="height: ${Math.max(1, (item.total / maxTotal) * 100)}%;">
                    <span class="label">${item.name}</span>
                </div>
            `).join('')}
        </div>
    `;
};

/**
 * Renderiza a lista de vendas recentes.
 * @param {Array<object>} sales - O array de objetos com as vendas.
 */
const renderRecentSales = (sales) => {
    const salesContainer = document.getElementById('recent-sales');
    salesContainer.innerHTML = `
        <h3 class="text-lg font-semibold">Vendas Recentes</h3>
        <p class="description">
            Você fez ${sales.length} vendas este mês.
        </p>
        <div class="sales-list">
            ${sales.map(sale => `
                <div class="sale-item">
                    <div class="icon">${icons.CreditCard}</div>
                    <div class="info">
                        <p>Novo cliente</p>
                        <p>${sale.email}</p>
                    </div>
                    <div class="amount">${sale.amount}</div>
                </div>
            `).join('')}
        </div>
    `;
};

/**
 * Renderiza a tabela de produtos.
 */
const renderProductTable = () => {
    const tableContainer = document.getElementById('products-table');
    tableContainer.innerHTML = `
        <h3>Tabela de Produtos</h3>
        <table>
            <thead>
                <tr>
                    <th>Imagens</th>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Marca</th>
                    <th>Preço</th>
                    <th>Status</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => `
                    <tr>
                        <td>
                            <div class="product-thumbnail-container">
                                ${product.images.map(image => `<img src="${image}" alt="${product.name}" class="product-thumbnail">`).join('')}
                            </div>
                        </td>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>R$ ${product.price}</td>
                        <td>${product.status}</td>
                        <td class="table-actions">
                            <button onclick="removeProduct('${product.id}')">Remover</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
};

/**
 * Renderiza a tabela de marcas mockadas.
 */
const renderBrandTable = () => {
    const tableContainer = document.getElementById('brands-table');
    tableContainer.innerHTML = `
        <h3 class="text-lg font-semibold mb-4">Marcas</h3>
        <table>
            <thead>
                <tr>
                    <th>Marca</th>
                    <th>Produtos</th>
                    <th>Receita</th>
                </tr>
            </thead>
            <tbody>
                <!-- Conteúdo mockado removido -->
            </tbody>
        </table>
    `;
};

/**
 * Renderiza a tabela de usuários mockados.
 */
const renderUserTable = () => {
    const tableContainer = document.getElementById('users-table');
    tableContainer.innerHTML = `
        <h3 class="text-lg font-semibold mb-4">Usuários</h3>
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Compras</th>
                </tr>
            </thead>
            <tbody>
                <!-- Conteúdo mockado removido -->
            </tbody>
        </table>
    `;
};


// ==============================================================================
// FUNÇÕES DE INTERAÇÃO COM O BACKEND FLASK
// ==============================================================================

/**
 * Busca a lista de produtos da API e renderiza a tabela.
 */
const fetchAndRenderProducts = async () => {
    try {
        const response = await fetch(API_PRODUCTS_URL);
        if (!response.ok) throw new Error("Erro ao buscar produtos.");
        products = await response.json();
        renderProductTable();
    } catch (error) {
        console.error("Erro:", error);
    }
};

/**
 * Adiciona um novo produto ao backend.
 */
const addProduct = async (productData, images) => {
    try {
        const formData = new FormData();
        formData.append("product_data", JSON.stringify(productData));
        for (const image of images) {
            formData.append("images", image);
        }

        const response = await fetch(API_PRODUCTS_URL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao adicionar produto: ${errorText}`);
        }
        
        await fetchAndRenderProducts();
        console.log("Produto adicionado com sucesso!");
    } catch (error) {
        console.error("Erro:", error);
        console.log("Ocorreu um erro ao adicionar o produto.");
    }
};

/**
 * Função global para remover um produto.
 */
window.removeProduct = async (productId) => {
    try {
        const response = await fetch(`${API_PRODUCTS_URL}/${productId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro ao remover produto: ${errorText}`);
        }
        await fetchAndRenderProducts();
        console.log("Produto removido com sucesso!");
    } catch (error) {
        console.error("Erro:", error);
        console.log("Ocorreu um erro ao remover o produto.");
    }
};

/**
 * Função principal para carregar os dados do painel de controle.
 */
const loadDashboard = async (timeRange) => {
    document.getElementById('kpi-cards').innerHTML = '<div class="card kpi-card skeleton"></div><div class="card kpi-card skeleton"></div><div class="card kpi-card skeleton"></div><div class="card kpi-card skeleton"></div>';
    document.getElementById('analytics-chart').innerHTML = '<div class="card analytics-chart-card skeleton"></div>';
    document.getElementById('recent-sales').innerHTML = '<div class="card recent-sales-card skeleton"></div>';
    
    try {
        const response = await fetch(`${API_DASHBOARD_URL}?timeRange=${timeRange}`);
        if (!response.ok) throw new Error("Erro ao buscar dados do dashboard.");
        const data = await response.json();
        
        renderKpiCards(data);
        renderAnalyticsChart(data.analytics);
        renderRecentSales(data.recentSales);

    } catch (error) {
        console.error("Erro ao carregar o dashboard:", error);
    }
};

/**
 * Configura todos os "ouvintes de eventos" (event listeners) da página.
 */
const setupEventListeners = () => {
    document.querySelectorAll('.tab-trigger').forEach(button => {
        button.addEventListener('click', () => {
            const activeTab = document.querySelector('.tab-trigger.active');
            if (activeTab) {
                activeTab.classList.remove('active');
            }
            button.classList.add('active');
            const timeRange = button.getAttribute('data-value');
            loadDashboard(timeRange);
        });
    });

    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const imagesInput = document.getElementById('product-image');
        const images = Array.from(imagesInput.files);
        
        const newProduct = {
            name: document.getElementById('product-name').value,
            brand: document.getElementById('product-brand').value,
            price: parseFloat(document.getElementById('product-price').value),
            description: document.getElementById('product-description').value,
            status: document.getElementById('product-status').value,
        };

        await addProduct(newProduct, images);
        
        e.target.reset();
        document.getElementById('product-image-previews-container').innerHTML = '';
        document.getElementById('product-image-previews-container').classList.add('hidden');
    });
    
    document.getElementById('product-image').addEventListener('change', (event) => {
        const files = event.target.files;
        const previewsContainer = document.getElementById('product-image-previews-container');
        previewsContainer.innerHTML = '';
        previewsContainer.classList.add('hidden');
        
        if (files.length > 0) {
            previewsContainer.classList.remove('hidden');
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = "Pré-visualização da imagem";
                    img.classList.add('product-image-preview');
                    previewsContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        }
    });
};

/**
 * Função de inicialização da aplicação.
 */
const initialize = async () => {
    const initialTimeRange = document.querySelector('.tab-trigger.active').getAttribute('data-value');
    await loadDashboard(initialTimeRange);
    fetchAndRenderProducts();
    renderBrandTable();
    renderUserTable();
    setupEventListeners();
};

window.onload = initialize;
