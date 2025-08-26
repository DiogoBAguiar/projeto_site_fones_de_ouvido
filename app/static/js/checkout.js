// checkout.js
// Lógica para a página de finalização de compra.

document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DE ALTERNÂNCIA DE TEMA (Claro/Escuro) ---
    const body = document.body;
    const alternarTemaDropdown = document.getElementById('alternar-tema-dropdown');

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
    if (alternarTemaDropdown) {
        alternarTemaDropdown.addEventListener('click', alternarTema);
    }

    // --- LÓGICA DO MENU DROPDOWN DE PERFIL ---
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

    // --- FUNÇÃO GLOBAL DE MENSAGEM ---
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


    // --- LÓGICA ESPECÍFICA DO CHECKOUT ---
    const summaryItemsContainer = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('summary-subtotal');
    const finalTotalEl = document.getElementById('summary-final-total');
    const shippingEl = document.getElementById('summary-shipping');
    const discountRow = document.getElementById('discount-row');
    const discountEl = document.getElementById('summary-discount');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const successModal = document.getElementById('success-modal');
    const couponInput = document.getElementById('coupon-input');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const shippingOptions = document.querySelectorAll('input[name="shipping"]');
    const paymentTabs = document.querySelectorAll('.tab-link');
    const tabPanes = document.querySelectorAll('.tab-pane');

    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    let subtotal = 0;
    let shippingCost = 15.00;
    let discount = 0;

    function calculateTotals() {
        subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        const totalFinal = subtotal + shippingCost - discount;

        subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        shippingEl.textContent = `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
        
        if (discount > 0) {
            discountEl.textContent = `- R$ ${discount.toFixed(2).replace('.', ',')}`;
            discountRow.style.display = 'flex';
        } else {
            discountRow.style.display = 'none';
        }

        finalTotalEl.textContent = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;
    }

    function renderSummary() {
        summaryItemsContainer.innerHTML = '';
        if (carrinho.length === 0) {
            summaryItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            confirmOrderBtn.disabled = true;
        }

        carrinho.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('summary-item');
            itemDiv.innerHTML = `
                <div class="summary-item-info">
                    <img src="${item.imagem}" alt="${item.nome}">
                    <div>
                        <p class="summary-item-name">${item.nome}</p>
                        <p class="summary-item-qty">Qtd: ${item.quantidade}</p>
                    </div>
                </div>
                <p class="summary-item-price">R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</p>
            `;
            summaryItemsContainer.appendChild(itemDiv);
        });
        calculateTotals();
    }

    // Evento para aplicar cupom
    applyCouponBtn.addEventListener('click', () => {
        if (couponInput.value.toUpperCase() === 'DECI10') {
            discount = subtotal * 0.10; // 10% de desconto
            // NOTA: Foi alterado de `alert` para `exibirMensagem`
            if (window.exibirMensagem) {
                exibirMensagem('Cupom de 10% aplicado!', 'success');
            }
            calculateTotals();
        } else {
            // NOTA: Foi alterado de `alert` para `exibirMensagem`
            if (window.exibirMensagem) {
                exibirMensagem('Cupom inválido.', 'warning');
            }
        }
    });

    // Evento para mudar opção de frete
    shippingOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            shippingCost = parseFloat(e.target.value);
            calculateTotals();
        });
    });

    // Evento para abas de pagamento
    paymentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            paymentTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabPanes.forEach(pane => {
                pane.classList.toggle('active', pane.id === `${tab.dataset.tab}-pane`);
            });
        });
    });

    // Evento para confirmar pedido
    confirmOrderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const form = document.getElementById('checkout-form');
        if (!form.checkValidity()) {
            // NOTA: Foi alterado de `alert` para `exibirMensagem`
            if (window.exibirMensagem) {
                exibirMensagem('Por favor, preencha todos os campos obrigatórios.', 'danger');
            }
            return;
        }
        successModal.style.display = 'flex';
        setTimeout(() => {
            localStorage.removeItem('carrinho');
            window.location.href = '/';
        }, 3000);
    });

    renderSummary();
});
