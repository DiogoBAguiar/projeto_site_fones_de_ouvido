// js/index/slider.js
import { addToCart } from './cart.js';
import { renderCartUI, exibirMensagem } from './ui.js';

export function initSlider() {
    const destaqueContainer = document.querySelector('.produtos-destaque-container');
    if (!destaqueContainer) return;

    const gradeProdutos = destaqueContainer.querySelector('.grade-produtos');
    const prevBtn = destaqueContainer.querySelector('.slider-btn.prev');
    const nextBtn = destaqueContainer.querySelector('.slider-btn.next');
    const indicatorsContainer = document.querySelector('.slider-indicators');
    const API_FEATURED_URL = window.location.origin + "/api/products/featured";
    
    let allFeaturedProducts = [];
    let scrollTimeout;
    let isCheckingLoop = false;

    function setupSlider() {
        if (!gradeProdutos.querySelector('.cartao-produto')) return;
        const scrollWidth = gradeProdutos.scrollWidth;
        const clientWidth = gradeProdutos.clientWidth;

        const isScrollable = scrollWidth > clientWidth;
        prevBtn.style.display = isScrollable ? 'flex' : 'none';
        nextBtn.style.display = isScrollable ? 'flex' : 'none';
        indicatorsContainer.style.display = isScrollable ? 'flex' : 'none';
        
        updateIndicators();
    }

    function renderSkeletons(count = 4) {
        gradeProdutos.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.classList.add('skeleton-card');
            skeletonCard.innerHTML = `<div class="skeleton-image shimmer"></div><div class="skeleton-info"><div class="skeleton-text shimmer"></div><div class="skeleton-text short shimmer"></div><div class="skeleton-button shimmer"></div></div>`;
            gradeProdutos.appendChild(skeletonCard);
        }
    }

    function renderFeaturedProducts(produtos, append = false) {
        if (!append) gradeProdutos.innerHTML = '';
        
        produtos.forEach(produto => {
            const card = document.createElement('div');
            card.classList.add('cartao-produto');
            card.innerHTML = `
                <a href="/products-details/${produto.id}"><img src="${produto.images.length > 0 ? produto.images[0] : 'https://placehold.co/300'}" alt="${produto.name}" class="imagem-produto"></a>
                <div class="info-produto">
                    <a href="/products-details/${produto.id}">
                        <h3 class="nome-produto">${produto.name}</h3>
                        <p class="descricao-produto">${produto.description || ''}</p>
                        <p class="preco-produto">R$ ${produto.price.toFixed(2).replace('.', ',')}</p>
                    </a>
                    <button class="botao-add-carrinho" data-product-id="${produto.id}">Adicionar ao Carrinho</button>
                </div>`;
            gradeProdutos.appendChild(card);
        });
        if (!append) setupSlider();
    }

    async function fetchFeaturedProducts() {
        renderSkeletons();
        try {
            const response = await fetch(API_FEATURED_URL);
            if (!response.ok) throw new Error('Erro ao buscar produtos da API.');
            
            allFeaturedProducts = await response.json();
            renderFeaturedProducts(allFeaturedProducts);
            if (allFeaturedProducts.length > 0) {
                renderFeaturedProducts(allFeaturedProducts, true);
            }
        } catch (error) {
            console.error("Erro ao carregar produtos:", error);
            gradeProdutos.innerHTML = '<p>Não foi possível carregar os produtos.</p>';
        }
    }

    function updateIndicators() {
        const card = gradeProdutos.querySelector('.cartao-produto');
        if (!card) return;
        const cardWidth = card.offsetWidth, gap = 32;
        const itemsPerPage = Math.floor(gradeProdutos.clientWidth / (cardWidth + gap));
        const totalPages = Math.ceil(allFeaturedProducts.length / itemsPerPage);
        
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('div');
            dot.classList.add('indicator-dot');
            dot.dataset.page = i;
            indicatorsContainer.appendChild(dot);
        }
        updateActiveDot();
    }

    function updateActiveDot() {
        const card = gradeProdutos.querySelector('.cartao-produto');
        if (!card) return;
        const cardWidth = card.offsetWidth, gap = 32;
        const itemsPerPage = Math.floor(gradeProdutos.clientWidth / (cardWidth + gap));
        const totalOriginalWidth = allFeaturedProducts.length * (cardWidth + gap);
        const currentLogicalScroll = gradeProdutos.scrollLeft % totalOriginalWidth;
        const currentPage = Math.round(currentLogicalScroll / (itemsPerPage * (cardWidth + gap)));
        
        indicatorsContainer.querySelectorAll('.indicator-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
    }

    function handleInfiniteScroll() {
        if (isCheckingLoop || !gradeProdutos.querySelector('.cartao-produto')) return;
        isCheckingLoop = true;
        const totalOriginalWidth = allFeaturedProducts.length * (gradeProdutos.querySelector('.cartao-produto').offsetWidth + 32);
        
        if (gradeProdutos.scrollLeft >= totalOriginalWidth) {
            gradeProdutos.scrollLeft -= totalOriginalWidth;
        }
        isCheckingLoop = false;
    }

    prevBtn.addEventListener('click', () => { gradeProdutos.scrollLeft -= (gradeProdutos.querySelector('.cartao-produto').offsetWidth + 32); });
    nextBtn.addEventListener('click', () => { gradeProdutos.scrollLeft += (gradeProdutos.querySelector('.cartao-produto').offsetWidth + 32); });

    gradeProdutos.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateActiveDot();
            handleInfiniteScroll();
        }, 150);
    });

    indicatorsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('indicator-dot')) {
            const page = parseInt(e.target.dataset.page);
            const cardWidth = gradeProdutos.querySelector('.cartao-produto').offsetWidth, gap = 32;
            const itemsPerPage = Math.floor(gradeProdutos.clientWidth / (cardWidth + gap));
            gradeProdutos.scrollLeft = page * itemsPerPage * (cardWidth + gap);
        }
    });

    // --- LÓGICA DA ANIMAÇÃO "VOAR PARA O CARRINHO" (CORRIGIDA E COMENTADA) ---
    gradeProdutos.addEventListener('click', (e) => {
        if (e.target.classList.contains('botao-add-carrinho')) {
            const button = e.target;
            const productId = button.dataset.productId;
            const productData = allFeaturedProducts.find(p => p.id == productId);
            
            if (productData) {
                // 1. Encontrar a imagem original do produto que foi clicado.
                const productImageEl = button.closest('.cartao-produto').querySelector('.imagem-produto');
                
                // 2. Clonar a imagem para criar o efeito de "voo" sem mover a original.
                const flyingImage = productImageEl.cloneNode(true);
                flyingImage.classList.add('flying-image');

                // 3. Obter a posição e tamanho da imagem original na tela.
                const rectStart = productImageEl.getBoundingClientRect();
                flyingImage.style.top = `${rectStart.top}px`;
                flyingImage.style.left = `${rectStart.left}px`;
                flyingImage.style.width = `${rectStart.width}px`;
                flyingImage.style.height = `${rectStart.height}px`;

                // 4. Adicionar a imagem clonada ao 'body' para que ela possa flutuar sobre todos os outros elementos.
                document.body.appendChild(flyingImage);

                // 5. Obter a posição do ícone do carrinho, que é o nosso destino.
                const cartIcon = document.getElementById('btn-carrinho');
                const rectEnd = cartIcon.getBoundingClientRect();
                
                // 6. Calcular as coordenadas exatas do centro do ícone do carrinho.
                const endTop = rectEnd.top + (rectEnd.height / 2);
                const endLeft = rectEnd.left + (rectEnd.width / 2);
                
                // 7. Calcular a distância que a imagem precisa viajar nos eixos X e Y.
                //    Isso move o centro da imagem voadora para o centro do carrinho.
                const deltaX = endLeft - (rectStart.left + rectStart.width / 2);
                const deltaY = endTop - (rectStart.top + rectStart.height / 2);

                // 8. Pedir ao navegador para aplicar a animação na próxima "pintura" de tela (mais suave).
                requestAnimationFrame(() => {
                    flyingImage.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1)`;
                    flyingImage.style.opacity = '0';
                });

                // 9. Quando a animação CSS terminar, remover a imagem voadora e atualizar o carrinho.
                flyingImage.addEventListener('transitionend', () => {
                    flyingImage.remove();
                    const productToAdd = {
                        id: productData.id,
                        nome: productData.name,
                        preco: productData.price,
                        imagem: productData.images.length > 0 ? productData.images[0] : 'https://placehold.co/300'
                    };
                    addToCart(productToAdd);
                    renderCartUI();
                    exibirMensagem(`"${productData.name}" adicionado ao carrinho!`, 'success');
                }, { once: true });
            }
        }
    });

    window.addEventListener('resize', () => { setupSlider(); updateIndicators(); });
    fetchFeaturedProducts();
}
