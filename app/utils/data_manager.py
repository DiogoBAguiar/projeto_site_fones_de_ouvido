# app/utils/data_manager.py
# Este módulo contém funções utilitárias para ler e escrever em arquivos CSV,
# agindo como a camada de persistência para a aplicação.
# Refatorado para adicionar a lógica de contagem de visitas.

import csv
import os
import json
from datetime import datetime, timedelta
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
import pandas as pd

# Define a pasta e os caminhos dos arquivos de dados
DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'banco_de_dados')
USERS_CSV = os.path.join(DATA_FOLDER, 'users.csv')
PRODUCTS_CSV = os.path.join(DATA_FOLDER, 'products.csv')
REVIEWS_CSV = os.path.join(DATA_FOLDER, 'reviews.csv')
FILTERS_CSV = os.path.join(DATA_FOLDER, 'filters.csv')
VISITS_CSV = os.path.join(DATA_FOLDER, 'visits.csv')
KPI_CSV = os.path.join(DATA_FOLDER, 'kpis.csv')
ANALYTICS_CSV = os.path.join(DATA_FOLDER, 'analytics.csv')
RECENT_SALES_CSV = os.path.join(DATA_FOLDER, 'recent_sales.csv')

# Define a ordem dos filtros para garantir consistência
FILTER_ORDER = ['brand', 'type', 'color', 'connectivity']

# Define a lista de campos para cada arquivo CSV para garantir consistência
<<<<<<< HEAD
# Adicionado 'filters' para garantir que o campo seja reconhecido
=======
>>>>>>> 1b4e935136347d77e107e7a9d2ac5221539c0e8b
PRODUCTS_FIELDNAMES = ['id', 'name', 'brand', 'price', 'status', 'images', 'description', 'specs', 'seller_id', 'filters']
USERS_FIELDNAMES = ['id', 'username', 'email', 'password_hash', 'role', 'profile_picture', 'date_joined']
FILTERS_FIELDNAMES = ['id', 'name', 'type']
REVIEWS_FIELDNAMES = ['id', 'rating', 'comment', 'media_url', 'date_posted', 'user_id', 'product_id']
VISITS_FIELDNAMES = ['id', 'timestamp']
<<<<<<< HEAD


def read_csv(filepath):
    # ... (código existente) ...
=======

def read_csv(filepath):
>>>>>>> 1b4e935136347d77e107e7a9d2ac5221539c0e8b
    """
    Lê um arquivo CSV e retorna uma lista de dicionários.
    Retorna uma lista vazia se o arquivo não existir.
    """
    data = []
    if not os.path.exists(filepath):
        return data
        
    with open(filepath, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

def write_csv(filepath, data, fieldnames):
<<<<<<< HEAD
    # ... (código existente) ...
=======
>>>>>>> 1b4e935136347d77e107e7a9d2ac5221539c0e8b
    """
    Escreve uma lista de dicionários em um arquivo CSV.
    """
    with open(filepath, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def get_next_id(filepath):
<<<<<<< HEAD
    # ... (código existente) ...
=======
>>>>>>> 1b4e935136347d77e107e7a9d2ac5221539c0e8b
    """
    Determina o próximo ID disponível para um novo registro em um arquivo CSV.
    """
    data = read_csv(filepath)
    if data:
        try:
            # Encontra o ID máximo na lista de dicionários
            last_id = max(int(row['id']) for row in data)
            return last_id + 1
        except (ValueError, KeyError):
            # Lida com casos onde 'id' não é um número ou não existe
            return 1
    return 1

# ==============================================================================
# FUNÇÕES PARA VISITAS (VISITS)
<<<<<<< HEAD
=======
# ==============================================================================
def create_visits_file():
    """Cria o arquivo CSV de visitas se ele não existir."""
    if not os.path.exists(VISITS_CSV):
        with open(VISITS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=VISITS_FIELDNAMES)
            writer.writeheader()

def register_visit():
    """Registra uma visita com data e hora atuais no CSV."""
    create_visits_file()
    visits_data = read_csv(VISITS_CSV)
    new_id = get_next_id(VISITS_CSV)
    
    new_visit = {
        'id': new_id,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    visits_data.append(new_visit)
    write_csv(VISITS_CSV, visits_data, VISITS_FIELDNAMES)

def get_visits_count(time_range):
    """
    Calcula a contagem de visitantes para um período específico.
    """
    create_visits_file()
    visits = read_csv(VISITS_CSV)

    if not visits:
        return 0
    
    df = pd.DataFrame(visits)
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    
    # Mapeia o time_range para o timedelta
    delta_map = {
        '24h': timedelta(hours=24),
        '7d': timedelta(days=7),
        '30d': timedelta(days=30),
        '12m': timedelta(days=365)
    }
    
    now = datetime.utcnow().replace(tzinfo=None)
    start_time = now - delta_map.get(time_range, timedelta(days=30))
    
    filtered_visits = df[(df['timestamp'].dt.tz_localize(None) >= start_time)]
    
    return len(filtered_visits)

def get_daily_visits(time_range):
    """
    Retorna a contagem de visitas por dia para um período.
    """
    create_visits_file()
    visits = read_csv(VISITS_CSV)
    
    if not visits:
        return []
    
    df = pd.DataFrame(visits)
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    
    delta_map = {
        '24h': timedelta(hours=24),
        '7d': timedelta(days=7),
        '30d': timedelta(days=30),
        '12m': timedelta(days=365)
    }
    
    now = datetime.utcnow().replace(tzinfo=None)
    start_time = now - delta_map.get(time_range, timedelta(days=30))
    
    filtered_visits = df[(df['timestamp'].dt.tz_localize(None) >= start_time)]
    
    visits_by_day = filtered_visits.groupby(filtered_visits['timestamp'].dt.date).size().reset_index(name='count')
    visits_by_day['date'] = visits_by_day['timestamp'].astype(str)
    
    return visits_by_day[['date', 'count']].to_dict('records')

# ==============================================================================
# FUNÇÕES PARA USUÁRIOS (USERS)
>>>>>>> 1b4e935136347d77e107e7a9d2ac5221539c0e8b
# ==============================================================================
# ... (código existente) ...
def create_visits_file():
    """Cria o arquivo CSV de visitas se ele não existir."""
    if not os.path.exists(VISITS_CSV):
        with open(VISITS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=VISITS_FIELDNAMES)
            writer.writeheader()

def register_visit():
    """Registra uma visita com data e hora atuais no CSV."""
    create_visits_file()
    visits_data = read_csv(VISITS_CSV)
    new_id = get_next_id(VISITS_CSV)
    
    new_visit = {
        'id': new_id,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    visits_data.append(new_visit)
    write_csv(VISITS_CSV, visits_data, VISITS_FIELDNAMES)

def get_visits_count(time_range):
    """
    Calcula a contagem de visitantes para um período específico.
    """
    create_visits_file()
    visits = read_csv(VISITS_CSV)

    if not visits:
        return 0
    
    df = pd.DataFrame(visits)
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    
    # Mapeia o time_range para o timedelta
    delta_map = {
        '24h': timedelta(hours=24),
        '7d': timedelta(days=7),
        '30d': timedelta(days=30),
        '12m': timedelta(days=365)
    }
    
    now = datetime.utcnow().replace(tzinfo=None)
    start_time = now - delta_map.get(time_range, timedelta(days=30))
    
    filtered_visits = df[(df['timestamp'].dt.tz_localize(None) >= start_time)]
    
    return len(filtered_visits)

def get_daily_visits(time_range):
    """
    Retorna a contagem de visitas por dia para um período.
    """
    create_visits_file()
    visits = read_csv(VISITS_CSV)
    
    if not visits:
        return []
    
    df = pd.DataFrame(visits)
    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
    
    delta_map = {
        '24h': timedelta(hours=24),
        '7d': timedelta(days=7),
        '30d': timedelta(days=30),
        '12m': timedelta(days=365)
    }
    
    now = datetime.utcnow().replace(tzinfo=None)
    start_time = now - delta_map.get(time_range, timedelta(days=30))
    
    filtered_visits = df[(df['timestamp'].dt.tz_localize(None) >= start_time)]
    
    visits_by_day = filtered_visits.groupby(filtered_visits['timestamp'].dt.date).size().reset_index(name='count')
    visits_by_day['date'] = visits_by_day['timestamp'].astype(str)
    
    return visits_by_day[['date', 'count']].to_dict('records')

# ==============================================================================
# FUNÇÕES PARA USUÁRIOS (USERS)
# ==============================================================================
# ... (código existente) ...

def get_users():
    """
    Lê o arquivo de usuários e retorna uma lista de objetos User.
    """
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
    """
    Encontra um usuário por email.
    """
    users = get_users()
    for user in users:
        if user.email == email:
            return user
    return None

def get_user_by_id(user_id):
    """
    Encontra um usuário por ID.
    """
    users = get_users()
    for user in users:
        if str(user.id) == str(user_id):
            return user
    return None

def save_user(user):
    """
    Salva um novo usuário no arquivo CSV.
    """
    users = read_csv(USERS_CSV)
    users.append(user.to_dict())
    write_csv(USERS_CSV, users, USERS_FIELDNAMES)
    
def update_user(user):
    """
    Atualiza um usuário existente no arquivo CSV.
    """
    users = read_csv(USERS_CSV)
    updated = False
    for i, u in enumerate(users):
        if int(u['id']) == int(user.id):
            users[i] = user.to_dict()
            updated = True
            break
    if updated:
        write_csv(USERS_CSV, users, USERS_FIELDNAMES)

# ==============================================================================
# FUNÇÕES PARA PRODUTOS (PRODUCTS)
# ==============================================================================

def get_products():
    """
    Lê o arquivo de produtos e retorna uma lista de objetos Product.
    """
    products_data = read_csv(PRODUCTS_CSV)
    return [Product.from_dict(row) for row in products_data]

def get_product_by_id(product_id):
    """
    Encontra um produto por ID.
    """
    products = get_products()
    for product in products:
        if str(product.id) == str(product_id):
            return product
    return None

def save_product(product):
    """
    Salva um novo produto no arquivo CSV.
    """
    products_data = read_csv(PRODUCTS_CSV)
    products_data.append(product.to_dict())
    write_csv(PRODUCTS_CSV, products_data, PRODUCTS_FIELDNAMES)

def update_product(product):
    """
    Atualiza um produto existente no arquivo CSV.
    """
    products_data = read_csv(PRODUCTS_CSV)
    updated = False
    for i, p in enumerate(products_data):
        if int(p['id']) == int(product.id):
            products_data[i] = product.to_dict()
            updated = True
            break
    if updated:
        write_csv(PRODUCTS_CSV, products_data, PRODUCTS_FIELDNAMES)
    
def delete_product(product_id):
    """
    Deleta um produto do arquivo CSV.
    """
    products_data = read_csv(PRODUCTS_CSV)
    updated_products = [p for p in products_data if int(p['id']) != int(product_id)]
    write_csv(PRODUCTS_CSV, updated_products, PRODUCTS_FIELDNAMES)

# ==============================================================================
# FUNÇÕES PARA FILTROS (FILTERS)
# ==============================================================================
<<<<<<< HEAD
# ... (código existente) ...
=======
>>>>>>> 1b4e935136347d77e107e7a9d2ac5221539c0e8b

def get_filters():
    """
    Lê o arquivo de filtros e retorna uma lista de dicionários.
    """
    return read_csv(FILTERS_CSV)

def get_filters_by_order():
    """
    Lê os filtros e os retorna ordenados pela ordem definida.
    """
    filters = get_filters()
    order_map = {filter_type: i for i, filter_type in enumerate(FILTER_ORDER)}
    return sorted(filters, key=lambda f: order_map.get(f['type'], len(FILTER_ORDER)))

def save_filter(filter_data):
    """
    Salva um novo filtro no arquivo CSV.
    """
    filters = get_filters()
    filters.append(filter_data)
    write_csv(FILTERS_CSV, filters, FILTERS_FIELDNAMES)
    
def delete_filter(filter_id):
    """
    Deleta um filtro do arquivo CSV.
    """
    filters = get_filters()
    updated_filters = [f for f in filters if int(f['id']) != int(filter_id)]
    write_csv(FILTERS_CSV, updated_filters, FILTERS_FIELDNAMES)

# ==============================================================================
# FUNÇÕES PARA AVALIAÇÕES (REVIEWS)
# ==============================================================================
# ... (código existente) ...
def get_reviews():
    """
    Lê o arquivo de avaliações e retorna uma lista de objetos Review.
    """
    reviews_data = read_csv(REVIEWS_CSV)
    return [Review.from_dict(row) for row in reviews_data]

def get_reviews_by_product_id(product_id):
    """
    Encontra avaliações por ID do produto.
    """
    reviews = get_reviews()
    return [r for r in reviews if str(r.product_id) == str(product_id)]

def save_review(review):
    """
    Salva uma nova avaliação no arquivo CSV.
    """
    reviews_data = read_csv(REVIEWS_CSV)
    reviews_data.append(review.to_dict())
    write_csv(REVIEWS_CSV, reviews_data, REVIEWS_FIELDNAMES)

def delete_review(review_id):
    """
    Deleta uma avaliação do arquivo CSV.
    """
    reviews_data = read_csv(REVIEWS_CSV)
    updated_reviews = [r for r in reviews_data if int(r['id']) != int(review_id)]
<<<<<<< HEAD
    write_csv(REVIEWS_CSV, updated_reviews, REVIEWS_FIELDNAMES)
=======
    write_csv(REVIEWS_CSV, updated_reviews, REVIEWS_FIELDNAMES)
>>>>>>> 1b4e935136347d77e107e7a9d2ac5221539c0e8b
