# app/utils/data_manager.py
# Módulo para gerenciar a leitura e escrita de dados em arquivos CSV.
# Refatorado para remover a dependência do pandas e otimizar as operações.

import csv
import os
import json
from datetime import datetime, timedelta
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from app.models.filter import Filter

# --- CONFIGURAÇÃO DE CAMINHOS E CABEÇALHOS ---

# Define a pasta base para os arquivos de dados (banco_de_dados)
DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'banco_de_dados')

# Define os caminhos completos para cada arquivo CSV
USERS_CSV = os.path.join(DATA_FOLDER, 'users.csv')
PRODUCTS_CSV = os.path.join(DATA_FOLDER, 'products.csv')
REVIEWS_CSV = os.path.join(DATA_FOLDER, 'reviews.csv')
FILTERS_CSV = os.path.join(DATA_FOLDER, 'filters.csv')
VISITS_CSV = os.path.join(DATA_FOLDER, 'visits.csv')

# Define os cabeçalhos (nomes dos campos) para cada arquivo CSV.
# Isso garante consistência ao criar e escrever nos arquivos.
USERS_FIELDNAMES = ['id', 'username', 'email', 'password_hash', 'role', 'profile_picture', 'date_joined']
PRODUCTS_FIELDNAMES = ['id', 'name', 'brand', 'price', 'status', 'images', 'description', 'specs', 'seller_id', 'filters']
REVIEWS_FIELDNAMES = ['id', 'rating', 'comment', 'media_url', 'date_posted', 'user_id', 'product_id']
FILTERS_FIELDNAMES = ['id', 'name', 'type']
VISITS_FIELDNAMES = ['timestamp'] # Simplificado, o ID não é necessário aqui

# --- FUNÇÕES UTILITÁRIAS GENÉRICAS ---

def _read_csv(filepath):
    """Lê um arquivo CSV e retorna uma lista de dicionários. Retorna lista vazia se não existir."""
    if not os.path.exists(filepath):
        # Garante que o arquivo exista com o cabeçalho correto se for um dos arquivos principais
        _ensure_file_exists(filepath)
        return []
    try:
        with open(filepath, mode='r', newline='', encoding='utf-8') as file:
            return list(csv.DictReader(file))
    except (IOError, csv.Error) as e:
        print(f"Erro ao ler o arquivo CSV {filepath}: {e}")
        return []

def _write_csv(filepath, data, fieldnames):
    """Escreve uma lista de dicionários em um arquivo CSV, sobrescrevendo o conteúdo."""
    try:
        with open(filepath, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
    except (IOError, csv.Error) as e:
        print(f"Erro ao escrever no arquivo CSV {filepath}: {e}")

def _get_next_id(filepath):
    """Calcula o próximo ID disponível para um novo registro."""
    data = _read_csv(filepath)
    if not data:
        return 1
    # Converte os IDs para inteiros e encontra o maior valor
    max_id = max(int(row.get('id', 0)) for row in data)
    return max_id + 1

def _ensure_file_exists(filepath):
    """Cria um arquivo CSV com o cabeçalho apropriado se ele não existir."""
    if os.path.exists(filepath):
        return

    # Mapeia o caminho do arquivo para o seu respectivo cabeçalho
    filename_to_fieldnames = {
        USERS_CSV: USERS_FIELDNAMES,
        PRODUCTS_CSV: PRODUCTS_FIELDNAMES,
        REVIEWS_CSV: REVIEWS_FIELDNAMES,
        FILTERS_CSV: FILTERS_FIELDNAMES,
        VISITS_CSV: VISITS_FIELDNAMES,
    }
    
    fieldnames = filename_to_fieldnames.get(filepath)
    if fieldnames:
        # Cria a pasta 'banco_de_dados' se ela não existir
        os.makedirs(DATA_FOLDER, exist_ok=True)
        # Escreve apenas o cabeçalho no novo arquivo
        _write_csv(filepath, [], fieldnames)

# --- FUNÇÕES DE GERENCIAMENTO DE USUÁRIOS ---

def get_users():
    """Retorna uma lista de todos os usuários como objetos User."""
    users_data = _read_csv(USERS_CSV)
    return [User.from_dict(row) for row in users_data]

def get_user_by_id(user_id):
    """Busca um usuário pelo ID."""
    users_data = _read_csv(USERS_CSV)
    for row in users_data:
        if str(row.get('id')) == str(user_id):
            return User.from_dict(row)
    return None

def get_user_by_email(email):
    """Busca um usuário pelo email."""
    users_data = _read_csv(USERS_CSV)
    for row in users_data:
        if row.get('email') == email:
            return User.from_dict(row)
    return None

def save_user(user):
    """Salva um novo usuário ou atualiza um existente."""
    users_data = _read_csv(USERS_CSV)
    user_dict = user.to_dict()
    
    # Verifica se o usuário já existe para atualização
    user_found = False
    for i, existing_user in enumerate(users_data):
        if str(existing_user.get('id')) == str(user.id):
            users_data[i] = user_dict
            user_found = True
            break
            
    if not user_found:
        users_data.append(user_dict)
        
    _write_csv(USERS_CSV, users_data, USERS_FIELDNAMES)

# --- FUNÇÕES DE GERENCIAMENTO DE PRODUTOS ---

def get_products():
    """Retorna uma lista de todos os produtos como objetos Product."""
    products_data = _read_csv(PRODUCTS_CSV)
    return [Product.from_dict(row) for row in products_data]

def get_product_by_id(product_id):
    """Busca um produto pelo ID."""
    products_data = _read_csv(PRODUCTS_CSV)
    for row in products_data:
        if str(row.get('id')) == str(product_id):
            return Product.from_dict(row)
    return None

def save_product(product):
    """Salva um novo produto ou atualiza um existente."""
    products_data = _read_csv(PRODUCTS_CSV)
    product_dict = product.to_dict()

    product_found = False
    for i, p in enumerate(products_data):
        if str(p.get('id')) == str(product.id):
            products_data[i] = product_dict
            product_found = True
            break
    
    if not product_found:
        product.id = _get_next_id(PRODUCTS_CSV)
        products_data.append(product.to_dict())
        
    _write_csv(PRODUCTS_CSV, products_data, PRODUCTS_FIELDNAMES)

def delete_product(product_id):
    """Deleta um produto pelo ID."""
    products_data = _read_csv(PRODUCTS_CSV)
    # Filtra a lista, mantendo apenas os produtos cujo ID não corresponde
    products_to_keep = [p for p in products_data if str(p.get('id')) != str(product_id)]
    
    if len(products_to_keep) < len(products_data):
        _write_csv(PRODUCTS_CSV, products_to_keep, PRODUCTS_FIELDNAMES)
        return True # Indica que um produto foi deletado
    return False # Indica que nenhum produto foi encontrado/deletado

# --- FUNÇÕES DE GERENCIAMENTO DE FILTROS ---

def get_filters():
    """Retorna uma lista de todos os filtros como objetos Filter."""
    filters_data = _read_csv(FILTERS_CSV)
    return [Filter.from_dict(row) for row in filters_data]

def save_filter(filter_obj):
    """Salva um novo filtro."""
    filters_data = _read_csv(FILTERS_CSV)
    filter_obj.id = _get_next_id(FILTERS_CSV)
    filters_data.append(filter_obj.to_dict())
    _write_csv(FILTERS_CSV, filters_data, FILTERS_FIELDNAMES)

def delete_filter(filter_id):
    """Deleta um filtro pelo ID."""
    filters_data = _read_csv(FILTERS_CSV)
    filters_to_keep = [f for f in filters_data if str(f.get('id')) != str(filter_id)]
    
    if len(filters_to_keep) < len(filters_data):
        _write_csv(FILTERS_CSV, filters_to_keep, FILTERS_FIELDNAMES)
        return True
    return False

# --- FUNÇÕES DE ANÁLISE E VISITAS (SEM PANDAS) ---

def register_visit():
    """Registra o timestamp de uma nova visita."""
    _ensure_file_exists(VISITS_CSV)
    try:
        with open(VISITS_CSV, 'a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow([datetime.utcnow().isoformat()])
    except IOError as e:
        print(f"Erro ao registrar visita: {e}")

def get_visits_count(time_range_str):
    """Calcula o número de visitas em um determinado período de tempo (ex: '7d', '30d')."""
    visits_data = _read_csv(VISITS_CSV)
    if not visits_data:
        return 0

    now = datetime.utcnow()
    
    # Mapeia a string do período para um objeto timedelta
    range_map = {'24h': 1, '7d': 7, '30d': 30, '12m': 365}
    days = range_map.get(time_range_str, 30) # Padrão de 30 dias
    start_time = now - timedelta(days=days)
    
    count = 0
    for row in visits_data:
        try:
            # Tenta converter o timestamp para datetime e compara
            visit_time = datetime.fromisoformat(row['timestamp'])
            if visit_time >= start_time:
                count += 1
        except (ValueError, KeyError):
            # Ignora linhas com timestamp mal formatado ou ausente
            continue
            
    return count
