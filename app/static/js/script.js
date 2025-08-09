document.addEventListener('DOMContentLoaded', () => {
    // Referências para os elementos do DOM
    const botaoAlternarTema = document.getElementById('alternar-tema');
    const botaoAlternarTemaMobile = document.getElementById('botao-alternar-tema-mobile');
    const iconeSol = document.getElementById('icone-sol');
    const iconeLua = document.getElementById('icone-lua');
    const botaoMenuMobile = document.getElementById('botao-menu-mobile');
    const menuMobile = document.getElementById('menu-mobile');
    const corpo = document.body;
    const cabecalho = document.querySelector('.cabecalho');

    // Função para aplicar o tema com base na preferência do usuário ou no localStorage
    const aplicarTema = (tema) => {
        if (tema === 'escuro') {
            corpo.classList.remove('tema-claro');
            corpo.classList.add('tema-escuro');
            iconeSol.style.display = 'none';
            iconeLua.style.display = 'block';
        } else {
            corpo.classList.remove('tema-escuro');
            corpo.classList.add('tema-claro');
            iconeSol.style.display = 'block';
            iconeLua.style.display = 'none';
        }
    };

    // Verifica o tema preferido do usuário ou o que está salvo no localStorage
    const temaSalvo = localStorage.getItem('tema');
    const prefereEscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (temaSalvo === 'escuro' || (!temaSalvo && prefereEscuro)) {
        aplicarTema('escuro');
    } else {
        aplicarTema('claro');
    }

    // Função para alternar o tema
    const alternarTema = () => {
        if (corpo.classList.contains('tema-escuro')) {
            aplicarTema('claro');
            localStorage.setItem('tema', 'claro');
        } else {
            aplicarTema('escuro');
            localStorage.setItem('tema', 'escuro');
        }
    };

    // Adiciona os event listeners aos botões
    botaoAlternarTema.addEventListener('click', alternarTema);
    botaoAlternarTemaMobile.addEventListener('click', alternarTema);
    botaoMenuMobile.addEventListener('click', () => {
        // Alterna a visibilidade do menu mobile
        if (menuMobile.style.display === 'block') {
            menuMobile.style.display = 'none';
        } else {
            menuMobile.style.display = 'block';
        }
    });

    // Listener para o evento de scroll da janela
    window.addEventListener('scroll', () => {
        // Se a posição de scroll for maior que 50px, adiciona a classe
        if (window.scrollY > 50) {
            cabecalho.classList.add('cabecalho-rolado');
        } else {
            // Caso contrário, remove a classe
            cabecalho.classList.remove('cabecalho-rolado');
        }
    });
});