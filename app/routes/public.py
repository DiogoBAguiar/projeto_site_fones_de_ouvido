# app/routes/public.py
# Lida com as rotas públicas da aplicação, como home, login e visualização de produtos.

import json
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from app.models.user import User
from app.utils import data_manager

# Cria o Blueprint para agrupar as rotas públicas.
public_bp = Blueprint('public', __name__)


@public_bp.before_app_request
def before_request():
    """Registra uma visita antes de cada requisição, exceto para rotas de API e arquivos estáticos."""
    if request.path.startswith('/api/') or request.path.startswith('/static/'):
        return
    data_manager.register_visit()


# --- ROTAS DE PÁGINAS (HTML) ---

@public_bp.route('/')
def home():
    """Renderiza a página inicial."""
    return render_template('public/index.html')

@public_bp.route('/products')
def products():
    """Renderiza a página de listagem de todos os produtos."""
    return render_template('public/products.html')

@public_bp.route('/products-details/<int:product_id>')
def products_details(product_id):
    """Renderiza a página de detalhes de um produto específico."""
    product = data_manager.get_product_by_id(product_id)
    if product:
        return render_template('public/products-details.html', product=product)
    
    flash("Produto não encontrado.", "danger")
    return redirect(url_for('public.products'))

@public_bp.route('/checkout')
@login_required
def checkout():
    """Renderiza a página de finalização de compra."""
    return render_template('public/checkout.html')


@public_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Lida com o login do usuário."""
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('senha')
        user = data_manager.get_user_by_email(email)

        if user and check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('public.home'))
        else:
            flash('Login inválido. Verifique seu email e senha.', 'danger')

    return render_template('public/login.html')

@public_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Lida com o registro de um novo usuário."""
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))

    if request.method == 'POST':
        username = request.form.get('nome')
        email = request.form.get('email')
        password = request.form.get('senha')

        if data_manager.get_user_by_email(email):
            flash('Este email já está cadastrado. Tente fazer login.', 'warning')
            return redirect(url_for('public.register'))

        hashed_password = generate_password_hash(password)
        new_user = User(
            id=None,
            username=username,
            email=email,
            password_hash=hashed_password,
            role='user'
        )
        data_manager.save_user(new_user)
        
        flash('Cadastro realizado com sucesso! Faça o login para continuar.', 'success')
        return redirect(url_for('public.login'))

    return render_template('public/register.html')

@public_bp.route('/logout')
@login_required
def logout():
    """Faz o logout do usuário logado."""
    logout_user()
    flash('Você foi desconectado com segurança.', 'info')
    return redirect(url_for('public.home'))


# --- ROTAS DE API PÚBLICA (JSON) ---

@public_bp.route('/api/products')
def get_all_products():
    """API: Retorna todos os produtos para a página de listagem."""
    try:
        products = data_manager.get_products()
        all_filters_map = {f.id: f for f in data_manager.get_filters()}
        
        products_list = []
        for p in products:
            full_product_dict = p.to_dict(simplify=False)
            filter_ids = json.loads(full_product_dict.get('filters', '[]'))
            filter_names = [all_filters_map[fid].name for fid in filter_ids if fid in all_filters_map]
            
            product_type = "Geral"
            for fid in filter_ids:
                if fid in all_filters_map and all_filters_map[fid].type == 'type':
                    product_type = all_filters_map[fid].name
                    break

            simplified_dict = {
                'id': p.id,
                'name': p.name,
                'brand': p.brand,
                'price': p.price,
                'status': p.status,
                'images': p.images,
                'description': p.description,
                'type': product_type,
                'filter_names': filter_names
            }
            products_list.append(simplified_dict)
            
        return jsonify(products_list)
    except Exception as e:
        print(f"Erro na API get_all_products: {e}")
        return jsonify({"error": "Não foi possível carregar os produtos."}), 500

@public_bp.route('/api/products/featured')
def get_featured_products():
    """API: Retorna até 4 produtos marcados como 'Em destaque' para a página inicial."""
    try:
        all_products = data_manager.get_products()
        featured_products = [p for p in all_products if p.status == 'Em destaque']
        
        products_list = []
        for p in featured_products[:4]:
            # Constrói o dicionário manualmente para garantir que 'images' seja uma lista
            product_dict = {
                'id': p.id,
                'name': p.name,
                'brand': p.brand,
                'price': p.price,
                'status': p.status,
                'images': p.images,  # Garante que seja uma lista para o JSON
                'description': p.description,
            }
            products_list.append(product_dict)
            
        return jsonify(products_list)
    except Exception as e:
        print(f"Erro na API get_featured_products: {e}")
        return jsonify({"error": "Não foi possível carregar os produtos em destaque."}), 500
