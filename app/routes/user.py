# app/models/user.py
# Define o modelo de banco de dados para a tabela de usuários.

from app import db
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

class User(db.Model):
    """Modelo para a tabela 'users'."""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(16), default='user')
    
    # Relacionamento com produtos e avaliações.
    products = db.relationship('Product', backref='seller', lazy=True)
    reviews = db.relationship('Review', backref='reviewer', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'
