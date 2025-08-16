# app/models/user.py
# Este arquivo define o modelo de banco de dados para a tabela de usuários.

from app import db

class User(db.Model):
    """
    Modelo para a tabela 'users'.

    Atributos:
        id (int): A chave primária da tabela.
        username (str): O nome de usuário, deve ser único.
        email (str): O email do usuário, deve ser único.
        password_hash (str): O hash da senha do usuário para segurança.
        role (str): O papel do usuário (por exemplo, 'user' ou 'admin').
    """
    __tablename__ = 'users' # Define o nome da tabela
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(16), default='user')
    
    # Relacionamentos com outras tabelas.
    # `products`: Lista de produtos que este usuário adicionou.
    # `reviews`: Lista de avaliações que este usuário escreveu.
    products = db.relationship('Product', backref='seller', lazy=True)
    reviews = db.relationship('Review', backref='reviewer', lazy=True)
    
    def __repr__(self):
        """Retorna uma representação legível do objeto para fins de depuração."""
        return f'<User {self.username}>'


