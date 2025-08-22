// admin.js
// Este script lida com a lógica do painel de administração.
// Refatorado para buscar dados de forma dinâmica de todos os endpoints da API.
// Inclui agora a pré-visualização de imagens com reordenação e exclusão, além de atualizar a tabela de produtos após o envio.

document.addEventListener('DOMContentLoaded', () => {

    // Endpoints da API para o dashboard e painel de administração
    const API_DASHBOARD_URL = window.location.origin + '/api/dashboard/';
    const API_PRODUCTS_URL = window.location.origin + '/api/admin/products';
    const API_USERS_URL = window.location.origin + '/api/admin/users';
    const API_BRANDS_URL = window.location.origin + '/api/admin/brands';
    const API_FILTERS_URL = window.location.origin + '/api/admin/filters';
    const API_VISITS_URL = window.location.origin + '/api/admin/visits'; // Endpoint de visitas ajustado
    
    // Variável global para armazenar os filtros do back-end
    let allFilters = [];
    // Novo array global para armazenar os arquivos de imagem para o upload
    let uploadedFiles = [];

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
    
    // Novos seletores para o novo layout de filtros e upload
    const filtersProductContainer = document.getElementById('filters-product-container');
    const imageUploadLabel = document.getElementById('image-upload-label');

    // Funções de renderização
    /**
     * Renderiza os cartões de KPI (Key Performance Indicators).
     * @param {Array<Object>} kpis - Um array de objetos de KPI.
     * @param {number} totalVisits - A contagem total de visitantes.
     */
    function renderKPIs(kpis, totalVisits) {
        kpiCardsContainer.innerHTML = '';
        const iconMap = {
            'totalRevenue': 'fas fa-money-bill-wave',
            'subscriptions': 'fas fa-user-plus',
            'sales': 'fas fa-shopping-cart',
            'activeNow': 'fas fa-users',
            'visitors': 'fas fa-eye'
        };

        // Adiciona o card de visitantes
        const visitsCard = {
            metric: 'visitors',
            value: totalVisits,
            description: 'Visitantes',
            changeType: 'increase' // Assumimos que o número de visitantes sempre aumenta
        };
        kpis.push(visitsCard);

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
     * Os filtros são lidos da variável global `allFilters`.
     */
    function renderProductFiltersCheckboxes() {
        filtersProductContainer.innerHTML = '';
        const filtersByType = allFilters.reduce((acc, filter) => {
            (acc[filter.type] = acc[filter.type] || []).push(filter);
            return acc;
        }, {});

        // Ordem desejada dos grupos de filtro
        const order = ['brand', 'connectivity', 'type', 'color'];
        
        order.forEach(filterType => {
            const filtersOfType = filtersByType[filterType];
            if (filtersOfType && filtersOfType.length > 0) {
                const filterGroup = document.createElement('div');
                filterGroup.classList.add('filter-column');
                filterGroup.innerHTML = `
                    <div class="filter-header" data-toggle-id="${filterType}-content">
                        <h3>${filterType.charAt(0).toUpperCase() + filterType.slice(1)}</h3>
                        <span class="chevron">&#9660;</span>
                    </div>
                    <div id="${filterType}-content" class="dropdown-menu">
                        <div class="options-list">
                            ${filtersOfType.map(filter => `
                                <div class="option-item">
                                    <input type="checkbox" id="filter-${filter.id}" name="filters" value="${filter.id}">
                                    <label for="filter-${filter.id}">
                                        ${filter.type === 'color' ? `<div class="color-box" style="background-color: ${filter.name.toLowerCase()};"></div>` : ''}
                                        <span>${filter.name}</span>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                filtersProductContainer.appendChild(filterGroup);
            }
        });
        
        // Adiciona listeners para os dropdowns
        document.querySelectorAll('.filter-header').forEach(header => {
            header.addEventListener('click', toggleDropdown);
        });
    }

    /**
     * Lida com a funcionalidade de dropdown dos filtros.
     * @param {Event} e - O evento de clique.
     */
    function toggleDropdown(e) {
        const header = e.currentTarget;
        const dropdown = document.getElementById(header.dataset.toggleId);
        const chevron = header.querySelector('.chevron');
        
        const isCurrentlyOpen = dropdown.classList.contains('open');

        // Fecha todos os outros dropdowns
        document.querySelectorAll('.dropdown-menu.open').forEach(menu => {
            menu.classList.remove('open');
            menu.previousElementSibling.querySelector('.chevron').classList.remove('rotate');
        });

        // Abre ou fecha o dropdown clicado
        if (!isCurrentlyOpen) {
            dropdown.classList.add('open');
            chevron.classList.add('rotate');
        }
    }
    
    // ==============================================================================
    // LÓGICA DE UPLOAD E PRÉ-VISUALIZAÇÃO DE IMAGENS
    // ==============================================================================

    /**
     * Lida com os arquivos arrastados ou selecionados pelo input.
     * Adiciona-os à lista de arquivos a serem enviados, respeitando o limite de 15.
     * @param {FileList} files - A lista de arquivos do evento.
     */
    function handleFiles(files) {
        // Concatena a nova lista de arquivos com a lista existente
        for (const file of files) {
            if (uploadedFiles.length < 15) {
                uploadedFiles.push(file);
            } else {
                exibirMensagem('Limite de 15 imagens atingido. As imagens restantes não serão adicionadas.', 'danger');
                break;
            }
        }
        // Atualiza a pré-visualização das imagens
        renderImagePreviews();
    }

    /**
     * Renderiza as pré-visualizações de imagens a partir da lista 'uploadedFiles'.
     */
    function renderImagePreviews() {
        imagePreviewsContainer.innerHTML = '';
        if (uploadedFiles.length > 0) {
            imagePreviewsContainer.classList.remove('hidden');
            uploadedFiles.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const previewWrapper = document.createElement('div');
                    previewWrapper.classList.add('preview-item');
                    previewWrapper.draggable = true;
                    previewWrapper.dataset.index = index;

                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = `Pré-visualização da imagem ${index + 1}`;

                    const removeBtn = document.createElement('button');
                    removeBtn.classList.add('remove-image-btn');
                    removeBtn.innerHTML = `<i class="fas fa-times"></i>`;
                    removeBtn.dataset.index = index; // Armazena o índice para fácil remoção
                    
                    const imageNumber = document.createElement('span');
                    imageNumber.classList.add('image-number');
                    imageNumber.textContent = `${index + 1}º`;

                    previewWrapper.appendChild(img);
                    previewWrapper.appendChild(removeBtn);
                    previewWrapper.appendChild(imageNumber);
                    imagePreviewsContainer.appendChild(previewWrapper);
                };
                reader.readAsDataURL(file);
            });
        } else {
            imagePreviewsContainer.classList.add('hidden');
        }
    }
    
    let dragSrcEl = null;
    function handleDragStart(e) {
        this.style.opacity = '0.4';
        dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
    function handleDragEnter(e) {
        this.classList.add('drag-over-item');
    }
    function handleDragLeave(e) {
        this.classList.remove('drag-over-item');
    }
    function handleDrop(e) {
        e.stopPropagation();
        if (dragSrcEl !== this) {
            const dragIndex = parseInt(dragSrcEl.dataset.index, 10);
            const dropIndex = parseInt(this.dataset.index, 10);
            
            // Reordena o array de arquivos
            const tempFile = uploadedFiles[dragIndex];
            uploadedFiles.splice(dragIndex, 1);
            uploadedFiles.splice(dropIndex, 0, tempFile);

            renderImagePreviews(); // Renderiza a nova ordem
        }
        this.classList.remove('drag-over-item');
        return false;
    }
    function handleDragEnd(e) {
        this.style.opacity = '1';
        document.querySelectorAll('.preview-item').forEach(item => {
            item.classList.remove('drag-over-item');
        });
    }

    if (imageUploadLabel) {
        ['dragover', 'dragleave'].forEach(event => {
            imageUploadLabel.addEventListener(event, e => e.preventDefault(), false);
        });
        imageUploadLabel.addEventListener('dragover', () => {
            imageUploadLabel.classList.add('drag-over');
        });
        imageUploadLabel.addEventListener('dragleave', () => {
            imageUploadLabel.classList.remove('drag-over');
        });
        imageUploadLabel.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadLabel.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            handleFiles(files);
        });
        productImageInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
            e.target.value = '';
        });
        imagePreviewsContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-image-btn');
            if (removeBtn) {
                const indexToRemove = parseInt(removeBtn.dataset.index, 10);
                uploadedFiles.splice(indexToRemove, 1);
                renderImagePreviews();
            }
        });

        // Adiciona listeners de drag and drop para os itens de pré-visualização
        imagePreviewsContainer.addEventListener('dragstart', (e) => {
            if (e.target.closest('.preview-item')) {
                handleDragStart.call(e.target.closest('.preview-item'), e);
            }
        });
        imagePreviewsContainer.addEventListener('dragover', (e) => {
            const dropTarget = e.target.closest('.preview-item');
            if (dropTarget) {
                handleDragOver.call(dropTarget, e);
            }
        });
        imagePreviewsContainer.addEventListener('dragenter', (e) => {
            const dropTarget = e.target.closest('.preview-item');
            if (dropTarget) {
                handleDragEnter.call(dropTarget, e);
            }
        });
        imagePreviewsContainer.addEventListener('dragleave', (e) => {
            const dropTarget = e.target.closest('.preview-item');
            if (dropTarget) {
                handleDragLeave.call(dropTarget, e);
            }
        });
        imagePreviewsContainer.addEventListener('drop', (e) => {
            const dropTarget = e.target.closest('.preview-item');
            if (dropTarget) {
                handleDrop.call(dropTarget, e);
            }
        });
        imagePreviewsContainer.addEventListener('dragend', (e) => {
            const dragTarget = e.target.closest('.preview-item');
            if (dragTarget) {
                handleDragEnd.call(dragTarget, e);
            }
        });
    }

    // ==============================================================================
    // LÓGICA DE SUBMISSÃO E CARGA DE DADOS (Restante do Código)
    // ==============================================================================

    // Lógica para carregar os dados das APIs
    async function fetchDashboardData(timeRange = '30d') {
        try {
            // Requisições assíncronas em paralelo para melhor performance
            const [dashboardResponse, visitsResponse] = await Promise.all([
                fetch(`${API_DASHBOARD_URL}?timeRange=${timeRange}`),
                fetch(`${API_VISITS_URL}?timeRange=${timeRange}`)
            ]);

            const dashboardData = dashboardResponse.ok ? await dashboardResponse.json() : { kpis: [], recentSales: [] };
            const visitsData = visitsResponse.ok ? await visitsResponse.json() : { totalVisits: 0, dailyVisits: [] };
            
            renderKPIs(dashboardData.kpis, visitsData.totalVisits);
            renderSalesTable(dashboardData.recentSales);
            renderVisitsChart(visitsData.dailyVisits);
        } catch (error) {
            exibirMensagem(`Não foi possível carregar os dados do dashboard: ${error.message}`, 'danger');
            console.error(error);
        }
    }
    
    function renderVisitsChart(dailyVisits) {
        // Lógica de renderização do gráfico de visitas com Recharts
        const chartContainer = document.getElementById('chart-container');
        if (!chartContainer || !window.Recharts || !window.Recharts.LineChart) {
            console.error("Recharts não está disponível ou o contêiner do gráfico não foi encontrado.");
            return;
        }

        const data = dailyVisits.map(item => ({
            name: item.date,
            Visitas: item.count
        }));

        const {
            LineChart,
            Line,
            XAxis,
            YAxis,
            CartesianGrid,
            Tooltip,
            Legend,
            ResponsiveContainer
        } = window.Recharts;
        
        const chartElement = React.createElement(
            ResponsiveContainer, {
                width: '100%',
                height: '100%'
            },
            React.createElement(
                LineChart, {
                    data: data,
                    margin: {
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5
                    }
                },
                React.createElement(CartesianGrid, {
                    strokeDasharray: '3 3'
                }),
                React.createElement(XAxis, {
                    dataKey: 'name'
                }),
                React.createElement(YAxis, null),
                React.createElement(Tooltip, null),
                React.createElement(Legend, null),
                React.createElement(Line, {
                    type: 'monotone',
                    dataKey: 'Visitas',
                    stroke: '#82ca9d',
                    activeDot: {
                        r: 8
                    }
                })
            )
        );

        ReactDOM.render(chartElement, chartContainer);
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
            if (window.confirm(`Tem certeza que deseja excluir o filtro "${filterName}"?`)) {
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
    // SUBSTITUA A FUNÇÃO addProductForm.addEventListener EXISTENTE POR ESTA:

    addProductForm.addEventListener('submit', async (e) => {
     e.preventDefault(); // Impede o envio padrão do formulário que recarrega a página

     // 1. Cria um objeto FormData, que é o formato correto para enviar arquivos e dados juntos.
     const formData = new FormData();
    
     // 2. Coleta os dados de texto do formulário
     const selectedFilterIds = Array.from(document.querySelectorAll('#filters-product-container input[name="filters"]:checked')).map(checkbox => parseInt(checkbox.value));
    const selectedBrand = allFilters.find(f => selectedFilterIds.includes(f.id) && f.type === 'brand');

     // 3. Valida se a marca e as imagens foram selecionadas (feedback rápido para o usuário)
     if (!selectedBrand) {
        exibirMensagem('Por favor, selecione uma marca para o produto.', 'danger');
        return;
     }
     if (uploadedFiles.length === 0) {
        exibirMensagem('Por favor, adicione pelo menos uma imagem.', 'danger');
        return;
     }

     // 4. Agrupa todos os dados de texto em um único objeto.
     const productData = {
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        description: document.getElementById('product-description').value,
        status: document.getElementById('product-status').value,
        brand: selectedBrand.name,
        filters: selectedFilterIds
     };
    
     // 5. Adiciona o objeto de texto ao FormData, mas como uma STRING no formato JSON.
     // O backend irá ler esta string e decodificá-la.
     formData.append('product_data', JSON.stringify(productData));
    
     // 6. Adiciona cada arquivo de imagem que o usuário selecionou ao FormData.
     uploadedFiles.forEach(file => {
        formData.append('images', file); // A chave 'images' deve ser a mesma no backend
     });
    
     // 7. Envia o FormData para a API usando fetch.
     try {
        const response = await fetch(API_PRODUCTS_URL, {
            method: 'POST',
            body: formData // Note que não definimos 'Content-Type', o navegador faz isso por nós.
        });
        
        const result = await response.json();
        
        if (response.ok) {
            exibirMensagem(result.message, 'success');
            addProductForm.reset(); // Limpa os campos do formulário
            uploadedFiles = []; // Limpa o array de arquivos
            if(imagePreviewsContainer) imagePreviewsContainer.innerHTML = ''; // Limpa a pré-visualização de imagens
            fetchProductsAndUsersAndBrands(); // Atualiza a tabela de produtos na página
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
            if (window.confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)) {
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

    // Lida com o botão "Limpar Filtros"
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            document.querySelectorAll('#filters-product-container input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
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
