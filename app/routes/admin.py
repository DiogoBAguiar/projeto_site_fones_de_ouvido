# app/routes/admin.py
# Este arquivo é um Blueprint que agrupa todas as rotas
# de gerenciamento de produtos e do painel de controle da sua aplicação.

from flask import Blueprint, request, jsonify, render_template
from app import db
from app.models.product import Product
import json
import os

# Define o caminho para a pasta de uploads
UPLOAD_FOLDER = 'app/static/uploads'

# ==============================================================================
# BLUEPRINT DA PÁGINA DE ADMINISTRAÇÃO
# ==============================================================================
# Este Blueprint lida apenas com a rota que serve a página HTML.
admin_page_bp = Blueprint('admin_page', __name__, url_prefix='/admin')

@admin_page_bp.route('/')
def admin():
    """Rota para a página de administrador."""
    return render_template('admin/admin.html')

# ==============================================================================
# BLUEPRINT DA API DE PRODUTOS
# ==============================================================================
# Este Blueprint lida com os endpoints da API para gerenciar produtos.
admin_api_bp = Blueprint('admin_api', __name__, url_prefix='/api/produtos')

@admin_api_bp.route('/', methods=['GET'])
def get_products():
    """Rota de API para obter todos os produtos do banco de dados."""
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
def add_product():
    """Rota de API para adicionar um novo produto."""
    try:
        # Acessa os dados do formulário com get para evitar KeyError
        product_data_json = request.form.get('product_data')
        images = request.files.getlist('images')

        if not product_data_json:
            return jsonify({"error": "Dados do produto ausentes."}), 400

        product_data = json.loads(product_data_json)
        
        # Lógica para salvar as imagens
        image_paths = []
        if images:
            # Pega o último ID para o diretório
            last_product = Product.query.order_by(Product.id.desc()).first()
            new_id = (last_product.id + 1) if last_product else 1
            
            product_image_folder = os.path.join(UPLOAD_FOLDER, str(new_id))
            os.makedirs(product_image_folder, exist_ok=True)
            for image in images:
                image_path = os.path.join(product_image_folder, image.filename)
                image.save(image_path)
                # Garante que o caminho seja relativo à pasta 'static'
                image_paths.append(f'/static/uploads/{new_id}/{image.filename}')

        # Cria a nova instância do produto
        new_product = Product(
            name=product_data['name'],
            brand=product_data['brand'],
            price=product_data['price'],
            status=product_data['status'],
            images=json.dumps(image_paths),
            seller_id=1 # TODO: Lógica para pegar o ID do usuário logado
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
def remove_product(product_id):
    """Rota de API para remover um produto pelo ID."""
    try:
        product_to_remove = Product.query.get_or_404(product_id)
        
        db.session.delete(product_to_remove)
        db.session.commit()

        return jsonify({"message": "Produto removido com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ==============================================================================
# BLUEPRINT DA API DO DASHBOARD
# ==============================================================================
# Este Blueprint lida com os endpoints da API para os dados do dashboard.
dashboard_api_bp = Blueprint('dashboard_api', __name__, url_prefix='/api/dashboard')

@dashboard_api_bp.route('/', methods=['GET'])
def get_dashboard_data():
    """Rota de API para obter os dados do dashboard com base no timeRange."""
    time_range = request.args.get('timeRange', '30d') # Valor padrão de 30 dias
    
    # Simula dados do painel. Em uma aplicação real, estes dados viriam do banco de dados.
    mock_data = {
        "24h": {
            "totalRevenue": { "value": "R$ 1.250,00", "change": "+15%", "changeType": "increase", "description": "do que nas últimas 24h" },
            "subscriptions": { "value": "+10", "change": "+25%", "changeType": "increase", "description": "do que nas últimas 24h" },
            "sales": { "value": "+5", "change": "-5%", "changeType": "decrease", "description": "do que nas últimas 24h" },
            "activeNow": { "value": "12", "change": "+3", "changeType": "increase", "description": "visitantes ativos agora" },
            "analytics": [ { "name": "1h", "total": 300 }, { "name": "2h", "total": 280 } ],
            "recentSales": [ { "email": "olivia.martin@email.com", "amount": "R$ 150,00" } ]
        },
        "7d": {
            "totalRevenue": { "value": "R$ 8.500,00", "change": "+5.1%", "changeType": "increase", "description": "do que nos últimos 7 dias" },
            "subscriptions": { "value": "+45", "change": "+10%", "changeType": "increase", "description": "do que nos últimos 7 dias" },
            "sales": { "value": "+30", "change": "+2%", "changeType": "increase", "description": "do que nos últimos 7 dias" },
            "activeNow": { "value": "48", "change": "+15", "changeType": "increase", "description": "visitantes ativos agora" },
            "analytics": [ { "name": "Dia 1", "total": 500 }, { "name": "Dia 2", "total": 600 } ],
            "recentSales": [ { "email": "john.doe@email.com", "amount": "R$ 450,00" } ]
        },
        "30d": {
            "totalRevenue": { "value": "R$ 35.000,00", "change": "+12.1%", "changeType": "increase", "description": "do que nos últimos 30 dias" },
            "subscriptions": { "value": "+120", "change": "+8%", "changeType": "increase", "description": "do que nos últimos 30 dias" },
            "sales": { "value": "+100", "change": "+15%", "changeType": "increase", "description": "do que nos últimos 30 dias" },
            "activeNow": { "value": "105", "change": "+40", "changeType": "increase", "description": "visitantes ativos agora" },
            "analytics": [ { "name": "Sem 1", "total": 5000 }, { "name": "Sem 2", "total": 7500 } ],
            "recentSales": [ { "email": "jane.smith@email.com", "amount": "R$ 300,00" } ]
        },
        "12m": {
            "totalRevenue": { "value": "R$ 450.000,00", "change": "+20%", "changeType": "increase", "description": "do que nos últimos 12 meses" },
            "subscriptions": { "value": "+450", "change": "+18%", "changeType": "increase", "description": "do que nos últimos 12 meses" },
            "sales": { "value": "+1500", "change": "+22%", "changeType": "increase", "description": "do que nos últimos 12 meses" },
            "activeNow": { "value": "200", "change": "+50", "changeType": "increase", "description": "visitantes ativos agora" },
            "analytics": [ { "name": "Jan", "total": 20000 }, { "name": "Fev", "total": 25000 } ],
            "recentSales": [ { "email": "diogo.baguiar@email.com", "amount": "R$ 500,00" } ]
        }
    }
    
    return jsonify(mock_data.get(time_range, {}))

@dashboard_api_bp.route('/filters', methods=['POST'])
def add_filter():
    """Rota de API para adicionar um novo filtro."""
    try:
        filter_data = request.get_json()
        if not filter_data or 'type' not in filter_data or 'name' not in filter_data:
            return jsonify({"error": "Dados do filtro ausentes."}), 400

        # Retorna o filtro recebido na resposta para o frontend
        return jsonify({"message": "Filtro adicionado com sucesso!", "filter": filter_data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
