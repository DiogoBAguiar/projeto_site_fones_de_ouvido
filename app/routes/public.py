# app/routes/public.py
# Este Blueprint lida com as rotas acessíveis ao público.
# Refatorado para lidar com erros de JSON mal formatado no banco de dados.

from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from app import db # Importa a instância do SQLAlchemy
from app.models.product import Product # Importa o modelo de Produto
from app.models.user import User # Importa o modelo de Usuário
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import json

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
@public_bp.route('/login/', methods=['GET', 'POST'])
def login():
    """
    Rota para a página de login.
    Aceita URLs com e sem a barra final.
    """
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('senha')
        user = User.query.filter_by(email=email).first()
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
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))
    if request.method == 'POST':
        email = request.form.get('email')
        username = request.form.get('nome')
        password = request.form.get('senha')
        
        user_exists = User.query.filter_by(email=email).first()
        if user_exists:
            flash('Este email já está cadastrado.', 'danger')
            return redirect(url_for('public.register'))
        
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
    Retorna os primeiros 4 produtos do banco de dados com status 'Em destaque'.
    """
    try:
        featured_products = Product.query.filter_by(status='Em destaque').limit(4).all()
        products_list = []
        for product in featured_products:
            # Tenta carregar as imagens, caso contrário, retorna uma lista vazia
            try:
                images = json.loads(product.images) if product.images else []
            except json.JSONDecodeError:
                images = [] # Trata o erro de JSON mal formatado
                
            products_list.append({
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'images': images,
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
            try:
                images = json.loads(product.images) if product.images else []
            except json.JSONDecodeError:
                images = [] # Trata o erro de JSON mal formatado
            
            products_list.append({
                'id': product.id,
                'name': product.name,
                'brand': product.brand,
                'price': product.price,
                'status': product.status,
                'images': images,
                'type': 'Tipo 1'
            })
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": "Ocorreu um erro ao buscar os produtos."}), 500
