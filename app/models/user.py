# app/models/user.py
# Este arquivo define o modelo de dados para a tabela de usuários.
# Refatorado para ser um modelo de dados simples, compatível com arquivos CSV.

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(UserMixin):
    """
    Modelo de dados para a tabela de usuários.
    A classe herda de 'UserMixin' para fornecer os atributos necessários para o Flask-Login.

    Atributos:
        id (int): A chave primária (ID do usuário).
        username (str): O nome de usuário.
        email (str): O email do usuário.
        password_hash (str): O hash da senha do usuário para segurança.
        role (str): O papel do usuário (por exemplo, 'user' ou 'admin').
        profile_picture (str): O caminho para a foto de perfil do usuário.
        date_joined (datetime): Data em que o usuário se cadastrou.
    """
    def __init__(self, id, username, email, password_hash, role, profile_picture=None, date_joined=None):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.profile_picture = profile_picture
        self.date_joined = date_joined if date_joined else datetime.utcnow()

    @staticmethod
    def set_password(password):
        """
        Cria o hash da senha usando Bcrypt e a armazena no atributo `password_hash`.
        Este é um método estático pois não depende de uma instância de User.
        """
        return generate_password_hash(password)

    @staticmethod
    def check_password(hashed_password, password):
        """
        Verifica se a senha fornecida corresponde ao hash armazenado.
        Retorna True se a senha for válida, False caso contrário.
        Este é um método estático.
        """
        return check_password_hash(hashed_password, password)
    
    def get_id(self):
        """
        Método obrigatório do UserMixin para retornar o ID do usuário como string.
        """
        return str(self.id)
    
    def to_dict(self):
        """
        Serializa o objeto User para um dicionário, útil para salvar no CSV.
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'role': self.role,
            'profile_picture': self.profile_picture,
            'date_joined': self.date_joined.isoformat()
        }

