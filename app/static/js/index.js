// index.js
// Este script lida com a lógica principal da página inicial.
// Ajustado para permitir que o formulário de login seja enviado ao back-end
// e para gerenciar o dropdown de perfil.

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
        if (body.classList.contains('tema-escuro')) {
            body.classList.remove('tema-escuro');
            localStorage.setItem('tema', 'claro');
        } else {
            body.classList.add('tema-escuro');
            localStorage.setItem('tema', 'escuro');
        }
    }
    
    carregarTema();

    const alternarTemaDropdown = document.getElementById('alternar-tema-dropdown');
    const alternarTemaMobile = document.getElementById('botao-alternar-tema-mobile');

    if (alternarTemaDropdown) {
        alternarTemaDropdown.addEventListener('click', alternarTema);
    }
    if (alternarTemaMobile) {
        alternarTemaMobile.addEventListener('click', alternarTema);
    }

    // --- Lógica do Menu Mobile ---
    const botaoMenuMobile = document.getElementById('botao-menu-mobile');
    const menuMobile = document.getElementById('menu-mobile');
    const fecharMenuMobile = document.querySelector('.fechar-menu-mobile');
    const overlay = document.getElementById('overlay');

    function abrirMenuMobile() {
        menuMobile.classList.add('ativo');
        overlay.style.display = 'block';
    }

    function fecharMenuMobileHandler() {
        menuMobile.classList.remove('ativo');
        overlay.style.display = 'none';
    }

    botaoMenuMobile.addEventListener('click', abrirMenuMobile);
    fecharMenuMobile.addEventListener('click', fecharMenuMobileHandler);
    overlay.addEventListener('click', fecharMenuMobileHandler);

    document.querySelectorAll('.link-nav-mobile').forEach(link => {
        link.addEventListener('click', fecharMenuMobileHandler);
    });

    // --- Lógica do Carrinho de Compras ---
    const btnCarrinho = document.getElementById('btn-carrinho');
    const carrinhoLateral = document.getElementById('carrinho-lateral');
    const fecharCarrinho = document.getElementById('fechar-carrinho');
    const listaCarrinho = document.getElementById('lista-carrinho');
    const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
    const contadorCarrinho = document.getElementById('contador-carrinho');
    
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    function atualizarContadorCarrinho() {
        const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
        contadorCarrinho.textContent = totalItens;
        if (totalItens > 0) {
            contadorCarrinho.classList.add('visivel');
        } else {
            contadorCarrinho.classList.remove('visivel');
        }
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
        exibirMensagem(`"${produto.name}" adicionado ao carrinho!`, 'success');
    }

    function removerDoCarrinho(produtoId) {
        carrinho = carrinho.filter(item => item.id !== parseInt(produtoId));
        renderizarCarrinho();
        exibirMensagem('Item removido do carrinho.', 'info');
    }

    function abrirCarrinho() {
        carrinhoLateral.classList.add('ativo');
        overlay.style.display = 'block';
    }

    function fecharCarrinhoHandler() {
        carrinhoLateral.classList.remove('ativo');
        overlay.style.display = 'none';
    }

    btnCarrinho.addEventListener('click', abrirCarrinho);
    fecharCarrinho.addEventListener('click', fecharCarrinhoHandler);
    overlay.addEventListener('click', fecharCarrinhoHandler);

    listaCarrinho.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remover-item')) {
            const produtoId = e.target.dataset.id;
            removerDoCarrinho(produtoId);
        }
    });

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
    const modalLogin = document.getElementById('modal-login');
    const fecharModalLogin = document.querySelector('.fechar-modal-login');

    if (btnPerfil) {
        btnPerfil.addEventListener('click', (e) => {
            // A lógica de autenticação é controlada pelo Jinja no HTML.
            // O JavaScript apenas lida com o comportamento do dropdown.
            e.preventDefault();
            const isLoggedIn = btnPerfil.tagName === 'BUTTON';
            
            if (isLoggedIn) {
                dropdownPerfil.classList.toggle('ativo');
            } else {
                // Se não estiver logado, redireciona para a página de login
                window.location.href = btnPerfil.href;
            }
        });
    }

    // Fecha o dropdown se o usuário clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.perfil-container') && dropdownPerfil.classList.contains('ativo')) {
            dropdownPerfil.classList.remove('ativo');
        }
    });

    // Adiciona evento para fechar o modal de login
    if (fecharModalLogin) {
        fecharModalLogin.addEventListener('click', () => {
            modalLogin.style.display = 'none';
        });
    }

    // Fecha o modal se o usuário clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modalLogin) {
            modalLogin.style.display = 'none';
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
    // FUNÇÕES PARA PRODUTOS EM DESTAQUE
    // ==============================================================================
    
    const destaqueContainer = document.querySelector('#produtos-destaque .grade-produtos');
    const API_FEATURED_URL = window.location.origin + "/api/produtos/destaques";

    function renderFeaturedProducts(produtos) {
        destaqueContainer.innerHTML = '';
        if (produtos.length === 0) {
            destaqueContainer.innerHTML = '<p class="text-center text-gray-500">Nenhum produto em destaque encontrado.</p>';
            return;
        }

        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.classList.add('cartao-produto');
            card.setAttribute('data-produto-id', produto.id);
            card.innerHTML = `
                <img src="${produto.images.length > 0 ? produto.images[0] : 'https://placehold.co/600x400/1a1a1a/FFFFFF?text=Sem+Imagem'}" alt="${produto.name}" class="imagem-produto">
                <div class="info-produto">
                    <h3 class="nome-produto">${produto.name}</h3>
                    <p class="descricao-produto">${produto.description || 'Sem descrição.'}</p>
                    <p class="preco-produto" data-preco="${produto.price}">R$ ${produto.price.toFixed(2).replace('.', ',')}</p>
                    <button class="botao-add-carrinho" aria-label="Adicionar ${produto.name} ao carrinho" data-produto-id="${produto.id}">
                        Adicionar ao Carrinho
                    </button>
                </div>
            `;
            destaqueContainer.appendChild(card);
            
            card.querySelector('.botao-add-carrinho').addEventListener('click', (e) => {
                const produtoParaCarrinho = {
                    id: produto.id,
                    nome: produto.name,
                    preco: produto.price,
                    imagem: produto.images.length > 0 ? produto.images[0] : 'https://placehold.co/100',
                };
                adicionarAoCarrinho(produtoParaCarrinho);
            });
            
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('botao-add-carrinho')) {
                    return;
                }
                
                produtoSelecionado = {
                    id: produto.id,
                    nome: produto.name,
                    descricao: produto.description,
                    preco: produto.price,
                    imagem: produto.images.length > 0 ? produto.images[0] : 'https://placehold.co/600x400/1a1a1a/FFFFFF?text=Sem+Imagem',
                };
    
                modalImagem.src = produtoSelecionado.imagem;
                modalNome.textContent = produtoSelecionado.nome;
                modalDescricao.textContent = produtoSelecionado.descricao;
                modalPreco.textContent = produtoSelecionado.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                modalProduto.style.display = 'block';
            });
        });
    }

    async function fetchFeaturedProducts() {
        try {
            const response = await fetch(API_FEATURED_URL);
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos em destaque da API.');
            }
            const produtos = await response.json();
            renderFeaturedProducts(produtos);
        } catch (error) {
            console.error("Erro ao carregar produtos em destaque:", error);
            destaqueContainer.innerHTML = '<p class="text-center text-gray-500">Não foi possível carregar os produtos em destaque.</p>';
        }
    }
    
    function exibirMensagem(message, type = 'info') {
        const modalMessage = document.getElementById('modal-message');
        modalMessage.textContent = message;
        modalMessage.className = `modal-message ${type}`;
        modalMessage.style.display = 'block';
        setTimeout(() => {
            modalMessage.style.display = 'none';
        }, 3000);
    }

    fetchFeaturedProducts();
});
