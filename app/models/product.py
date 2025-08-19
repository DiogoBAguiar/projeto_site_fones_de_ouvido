# app/models/product.py
# Este arquivo define o modelo de banco de dados para a tabela de produtos.
# Adicionadas colunas para descrição e especificações, e métodos utilitários.

from app import db
import json

class Product(db.Model):
    """
    Modelo para a tabela 'products'.

    Atributos:
        id (int): A chave primária da tabela.
        name (str): O nome do produto.
        brand (str): A marca do produto.
        price (float): O preço do produto.
        status (str): O status do produto (por exemplo, "em estoque").
        images (str): Uma string JSON que armazena os caminhos das imagens do produto.
                      Essa abordagem é usada para guardar uma lista de URLs de forma simples.
        description (str): A descrição detalhada do produto.
        specs (str): Especificações técnicas do produto, formatadas como texto ou JSON.
        seller_id (int): A chave estrangeira que conecta este produto ao usuário
                         que o adicionou (o vendedor).
    """
    __tablename__ = 'products' # Define o nome da tabela
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    brand = db.Column(db.String(64), nullable=False)
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(32), nullable=False)
    images = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    specs = db.Column(db.Text, nullable=True)
    
    # Chave estrangeira para o usuário que adicionou o produto.
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relacionamento com avaliações.
    # O `backref='product'` cria uma referência de volta no modelo Review.
    reviews = db.relationship('Review', backref='product', lazy=True)
    
    def __repr__(self):
        """Retorna uma representação legível do objeto para fins de depuração."""
        return f'<Product {self.name}>'
    
    def get_images(self):
        """Retorna a lista de caminhos de imagens, convertendo de JSON."""
        return json.loads(self.images) if self.images else []
