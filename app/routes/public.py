# app/routes/public.py
# Este Blueprint lida com as rotas acessíveis ao público.

from flask import Blueprint, render_template, request, jsonify
from app import db # Importa a instância do SQLAlchemy
from app.models.product import Product # Importa o modelo de Produto

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

@public_bp.route('/login')
def login():
    """Rota para a página de login."""
    return render_template('public/login.html')

@public_bp.route('/register')
def register():
    """Rota para a página de registro."""
    return render_template('public/register.html')

@public_bp.route('/api/produtos/destaques', methods=['GET'])
def get_featured_products():
    """
    Rota de API para obter uma lista de produtos em destaque.
    Para simular, retornamos os primeiros 4 produtos do banco de dados.
    """
    try:
        featured_products = Product.query.limit(4).all()
        
        products_list = []
        for product in featured_products:
            products_list.append({
                'id': product.id,
                'name': product.name,
                'description': 'Conforto e potência.', # Adicione uma descrição, ou busque do banco de dados se tiver
                'price': product.price,
                'images': product.get_images()
            })
        return jsonify(products_list)
    except Exception as e:
        return jsonify({"error": "Ocorreu um erro ao buscar os produtos em destaque."}), 500

@public_bp.route('/api/produtos/<int:product_id>', methods=['GET'])
def get_product_details(product_id):
    """
    Rota de API para obter os detalhes de um produto específico.
    """
    try:
        product = Product.query.get_or_404(product_id)
        return jsonify({
            'id': product.id,
            'name': product.name,
            'brand': product.brand,
            'price': product.price,
            'status': product.status,
            'images': product.get_images(),
        })
    except Exception as e:
        return jsonify({"error": "Produto não encontrado."}), 404

@public_bp.route('/api/products', methods=['GET'])
def get_all_products():
    """Rota de API para obter todos os produtos em formato JSON."""
    all_products = Product.query.all()
    products_list = []
    for product in all_products:
        products_list.append({
            'id': product.id,
            'name': product.name,
            'brand': product.brand,
            'price': product.price,
            'status': product.status,
            'images': product.get_images(),
            'type': 'Tipo 1' # Atributo mockado para os filtros
        })
    return jsonify(products_list)
