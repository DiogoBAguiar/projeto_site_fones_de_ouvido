// js/cart.js

// A variável 'carrinho' agora é gerenciada apenas por este módulo.
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Função para obter o estado atual do carrinho
export function getCart() {
    return carrinho;
}

// Adiciona um item ao carrinho e salva no localStorage
export function addToCart(produto) {
    const itemExistente = carrinho.find(item => item.id === produto.id);
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({ ...produto, quantidade: 1 });
    }
    saveCart();
}

// Remove um item do carrinho e salva no localStorage
export function removeFromCart(produtoId) {
    carrinho = carrinho.filter(item => item.id !== parseInt(produtoId));
    saveCart();
}

// Salva o carrinho no localStorage
function saveCart() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}
