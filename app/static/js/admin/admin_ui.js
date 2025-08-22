window.addEventListener('load', () => {
    // Garante que a biblioteca de ícones esteja pronta
    if (window.lucide) {
        lucide.createIcons();
    }

    //-----------------------------------------
    //  SELETORES DE ELEMENTOS DA UI
    //-----------------------------------------
    const searchInput = document.getElementById('product-search-input');
    const productsTableBody = document.getElementById('products-table-body');
    const tabLinks = document.querySelectorAll('.tab-link');
    const adminSections = document.querySelectorAll('.admin-section');
    const adminProfileBtn = document.getElementById('admin-profile-btn');
    const adminDropdown = document.getElementById('admin-dropdown');
    const themeToggleBtn = document.getElementById('theme-toggle');

    //-----------------------------------------
    //  LÓGICA DA INTERFACE
    //-----------------------------------------

    // Lógica para a barra de busca
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const tableRows = productsTableBody.querySelectorAll('tr');

            tableRows.forEach(row => {
                // A segunda célula (índice 1) contém o nome do produto
                const productName = row.cells[1].textContent.toLowerCase();
                if (productName.includes(searchTerm)) {
                    row.style.display = ''; // Mostra a linha
                } else {
                    row.style.display = 'none'; // Esconde a linha
                }
            });
        });
    }

    // Lógica para a navegação por abas
    if (tabLinks.length > 0) {
        tabLinks.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove a classe 'active' de todas as abas e seções
                tabLinks.forEach(t => t.classList.remove('active'));
                adminSections.forEach(s => s.classList.remove('active'));
                
                // Adiciona a classe 'active' à aba clicada e à sua seção correspondente
                tab.classList.add('active');
                const viewId = tab.dataset.view;
                const activeSection = document.getElementById(viewId);
                if (activeSection) {
                    activeSection.classList.add('active');
                }
            });
        });
    }

    // Lógica para o menu dropdown do perfil
    if (adminProfileBtn && adminDropdown) {
        adminProfileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede que o clique feche o menu imediatamente
            adminDropdown.classList.toggle('show');
        });

        // Fecha o dropdown se o usuário clicar fora
        document.addEventListener('click', (e) => {
            if (!adminProfileBtn.contains(e.target) && !adminDropdown.contains(e.target)) {
                adminDropdown.classList.remove('show');
            }
        });
    }

    // Lógica para o botão de tema (sol/lua)
    if (themeToggleBtn) {
        // Função para aplicar o tema
        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        };

        // Carrega o tema salvo ao iniciar a página
        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);

        // Adiciona o evento de clique para alternar o tema
        themeToggleBtn.addEventListener('click', () => {
            const isDarkMode = document.body.classList.contains('dark-mode');
            const newTheme = isDarkMode ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});
