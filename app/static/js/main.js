// main.js
// Contém a lógica JavaScript compartilhada por várias páginas.

document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica de Alternância de Tema (Claro/Escuro) ---
    const body = document.body;
    const alternarTemaDropdown = document.getElementById('alternar-tema-dropdown');
    const alternarTemaMobile = document.getElementById('botao-alternar-tema-mobile');

    function carregarTema() {
        const temaSalvo = localStorage.getItem('tema') || 'claro';
        body.classList.toggle('tema-escuro', temaSalvo === 'escuro');
    }

    function alternarTema() {
        body.classList.toggle('tema-escuro');
        const novoTema = body.classList.contains('tema-escuro') ? 'escuro' : 'claro';
        localStorage.setItem('tema', novoTema);
    }

    carregarTema();
    if (alternarTemaDropdown) alternarTemaDropdown.addEventListener('click', alternarTema);
    if (alternarTemaMobile) alternarTemaMobile.addEventListener('click', alternarTema);

    // --- Lógica do Menu Mobile ---
    const botaoMenuMobile = document.getElementById('botao-menu-mobile');
    const menuMobile = document.getElementById('menu-mobile');
    const fecharMenuMobileBtn = document.querySelector('.fechar-menu-mobile');
    const overlay = document.getElementById('overlay');

    function toggleMenuMobile(action) {
        const isActive = action === 'open';
        menuMobile.classList.toggle('ativo', isActive);
        overlay.style.display = isActive ? 'block' : 'none';
    }

    if (botaoMenuMobile) botaoMenuMobile.addEventListener('click', () => toggleMenuMobile('open'));
    if (fecharMenuMobileBtn) fecharMenuMobileBtn.addEventListener('click', () => toggleMenuMobile('close'));
    if (overlay) overlay.addEventListener('click', () => toggleMenuMobile('close'));

    // --- Lógica do Carrinho de Compras ---
    const btnCarrinho = document.getElementById('btn-carrinho');
    const carrinhoLateral = document.getElementById('carrinho-lateral');
    const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
    const listaCarrinho = document.getElementById('lista-carrinho');
    const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
    const contadorCarrinho = document.getElementById('contador-carrinho');
    
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

    function salvarCarrinho() {
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
    }

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
                            <p>Qtd: ${item.quantidade}</p>
                            <p>${(item.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </div>
                    </div>
                    <button class="btn-remover-item" data-id="${item.id}">&times;</button>
                `;
                listaCarrinho.appendChild(li);
                total += item.preco * item.quantidade;
            });
        }

        carrinhoTotalValor.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        atualizarContadorCarrinho();
    }

    window.adicionarAoCarrinho = function(produto, quantidade = 1) {
        const itemExistente = carrinho.find(item => item.id === produto.id);
        if (itemExistente) {
            itemExistente.quantidade += quantidade;
        } else {
            carrinho.push({ ...produto, quantidade });
        }
        salvarCarrinho();
        renderizarCarrinho();
        exibirMensagem(`"${produto.nome}" adicionado ao carrinho!`, 'success');
    }

    function removerDoCarrinho(produtoId) {
        carrinho = carrinho.filter(item => item.id !== parseInt(produtoId));
        salvarCarrinho();
        renderizarCarrinho();
        exibirMensagem('Item removido do carrinho.', 'info');
    }
    
    if (listaCarrinho) {
        listaCarrinho.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remover-item')) {
                removerDoCarrinho(e.target.dataset.id);
            }
        });
    }

    function toggleCarrinho(action) {
        const isActive = action === 'open';
        carrinhoLateral.classList.toggle('ativo', isActive);
        overlay.style.display = isActive ? 'block' : 'none';
    }

    if (btnCarrinho) btnCarrinho.addEventListener('click', () => toggleCarrinho('open'));
    if (fecharCarrinhoBtn) fecharCarrinhoBtn.addEventListener('click', () => toggleCarrinho('close'));
    if (overlay) overlay.addEventListener('click', () => {
        if (carrinhoLateral.classList.contains('ativo')) toggleCarrinho('close');
    });

    renderizarCarrinho();

    // --- Lógica do Dropdown de Perfil ---
    const btnPerfil = document.getElementById('btn-perfil');
    const dropdownPerfil = document.getElementById('dropdown-perfil');

    if (btnPerfil && dropdownPerfil) {
        btnPerfil.addEventListener('click', (e) => {
            if (btnPerfil.tagName === 'BUTTON') {
                e.preventDefault();
                dropdownPerfil.classList.toggle('ativo');
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (dropdownPerfil && !e.target.closest('.perfil-container')) {
            dropdownPerfil.classList.remove('ativo');
        }
    });

    // --- Lógica do Menu de Busca ---
    const btnLupa = document.querySelector('.btn-lupa');
    const barraBuscaInput = document.querySelector('.barra-busca-input');

    if (btnLupa && barraBuscaInput) {
        btnLupa.addEventListener('click', () => {
            barraBuscaInput.classList.toggle('ativo');
            if (barraBuscaInput.classList.contains('ativo')) {
                barraBuscaInput.focus();
            }
        });
    }
    
    // --- Função Global de Mensagem ---
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
});
