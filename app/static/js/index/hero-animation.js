document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-animation-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray;

    // Paletas de cores para os temas, agora com gradientes
    const themeColors = {
        light: {
            // Gradiente suave para o tema claro
            backgroundGradientStart: '#e0e2e5',
            backgroundGradientEnd: '#f0f2f5',
            particleColor: 'rgba(44, 62, 80, 0.5)'
        },
        dark: {
            // Gradiente do CSS para o tema escuro
            backgroundGradientStart: '#232526',
            backgroundGradientEnd: '#414345',
            particleColor: 'rgba(240, 242, 245, 0.5)'
        }
    };

    let currentTheme = document.body.classList.contains('tema-escuro') ? 'dark' : 'light';

    // Configurações das partículas
    const particleConfig = {
        count: 100,
        radius: 2,
        speed: 0.5,
        connectionDistance: 120
    };

    // Classe da Partícula
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }
            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    // Inicializa as partículas
    function init() {
        particlesArray = [];
        const numberOfParticles = particleConfig.count;
        const color = themeColors[currentTheme].particleColor;

        for (let i = 0; i < numberOfParticles; i++) {
            const size = (Math.random() * particleConfig.radius) + 1;
            const x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            const y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            const directionX = (Math.random() * particleConfig.speed) - (particleConfig.speed / 2);
            const directionY = (Math.random() * particleConfig.speed) - (particleConfig.speed / 2);
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Conecta as partículas com linhas
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                                 ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
                if (distance < (particleConfig.connectionDistance * particleConfig.connectionDistance)) {
                    opacityValue = 1 - (distance / (particleConfig.connectionDistance * particleConfig.connectionDistance));
                    ctx.strokeStyle = themeColors[currentTheme].particleColor.replace('0.5', opacityValue);
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Loop de animação
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, innerWidth, innerHeight);

        // Cria o gradiente de fundo
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, themeColors[currentTheme].backgroundGradientStart);
        gradient.addColorStop(1, themeColors[currentTheme].backgroundGradientEnd);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    // Ajusta o canvas ao tamanho da janela
    function handleResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }

    // Observa mudanças no tema
    const themeObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const newTheme = document.body.classList.contains('tema-escuro') ? 'dark' : 'light';
                if (newTheme !== currentTheme) {
                    currentTheme = newTheme;
                    // Reinicia a animação com as novas cores
                    init();
                }
            }
        });
    });

    themeObserver.observe(document.body, {
        attributes: true
    });

    window.addEventListener('resize', handleResize);

    // Inicia tudo
    handleResize();
    animate();
});
