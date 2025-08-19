// Seleciona os elementos necessários
const mainImage = document.querySelector('.product-gallery img');
const thumbnailsContainer = document.querySelector('.gallery-thumbnails');
const productName = document.querySelector('.product-details h1');
const productPrice = document.querySelector('.product-price');
const productDescription = document.querySelector('.product-description');
const productStatus = document.querySelector('.product-status');
const tabs = document.querySelectorAll('.tabs li');
const specsContent = document.querySelectorAll('.specs-content > div');

/**
 * Função para buscar os detalhes do produto da API e renderizá-los.
 */
async function fetchAndRenderProductDetails() {
    // Obtém o ID do produto da URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        // Redireciona ou exibe uma mensagem de erro se o ID não for encontrado
        console.error("ID do produto não encontrado na URL.");
        // Redirecione o usuário para a página de produtos ou exiba um erro
        // window.location.href = '/products';
        return;
    }

    try {
        const API_URL = `${window.location.origin}/api/produtos/${productId}`;
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Produto não encontrado.');
        }

        const product = await response.json();
        
        // Preenche o HTML com os dados do produto
        productName.textContent = product.name;
        productPrice.textContent = `R$ ${product.price.toFixed(2).replace('.', ',')}`;
        productDescription.textContent = product.description || 'Sem descrição.';
        productStatus.textContent = product.status;

        // Renderiza a imagem principal e as miniaturas
        if (product.images && product.images.length > 0) {
            mainImage.src = product.images[0];
            mainImage.alt = product.name;

            // Limpa o contêiner de miniaturas e adiciona as novas
            thumbnailsContainer.innerHTML = '';
            product.images.forEach(imageSrc => {
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = product.name;
                img.classList.add('thumbnail');
                thumbnailsContainer.appendChild(img);
            });
            
            // Adiciona o evento de clique para as miniaturas
            document.querySelectorAll('.gallery-thumbnails img').forEach((thumbnail) => {
                thumbnail.addEventListener('click', (event) => {
                    mainImage.src = event.target.src;
                });
            });

        }

    } catch (error) {
        console.error("Erro ao carregar detalhes do produto:", error);
        // Exibe uma mensagem de erro para o usuário
        productName.textContent = 'Produto não encontrado.';
        productPrice.textContent = '';
        productDescription.textContent = 'Ocorreu um erro ao carregar os detalhes do produto.';
    }
}

// Inicializa a função quando a página é carregada
document.addEventListener('DOMContentLoaded', fetchAndRenderProductDetails);

// Função para alternar entre as abas de especificações
tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        // Esconde todas as seções de especificações
        specsContent.forEach(content => content.style.display = 'none');

        // Mostra a seção correspondente à aba clicada
        specsContent[index].style.display = 'block';

        // Atualiza a aparência das abas
        tabs.forEach(t => t.style.color = '#777'); // Reseta a cor
        tab.style.color = '#ffa500'; // Destaca a aba ativa
    });
});

// Inicializa a primeira aba como visível
specsContent.forEach((content, index) => {
    content.style.display = index === 0 ? 'block' : 'none';
});
