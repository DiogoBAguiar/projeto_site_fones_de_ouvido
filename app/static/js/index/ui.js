// js/index/ui.js
import { getCart, removeFromCart } from './cart.js';

// Função principal que inicializa todos os componentes da UI
export function initUI() {
    // --- Lógica de Alternância de Tema ---
    const body = document.body;
    const alternarTemaDropdown = document.getElementById('alternar-tema-dropdown');
    const alternarTemaMobile = document.getElementById('botao-alternar-tema-mobile');

    function carregarTema() {
        const temaSalvo = localStorage.getItem('tema') || 'claro';
        body.classList.toggle('tema-escuro', temaSalvo === 'escuro');
    }

    function alternarTema() {
        body.classList.toggle('tema-escuro');
        localStorage.setItem('tema', body.classList.contains('tema-escuro') ? 'escuro' : 'claro');
    }

    if (alternarTemaDropdown) alternarTemaDropdown.addEventListener('click', alternarTema);
    if (alternarTemaMobile) alternarTemaMobile.addEventListener('click', alternarTema);
    carregarTema();

    // --- Lógica do Menu Mobile e Overlay ---
    const botaoMenuMobile = document.getElementById('botao-menu-mobile');
    const menuMobile = document.getElementById('menu-mobile');
    const fecharMenuMobile = document.querySelector('.fechar-menu-mobile');
    const overlay = document.getElementById('overlay');

    function toggleMenu(action) {
        const open = action === 'open';
        body.classList.toggle('menu-aberto', open);
        menuMobile.classList.toggle('ativo', open);
        overlay.classList.toggle('ativo', open);
        body.classList.toggle('no-scroll', open);
    }

    botaoMenuMobile.addEventListener('click', () => toggleMenu('open'));
    fecharMenuMobile.addEventListener('click', () => toggleMenu('close'));

    // --- Lógica da UI do Carrinho ---
    const btnCarrinho = document.getElementById('btn-carrinho');
    const carrinhoLateral = document.getElementById('carrinho-lateral');
    const fecharCarrinho = document.getElementById('fechar-carrinho');
    
    function abrirCarrinho() {
        renderCartUI(); // Atualiza a UI antes de abrir
        carrinhoLateral.classList.add('ativo');
        overlay.classList.add('ativo');
        body.classList.add('no-scroll');
    }

    function fecharCarrinhoHandler() {
        carrinhoLateral.classList.remove('ativo');
        overlay.classList.remove('ativo');
        body.classList.remove('no-scroll');
    }

    if(btnCarrinho) btnCarrinho.addEventListener('click', abrirCarrinho);
    if(fecharCarrinho) fecharCarrinho.addEventListener('click', fecharCarrinhoHandler);
    
    // --- LÓGICA DO DROPDOWN DE PERFIL (RESTAURADA) ---
    const btnPerfil = document.getElementById('btn-perfil');
    const dropdownPerfil = document.getElementById('dropdown-perfil');

    if (btnPerfil) {
        btnPerfil.addEventListener('click', (e) => {
            e.preventDefault();
            // A lógica original para diferenciar botão de link
            if (btnPerfil.tagName === 'BUTTON') {
                dropdownPerfil.classList.toggle('ativo');
            } else {
                window.location.href = btnPerfil.href;
            }
        });
    }

    // --- Lógica Unificada para Fechar Elementos ---
    document.addEventListener('click', (e) => {
        const target = e.target;
        // Fecha o menu mobile
        if (menuMobile.classList.contains('ativo') && !menuMobile.contains(target) && !botaoMenuMobile.contains(target)) {
             toggleMenu('close');
        }
        // Fecha o carrinho
        if (carrinhoLateral.classList.contains('ativo') && !carrinhoLateral.contains(target) && !btnCarrinho.contains(target)) {
            fecharCarrinhoHandler();
        }
        // Fecha o dropdown de perfil (lógica restaurada)
        if (dropdownPerfil && dropdownPerfil.classList.contains('ativo') && !target.closest('.perfil-container')) {
            dropdownPerfil.classList.remove('ativo');
        }
    });

    const secoes = document.querySelectorAll('.secao');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
            }
        });
    }, { threshold: 0.1 });
    secoes.forEach(secao => observer.observe(secao));
}

// Função para renderizar o carrinho na tela
export function renderCartUI() {
    const carrinho = getCart();
    const listaCarrinho = document.getElementById('lista-carrinho');
    const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
    const contadorCarrinho = document.getElementById('contador-carrinho');

    if (!listaCarrinho) return;
    listaCarrinho.innerHTML = '';
    let total = 0;
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);

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

    if(carrinhoTotalValor) carrinhoTotalValor.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    contadorCarrinho.textContent = totalItens;
    contadorCarrinho.classList.toggle('visivel', totalItens > 0);

    // Adiciona o event listener para os botões de remover
    listaCarrinho.querySelectorAll('.btn-remover-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const produtoId = e.target.dataset.id;
            removeFromCart(produtoId);
            renderCartUI(); // Re-renderiza a UI do carrinho
            exibirMensagem('Item removido do carrinho.', 'info');
        });
    });
}

// Função para exibir mensagens
export function exibirMensagem(message, type = 'info') {
    const modalMessage = document.getElementById('modal-message');
    if (!modalMessage) return;
    modalMessage.textContent = message;
    modalMessage.className = `modal-message ${type}`;
    modalMessage.style.display = 'block';
    setTimeout(() => {
        modalMessage.style.display = 'none';
    }, 3000);
}
