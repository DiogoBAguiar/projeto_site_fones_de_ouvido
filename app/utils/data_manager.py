# app/utils/data_manager.py
# Este módulo contém funções utilitárias para ler e escrever em arquivos CSV,
# agindo como a camada de persistência para a aplicação.

import csv
import os
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from datetime import datetime
import json

DATA_FOLDER = 'banco_de_dados'
USERS_CSV = os.path.join(DATA_FOLDER, 'users.csv')
PRODUCTS_CSV = os.path.join(DATA_FOLDER, 'products.csv')
REVIEWS_CSV = os.path.join(DATA_FOLDER, 'reviews.csv')
FILTERS_CSV = os.path.join(DATA_FOLDER, 'filters.csv')

def read_csv(filepath):
    """Lê um arquivo CSV e retorna uma lista de dicionários."""
    data = []
    if not os.path.exists(filepath):
        return data
        
    with open(filepath, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

def write_csv(filepath, data, fieldnames):
    """Escreve uma lista de dicionários em um arquivo CSV."""
    with open(filepath, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def get_next_id(filepath):
    """Determina o próximo ID disponível para um novo registro."""
    data = read_csv(filepath)
    if data:
        last_id = max(int(row['id']) for row in data)
        return last_id + 1
    return 1

# ==============================================================================
# FUNÇÕES PARA USUÁRIOS
# ==============================================================================

def get_users():
    """Lê o arquivo de usuários e retorna uma lista de objetos User."""
    users_data = read_csv(USERS_CSV)
    return [User(
        id=int(row['id']),
        username=row['username'],
        email=row['email'],
        password_hash=row['password_hash'],
        role=row['role'],
        profile_picture=row.get('profile_picture'),
        date_joined=datetime.fromisoformat(row['date_joined']) if row.get('date_joined') else datetime.utcnow()
    ) for row in users_data]

def get_user_by_email(email):
    """Encontra um usuário por email."""
    users = get_users()
    for user in users:
        if user.email == email:
            return user
    return None

def get_user_by_id(user_id):
    """Encontra um usuário por ID."""
    users = get_users()
    for user in users:
        if str(user.id) == str(user_id):
            return user
    return None

def save_user(user):
    """Salva um novo usuário no arquivo CSV."""
    users = read_csv(USERS_CSV)
    users.append(user.to_dict())
    fieldnames = ['id', 'username', 'email', 'password_hash', 'role', 'profile_picture', 'date_joined']
    write_csv(USERS_CSV, users, fieldnames)
    
def update_user(user):
    """Atualiza um usuário existente no arquivo CSV."""
    users = read_csv(USERS_CSV)
    updated = False
    for i, u in enumerate(users):
        if int(u['id']) == int(user.id):
            users[i] = user.to_dict()
            updated = True
            break
    if updated:
        fieldnames = ['id', 'username', 'email', 'password_hash', 'role', 'profile_picture', 'date_joined']
        write_csv(USERS_CSV, users, fieldnames)

# ==============================================================================
# FUNÇÕES PARA PRODUTOS
# ==============================================================================

def get_products():
    """Lê o arquivo de produtos e retorna uma lista de objetos Product."""
    products_data = read_csv(PRODUCTS_CSV)
    return [Product(
        id=int(row['id']),
        name=row['name'],
        brand=row['brand'],
        price=float(row['price']),
        status=row['status'],
        images=json.loads(row.get('images', '[]')),
        description=row.get('description'),
        specs=row.get('specs'),
        seller_id=int(row['seller_id'])
    ) for row in products_data]

def get_product_by_id(product_id):
    """Encontra um produto por ID."""
    products = get_products()
    for product in products:
        if str(product.id) == str(product_id):
            return product
    return None

def save_product(product):
    """Salva um novo produto no arquivo CSV."""
    products_data = read_csv(PRODUCTS_CSV)
    products_data.append(product.to_dict())
    fieldnames = ['id', 'name', 'brand', 'price', 'status', 'images', 'description', 'specs', 'seller_id']
    write_csv(PRODUCTS_CSV, products_data, fieldnames)

def update_product(product):
    """Atualiza um produto existente no arquivo CSV."""
    products_data = read_csv(PRODUCTS_CSV)
    updated = False
    for i, p in enumerate(products_data):
        if int(p['id']) == int(product.id):
            products_data[i] = product.to_dict()
            updated = True
            break
    if updated:
        fieldnames = ['id', 'name', 'brand', 'price', 'status', 'images', 'description', 'specs', 'seller_id']
        write_csv(PRODUCTS_CSV, products_data, fieldnames)
    
def delete_product(product_id):
    """Deleta um produto do arquivo CSV."""
    products_data = read_csv(PRODUCTS_CSV)
    updated_products = [p for p in products_data if int(p['id']) != int(product_id)]
    fieldnames = ['id', 'name', 'brand', 'price', 'status', 'images', 'description', 'specs', 'seller_id']
    write_csv(PRODUCTS_CSV, updated_products, fieldnames)

# ==============================================================================
# FUNÇÕES PARA FILTROS
# ==============================================================================
# Adicionada a ordem desejada para os filtros
FILTER_ORDER = ['brand', 'type', 'color', 'connectivity']

def get_filters():
    """Lê o arquivo de filtros e retorna uma lista de dicionários."""
    return read_csv(FILTERS_CSV)

def get_filters_by_order():
    """Lê os filtros e os retorna ordenados pela ordem definida."""
    filters = get_filters()
    # Cria um dicionário para mapear a ordem de cada tipo de filtro
    order_map = {filter_type: i for i, filter_type in enumerate(FILTER_ORDER)}
    # Ordena os filtros com base no mapa de ordem
    return sorted(filters, key=lambda f: order_map.get(f['type'], len(FILTER_ORDER)))


def save_filter(filter_data):
    """Salva um novo filtro no arquivo CSV."""
    filters = get_filters()
    filters.append(filter_data)
    fieldnames = ['id', 'name', 'type']
    write_csv(FILTERS_CSV, filters, fieldnames)
    
def delete_filter(filter_id):
    """Deleta um filtro do arquivo CSV."""
    filters = get_filters()
    updated_filters = [f for f in filters if int(f['id']) != int(filter_id)]
    fieldnames = ['id', 'name', 'type']
    write_csv(FILTERS_CSV, updated_filters, fieldnames)

# ==============================================================================
# FUNÇÕES PARA AVALIAÇÕES (REVIEWS)
# ==============================================================================

def get_reviews():
    """Lê o arquivo de avaliações e retorna uma lista de objetos Review."""
    reviews_data = read_csv(REVIEWS_CSV)
    return [Review.from_dict(row) for row in reviews_data]

def get_reviews_by_product_id(product_id):
    """Encontra avaliações por ID do produto."""
    reviews = get_reviews()
    return [r for r in reviews if str(r.product_id) == str(product_id)]

def save_review(review):
    """Salva uma nova avaliação no arquivo CSV."""
    reviews_data = read_csv(REVIEWS_CSV)
    reviews_data.append(review.to_dict())
    fieldnames = ['id', 'rating', 'comment', 'media_url', 'date_posted', 'user_id', 'product_id']
    write_csv(REVIEWS_CSV, reviews_data, fieldnames)

def delete_review(review_id):
    """Deleta uma avaliação do arquivo CSV."""
    reviews_data = read_csv(REVIEWS_CSV)
    updated_reviews = [r for r in reviews_data if int(r['id']) != int(review_id)]
    fieldnames = ['id', 'rating', 'comment', 'media_url', 'date_posted', 'user_id', 'product_id']
    write_csv(REVIEWS_CSV, updated_reviews, fieldnames)
