// checkout.js
// Lógica para a página de finalização de compra.

document.addEventListener('DOMContentLoaded', () => {

    // --- LÓGICA DO HEADER (MENU DE PERFIL E TEMA) ---
    // Adicionado aqui para garantir a funcionalidade na página de checkout.
    const body = document.body;
    const alternarTemaDropdown = document.getElementById('alternar-tema-dropdown');
    const btnPerfil = document.getElementById('btn-perfil');
    const dropdownPerfil = document.getElementById('dropdown-perfil');

    // Função para alternar o tema
    function alternarTema() {
        body.classList.toggle('tema-escuro');
        const novoTema = body.classList.contains('tema-escuro') ? 'escuro' : 'claro';
        localStorage.setItem('tema', novoTema);
    }

    if (alternarTemaDropdown) {
        alternarTemaDropdown.addEventListener('click', alternarTema);
    }

    // Lógica para o menu dropdown do perfil
    if (btnPerfil && dropdownPerfil) {
        btnPerfil.addEventListener('click', (e) => {
            // Previne o comportamento padrão apenas se for um botão (usuário logado)
            if (btnPerfil.tagName === 'BUTTON') {
                e.preventDefault();
                dropdownPerfil.classList.toggle('ativo');
            }
        });
    }

    // Fecha o dropdown se o usuário clicar fora
    document.addEventListener('click', (e) => {
        if (dropdownPerfil && !e.target.closest('.perfil-container')) {
            dropdownPerfil.classList.remove('ativo');
        }
    });


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
            alert('Cupom de 10% aplicado!');
            calculateTotals();
        } else {
            alert('Cupom inválido.');
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
            alert('Por favor, preencha todos os campos obrigatórios.');
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
