window.addEventListener('load', () => {
    // Seleciona os elementos apenas quando o DOM estiver pronto
    const statsSection = document.getElementById('stats-view');
    if (!statsSection) return; // Se não estiver na página de stats, não faz nada

    const API_URL = '/api/admin/stats';
    const chartFilters = document.getElementById('visits-chart-filters');
    const chartTitle = document.getElementById('visits-chart-title');
    const chartCanvas = document.getElementById('visitsChart'); // Corrigido para corresponder ao HTML
    let visitsChartInstance = null;

    /**
     * Busca os dados reais da API do backend.
     */
    async function fetchStats(period = 'day') {
        try {
            const response = await fetch(`${API_URL}?period=${period}`);
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.statusText}`);
            }
            const data = await response.json();
            updateUI(data);
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            // Opcional: mostrar uma mensagem de erro na UI
        }
    }

    /**
     * Atualiza os cards e o gráfico com os novos dados vindos do CSV.
     */
    function updateUI(data) {
        document.getElementById('total-users-stat').textContent = data.total_users || 0;
        document.getElementById('total-products-stat').textContent = data.total_products || 0;
        document.getElementById('total-visits-stat').textContent = data.total_visits || 0;
        
        const chartLabels = data.visits_by_period.map(item => item.date);
        const chartData = data.visits_by_period.map(item => item.count);
        
        renderVisitsChart(chartLabels, chartData);
    }

    /**
     * Renderiza o gráfico de visitas com Chart.js.
     */
    function renderVisitsChart(labels, data) {
        if (!chartCanvas) return;
        const ctx = chartCanvas.getContext('2d');
        
        if (visitsChartInstance) {
            visitsChartInstance.destroy();
        }
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        const bodyStyles = getComputedStyle(document.body);

        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const tickColor = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#666';
        const bodyColor = isDarkMode ? '#fff' : '#333';

        visitsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Visitas',
                    data: data,
                    backgroundColor: 'rgba(0, 122, 255, 0.6)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 2,
                    borderRadius: 5,
                    hoverBackgroundColor: 'rgba(0, 122, 255, 0.8)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: isDarkMode ? '#48484a' : '#fff',
                        titleColor: bodyColor,
                        bodyColor: bodyColor,
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#ddd',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `Visitas: ${context.raw}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor, drawBorder: false },
                        ticks: { 
                            color: tickColor, 
                            padding: 10,
                            stepSize: 1 // Garante que o eixo Y use apenas números inteiros
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: tickColor, padding: 10 }
                    }
                }
            }
        });
    }

    // --- EVENT LISTENERS ---
    if (chartFilters) {
        chartFilters.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                chartFilters.querySelector('.active')?.classList.remove('active');
                e.target.classList.add('active');
                
                const period = e.target.dataset.period;
                const titleMap = {
                    day: 'Visitas Diárias (Últimos 7 Dias)',
                    week: 'Visitas Semanais (Últimas 7 Semanas)',
                    month: 'Visitas Mensais (Último Ano)',
                    year: 'Visitas Anuais (Últimos 5 Anos)'
                };
                chartTitle.textContent = titleMap[period];
                fetchStats(period);
            }
        });
    }
    
    // Ouve o evento customizado 'themeChanged' (disparado pelo admin_ui.js)
    window.addEventListener('themeChanged', () => {
        if (visitsChartInstance) {
            const activePeriod = chartFilters.querySelector('.active')?.dataset.period || 'day';
            fetchStats(activePeriod);
        }
    });

    // Carrega as estatísticas iniciais quando a página é carregada
    fetchStats('day');
});
