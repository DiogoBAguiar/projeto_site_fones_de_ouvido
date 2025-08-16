# routes/admin.py
# Este arquivo é um Blueprint que agrupa todas as rotas
# de gerenciamento de produtos da sua aplicação.

from flask import Blueprint, request, jsonify
import json
import os
import pandas as pd

# Define o caminho do arquivo de dados e as funções de lógica de negócio
# para que o Blueprint possa acessá-las.
# Em projetos maiores, essas funções de lógica de negócio seriam movidas
# para um arquivo de "serviços" separado para maior modularidade.
DATA_FOLDER = '../../banco_de_dados/produtos/'
PRODUCTS_CSV = os.path.join(DATA_FOLDER, 'products.csv')

def read_products_from_csv():
    """Lê os produtos do arquivo CSV e retorna como uma lista de dicionários."""
    if not os.path.exists(PRODUCTS_CSV):
        return []
    df = pd.read_csv(PRODUCTS_CSV)
    df['images'] = df['images'].apply(eval)
    return df.to_dict('records')

def write_products_to_csv(products):
    """Escreve uma lista de produtos no arquivo CSV."""
    df = pd.DataFrame(products)
    df.to_csv(PRODUCTS_CSV, index=False)

def add_product_logic(product_data, image_files):
    """Lógica para adicionar um produto e salvar suas imagens."""
    product_id = product_data['id']
    image_folder = os.path.join(DATA_FOLDER, product_id)
    os.makedirs(image_folder, exist_ok=True)
    
    image_paths = []
    for image in image_files:
        image_path = os.path.join(image_folder, image.filename)
        image.save(image_path)
        image_paths.append(f'/{image_path}')

    product_data['images'] = image_paths
    products = read_products_from_csv()
    products.append(product_data)
    write_products_to_csv(products)
    
    return product_data

def remove_product_logic(product_id):
    """Lógica para remover um produto e sua pasta de imagens."""
    products = read_products_from_csv()
    products = [p for p in products if p['id'] != product_id]
    write_products_to_csv(products)
    
    image_folder = os.path.join(DATA_FOLDER, product_id)
    if os.path.exists(image_folder):
        for file_name in os.listdir(image_folder):
            os.remove(os.path.join(image_folder, file_name))
        os.rmdir(image_folder)

# Cria o Blueprint
admin_bp = Blueprint('admin', __name__, url_prefix='/api/produtos')

@admin_bp.route('/', methods=['GET'])
def get_products():
    """Rota para obter todos os produtos."""
    products = read_products_from_csv()
    return jsonify(products)

@admin_bp.route('/', methods=['POST'])
def add_product():
    """Rota para adicionar um novo produto."""
    try:
        product_data = json.loads(request.form['product_data'])
        new_product = add_product_logic(product_data, request.files.getlist('images'))
        return jsonify({"message": "Produto adicionado com sucesso!", "product": new_product}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/<string:product_id>', methods=['DELETE'])
def remove_product(product_id):
    """Rota para remover um produto pelo ID."""
    try:
        remove_product_logic(product_id)
        return jsonify({"message": "Produto removido com sucesso!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
