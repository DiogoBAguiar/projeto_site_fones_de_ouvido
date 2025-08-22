window.addEventListener('load', () => {

    //-----------------------------------------
    //  CONFIGURAÇÃO E PONTOS DE API
    //-----------------------------------------
    const API_URLS = {
        PRODUCTS: '/api/admin/products',
        FILTERS: '/api/admin/filters'
    };

    //-----------------------------------------
    //  SELETORES DE ELEMENTOS DO DOM
    //-----------------------------------------
    const tabLinks = document.querySelectorAll('.tab-link');
    const adminSections = document.querySelectorAll('.admin-section');
    const addProductBtn = document.getElementById('add-product-btn');
    const modal = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const productForm = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    const productsTableBody = document.getElementById('products-table-body');
    const filtersTableBody = document.getElementById('filters-table-body');
    const addFilterForm = document.getElementById('add-filter-form');
    const loader = document.getElementById('loader');
    
    // Campos do formulário de produto
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productBrandSelect = document.getElementById('product-brand');
    const productStatusSelect = document.getElementById('product-status');
    const productDescriptionInput = document.getElementById('product-description');
    const productFiltersContainer = document.getElementById('product-filters-checkboxes');
    
    // Upload de Imagens
    const dropZone = document.getElementById('drop-zone');
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview');
    
    let uploadedFiles = [];
    let allProducts = [];
    let allFilters = [];

    //-----------------------------------------
    //  FUNÇÕES DE API
    //-----------------------------------------
    async function apiRequest(url, options = {}) {
        showLoader(true);
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro: ${response.statusText}`);
            }
            if (response.status === 204) return {};
            return response.json();
        } catch (error) {
            console.error('Erro na API:', error);
            alert(`Erro: ${error.message}`);
            return null;
        } finally {
            showLoader(false);
        }
    }

    //-----------------------------------------
    //  LÓGICA DE RENDERIZAÇÃO
    //-----------------------------------------
    function renderProductsTable(products) {
        productsTableBody.innerHTML = '';
        if (products.length === 0) {
            productsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhum produto encontrado.</td></tr>`;
            return;
        }
        products.forEach(product => {
            const row = productsTableBody.insertRow();
            row.innerHTML = `
                <td><img src="${product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/100x100?text=Sem+Img'}" alt="${product.name}" class="product-image"></td>
                <td>${product.name}</td>
                <td>R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}</td>
                <td>${product.status}</td>
                <td class="action-btns">
                    <button class="action-btn edit-btn" data-id="${product.id}" title="Editar"><i data-lucide="edit"></i> Editar</button>
                    <button class="action-btn delete-product-btn" data-id="${product.id}" title="Excluir"><i data-lucide="trash-2"></i> Excluir</button>
                </td>
            `;
        });
        if (window.lucide) lucide.createIcons();
    }

    function renderFiltersTable(filters) {
        filtersTableBody.innerHTML = '';
        if (filters.length === 0) {
            filtersTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center;">Nenhum filtro encontrado.</td></tr>`;
            return;
        }
        filters.forEach(filter => {
            const row = filtersTableBody.insertRow();
            row.innerHTML = `
                <td>${filter.name}</td>
                <td>${filter.type}</td>
                <td class="action-btns">
                    <button class="action-btn delete-filter-btn" data-id="${filter.id}" title="Excluir"><i data-lucide="trash-2"></i> Excluir</button>
                </td>
            `;
        });
        if (window.lucide) lucide.createIcons();
    }

    //-----------------------------------------
    //  LÓGICA DE PRODUTOS (CRUD)
    //-----------------------------------------
    async function handleProductFormSubmit(e) {
        e.preventDefault();
        const id = productIdInput.value;
        const isEditing = !!id;

        const selectedFilters = Array.from(productFiltersContainer.querySelectorAll('input:checked')).map(cb => parseInt(cb.value));

        const productData = {
            name: productNameInput.value,
            price: parseFloat(productPriceInput.value),
            brand: productBrandSelect.value,
            status: productStatusSelect.value,
            description: productDescriptionInput.value,
            filters: selectedFilters
        };

        const formData = new FormData();
        formData.append('product_data', JSON.stringify(productData));
        uploadedFiles.forEach(fileData => {
            formData.append('images', fileData.file, fileData.file.name);
        });

        const url = isEditing ? `${API_URLS.PRODUCTS}/${id}` : API_URLS.PRODUCTS;
        const method = isEditing ? 'PUT' : 'POST';

        const result = await apiRequest(url, { method, body: formData });
        if (result) {
            closeModal();
            loadProducts();
        }
    }

    function handleEditProduct(id) {
        const product = allProducts.find(p => p.id == id);
        if (product) {
            openModal(product);
        }
    }

    function handleDeleteProduct(id) {
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            apiRequest(`${API_URLS.PRODUCTS}/${id}`, { method: 'DELETE' }).then(loadProducts);
        }
    }

    //-----------------------------------------
    //  LÓGICA DE FILTROS (CRUD)
    //-----------------------------------------
    async function handleFilterFormSubmit(e) {
        e.preventDefault();
        const filterData = {
            name: document.getElementById('filter-name').value,
            type: document.getElementById('filter-type').value,
        };
        const result = await apiRequest(API_URLS.FILTERS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filterData)
        });
        if (result) {
            addFilterForm.reset();
            loadFilters();
        }
    }

    function handleDeleteFilter(id) {
        if (confirm('Tem certeza que deseja excluir este filtro?')) {
            apiRequest(`${API_URLS.FILTERS}/${id}`, { method: 'DELETE' }).then(loadFilters);
        }
    }

    //-----------------------------------------
    //  LÓGICA DO MODAL E FORMULÁRIO
    //-----------------------------------------
    function openModal(product = null) {
        productForm.reset();
        productIdInput.value = '';
        imagePreviewContainer.innerHTML = '';
        uploadedFiles = [];
        populateFilterCheckboxes(allFilters); // Sempre popula os filtros

        if (product) {
            modalTitle.textContent = 'Editar Produto';
            productIdInput.value = product.id;
            productNameInput.value = product.name;
            productPriceInput.value = product.price;
            productBrandSelect.value = product.brand;
            productStatusSelect.value = product.status;
            productDescriptionInput.value = product.description;
            
            if (product.filters) {
                product.filters.forEach(filterId => {
                    const checkbox = productFiltersContainer.querySelector(`input[value="${filterId}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }

            if (product.images && product.images.length > 0) {
                 imagePreviewContainer.innerHTML = `<p class="text-secondary">Para alterar, adicione novas imagens. As atuais serão substituídas.</p>`;
            }
        } else {
            modalTitle.textContent = 'Adicionar Novo Produto';
        }
        modal.classList.add('show');
    }

    function closeModal() {
        modal.classList.remove('show');
    }

    //-----------------------------------------
    //  UPLOAD DE IMAGENS
    //-----------------------------------------
    function handleDragOver(e) { e.preventDefault(); dropZone.classList.add('drag-over'); }
    function handleDragLeave() { dropZone.classList.remove('drag-over'); }
    function handleDrop(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    }
    function handleFiles(files) {
        uploadedFiles = [];
        imagePreviewContainer.innerHTML = '';
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileData = { file, url: e.target.result };
                uploadedFiles.push(fileData);
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        }
    }
    function renderImagePreviews() {
        imagePreviewContainer.innerHTML = uploadedFiles.map((fileData, index) => `
            <div class="preview-item">
                <img src="${fileData.url}" alt="preview">
                <button type="button" class="remove-img-btn" data-index="${index}">&times;</button>
            </div>
        `).join('');
    }

    //-----------------------------------------
    //  INICIALIZAÇÃO E EVENTOS GERAIS
    //-----------------------------------------
    function showLoader(visible) {
        loader.style.display = visible ? 'flex' : 'none';
    }

    async function loadProducts() {
        const products = await apiRequest(API_URLS.PRODUCTS);
        if (products) {
            allProducts = products;
            renderProductsTable(products);
        }
    }

    async function loadFilters() {
        const filters = await apiRequest(API_URLS.FILTERS);
        if (filters) {
            allFilters = filters;
            renderFiltersTable(filters);
            populateBrandDropdown(filters);
            populateFilterCheckboxes(filters);
        }
    }
    
    function populateBrandDropdown(filters) {
        const brands = filters.filter(f => f.type === 'brand');
        productBrandSelect.innerHTML = brands.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
    }

    function populateFilterCheckboxes(filters) {
        const types = filters.filter(f => f.type === 'type');
        productFiltersContainer.innerHTML = types.map(f => `
            <label>
                <input type="checkbox" value="${f.id}">
                ${f.name}
            </label>
        `).join('');
    }

    function setupEventListeners() {
        tabLinks.forEach(tab => {
            tab.addEventListener('click', () => {
                tabLinks.forEach(t => t.classList.remove('active'));
                adminSections.forEach(s => s.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.view).classList.add('active');
            });
        });

        addProductBtn.addEventListener('click', () => openModal());
        closeModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        productForm.addEventListener('submit', handleProductFormSubmit);
        addFilterForm.addEventListener('submit', handleFilterFormSubmit);

        productsTableBody.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-product-btn');
            if (editBtn) handleEditProduct(editBtn.dataset.id);
            if (deleteBtn) handleDeleteProduct(deleteBtn.dataset.id);
        });

        filtersTableBody.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-filter-btn');
            if (deleteBtn) handleDeleteFilter(deleteBtn.dataset.id);
        });
        
        dropZone.addEventListener('click', () => imageUploadInput.click());
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
        imageUploadInput.addEventListener('change', (e) => handleFiles(e.target.files));
        
        imagePreviewContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-img-btn')) {
                const index = parseInt(e.target.dataset.index);
                uploadedFiles.splice(index, 1);
                renderImagePreviews();
            }
        });
    }

    function init() {
        if (window.lucide) {
            lucide.createIcons();
        }
        setupEventListeners();
        loadProducts();
        loadFilters();
    }

    init();
});
