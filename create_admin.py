import os
import csv 
from werkzeug.security import generate_password_hash
from app.models.user import User
from app.utils import data_manager

if not os.path.exists(data_manager.DATA_FOLDER):
    os.makedirs(data_manager.DATA_FOLDER)

def create_csv_files():
    """Cria os arquivos CSV com os cabeçalhos se eles não existirem."""
    if not os.path.exists(data_manager.USERS_CSV):
        fieldnames = ['id', 'username', 'email', 'password_hash', 'role', 'profile_picture', 'date_joined']
        with open(data_manager.USERS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
    
    if not os.path.exists(data_manager.PRODUCTS_CSV):
        fieldnames = ['id', 'name', 'brand', 'price', 'status', 'images', 'description', 'specs', 'seller_id']
        with open(data_manager.PRODUCTS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

    if not os.path.exists(data_manager.FILTERS_CSV):
        fieldnames = ['id', 'name', 'type']
        with open(data_manager.FILTERS_CSV, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

def create_admin_user():
    """Cria um usuário administrador e o salva no arquivo CSV."""
    
    if 'FLASK_APP' in os.environ:
        print("Este script deve ser rodado separadamente do servidor web. Por favor, rode 'python create_admin.py' em um terminal novo.")
        return

    create_csv_files()
    
    username = input("Digite o nome de usuário para o admin: ")
    email = input("Digite o email para o admin: ")
    password = input("Digite a senha para o admin: ")

    users = data_manager.get_users()
    if any(u.email == email or u.username == username for u in users):
        print("Já existe um usuário ou email com este nome. Por favor, tente novamente com outro.")
        username = input("Digite o nome de usuário para o admin: ")
        email = input("Digite o email para o admin: ")
        password = input("Digite a senha para o admin: ")

    hashed_password = generate_password_hash(password)
    
    new_id = data_manager.get_next_id(data_manager.USERS_CSV)
    admin_user = User(
        id=new_id,
        username=username,
        email=email,
        password_hash=hashed_password,
        role='admin'
    )
    

    data_manager.save_user(admin_user)
    print(f"Usuário administrador '{username}' criado com sucesso!")

if __name__ == '__main__':
    create_admin_user()
