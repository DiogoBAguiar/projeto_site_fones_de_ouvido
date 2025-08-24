# app/routes/admin.py
# Lida com as rotas do painel de administração e a API de gerenciamento.

import os
import json
import shutil
from functools import wraps
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
    @wraps(f)
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
    return render_template('admin/admin.html')

@admin_page_bp.route('/logout')
@login_required
def admin_logout():
    logout_user()
    return redirect(url_for('public.home'))

# --- ROTAS DA API DE PRODUTOS (CRUD) ---
@admin_api_bp.route('/products', methods=['GET'])
@admin_required
def get_products():
    products = data_manager.get_products()
    return jsonify([p.to_dict(simplify=True) for p in products])

@admin_api_bp.route('/products/<int:product_id>', methods=['GET'])
@admin_required
def get_product(product_id):
    product = data_manager.get_product_by_id(product_id)
    if product:
        return jsonify(product.to_dict())
    return jsonify({"error": "Produto não encontrado"}), 404

@admin_api_bp.route('/products', methods=['POST'])
@admin_required
def create_product():
    try:
        product_data = json.loads(request.form.get('product_data'))
        images = request.files.getlist('images')

        # Passo 1: Cria o produto sem imagens para obter um ID
        new_product = Product(
            id=None, 
            name=product_data['name'], 
            brand=product_data['brand'], 
            price=float(product_data['price']), 
            status=product_data['status'], 
            description=product_data['description'], 
            images=[], 
            specs="", 
            seller_id=current_user.id, 
            filters=product_data.get('filters', [])
        )
        saved_product = data_manager.save_product(new_product)
        product_id = saved_product.id

        # Passo 2: Processa e salva as imagens na pasta com o ID do produto
        image_paths = []
        if images:
            product_upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], str(product_id))
            os.makedirs(product_upload_folder, exist_ok=True)
            
            for image in images:
                filename = secure_filename(image.filename)
                save_path = os.path.join(product_upload_folder, filename)
                image.save(save_path)
                image_paths.append(f"/static/uploads/{product_id}/{filename}")
        
        # Passo 3: Atualiza o produto com os caminhos das imagens e salva novamente
        saved_product.images = image_paths
        data_manager.save_product(saved_product)

        return jsonify({"message": "Produto criado com sucesso!", "product": saved_product.to_dict()}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_api_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
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
            product_upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], str(product_id))
            if os.path.exists(product_upload_folder):
                shutil.rmtree(product_upload_folder) # Remove a pasta antiga de imagens
            os.makedirs(product_upload_folder, exist_ok=True)
            
            image_paths = []
            for image in images:
                filename = secure_filename(image.filename)
                save_path = os.path.join(product_upload_folder, filename)
                image.save(save_path)
                image_paths.append(f"/static/uploads/{product_id}/{filename}")
            product.images = image_paths
        
        data_manager.save_product(product)
        return jsonify({"message": "Produto atualizado com sucesso!", "product": product.to_dict()})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_api_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    if data_manager.delete_product(product_id):
        product_upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], str(product_id))
        if os.path.exists(product_upload_folder):
            shutil.rmtree(product_upload_folder) # Remove a pasta de imagens do produto
        return jsonify({"message": "Produto deletado com sucesso!"}), 204
    return jsonify({"error": "Produto não encontrado"}), 404

# --- ROTAS DA API DE FILTROS ---
@admin_api_bp.route('/filters', methods=['GET'])
@admin_required
def get_filters():
    filters = data_manager.get_filters()
    return jsonify([f.to_dict() for f in filters])

@admin_api_bp.route('/filters', methods=['POST'])
@admin_required
def create_filter():
    data = request.get_json()
    if not data or not data.get('name') or not data.get('type'):
        return jsonify({"error": "Dados incompletos"}), 400
    new_filter = Filter(id=None, name=data['name'], type=data['type'])
    data_manager.save_filter(new_filter)
    return jsonify({"message": "Filtro criado com sucesso!", "filter": new_filter.to_dict()}), 201

@admin_api_bp.route('/filters/<int:filter_id>', methods=['DELETE'])
@admin_required
def delete_filter(filter_id):
    if data_manager.delete_filter(filter_id):
        return jsonify({"message": "Filtro deletado com sucesso!"}), 204
    return jsonify({"error": "Filtro não encontrado"}), 404

# --- ROTA DA API DE ESTATÍSTICAS ---
@admin_api_bp.route('/stats')
@admin_required
def get_stats():
    """API: Fornece dados calculados para a aba de estatísticas."""
    try:
        period = request.args.get('period', 'day')
        total_users = len(data_manager.get_users())
        total_products = len(data_manager.get_products())
        total_visits = data_manager.get_visits_count('12m')
        visits_data = data_manager.get_visits_per_period(period)
        stats = {
            "total_users": total_users,
            "total_products": total_products,
            "total_visits": total_visits,
            "visits_by_period": visits_data
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
