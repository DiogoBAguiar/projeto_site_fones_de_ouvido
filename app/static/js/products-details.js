// Seleciona os elementos necessários
const mainImage = document.querySelector('.product-gallery img');
const thumbnails = document.querySelectorAll('.gallery-thumbnails img');
const tabs = document.querySelectorAll('.tabs li');
const specsContent = document.querySelectorAll('.specs-content > div');

// Função para mudar a imagem principal
thumbnails.forEach((thumbnail) => {
    thumbnail.addEventListener('click', (event) => {
        mainImage.src = event.target.src; // Altera a imagem principal
    });
});

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