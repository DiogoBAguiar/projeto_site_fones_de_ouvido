
# app/routes/user.py
# Este Blueprint lida com as rotas específicas para usuários autenticados.

from flask import Blueprint, render_template, request

# Cria o Blueprint com o nome 'user' e um prefixo de URL.
user_bp = Blueprint('user', __name__)

@user_bp.route('/profile')
def profile():
    """Rota para a página de perfil do usuário."""
    # Lógica de perfil aqui...
    return render_template('user/profile.html')

@user_bp.route('/cart')
def cart():
    """Rota para a página de carrinho do usuário."""
    # Lógica do carrinho aqui...
    return render_template('user/cart.html')
