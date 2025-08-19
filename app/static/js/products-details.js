// products-details.js
// Este script lida com a lógica da página de detalhes do produto.

document.addEventListener('DOMContentLoaded', () => {
    
    // URL base para a API de produtos
    const API_PRODUCT_DETAILS_URL = window.location.origin + "/api/produtos/";

    // Seletores de elementos da página
    const mainImage = document.querySelector('.main-image-container img');
    const thumbnails = document.querySelectorAll('.gallery-thumbnails img');
    const tabs = document.querySelectorAll('.specs .tabs li');
    const tabContents = document.querySelectorAll('.specs-content div');
    const btnAddToCart = document.querySelector('.btn-add-to-cart');
    const quantityInput = document.querySelector('.quantity-input');
    
    // Adiciona evento de clique para as miniaturas da galeria de imagens
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            mainImage.src = thumbnail.src;
        });
    });

    // Adiciona evento de clique para as abas de navegação
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove a classe 'active' de todas as abas
            tabs.forEach(t => t.classList.remove('active'));
            // Adiciona a classe 'active' à aba clicada
            tab.classList.add('active');
            
            // Oculta todo o conteúdo das abas
            tabContents.forEach(content => content.style.display = 'none');
            
            // Exibe o conteúdo da aba correspondente
            const targetId = tab.textContent.toLowerCase().replace(' ', '-') + '-content';
            document.getElementById(targetId).style.display = 'block';
        });
    });

    // Lógica para adicionar o produto ao carrinho
    if (btnAddToCart) {
        btnAddToCart.addEventListener('click', async () => {
            // Pega o ID do produto da URL (ex: products-details/1)
            const url = window.location.href;
            const productId = url.substring(url.lastIndexOf('/') + 1);
            const quantity = parseInt(quantityInput.value, 10);

            // Valida a quantidade
            if (quantity <= 0 || isNaN(quantity)) {
                alert("Por favor, insira uma quantidade válida.");
                return;
            }
            
            try {
                // Busca os detalhes do produto para ter todas as informações
                const response = await fetch(API_PRODUCT_DETAILS_URL + productId);
                const product = await response.json();
                
                // Pega o carrinho do localStorage ou cria um novo
                let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
                const itemExistente = carrinho.find(item => item.id == product.id);

                if (itemExistente) {
                    itemExistente.quantidade += quantity;
                } else {
                    carrinho.push({
                        id: product.id,
                        nome: product.name,
                        preco: product.price,
                        imagem: product.images[0] || 'https://placehold.co/100',
                        quantidade: quantity
                    });
                }

                localStorage.setItem('carrinho', JSON.stringify(carrinho));
                
                // Alerta de sucesso (pode ser substituído por um modal mais elegante)
                alert(`${quantity} unidade(s) de "${product.name}" adicionada(s) ao carrinho!`);
                
            } catch (error) {
                console.error("Erro ao adicionar ao carrinho:", error);
                alert("Não foi possível adicionar o produto ao carrinho.");
            }
        });
    }
});
