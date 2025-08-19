# app/routes/admin.py
# Este arquivo é um Blueprint que agrupa todas as rotas
# de gerenciamento de produtos da sua aplicação.

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
        product_data = json.loads(request.form['product_data'])
        images = request.files.getlist('images')

        # Lógica de criação e salvamento do produto...
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
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

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
