import os
from werkzeug.security import generate_password_hash
from app import create_app, db
from app.models.user import User

# Cria a instância da aplicação
app = create_app()

def create_admin_user():
    """Cria um usuário administrador no banco de dados."""
    with app.app_context():
        # Informações do usuário admin
        username = input("Digite o nome de usuário para o admin: ")
        email = input("Digite o email para o admin: ")
        password = input("Digite a senha para o admin: ")

        # Verifica se o usuário já existe para evitar duplicatas
        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            print("Já existe um usuário ou email com este nome. Por favor, tente novamente com outro.")
            return

        # Cria o hash da senha de forma segura
        hashed_password = generate_password_hash(password)
        
        # Cria a nova instância do usuário com a role 'admin'
        admin_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            role='admin'
        )

        db.session.add(admin_user)
        db.session.commit()
        print(f"Usuário administrador '{username}' criado com sucesso!")

if __name__ == '__main__':
    create_admin_user()
