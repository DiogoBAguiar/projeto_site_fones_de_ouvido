# app/routes/admin.py
# Este Blueprint lida com as rotas de gerenciamento e o painel de controle.
# Corrigido para garantir o funcionamento do CRUD de produtos e filtros.

from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from app.models.product import Product
from app.models.user import User
from app.models.filter import Filter
from app.utils import data_manager
from flask_login import login_required, current_user, login_user, logout_user
import json
import os
import pandas as pd
from werkzeug.security import check_password_hash
from werkzeug.utils import secure_filename

# Define o caminho para a pasta de uploads
UPLOAD_FOLDER = 'app/static/uploads'

# ==============================================================================
# BLUEPRINT DA PÁGINA DE ADMINISTRAÇÃO E LOGIN
# ==============================================================================
admin_page_bp = Blueprint('admin_page', __name__, url_prefix='/admin')

@admin_page_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    """Rota para a página de login de administrador."""
    if current_user.is_authenticated and current_user.role == 'admin':
        return redirect(url_for('admin_page.admin'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('senha')
        user = data_manager.get_user_by_email(email)
        
        if user and user.role == 'admin' and check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            return redirect(url_for('admin_page.admin'))
        else:
            flash('Login de administrador inválido.', 'danger')
            
    return render_template('admin/login_admin.html')

@admin_page_bp.route('/')
@login_required
def admin():
    """Rota para a página de administrador, protegida por login."""
    if not current_user.is_authenticated or current_user.role != 'admin':
        flash('Você não tem permissão para acessar esta página.', 'danger')
        return redirect(url_for('public.home'))
    return render_template('admin/admin.html')

@admin_page_bp.route('/logout')
@login_required
def admin_logout():
    """Rota para fazer logout do administrador."""
    logout_user()
    return redirect(url_for('admin_page.admin_login'))

# ==============================================================================
# FUNÇÕES DE LEITURA DE CSV
# ==============================================================================

def read_csv_data(filepath, time_range):
    """Lê um arquivo CSV e filtra por timeRange usando pandas."""
    try:
        df = pd.read_csv(filepath)
        filtered_df = df[df['timeRange'] == time_range]
        return filtered_df.to_dict('records')
    except Exception as e:
        print(f"Erro ao ler o arquivo CSV {filepath}: {e}")
        return []

# ==============================================================================
# BLUEPRINT DA API DE ADMINISTRAÇÃO
# ==============================================================================
admin_api_bp = Blueprint('admin_api', __name__, url_prefix='/api/admin')

@admin_api_bp.route('/products', methods=['GET'])
@login_required
def get_products():
    """Rota de API para obter todos os produtos do CSV."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
        
    try:
        products = data_manager.get_products()
        products_list = [p.to_dict() for p in products]
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api_bp.route('/products', methods=['POST'])
@login_required
def add_product():
    """Rota de API para adicionar um novo produto ao CSV."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
        
    try:
        product_data_json = request.form.get('product_data')
        images = request.files.getlist('images')

        if not product_data_json:
            return jsonify({"error": "Dados do produto ausentes."}), 400

        product_data = json.loads(product_data_json)
        
        image_paths = []
        if images:
            product_folder_name = secure_filename(product_data['name']).replace(' ', '_')
            product_image_folder = os.path.join(UPLOAD_FOLDER, product_folder_name)
            os.makedirs(product_image_folder, exist_ok=True)
            for image in images:
                filename = secure_filename(image.filename)
                image_path = os.path.join(product_image_folder, filename)
                image.save(image_path)
                image_paths.append(f'/static/uploads/{product_folder_name}/{filename}')

        new_product = Product(
            id=data_manager.get_next_id(data_manager.PRODUCTS_CSV),
            name=product_data['name'],
            brand=product_data['brand'],
            price=product_data['price'],
            description=product_data['description'],
            status=product_data['status'],
            images=image_paths,
            seller_id=current_user.id
        )

        data_manager.save_product(new_product)

        return jsonify({"message": "Produto adicionado com sucesso!", "product": new_product.to_dict()}), 201
    except json.JSONDecodeError:
        return jsonify({"error": "Dados JSON do produto mal formatados."}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api_bp.route('/products/<int:product_id>', methods=['DELETE'])
@login_required
def remove_product(product_id):
    """Rota de API para remover um produto do CSV pelo ID."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403

    try:
        data_manager.delete_product(product_id)
        return jsonify({"message": "Produto removido com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_api_bp.route('/users', methods=['GET'])
@login_required
def get_users():
    """Rota de API para obter todos os usuários do CSV."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
    try:
        users = data_manager.get_users()
        users_list = [user.to_dict() for user in users]
        return jsonify(users_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@admin_api_bp.route('/brands', methods=['GET'])
@login_required
def get_brands():
    """
    Rota de API para obter todas as marcas únicas do CSV.
    Ajustado para ler do arquivo de filtros.
    """
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
    try:
        filters = data_manager.get_filters()
        brands = [f for f in filters if f['type'] == 'brand']
        return jsonify(brands)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================================================================
# BLUEPRINT DA API DO DASHBOARD (Ainda usa CSVs estáticos com Pandas)
# ==============================================================================
dashboard_api_bp = Blueprint('dashboard_api', __name__, url_prefix='/api/dashboard')

@dashboard_api_bp.route('/', methods=['GET'])
@login_required
def get_dashboard_data():
    """
    Rota de API para obter os dados do dashboard com base no timeRange.
    Os dados são lidos dos arquivos CSV.
    """
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
    
    time_range = request.args.get('timeRange', '30d')
    
    kpis_data = read_csv_data('kpis.csv', time_range)
    analytics_data = read_csv_data('analytics.csv', time_range)
    recent_sales_data = read_csv_data('recent_sales.csv', time_range)

    dashboard_data = {
        "kpis": kpis_data,
        "analytics": analytics_data,
        "recentSales": recent_sales_data
    }
    
    return jsonify(dashboard_data)

# ==============================================================================
# API PARA GERENCIAMENTO DE FILTROS
# ==============================================================================
@admin_api_bp.route('/filters', methods=['GET'])
@login_required
def get_filters():
    """Rota de API para obter todos os filtros ativos do CSV."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
    try:
        filters = data_manager.get_filters()
        return jsonify(filters)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api_bp.route('/filters', methods=['POST'])
@login_required
def add_filter():
    """Rota de API para adicionar um novo filtro ao CSV."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
        
    try:
        filter_data = request.get_json()
        name = filter_data.get('name')
        type = filter_data.get('type')
        
        if not name or not type:
            return jsonify({"error": "Dados do filtro ausentes."}), 400

        # Verifica se o filtro já existe
        existing_filters = data_manager.get_filters()
        if any(f['name'] == name for f in existing_filters):
            return jsonify({"error": "Este filtro já existe."}), 409
            
        new_filter_data = {
            'id': data_manager.get_next_id(data_manager.FILTERS_CSV),
            'name': name,
            'type': type
        }
        data_manager.save_filter(new_filter_data)

        return jsonify({"message": "Filtro adicionado com sucesso!", "filter": new_filter_data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api_bp.route('/filters/<int:filter_id>', methods=['DELETE'])
@login_required
def remove_filter(filter_id):
    """Rota de API para remover um filtro do CSV pelo ID."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
        
    try:
        data_manager.delete_filter(filter_id)
        return jsonify({"message": "Filtro removido com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
