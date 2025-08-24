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
    if (searchInput && productsTableBody) {
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const tableRows = productsTableBody.querySelectorAll('tr');

            tableRows.forEach(row => {
                // A segunda célula (índice 1) contém o nome do produto
                if(row.cells[1]) {
                    const productName = row.cells[1].textContent.toLowerCase();
                    row.style.display = productName.includes(searchTerm) ? '' : 'none';
                }
            });
        });
    }

    // Lógica para a navegação por abas
    if (tabLinks.length > 0) {
        tabLinks.forEach(tab => {
            tab.addEventListener('click', () => {
                tabLinks.forEach(t => t.classList.remove('active'));
                adminSections.forEach(s => s.classList.remove('active'));
                
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
        const applyTheme = (theme) => {
            document.body.classList.toggle('dark-mode', theme === 'dark');
            // ATUALIZAÇÃO: Dispara um evento para outros scripts (como o gráfico) saberem da mudança
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
        };

        const savedTheme = localStorage.getItem('theme') || 'light';
        applyTheme(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});
