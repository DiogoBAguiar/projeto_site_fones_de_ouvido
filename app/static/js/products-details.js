// products-details.js
// Lógica específica para a página de detalhes do produto.

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica da Galeria de Imagens ---
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail-image');

    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            mainImage.src = thumbnail.src;
            thumbnails.forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        });
    });

    // --- Lógica das Abas de Informação ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.dataset.tab;

            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tabPanes.forEach(pane => {
                pane.classList.toggle('active', pane.id === `${tabId}-content`);
            });
        });
    });

    // --- Lógica para Adicionar ao Carrinho ---
    const btnAddToCart = document.querySelector('.btn-add-to-cart');
    const quantityInput = document.getElementById('quantity-input');
    const productName = document.getElementById('product-name').textContent;
    const productPrice = parseFloat(document.getElementById('product-price').textContent.replace('R$', '').replace(',', '.'));
    const productId = window.location.pathname.split('/').pop();

    if (btnAddToCart) {
        btnAddToCart.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value, 10);

            if (quantity <= 0 || isNaN(quantity)) {
                alert("Por favor, insira uma quantidade válida.");
                return;
            }
            
            const product = {
                id: parseInt(productId),
                nome: productName,
                preco: productPrice,
                imagem: mainImage.src
            };

            // A função adicionarAoCarrinho é global e vem do main.js
            if (window.adicionarAoCarrinho) {
                window.adicionarAoCarrinho(product, quantity);
            } else {
                console.error("Função adicionarAoCarrinho não encontrada.");
            }
        });
    }
});
