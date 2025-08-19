# app/routes/admin.py
# Este Blueprint lida com as rotas de gerenciamento e o painel de controle.
# Conectado ao banco de dados e aos arquivos CSV para dados dinâmicos.

from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from app import db
from app.models.product import Product
from app.models.user import User
from flask_login import login_required, current_user, login_user, logout_user
import json
import os
import pandas as pd
import io
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
        user = User.query.filter_by(email=email).first()
        
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
    """Lê um arquivo CSV e filtra por timeRange."""
    try:
        df = pd.read_csv(filepath)
        filtered_df = df[df['timeRange'] == time_range]
        return filtered_df.to_dict('records')
    except Exception as e:
        print(f"Erro ao ler o arquivo CSV {filepath}: {e}")
        return []

# ==============================================================================
# BLUEPRINT DA API DO DASHBOARD
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
    
    # Lógica para ler os arquivos CSV e montar a resposta
    kpis_data = read_csv_data('kpis.csv', time_range)
    analytics_data = read_csv_data('analytics.csv', time_range)
    recent_sales_data = read_csv_data('recent_sales.csv', time_range)

    # Converte os dados para o formato esperado pelo front-end
    dashboard_data = {
        "kpis": kpis_data,
        "analytics": analytics_data,
        "recentSales": recent_sales_data
    }
    
    return jsonify(dashboard_data)

# ==============================================================================
# BLUEPRINT DA API DE PRODUTOS, MARCAS E USUÁRIOS
# ==============================================================================
admin_api_bp = Blueprint('admin_api', __name__, url_prefix='/api/admin')

@admin_api_bp.route('/products', methods=['GET'])
@login_required
def get_products():
    """Rota de API para obter todos os produtos do banco de dados."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
        
    try:
        products = Product.query.all()
        products_list = []
        for product in products:
            try:
                images = json.loads(product.images) if product.images else []
            except json.JSONDecodeError:
                images = []
            products_list.append({
                'id': product.id,
                'name': product.name,
                'brand': product.brand,
                'price': product.price,
                'status': product.status,
                'images': images
            })
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api_bp.route('/products', methods=['POST'])
@login_required
def add_product():
    """Rota de API para adicionar um novo produto."""
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
            product_image_folder = os.path.join(UPLOAD_FOLDER, secure_filename(product_data['name']))
            os.makedirs(product_image_folder, exist_ok=True)
            for image in images:
                filename = secure_filename(image.filename)
                image_path = os.path.join(product_image_folder, filename)
                image.save(image_path)
                image_paths.append(f'/static/uploads/{secure_filename(product_data["name"])}/{filename}')

        new_product = Product(
            name=product_data['name'],
            brand=product_data['brand'],
            price=product_data['price'],
            status=product_data['status'],
            images=json.dumps(image_paths),
            seller_id=current_user.id
        )

        db.session.add(new_product)
        db.session.commit()

        return jsonify({"message": "Produto adicionado com sucesso!", "product": product_data}), 201
    except json.JSONDecodeError:
        db.session.rollback()
        return jsonify({"error": "Dados JSON do produto mal formatados."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@admin_api_bp.route('/products/<int:product_id>', methods=['DELETE'])
@login_required
def remove_product(product_id):
    """Rota de API para remover um produto pelo ID."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403

    try:
        product_to_remove = Product.query.get_or_404(product_id)
        
        db.session.delete(product_to_remove)
        db.session.commit()

        return jsonify({"message": "Produto removido com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@admin_api_bp.route('/users', methods=['GET'])
@login_required
def get_users():
    """Rota de API para obter todos os usuários."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
    try:
        users = User.query.all()
        users_list = []
        for user in users:
            users_list.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'date_joined': user.date_joined.strftime('%d/%m/%Y %H:%M:%S')
            })
        return jsonify(users_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@admin_api_bp.route('/brands', methods=['GET'])
@login_required
def get_brands():
    """Rota de API para obter todas as marcas únicas de produtos."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
    try:
        brands = db.session.query(Product.brand).distinct().all()
        brands_list = [brand[0] for brand in brands]
        return jsonify([{'name': brand} for brand in brands_list])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api_bp.route('/filters', methods=['POST'])
@login_required
def add_filter():
    """Rota de API para adicionar um novo filtro."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
        
    try:
        filter_data = request.get_json()
        if not filter_data or 'type' not in filter_data or 'name' not in filter_data:
            return jsonify({"error": "Dados do filtro ausentes."}), 400

        return jsonify({"message": "Filtro adicionado com sucesso!", "filter": filter_data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
