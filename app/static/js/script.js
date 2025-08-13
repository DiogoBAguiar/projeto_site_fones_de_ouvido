   document.addEventListener('DOMContentLoaded', () => {
            const body = document.body;
            const cabecalho = document.querySelector('.cabecalho');
            const modalProduto = document.getElementById('modal-produto');
            const fecharModalBtn = document.querySelector('.fechar-modal');
            const cardsProduto = document.querySelectorAll('.cartao-produto');
            const mobileMenuBtn = document.getElementById('botao-menu-mobile');
            const mobileMenu = document.getElementById('menu-mobile');
            const fecharMobileMenuBtn = document.querySelector('.fechar-menu-mobile');
            const mobileLinks = document.querySelectorAll('.menu-mobile .link-nav-mobile');

            // Elementos da barra de pesquisa
            const btnLupa = document.querySelector('.btn-lupa');
            const barraBuscaContainer = document.querySelector('.barra-busca-container');
            const barraBuscaInput = document.querySelector('.barra-busca-input');

            // Elementos do perfil do usuário
            const btnPerfil = document.getElementById('btn-perfil');
            const perfilContainer = document.querySelector('.perfil-container');
            const dropdownPerfil = document.getElementById('dropdown-perfil');
            const alternarTemaDropdownBtn = document.getElementById('alternar-tema-dropdown');
            const btnLogout = document.getElementById('btn-logout');

            // Elementos do carrinho lateral
            const btnCarrinho = document.getElementById('btn-carrinho');
            const carrinhoLateral = document.getElementById('carrinho-lateral');
            const fecharCarrinhoBtn = document.getElementById('fechar-carrinho');
            const overlay = document.getElementById('overlay');
            const btnCheckout = document.getElementById('btn-checkout');
            const listaCarrinho = document.getElementById('lista-carrinho');
            const carrinhoTotalValor = document.getElementById('carrinho-total-valor');
            const botoesAdicionarCarrinho = document.querySelectorAll('.botao-add-carrinho');
            const botaoAdicionarCarrinhoModal = document.querySelector('.botao-add-carrinho-modal');

            // Simula o estado de login
            let isLoggedIn = true; // Altere para 'true' para testar o menu de perfil logado
            let carrinho = []; // Array para armazenar os produtos no carrinho

            // Função para alternar o tema (Modo Escuro)
            const toggleTema = () => {
                body.classList.toggle('modo-escuro');
                const isDarkMode = body.classList.contains('modo-escuro');
                localStorage.setItem('tema', isDarkMode ? 'escuro' : 'claro');
                
                alternarTemaDropdownBtn.textContent = isDarkMode ? 'Modo Claro' : 'Modo Escuro';
            };

            // Aplica o tema salvo no localStorage
            const temaSalvo = localStorage.getItem('tema');
            if (temaSalvo === 'escuro') {
                body.classList.add('modo-escuro');
            }

            // --- Lógica do Header e Perfil ---
            const updateHeaderUI = () => {
                if (isLoggedIn) {
                    btnPerfil.innerHTML = '<i class="fas fa-user-circle"></i>';
                } else {
                    btnPerfil.innerHTML = 'Login';
                }
            };
            
            btnPerfil.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que o clique se propague e feche o dropdown
                if (isLoggedIn) {
                    perfilContainer.classList.toggle('ativo');
                } else {
                    // Simulação de login, pode ser expandido para uma página real
                    isLoggedIn = true;
                    updateHeaderUI();
                }
            });
            
            btnLogout.addEventListener('click', () => {
                isLoggedIn = false;
                perfilContainer.classList.remove('ativo');
                updateHeaderUI();
            });

            document.addEventListener('click', (evento) => {
                if (!perfilContainer.contains(evento.target)) {
                    perfilContainer.classList.remove('ativo');
                }
            });

            alternarTemaDropdownBtn.addEventListener('click', toggleTema);
            updateHeaderUI();

            // --- Lógica da Barra de Pesquisa ---
            btnLupa.addEventListener('click', (e) => {
                e.stopPropagation(); 
                barraBuscaContainer.classList.toggle('expandida');
                if (barraBuscaContainer.classList.contains('expandida')) {
                    barraBuscaInput.focus();
                } else {
                    barraBuscaInput.blur();
                }
            });
            
            document.addEventListener('click', (evento) => {
                const isClickInside = barraBuscaContainer.contains(evento.target);
                if (!isClickInside && barraBuscaContainer.classList.contains('expandida')) {
                    barraBuscaContainer.classList.remove('expandida');
                }
            });
            
            // --- Lógica do Carrinho ---
            const renderizarCarrinho = () => {
                listaCarrinho.innerHTML = '';
                let total = 0;

                if (carrinho.length === 0) {
                    const mensagemVazio = document.createElement('p');
                    mensagemVazio.textContent = 'Seu carrinho está vazio.';
                    listaCarrinho.appendChild(mensagemVazio);
                } else {
                    carrinho.forEach(item => {
                        const li = document.createElement('li');
                        li.className = 'item-carrinho';
                        li.innerHTML = `
                            <img src="${item.imagem}" alt="${item.nome}">
                            <div class="detalhes-item">
                                <h4>${item.nome}</h4>
                                <p>Preço: R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                                <p>Quantidade: ${item.quantidade}</p>
                            </div>
                            <button class="remover-item" data-produto-id="${item.id}">&times;</button>
                        `;
                        listaCarrinho.appendChild(li);
                        total += item.preco * item.quantidade;
                    });
                }
                carrinhoTotalValor.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

                document.querySelectorAll('.remover-item').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const produtoId = e.target.dataset.produtoId;
                        removerDoCarrinho(produtoId);
                    });
                });
            };

            const adicionarAoCarrinho = (produto) => {
                const itemExistente = carrinho.find(item => item.id === produto.id);
                if (itemExistente) {
                    itemExistente.quantidade++;
                } else {
                    carrinho.push({ ...produto, quantidade: 1 });
                }
                renderizarCarrinho();
                
                // Animação do balanço
                btnCarrinho.classList.add('animar');
                setTimeout(() => {
                    btnCarrinho.classList.remove('animar');
                }, 800);
            };

            const removerDoCarrinho = (produtoId) => {
                carrinho = carrinho.filter(item => item.id !== produtoId);
                renderizarCarrinho();
            };

            botoesAdicionarCarrinho.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const card = e.target.closest('.cartao-produto');
                    const produto = {
                        id: card.dataset.produtoId,
                        nome: card.querySelector('.nome-produto').textContent,
                        preco: parseFloat(card.querySelector('.preco-produto').dataset.preco),
                        imagem: card.querySelector('.imagem-produto').src
                    };
                    adicionarAoCarrinho(produto);
                    carrinhoLateral.classList.add('ativo');
                    overlay.classList.add('ativo');
                });
            });

            botaoAdicionarCarrinhoModal.addEventListener('click', () => {
                const modalNome = modalProduto.querySelector('.modal-nome-produto').textContent;
                const modalPreco = modalProduto.querySelector('.modal-preco-produto').textContent;
                const modalImagem = modalProduto.querySelector('.modal-imagem').src;
                
                const produtoId = modalNome.replace(/\s+/g, '-').toLowerCase();

                const produto = {
                    id: produtoId,
                    nome: modalNome,
                    preco: parseFloat(modalPreco.replace('R$', '').replace(',', '.')),
                    imagem: modalImagem
                };
                adicionarAoCarrinho(produto);
                modalProduto.style.display = 'none';
            });


            let lastClickTime = 0;
            btnCarrinho.addEventListener('click', () => {
                const clickTime = new Date().getTime();
                if (clickTime - lastClickTime < 300) {
                    window.location.href = '/checkout'; // Simula a ida para a página de checkout
                    return;
                }
                lastClickTime = clickTime;
                
                carrinhoLateral.classList.add('ativo');
                overlay.classList.add('ativo');
            });

            fecharCarrinhoBtn.addEventListener('click', () => {
                carrinhoLateral.classList.remove('ativo');
                overlay.classList.remove('ativo');
            });
            
            overlay.addEventListener('click', () => {
                carrinhoLateral.classList.remove('ativo');
                overlay.classList.remove('ativo');
            });
            
            btnCheckout.addEventListener('click', () => {
                window.location.href = '/checkout';
            });

            // --- Lógica do Menu Mobile ---
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('ativo');
            });

            fecharMobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('ativo');
            });
            
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('ativo');
                });
            });

            // --- Lógica do Modal de Produto ---
            cardsProduto.forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.tagName.toLowerCase() === 'button') {
                        return;
                    }

                    const produtoNome = card.querySelector('.nome-produto').textContent;
                    const produtoDescricao = card.querySelector('.descricao-produto').textContent;
                    const produtoPreco = card.querySelector('.preco-produto').textContent;
                    const produtoImagem = card.querySelector('.imagem-produto').src;
                    const modalNome = modalProduto.querySelector('.modal-nome-produto');
                    const modalDescricao = modalProduto.querySelector('.modal-descricao-produto');
                    const modalPreco = modalProduto.querySelector('.modal-preco-produto');
                    const modalImagem = modalProduto.querySelector('.modal-imagem');

                    modalNome.textContent = produtoNome;
                    modalDescricao.textContent = produtoDescricao;
                    modalPreco.textContent = produtoPreco;
                    modalImagem.src = produtoImagem;
                    modalImagem.alt = `Imagem de ${produtoNome}`;

                    modalProduto.style.display = 'block';
                });
            });

            fecharModalBtn.addEventListener('click', () => {
                modalProduto.style.display = 'none';
            });

            window.addEventListener('click', (evento) => {
                if (evento.target === modalProduto) {
                    modalProduto.style.display = 'none';
                }
            });

            // --- Lógica de Animação de Rolagem ---
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    cabecalho.classList.add('rolando');
                } else {
                    cabecalho.classList.remove('rolando');
                }
            });

            const secoesOcultas = document.querySelectorAll('.secao.oculta');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visivel');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1
            });

            secoesOcultas.forEach(secao => {
                observer.observe(secao);
            });
            
            // Renderiza o carrinho vazio inicialmente
            renderizarCarrinho();
        });
