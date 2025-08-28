document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica de Alternância de Tema (Claro/Escuro) ---
    const body = document.body;

    function carregarTema() {
        const temaSalvo = localStorage.getItem('tema') || 'claro';
        if (temaSalvo === 'escuro') {
            body.classList.add('tema-escuro');
        } else {
            body.classList.remove('tema-escuro');
        }
    }

    function alternarTema() {
        body.classList.toggle('tema-escuro');
        localStorage.setItem('tema', body.classList.contains('tema-escuro') ? 'escuro' : 'claro');
    }
    
    carregarTema();

    const alternarTemaDropdown = document.getElementById('alternar-tema-dropdown');
    const alternarTemaMobile = document.getElementById('botao-alternar-tema-mobile');

    if (alternarTemaDropdown) alternarTemaDropdown.addEventListener('click', alternarTema);
    if (alternarTemaMobile) alternarTemaMobile.addEventListener('click', alternarTema);

    // --- LÓGICA DO MENU MOBILE ---
    const botaoMenuMobile = document.getElementById('botao-menu-mobile');
    const menuMobile = document.getElementById('menu-mobile');
    const fecharMenuMobile = document.querySelector('.fechar-menu-mobile');
    const overlay = document.getElementById('overlay');
    const linksMenuMobile = document.querySelectorAll('.link-nav-mobile');

    function toggleMenu(action) {
        const open = action === 'open';
        menuMobile.classList.toggle('ativo', open);
        overlay.classList.toggle('ativo', open);
        body.classList.toggle('no-scroll', open);
    }

    botaoMenuMobile.addEventListener('click', () => toggleMenu('open'));
    fecharMenuMobile.addEventListener('click', () => toggleMenu('close'));
    linksMenuMobile.forEach(link => {
        link.addEventListener('click', () => toggleMenu('close'));
    });


    // --- Lógica do Carrinho de Compras ---
    const btnCarrinho = document.getElementById('btn-carrinho');
    const carrinhoLateral = document.getElementById('carrinho-lateral');
    const fecharCarrinho = document.getElementById('fechar-carrinho');
    const listaCarrinho = document.getElementById('lista-carrinho');
    const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
    const contadorCarrinho = document.getElementById('contador-carrinho');
    const btnCheckout = document.getElementById('btn-checkout');
    
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    function atualizarContadorCarrinho() {
        const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
        contadorCarrinho.textContent = totalItens;
        contadorCarrinho.classList.toggle('visivel', totalItens > 0);
    }

    function renderizarCarrinho() {
        listaCarrinho.innerHTML = '';
        let total = 0;

        if (carrinho.length === 0) {
            listaCarrinho.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>';
        } else {
            carrinho.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('item-carrinho');
                li.innerHTML = `
                    <div class="info-item">
                        <img src="${item.imagem}" alt="${item.nome}">
                        <div>
                            <h4>${item.nome}</h4>
                            <p>Quantidade: ${item.quantidade}</p>
                            <p>${item.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                    <button class="btn-remover-item" data-id="${item.id}">&times;</button>
                `;
                listaCarrinho.appendChild(li);
                total += item.preco * item.quantidade;
            });
        }

        carrinhoTotalValor.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarContadorCarrinho();
    }

    function adicionarAoCarrinho(produto) {
        const itemExistente = carrinho.find(item => item.id === produto.id);
        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        renderizarCarrinho();
        exibirMensagem(`"${produto.nome}" adicionado ao carrinho!`, 'success');
    }

    function removerDoCarrinho(produtoId) {
        carrinho = carrinho.filter(item => item.id !== parseInt(produtoId));
        renderizarCarrinho();
        exibirMensagem('Item removido do carrinho.', 'info');
    }

    function abrirCarrinho() {
        carrinhoLateral.classList.add('ativo');
        overlay.classList.add('ativo');
        body.classList.add('no-scroll');
    }

    function fecharCarrinhoHandler() {
        carrinhoLateral.classList.remove('ativo');
        overlay.classList.remove('ativo');
        body.classList.remove('no-scroll');
    }

    btnCarrinho.addEventListener('click', abrirCarrinho);
    fecharCarrinho.addEventListener('click', fecharCarrinhoHandler);
    
    // --- LÓGICA UNIFICADA DO OVERLAY ---
    overlay.addEventListener('click', () => {
        if (menuMobile.classList.contains('ativo')) {
            toggleMenu('close');
        }
        if (carrinhoLateral.classList.contains('ativo')) {
            fecharCarrinhoHandler();
        }
    });

    listaCarrinho.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remover-item')) {
            const produtoId = e.target.dataset.id;
            removerDoCarrinho(produtoId);
        }
    });

    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            window.location.href = '/checkout';
        });
    }

    // --- Lógica do Menu de Busca ---
    const btnLupa = document.querySelector('.btn-lupa');
    const barraBuscaInput = document.querySelector('.barra-busca-input');

    btnLupa.addEventListener('click', () => {
        barraBuscaInput.classList.toggle('ativo');
        if (barraBuscaInput.classList.contains('ativo')) {
            barraBuscaInput.focus();
        }
    });
    
    // --- Lógica do Dropdown de Perfil ---
    const btnPerfil = document.getElementById('btn-perfil');
    const dropdownPerfil = document.getElementById('dropdown-perfil');
    
    if (btnPerfil) {
        btnPerfil.addEventListener('click', (e) => {
            e.preventDefault();
            if (btnPerfil.tagName === 'BUTTON') {
                dropdownPerfil.classList.toggle('ativo');
            } else {
                window.location.href = btnPerfil.href;
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (dropdownPerfil && !e.target.closest('.perfil-container') && dropdownPerfil.classList.contains('ativo')) {
            dropdownPerfil.classList.remove('ativo');
        }
    });

    // --- Animação de Scroll-Reveal ---
    const secoes = document.querySelectorAll('.secao');
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    secoes.forEach(secao => {
        observer.observe(secao);
    });
    
    renderizarCarrinho();
    
    // ==============================================================================
    // SLIDER DE PRODUTOS EM DESTAQUE
    // ==============================================================================
    
    const destaqueContainer = document.querySelector('.produtos-destaque-container');
    if (destaqueContainer) {
        const gradeProdutos = destaqueContainer.querySelector('.grade-produtos');
        const prevBtn = destaqueContainer.querySelector('.slider-btn.prev');
        const nextBtn = destaqueContainer.querySelector('.slider-btn.next');
        const API_FEATURED_URL = window.location.origin + "/api/products/featured";
        let allFeaturedProducts = []; // Armazena os produtos buscados

        function setupSlider() {
            if (!gradeProdutos.querySelector('.cartao-produto')) return;
            const scrollWidth = gradeProdutos.scrollWidth;
            const clientWidth = gradeProdutos.clientWidth;

            if (scrollWidth > clientWidth) {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            } else {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            }
        }

        prevBtn.addEventListener('click', () => {
            const cardWidth = gradeProdutos.querySelector('.cartao-produto').offsetWidth;
            gradeProdutos.scrollLeft -= (cardWidth + 32); // 32px é o gap
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = gradeProdutos.querySelector('.cartao-produto').offsetWidth;
            gradeProdutos.scrollLeft += (cardWidth + 32); // 32px é o gap
        });

        function renderFeaturedProducts(produtos) {
            gradeProdutos.innerHTML = '';
            if (produtos.length === 0) {
                gradeProdutos.innerHTML = '<p class="text-center text-gray-500">Nenhum produto em destaque encontrado.</p>';
                return;
            }

            produtos.forEach(produto => {
                const card = document.createElement('div');
                card.classList.add('cartao-produto');
                card.innerHTML = `
                    <a href="/products-details/${produto.id}">
                        <img src="${produto.images.length > 0 ? produto.images[0] : 'https://placehold.co/300'}" alt="${produto.name}" class="imagem-produto">
                    </a>
                    <div class="info-produto">
                        <a href="/products-details/${produto.id}">
                            <h3 class="nome-produto">${produto.name}</h3>
                            <p class="descricao-produto">${produto.description || ''}</p>
                            <p class="preco-produto">R$ ${produto.price.toFixed(2).replace('.', ',')}</p>
                        </a>
                        <button class="botao-add-carrinho" data-product-id="${produto.id}">Adicionar ao Carrinho</button>
                    </div>
                `;
                gradeProdutos.appendChild(card);
            });

            setupSlider();
        }

        // --- LÓGICA PARA ADICIONAR AO CARRINHO DOS PRODUTOS EM DESTAQUE ---
        gradeProdutos.addEventListener('click', (e) => {
            if (e.target.classList.contains('botao-add-carrinho')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                const productData = allFeaturedProducts.find(p => p.id == productId);
                if (productData) {
                    const productToAdd = {
                        id: productData.id,
                        nome: productData.name,
                        preco: productData.price,
                        imagem: productData.images.length > 0 ? productData.images[0] : 'https://placehold.co/300'
                    };
                    adicionarAoCarrinho(productToAdd);
                }
            }
        });

        async function fetchFeaturedProducts() {
            try {
                const response = await fetch(API_FEATURED_URL);
                if (!response.ok) {
                    throw new Error('Erro ao buscar produtos em destaque da API.');
                }
                allFeaturedProducts = await response.json(); // Armazena os dados
                renderFeaturedProducts(allFeaturedProducts);
            } catch (error) {
                console.error("Erro ao carregar produtos em destaque:", error);
                gradeProdutos.innerHTML = '<p class="text-center text-gray-500">Não foi possível carregar os produtos em destaque.</p>';
            }
        }
        
        function exibirMensagem(message, type = 'info') {
            const modalMessage = document.getElementById('modal-message');
            if (!modalMessage) return;
            modalMessage.textContent = message;
            modalMessage.className = `modal-message ${type}`;
            modalMessage.style.display = 'block';
            setTimeout(() => {
                modalMessage.style.display = 'none';
            }, 3000);
        }

        fetchFeaturedProducts();
        window.addEventListener('resize', setupSlider);
    }
    function toggleMenu(action) {
    const open = action === 'open';
    body.classList.toggle('menu-aberto', open); // Esta linha ativa a animação do CSS
    menuMobile.classList.toggle('ativo', open);
    overlay.classList.toggle('ativo', open);
    body.classList.toggle('no-scroll', open);
}
    // ==============================================================================
    // SLIDER PARA TIPOS DE FONES
    // ==============================================================================
    const tiposFonesContainer = document.querySelector('.tipos-fones-container');
    if (tiposFonesContainer) {
        const gradeTiposFones = tiposFonesContainer.querySelector('.grade-tipos-fones');
        const prevBtnTipos = tiposFonesContainer.querySelector('.slider-btn-tipos.prev');
        const nextBtnTipos = tiposFonesContainer.querySelector('.slider-btn-tipos.next');

        prevBtnTipos.addEventListener('click', () => {
            const cardWidth = gradeTiposFones.querySelector('.cartao-tipo').offsetWidth;
            gradeTiposFones.scrollBy({ left: -(cardWidth + 16), behavior: 'smooth' }); // 16px é o gap
        });

        nextBtnTipos.addEventListener('click', () => {
            const cardWidth = gradeTiposFones.querySelector('.cartao-tipo').offsetWidth;
            gradeTiposFones.scrollBy({ left: cardWidth + 16, behavior: 'smooth' }); // 16px é o gap
        });
    }
});
