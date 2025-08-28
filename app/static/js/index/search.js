// js/index/search.js

/**
 * Função debounce para controlar a frequência de execução de uma função.
 * Essencial para evitar múltiplas chamadas à API enquanto o usuário digita.
 * @param {Function} func - A função a ser executada após o delay.
 * @param {number} delay - O tempo de espera em milissegundos.
 * @returns {Function} - A nova função com o debounce aplicado.
 */
function debounce(func, delay = 400) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

/**
 * Exibe uma mensagem (carregando, erro, nenhum resultado) no contêiner de resultados.
 * @param {string} message - A mensagem a ser exibida.
 * @param {HTMLElement} container - O elemento onde a mensagem será inserida.
 * @param {string} type - O tipo de mensagem ('loading', 'error', 'info').
 */
function displayMessage(message, container, type = 'info') {
    container.innerHTML = `<p class="${type}-message">${message}</p>`;
}

/**
 * Renderiza a lista de produtos filtrados no contêiner de resultados.
 * @param {Array} filteredProducts - A lista de produtos para exibir.
 * @param {HTMLElement} container - O elemento onde os resultados serão inseridos.
 * @param {string} searchTerm - O termo buscado, para destaque.
 */
function displayResults(filteredProducts, container, searchTerm) {
    container.innerHTML = ''; // Limpa resultados anteriores ou mensagens

    if (filteredProducts.length === 0) {
        displayMessage('Nenhum produto encontrado.', container);
        return;
    }

    // Cria um fragmento para melhorar a performance, adicionando todos os elementos de uma vez ao DOM.
    const fragment = document.createDocumentFragment();
    const regex = new RegExp(`(${searchTerm})`, 'gi');

    filteredProducts.forEach(product => {
        const highlightedName = product.name.replace(regex, `<span class="highlight">$1</span>`);
        const resultLink = document.createElement('a');
        resultLink.href = `/products-details/${product.id}`;
        resultLink.classList.add('search-result-item');
        // Acessibilidade: Define o papel de cada item para leitores de tela.
        resultLink.setAttribute('role', 'option');
        resultLink.innerHTML = `<div class="info"><h4>${highlightedName}</h4></div>`;
        fragment.appendChild(resultLink);
    });

    container.appendChild(fragment);
}

/**
 * Posiciona o painel de resultados alinhado ao campo de busca.
 * @param {HTMLElement} inputElement - O campo de busca.
 * @param {HTMLElement} resultsContainer - O contêiner de resultados.
 */
function positionResults(inputElement, resultsContainer) {
    const rect = inputElement.getBoundingClientRect();
    resultsContainer.style.top = `${rect.bottom + 10}px`;
    resultsContainer.style.right = `${window.innerWidth - rect.right}px`;
    resultsContainer.style.left = 'auto'; // Garante que não fique desalinhado
}

/**
 * Inicializa toda a funcionalidade de busca da página.
 */
export function initSearch() {
    const searchForm = document.getElementById('form-busca');
    const searchInput = document.getElementById('barra-busca-input');
    const searchButton = document.querySelector('.btn-lupa');
    const resultsContainer = document.getElementById('search-results');

    if (!searchForm || !searchInput || !searchButton || !resultsContainer) {
        console.error('Elementos essenciais da busca não foram encontrados no DOM.');
        return;
    }
    
    // --- MELHORIAS DE ACESSIBILIDADE (a11y) ---
    // Liga o input ao contêiner de resultados para leitores de tela.
    searchInput.setAttribute('aria-controls', 'search-results');
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.setAttribute('aria-autocomplete', 'list');
    resultsContainer.setAttribute('role', 'listbox');


    /**
     * Função principal que lida com a busca. Agora é assíncrona.
     */
    const handleSearch = async () => {
        const searchTerm = searchInput.value.trim().toLowerCase();

        if (searchTerm.length < 2) {
            resultsContainer.classList.remove('visivel');
            searchInput.setAttribute('aria-expanded', 'false');
            return;
        }

        // Mostra o painel e o estado de "carregando"
        positionResults(searchInput, resultsContainer);
        resultsContainer.classList.add('visivel');
        searchInput.setAttribute('aria-expanded', 'true');
        displayMessage('Buscando...', resultsContainer, 'loading');

        try {
            // --- MUDANÇA PRINCIPAL: BUSCA NO SERVIDOR ---
            // A busca agora é feita pela API, passando o termo como parâmetro.
            // Isso é muito mais escalável do que baixar todos os produtos.
            const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) {
                throw new Error('A resposta da rede não foi bem-sucedida.');
            }
            const filteredProducts = await response.json();
            displayResults(filteredProducts, resultsContainer, searchTerm);

        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            // Informa o usuário sobre o erro de forma clara.
            displayMessage('Houve um erro na busca. Tente novamente.', resultsContainer, 'error');
        }
    };

    // Evento para expandir a barra de busca
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.classList.add('ativo');
        searchInput.focus();
    });

    // Evento de input com debounce para acionar a busca
    searchInput.addEventListener('input', debounce(handleSearch));

    // Impede o envio do formulário, já que a busca é dinâmica
    searchForm.addEventListener('submit', (e) => e.preventDefault());

    // Fecha o painel de resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.barra-busca-container')) {
            resultsContainer.classList.remove('visivel');
            searchInput.classList.remove('ativo');
            searchInput.setAttribute('aria-expanded', 'false');
        }
    });

    // Reposiciona o painel se a janela for redimensionada
    window.addEventListener('resize', () => {
        if (resultsContainer.classList.contains('visivel')) {
            positionResults(searchInput, resultsContainer);
        }
    });
}
