# app/models/product.py
# Define o modelo de banco de dados para a tabela de produtos.

from app import db
# app/routes/public.py
# Este Blueprint lida com as rotas acessíveis ao público.

from flask import Blueprint, render_template

# Cria o Blueprint com o nome 'public'.
public_bp = Blueprint('public', __name__)

@public_bp.route('/')
def home():
    """Rota para a página inicial."""
    return render_template('public/index.html')

@public_bp.route('/products')
def products():
    """Rota para a página de produtos."""
    return render_template('public/products.html')

@public_bp.route('/login')
def login():
    """Rota para a página de login."""
    return render_template('public/login.html')

@public_bp.route('/register')
def register():
    """Rota para a página de registro."""
    return render_template('public/register.html')

class Product(db.Model):
    """Modelo para a tabela 'products'."""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    brand = db.Column(db.String(64), nullable=False)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(32), nullable=False)
    
    # Chave estrangeira para o usuário que adicionou o produto.
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relacionamento com avaliações.
    reviews = db.relationship('Review', backref='product', lazy=True)
    
    def __repr__(self):
        return f'<Product {self.name}>'
