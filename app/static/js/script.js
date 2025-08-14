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
    
    // Carregar o tema assim que a página for carregada
    carregarTema();

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

    // Fechar o menu mobile ao clicar em um link
    document.querySelectorAll('.link-nav-mobile').forEach(link => {
        link.addEventListener('click', fecharMenuMobileHandler);
    });

    // --- Lógica do Carrinho de Compras ---
    const btnCarrinho = document.getElementById('btn-carrinho');
    const carrinhoLateral = document.getElementById('carrinho-lateral');
    const fecharCarrinho = document.getElementById('fechar-carrinho');
    const listaCarrinho = document.getElementById('lista-carrinho');
    const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
    const botoesAddCarrinho = document.querySelectorAll('.botao-add-carrinho');
    
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

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
    }

    function adicionarAoCarrinho(produto) {
        const itemExistente = carrinho.find(item => item.id === produto.id);
        if (itemExistente) {
            itemExistente.quantidade++;
        } else {
            carrinho.push({ ...produto, quantidade: 1 });
        }
        renderizarCarrinho();
        abrirCarrinho();
    }

    function removerDoCarrinho(produtoId) {
        carrinho = carrinho.filter(item => item.id !== produtoId);
        renderizarCarrinho();
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

    botoesAddCarrinho.forEach(botao => {
        botao.addEventListener('click', () => {
            const produtoCard = botao.closest('.cartao-produto');
            const produto = {
                id: produtoCard.dataset.produtoId,
                nome: produtoCard.querySelector('.nome-produto').textContent,
                preco: parseFloat(produtoCard.querySelector('.preco-produto').dataset.preco),
                imagem: produtoCard.querySelector('.imagem-produto').src
            };
            adicionarAoCarrinho(produto);
        });
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

    // --- Lógica do Dropdown de Perfil (Login/Sair/Tema) ---
    const btnPerfil = document.getElementById('btn-perfil');
    const dropdownPerfil = document.getElementById('dropdown-perfil');
    
    function toggleDropdownPerfil() {
        dropdownPerfil.classList.toggle('ativo');
    }

    btnPerfil.addEventListener('click', toggleDropdownPerfil);

    document.addEventListener('click', (e) => {
        if (!btnPerfil.contains(e.target) && !dropdownPerfil.contains(e.target)) {
            dropdownPerfil.classList.remove('ativo');
        }
    });
    
    // Lógica para lidar com os botões de tema
    function configurarBotoesTema() {
        const alternarTemaDropdown = document.getElementById('alternar-tema-dropdown');
        const alternarTemaMobile = document.getElementById('botao-alternar-tema-mobile');

        if (alternarTemaDropdown) {
            alternarTemaDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                alternarTema();
            });
        }
        if (alternarTemaMobile) {
            alternarTemaMobile.addEventListener('click', alternarTema);
        }
    }

    // Lógica fictícia para status de login (pode ser substituída por uma API real)
    const usuarioLogado = false; // Mude para true para testar o modo logado
    if (usuarioLogado) {
        btnPerfil.innerHTML = '<i class="fas fa-user"></i>';
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.style.display = 'block';
            btnLogout.addEventListener('click', () => {
                alert('Você foi desconectado!');
                // Lógica de logout real aqui
            });
        }
    } else {
        btnPerfil.textContent = 'Login';
        const btnLogout = document.getElementById('btn-logout');
        if (btnLogout) {
            btnLogout.style.display = 'none';
        }
        
        // Re-atribui o evento de alternar tema para o menu dropdown, pois o HTML é recriado
        // A função de configurar botões de tema garante que o evento seja sempre adicionado
    }

    // Chama a função para configurar os botões de tema no início
    configurarBotoesTema();


    // --- Lógica do Modal de Produto ---
    const modalProduto = document.getElementById('modal-produto');
    const fecharModal = document.querySelector('.fechar-modal');
    const modalImagem = document.querySelector('.modal-imagem');
    const modalNome = document.querySelector('.modal-nome-produto');
    const modalDescricao = document.querySelector('.modal-descricao-produto');
    const modalPreco = document.querySelector('.modal-preco-produto');
    const botoesProduto = document.querySelectorAll('.cartao-produto');
    const botaoAddCarrinhoModal = document.querySelector('.botao-add-carrinho-modal');
    
    let produtoSelecionado = null;

    botoesProduto.forEach(card => {
        card.addEventListener('click', (e) => {
            // Evita que o modal abra se o botão "Adicionar ao Carrinho" for clicado
            if (e.target.classList.contains('botao-add-carrinho')) {
                return;
            }
            
            produtoSelecionado = {
                id: card.dataset.produtoId,
                nome: card.querySelector('.nome-produto').textContent,
                descricao: card.querySelector('.descricao-produto').textContent,
                preco: parseFloat(card.querySelector('.preco-produto').dataset.preco),
                imagem: card.querySelector('.imagem-produto').src
            };

            modalImagem.src = produtoSelecionado.imagem;
            modalNome.textContent = produtoSelecionado.nome;
            modalDescricao.textContent = produtoSelecionado.descricao;
            modalPreco.textContent = produtoSelecionado.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            modalProduto.style.display = 'block';
        });
    });

    fecharModal.addEventListener('click', () => {
        modalProduto.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target == modalProduto) {
            modalProduto.style.display = 'none';
        }
    });

    botaoAddCarrinhoModal.addEventListener('click', () => {
        if (produtoSelecionado) {
            adicionarAoCarrinho(produtoSelecionado);
            modalProduto.style.display = 'none';
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
    
    // Renderizar o carrinho inicial
    renderizarCarrinho();
});