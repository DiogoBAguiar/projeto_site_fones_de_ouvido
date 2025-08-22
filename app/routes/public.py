# app/routes/public.py
# Este Blueprint lida com as rotas acessíveis ao público.
# Refatorado para usar arquivos CSV em vez de um banco de dados e contar visitas.

from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from app.models.user import User # Importa o modelo de Usuário
from app.models.product import Product # Importa o modelo de Produto
from app.utils import data_manager
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import json
from datetime import datetime

# Cria o Blueprint com o nome 'public'.
public_bp = Blueprint('public', __name__)

# Nova rota para registrar visitas
@public_bp.before_app_request
def before_request():
    """
    Registra uma visita a cada requisição de página que não seja uma API ou arquivo estático.
    """
    # Exclui rotas de API e arquivos estáticos da contagem
    if request.path.startswith('/api/') or request.path.startswith('/static/'):
        return

    # A função de registro de visita será implementada no data_manager
    data_manager.register_visit()

@public_bp.route('/')
def home():
    """Rota para a página inicial."""
    return render_template('public/index.html')

@public_bp.route('/products')
def products():
    """Rota para a página de produtos, listando-os do CSV."""
    return render_template('public/products.html')

@public_bp.route('/products-details/<int:product_id>')
def products_details(product_id):
    """Rota para a página de produtos detalhada."""
    # Busca um produto específico pelo ID do CSV
    product = data_manager.get_product_by_id(product_id)
    if product:
        return render_template('public/products-details.html', product=product)
    else:
        flash("Produto não encontrado.", "danger")
        return redirect(url_for('public.products'))

@public_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Rota para a página de login."""
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('senha')
        user = data_manager.get_user_by_email(email)
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
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))
    if request.method == 'POST':
        email = request.form.get('email')
        username = request.form.get('nome')
        password = request.form.get('senha')
        
        # Verifica se o email já está em uso
        user_exists = data_manager.get_user_by_email(email)
        if user_exists:
            flash('Este email já está cadastrado.', 'danger')
            return redirect(url_for('public.register'))
        
        # Cria um novo usuário com a senha hasheada
        hashed_password = generate_password_hash(password)
        new_user = User(
            id=data_manager.get_next_id(data_manager.USERS_CSV),
            username=username,
            email=email,
            password_hash=hashed_password,
            role='user'
        )
        
        try:
            data_manager.save_user(new_user)
            flash('Cadastro realizado com sucesso! Faça login para continuar.', 'success')
            return redirect(url_for('public.login'))
        except Exception as e:
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
    Rota de API para obter uma lista de produtos em destaque do CSV.
    """
    try:
        all_products = data_manager.get_products()
        featured_products = [p for p in all_products if p.status == 'Em destaque']
        
        products_list = []
        for product in featured_products[:4]:
            products_list.append({
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': product.price,
                'images': product.images,
                'status': product.status
            })
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": "Ocorreu um erro ao buscar os produtos em destaque."}), 500

@public_bp.route('/api/products', methods=['GET'])
def get_all_products():
    """Rota de API para obter todos os produtos do CSV."""
    try:
        all_products = data_manager.get_products()
        products_list = []
        for product in all_products:
            products_list.append({
                'id': product.id,
                'name': product.name,
                'brand': product.brand,
                'price': product.price,
                'status': product.status,
                'images': product.images,
                'type': 'Tipo 1' # Atributo mockado
            })
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": "Ocorreu um erro ao buscar os produtos."}), 500
