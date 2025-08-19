# app/routes/public.py
# Este Blueprint lida com as rotas acessíveis ao público.
# Refatorado para integrar com Flask-Login e Bcrypt para autenticação,
# e para usar o banco de dados de forma mais eficiente.

from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from app import db # Importa a instância do SQLAlchemy
from app.models.product import Product # Importa o modelo de Produto
from app.models.user import User # Importa o modelo de Usuário
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

# Cria o Blueprint com o nome 'public'.
public_bp = Blueprint('public', __name__)

@public_bp.route('/')
def home():
    """Rota para a página inicial."""
    return render_template('public/index.html')

@public_bp.route('/products')
def products():
    """Rota para a página de produtos, listando-os do banco de dados."""
    return render_template('public/products.html')

@public_bp.route('/products-details/<int:product_id>')
def products_details(product_id):
    """Rota para a página de produtos detalhada."""
    # Busca um produto específico pelo ID do banco de dados
    product = Product.query.get_or_404(product_id)
    return render_template('public/products-details.html', product=product)

@public_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Rota para a página de login."""
    # Se o usuário já estiver autenticado, redireciona para a home
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('senha')
        user = User.query.filter_by(email=email).first()
        # Verifica se o usuário existe e se a senha está correta
        if user and check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            flash('Login bem-sucedido!', 'success')
            return redirect(url_for('public.home'))
        else:
            flash('Email ou senha inválidos.', 'danger')
    return render_template('public/login.html')

@public_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Rota para a página de registro."""
    # Se o usuário já estiver autenticado, redireciona para a home
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))
    if request.method == 'POST':
        email = request.form.get('email')
        username = request.form.get('nome')
        password = request.form.get('senha')
        
        # Verifica se o email já está em uso
        user_exists = User.query.filter_by(email=email).first()
        if user_exists:
            flash('Este email já está cadastrado.', 'danger')
            return redirect(url_for('public.register'))
        
        # Cria um novo usuário com a senha hasheada
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password_hash=hashed_password, role='user')
        
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Cadastro realizado com sucesso! Faça login para continuar.', 'success')
            return redirect(url_for('public.login'))
        except Exception as e:
            db.session.rollback()
            flash(f'Ocorreu um erro no cadastro: {str(e)}', 'danger')
    
    return render_template('public/register.html')

@public_bp.route('/logout')
@login_required
def logout():
    """Rota para fazer logout do usuário."""
    logout_user()
    flash('Você foi desconectado.', 'info')
    return redirect(url_for('public.home'))

@public_bp.route('/api/produtos/destaques', methods=['GET'])
def get_featured_products():
    """
    Rota de API para obter uma lista de produtos em destaque.
    Para simular, retorna os primeiros 4 produtos do banco de dados com status 'Em destaque'.
    """
    try:
        # Filtra os produtos pelo status 'Em destaque'
        featured_products = Product.query.filter_by(status='Em destaque').limit(4).all()
        
        products_list = []
        for product in featured_products:
            products_list.append({
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'images': product.get_images(),
                'status': product.status
            })
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": "Ocorreu um erro ao buscar os produtos em destaque."}), 500

@public_bp.route('/api/products', methods=['GET'])
def get_all_products():
    """Rota de API para obter todos os produtos em formato JSON."""
    try:
        all_products = Product.query.all()
        products_list = []
        for product in all_products:
            products_list.append({
                'id': product.id,
                'name': product.name,
                'brand': product.brand,
                'price': product.price,
                'status': product.status,
                'images': product.get_images(),
                # Atributo 'type' é simulado, pois não existe no modelo
                'type': 'Tipo 1'
            })
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": "Ocorreu um erro ao buscar os produtos."}), 500
