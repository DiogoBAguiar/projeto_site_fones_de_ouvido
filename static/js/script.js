document.addEventListener('DOMContentLoaded', () => {
    const cabecalho = document.getElementById('cabecalho');
    const produtoDestaqueContainer = document.getElementById('produto-destaque');

    // Função para mudar o estilo do cabeçalho ao rolar a página
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // Adiciona a classe 'rolagem' após 50px de scroll
            cabecalho.classList.add('rolagem');
        } else {
            cabecalho.classList.remove('rolagem');
        }
    });

    // Função para rolagem suave para as seções
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calcula a posição de rolagem, descontando a altura do cabeçalho fixo
                const offsetTop = targetElement.offsetTop - cabecalho.offsetHeight;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Função para carregar produtos de destaque da API Flask
    async function carregarProdutosDestaque() {
        try {
            // Simula um atraso para mostrar o estado de carregamento
            produtoDestaqueContainer.innerHTML = '<div class="carregando-produto">Carregando novidades...</div>';

            const response = await fetch('/api/novidades'); // Endpoint da API Flask
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const produtos = await response.json();

            if (produtos.length > 0) {
                // Exibe o primeiro produto como destaque
                const produto = produtos[0]; // Você pode adicionar lógica para rotacionar produtos aqui

                produtoDestaqueContainer.innerHTML = `
                    <img src="${produto.imagem_url}" alt="${produto.nome}">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao}</p>
                    <div class="botoes-produto">
                        <button onclick="alert('Funcionalidade de compra não implementada.')">Comprar agora</button>
                        <button onclick="alert('Funcionalidade de adicionar ao carrinho não implementada.')">Adicionar ao carrinho</button>
                    </div>
                `;
            } else {
                produtoDestaqueContainer.innerHTML = '<p class="carregando-produto">Nenhum produto em destaque no momento.</p>';
            }
        } catch (error) {
            console.error('Erro ao carregar produtos de destaque:', error);
            produtoDestaqueContainer.innerHTML = '<p class="carregando-produto">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
        }
    }

    // Chama a função para carregar produtos quando a página é carregada
    carregarProdutosDestaque();

    // Placeholder para funcionalidades de Carrinho, Login e Pesquisa
    // Você pode adicionar mais lógica aqui para modais ou redirecionamentos
    document.querySelector('.icones-navegacao a[aria-label="Pesquisar"]').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Funcionalidade de pesquisa em desenvolvimento!');
    });

    document.querySelector('.icones-navegacao a[aria-label="Carrinho de Compras"]').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Seu carrinho está vazio. Comece a comprar!');
    });

    document.querySelector('.icones-navegacao a[aria-label="Login"]').addEventListener('click', (e) => {
        e.preventDefault();
        alert('Página de login em breve!');
    });

    // Funcionalidade do formulário de newsletter (apenas simulação)
    document.querySelector('.formulario-newsletter').addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = e.target.querySelector('input[type="email"]');
        if (emailInput.value) {
            alert(`Obrigado por assinar a newsletter, ${emailInput.value}!`);
            emailInput.value = ''; // Limpa o campo
        } else {
            alert('Por favor, insira um e-mail válido.');
        }
    });
});
