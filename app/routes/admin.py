# app/routes/admin.py
# Este arquivo é um Blueprint que agrupa todas as rotas
# de gerenciamento de produtos e do painel de controle da sua aplicação.
# O código foi refatorado para usar dados reais dos arquivos CSV.

from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from app import db
from app.models.product import Product
from app.models.user import User
from flask_login import login_required, current_user, login_user, logout_user
import json
import os
import pandas as pd
import io
from werkzeug.security import check_password_hash, generate_password_hash

# Define o caminho para a pasta de uploads
UPLOAD_FOLDER = 'app/static/uploads'

# ==============================================================================
# BLUEPRINT DA PÁGINA DE ADMINISTRAÇÃO E LOGIN
# ==============================================================================
# Este Blueprint lida com as rotas que servem as páginas HTML.
admin_page_bp = Blueprint('admin_page', __name__, url_prefix='/admin')

@admin_page_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    """Rota para a página de login de administrador."""
    # Se o usuário já estiver autenticado e for admin, redireciona para o dashboard
    if current_user.is_authenticated and current_user.role == 'admin':
        return redirect(url_for('admin_page.admin'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('senha')
        user = User.query.filter_by(email=email).first()
        
        # Verifica se o usuário existe, se é um admin e se a senha está correta
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
    # Garante que apenas usuários com o papel 'admin' possam acessar a página
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
        # Lê o arquivo CSV com pandas
        df = pd.read_csv(filepath)
        # Filtra os dados com base no 'timeRange' fornecido
        filtered_df = df[df['timeRange'] == time_range]
        # Converte o DataFrame filtrado para um dicionário de registros
        return filtered_df.to_dict('records')
    except Exception as e:
        print(f"Erro ao ler o arquivo CSV {filepath}: {e}")
        return []

# ==============================================================================
# BLUEPRINT DA API DO DASHBOARD
# ==============================================================================
# Este Blueprint lida com os endpoints da API para os dados do dashboard.
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
    
    time_range = request.args.get('timeRange', '30d') # Valor padrão de 30 dias

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
# BLUEPRINT DA API DE PRODUTOS
# ==============================================================================
# Este Blueprint lida com os endpoints da API para gerenciar produtos.
admin_api_bp = Blueprint('admin_api', __name__, url_prefix='/api/produtos')

@admin_api_bp.route('/', methods=['GET'])
@login_required
def get_products():
    """Rota de API para obter todos os produtos do banco de dados."""
    if current_user.role != 'admin':
        return jsonify({"error": "Acesso não autorizado."}), 403
        
    try:
        products = Product.query.all()
        products_list = []
        for product in products:
            products_list.append({
                'id': product.id,
                'name': product.name,
                'brand': product.brand,
                'price': product.price,
                'status': product.status,
                'images': product.get_images()
            })
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_api_bp.route('/', methods=['POST'])
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
        
        # Lógica para salvar as imagens
        image_paths = []
        # TODO: Adicionar lógica para salvar imagens
        # A lógica abaixo é um placeholder, a implementação real dependerá da sua arquitetura
        if images:
            for image in images:
                # Exemplo simples, precisa de uma lógica mais robusta para nomes de arquivos
                image_path = os.path.join(UPLOAD_FOLDER, image.filename)
                image.save(image_path)
                image_paths.append(f'/static/uploads/{image.filename}')

        new_product = Product(
            name=product_data['name'],
            brand=product_data['brand'],
            price=product_data['price'],
            status=product_data['status'],
            images=json.dumps(image_paths),
            seller_id=current_user.id # Agora usa o ID do usuário logado
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

@admin_api_bp.route('/<int:product_id>', methods=['DELETE'])
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

        # TODO: Lógica para salvar o filtro no banco de dados.

        return jsonify({"message": "Filtro adicionado com sucesso!", "filter": filter_data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
