# app/routes/admin.py
# Lida com as rotas do painel de administração e a API de gerenciamento.

import os
import json
from functools import wraps  # <-- 1. IMPORTAR O WRAPS
from flask import (
    Blueprint, request, jsonify, render_template, redirect, url_for, flash, current_app
)
from flask_login import login_required, current_user, login_user, logout_user
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

from app.models.product import Product
from app.models.filter import Filter
from app.utils import data_manager

# --- BLUEPRINTS ---
admin_page_bp = Blueprint('admin_page', __name__)
admin_api_bp = Blueprint('admin_api', __name__)


# --- FUNÇÃO AUXILIAR DE SEGURANÇA ---

def admin_required(f):
    """Decorator para garantir que o usuário é um administrador."""
    @wraps(f)  # <-- 2. ADICIONAR ESTA LINHA
    @login_required
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            flash('Acesso negado. Você precisa ser um administrador.', 'danger')
            return redirect(url_for('public.home'))
        return f(*args, **kwargs)
    return decorated_function

# --- ROTAS DA PÁGINA DE ADMINISTRAÇÃO (HTML) ---

@admin_page_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    """Rota para a página de login de administrador."""
    if current_user.is_authenticated and current_user.role == 'admin':
        return redirect(url_for('admin_page.admin_dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('senha')
        user = data_manager.get_user_by_email(email)
        
        if user and user.role == 'admin' and check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            return redirect(url_for('admin_page.admin_dashboard'))
        else:
            flash('Login de administrador inválido.', 'danger')
            
    return render_template('admin/login_admin.html')

@admin_page_bp.route('/')
@admin_required
def admin_dashboard():
    """Rota principal que renderiza o painel de administração."""
    return render_template('admin/admin.html')

@admin_page_bp.route('/logout')
@login_required
def admin_logout():
    """Rota para fazer logout do administrador."""
    logout_user()
    return redirect(url_for('public.home'))

# --- ROTAS DA API DE PRODUTOS (CRUD) ---

@admin_api_bp.route('/products', methods=['GET'])
@admin_required
def get_products():
    """API: Retorna a lista de todos os produtos."""
    products = data_manager.get_products()
    return jsonify([p.to_dict(simplify=True) for p in products])

@admin_api_bp.route('/products/<int:product_id>', methods=['GET'])
@admin_required
def get_product(product_id):
    """API: Retorna os detalhes de um único produto."""
    product = data_manager.get_product_by_id(product_id)
    if product:
        return jsonify(product.to_dict())
    return jsonify({"error": "Produto não encontrado"}), 404

@admin_api_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    """API: Cria um novo produto."""
    try:
        product_data = json.loads(request.form.get('product_data'))
        images = request.files.getlist('images')

        image_paths = []
        if images:
            product_name_sanitized = secure_filename(product_data['name'])
            for image in images:
                filename = f"{product_name_sanitized}_{secure_filename(image.filename)}"
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                image.save(save_path)
                image_paths.append(f"/static/uploads/{filename}")

        new_product = Product(
            id=None,
            name=product_data['name'],
            brand=product_data['brand'],
            price=float(product_data['price']),
            status=product_data['status'],
            description=product_data['description'],
            images=image_paths,
            specs="",
            seller_id=current_user.id,
            filters=product_data.get('filters', [])
        )
        data_manager.save_product(new_product)
        return jsonify({"message": "Produto criado com sucesso!", "product": new_product.to_dict()}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_api_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    """API: Atualiza um produto existente."""
    try:
        product = data_manager.get_product_by_id(product_id)
        if not product:
            return jsonify({"error": "Produto não encontrado"}), 404

        product_data = json.loads(request.form.get('product_data'))
        images = request.files.getlist('images')

        product.name = product_data['name']
        product.brand = product_data['brand']
        product.price = float(product_data['price'])
        product.status = product_data['status']
        product.description = product_data['description']
        product.filters = product_data.get('filters', [])

        if images:
            image_paths = []
            product_name_sanitized = secure_filename(product_data['name'])
            for image in images:
                filename = f"{product_name_sanitized}_{secure_filename(image.filename)}"
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                image.save(save_path)
                image_paths.append(f"/static/uploads/{filename}")
            product.images = image_paths

        data_manager.save_product(product)
        return jsonify({"message": "Produto atualizado com sucesso!", "product": product.to_dict()})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_api_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    """API: Deleta um produto."""
    if data_manager.delete_product(product_id):
        return jsonify({"message": "Produto deletado com sucesso!"})
    return jsonify({"error": "Produto não encontrado"}), 404

# --- ROTAS DA API DE FILTROS ---

@admin_api_bp.route('/filters', methods=['GET'])
@admin_required
def get_filters():
    """API: Retorna a lista de todos os filtros."""
    filters = data_manager.get_filters()
    return jsonify([f.to_dict() for f in filters])

@admin_api_bp.route('/filters', methods=['POST'])
@admin_required
def create_filter():
    """API: Cria um novo filtro."""
    data = request.get_json()
    if not data or not data.get('name') or not data.get('type'):
        return jsonify({"error": "Dados incompletos"}), 400
    
    new_filter = Filter(id=None, name=data['name'], type=data['type'])
    data_manager.save_filter(new_filter)
    return jsonify({"message": "Filtro criado com sucesso!", "filter": new_filter.to_dict()}), 201

# --- ROTAS DA API DE USUÁRIOS E DASHBOARD ---

@admin_api_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """API: Retorna a lista de todos os usuários."""
    users = data_manager.get_users()
    return jsonify([
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "date_joined": user.date_joined.isoformat()
        } for user in users
    ])

@admin_api_bp.route('/dashboard', methods=['GET'])
@admin_required
def get_dashboard_data():
    """API: Fornece dados para o dashboard."""
    time_range = request.args.get('timeRange', '30d')
    total_visits = data_manager.get_visits_count(time_range)
    
    mock_data = {
        "kpis": [
            {"metric": "faturamento", "value": 15750.80},
            {"metric": "vendas", "value": 89},
            {"metric": "novos_usuarios", "value": 23},
        ],
        "totalVisits": total_visits,
        "analytics": [
            {"date": "2025-08-01", "sales": 1200},
            {"date": "2025-08-02", "sales": 1900},
            {"date": "2025-08-03", "sales": 1500},
        ],
        "recentSales": [
            {"email": "diogo@email.com", "amount": 1299.90}
        ]
    }
    return jsonify(mock_data)
