# app/models/user.py
# Este arquivo define o modelo de banco de dados para a tabela de usuários.
# Foi aprimorado para integrar-se com o Flask-Login e o Bcrypt.

from app import db
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, UserMixin):
    """
    Modelo para a tabela 'users'.
    A classe herda de 'db.Model' para mapeamento com o SQLAlchemy e de
    'UserMixin' para fornecer os atributos necessários para o Flask-Login.

    Atributos:
        id (int): A chave primária da tabela.
        username (str): O nome de usuário, deve ser único.
        email (str): O email do usuário, deve ser único.
        password_hash (str): O hash da senha do usuário para segurança.
        role (str): O papel do usuário (por exemplo, 'user' ou 'admin').
        date_joined (datetime): Data em que o usuário se cadastrou.
    """
    __tablename__ = 'users' # Define o nome da tabela
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(16), default='user')
    date_joined = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relacionamentos com outras tabelas.
    # `products`: Lista de produtos que este usuário adicionou.
    # `reviews`: Lista de avaliações que este usuário escreveu.
    products = db.relationship('Product', backref='seller', lazy=True)
    reviews = db.relationship('Review', backref='reviewer', lazy=True)
    
    def __repr__(self):
        """Retorna uma representação legível do objeto para fins de depuração."""
        return f'<User {self.username}>'

    def set_password(self, password):
        """
        Cria o hash da senha usando Bcrypt e a armazena no atributo `password_hash`.
        """
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """
        Verifica se a senha fornecida corresponde ao hash armazenado.
        Retorna True se a senha for válida, False caso contrário.
        """
        return check_password_hash(self.password_hash, password)
