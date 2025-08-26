import csv
import os
import json
from datetime import datetime, timedelta
from collections import Counter
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from app.models.filter import Filter

DATA_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'banco_de_dados')
USERS_CSV = os.path.join(DATA_FOLDER, 'users.csv')
PRODUCTS_CSV = os.path.join(DATA_FOLDER, 'products.csv')
REVIEWS_CSV = os.path.join(DATA_FOLDER, 'reviews.csv')
FILTERS_CSV = os.path.join(DATA_FOLDER, 'filters.csv')
VISITS_CSV = os.path.join(DATA_FOLDER, 'visits.csv')
USERS_FIELDNAMES = ['id', 'username', 'email', 'password_hash', 'role', 'profile_picture', 'date_joined', 'address', 'city', 'state', 'zip_code']
PRODUCTS_FIELDNAMES = ['id', 'name', 'brand', 'price', 'status', 'images', 'description', 'specs', 'seller_id', 'filters']
REVIEWS_FIELDNAMES = ['id', 'rating', 'comment', 'media_url', 'date_posted', 'user_id', 'product_id']
FILTERS_FIELDNAMES = ['id', 'name', 'type']
VISITS_FIELDNAMES = ['timestamp', 'session_id']

def _read_csv(filepath):
    """Lê um arquivo CSV e retorna uma lista de dicionários. Retorna lista vazia se não existir."""
    if not os.path.exists(filepath):
        _ensure_file_exists(filepath)
        return []
    try:
        with open(filepath, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)       
            return [row for row in reader if row]
    except Exception as e:
        print(f"Erro CRÍTICO ao ler o arquivo CSV {filepath}: {e}")
        return []

def _write_csv(filepath, data, fieldnames):
    """Escreve uma lista de dicionários em um arquivo CSV, sobrescrevendo o conteúdo."""
    try:
        with open(filepath, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
    except Exception as e:
        print(f"Erro CRÍTICO ao escrever no arquivo CSV {filepath}: {e}")

def get_next_id(filepath):
    """Calcula o próximo ID disponível para um novo registro."""
    data = _read_csv(filepath)
    if not data: return 1
    return max(int(row.get('id', 0)) for row in data) + 1

def _ensure_file_exists(filepath):
    """Cria um arquivo CSV com o cabeçalho apropriado se ele não existir."""
    if os.path.exists(filepath): return
    filename_map = {
        USERS_CSV: USERS_FIELDNAMES, PRODUCTS_CSV: PRODUCTS_FIELDNAMES,
        REVIEWS_CSV: REVIEWS_FIELDNAMES, FILTERS_CSV: FILTERS_FIELDNAMES,
        VISITS_CSV: VISITS_FIELDNAMES,
    }
    fieldnames = filename_map.get(filepath)
    if fieldnames:
        os.makedirs(DATA_FOLDER, exist_ok=True)
        _write_csv(filepath, [], fieldnames)

def get_users():
    """Retorna uma lista de todos os usuários como objetos User."""
    return [User.from_dict(row) for row in _read_csv(USERS_CSV)]

def get_products():
    """Retorna uma lista de todos os produtos como objetos Product."""
    return [Product.from_dict(row) for row in _read_csv(PRODUCTS_CSV)]

def get_filters():
    """Retorna uma lista de todos os filtros como objetos Filter."""
    return [Filter.from_dict(row) for row in _read_csv(FILTERS_CSV)]

def get_user_by_id(user_id):
    """Busca um usuário pelo ID."""
    for row in _read_csv(USERS_CSV):
        if str(row.get('id')) == str(user_id):
            return User.from_dict(row)
    return None

def get_product_by_id(product_id):
    """Busca um produto pelo ID."""
    for row in _read_csv(PRODUCTS_CSV):
        if str(row.get('id')) == str(product_id):
            return Product.from_dict(row)
    return None

def get_user_by_email(email):
    """Busca um usuário pelo email."""
    for row in _read_csv(USERS_CSV):
        if row.get('email') == email:
            return User.from_dict(row)
    return None

def save_user(user):
    """Salva um novo usuário ou atualiza um existente."""
    users_data = _read_csv(USERS_CSV)
    user_dict = user.to_dict()
    user_found = False
    for i, u in enumerate(users_data):
        if str(u.get('id')) == str(user.id):
            users_data[i] = user_dict
            user_found = True
            break
    if not user_found:
        user.id = get_next_id(USERS_CSV)
        users_data.append(user.to_dict())
    _write_csv(USERS_CSV, users_data, USERS_FIELDNAMES)

def save_product(product):
    """Salva um novo produto ou atualiza um existente. Retorna o produto salvo."""
    products_data = _read_csv(PRODUCTS_CSV)
    product_found = False

    if product.id is not None:
        for i, p in enumerate(products_data):
            if str(p.get('id')) == str(product.id):
                products_data[i] = product.to_dict()
                product_found = True
                break
    
    if not product_found:
        if product.id is None: 
            product.id = get_next_id(PRODUCTS_CSV)
        products_data.append(product.to_dict())

    _write_csv(PRODUCTS_CSV, products_data, PRODUCTS_FIELDNAMES)
    return product 
    
def delete_product(product_id):
    """Deleta um produto pelo ID."""
    products_data = _read_csv(PRODUCTS_CSV)
    original_len = len(products_data)
    products_to_keep = [p for p in products_data if str(p.get('id')) != str(product_id)]
    if len(products_to_keep) < original_len:
        _write_csv(PRODUCTS_CSV, products_to_keep, PRODUCTS_FIELDNAMES)
        return True
    return False

def save_filter(filter_obj):
    """Salva um novo filtro."""
    filters_data = _read_csv(FILTERS_CSV)
    filter_obj.id = get_next_id(FILTERS_CSV)
    filters_data.append(filter_obj.to_dict())
    _write_csv(FILTERS_CSV, filters_data, FILTERS_FIELDNAMES)

def delete_filter(filter_id):
    """Deleta um filtro pelo ID."""
    filters_data = _read_csv(FILTERS_CSV)
    original_len = len(filters_data)
    filters_to_keep = [f for f in filters_data if str(f.get('id')) != str(filter_id)]
    if len(filters_to_keep) < original_len:
        _write_csv(FILTERS_CSV, filters_to_keep, FILTERS_FIELDNAMES)
        return True
    return False

def register_visit(session_id):
    """
    Registra o timestamp e o ID da sessão de uma nova visita.
    A lógica de visita única por sessão deve ser gerenciada pelo chamador.
    """
    _ensure_file_exists(VISITS_CSV)
    try:
        with open(VISITS_CSV, 'a', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=VISITS_FIELDNAMES)
            if file.tell() == 0:
                writer.writeheader()
            writer.writerow({'timestamp': datetime.utcnow().isoformat(), 'session_id': session_id})
    except IOError as e:
        print(f"Erro ao registrar visita: {e}")

def get_visits_count(time_range_str):
    """Calcula o número de visitas únicas em um determinado período de tempo."""
    visits_data = _read_csv(VISITS_CSV)
    if not visits_data: return 0
    now = datetime.utcnow()
    range_map = {'24h': 1, '7d': 7, '30d': 30, '12m': 365}
    days = range_map.get(time_range_str, 365)
    start_time = now - timedelta(days=days)
    
    unique_sessions = set()
    for row in visits_data:
        timestamp_str = row.get('timestamp')
        session_id = row.get('session_id')
        if not timestamp_str or not session_id: continue
        try:
            if datetime.fromisoformat(timestamp_str.strip()) >= start_time:
                unique_sessions.add(session_id)
        except (ValueError, KeyError): continue
    
    return len(unique_sessions)

def get_visits_per_period(period='day'):
    """Agrupa as visitas únicas por período (dia, semana, mês, ano)."""
    visits_data = _read_csv(VISITS_CSV)
    now = datetime.utcnow()
    
    if period == 'day':
        start_time = now - timedelta(days=6)
        date_format = '%d/%m'
        labels = [(start_time + timedelta(days=i)).strftime(date_format) for i in range(7)]
    elif period == 'week':
        start_time = now - timedelta(weeks=6)
        date_format = 'W%U'
        labels = [(start_time + timedelta(weeks=i)).strftime(date_format) for i in range(7)]
    elif period == 'month':
        start_time = now - timedelta(days=365)
        date_format = '%b/%y'
        labels = []
        for i in range(12):
            month = now.month - i
            year = now.year
            if month <= 0:
                month += 12
                year -= 1
            labels.append(datetime(year, month, 1).strftime(date_format))
        labels.reverse()
    else: 
        start_time = now - timedelta(days=5*365)
        date_format = '%Y'
        labels = [str(year) for year in range(now.year - 4, now.year + 1)]

    counts = {label: set() for label in labels}
    
    for row in visits_data:
        timestamp_str = row.get('timestamp')
        session_id = row.get('session_id')
        if not timestamp_str or not session_id: continue
        try:
            visit_time = datetime.fromisoformat(timestamp_str.strip())
            if visit_time >= start_time:
                key = visit_time.strftime(date_format)
                if key in counts:
                    counts[key].add(session_id)
        except (ValueError, KeyError): continue
    
    return [{"date": label, "count": len(counts[label])} for label in labels]
