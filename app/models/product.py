# app/models/product.py
# Este arquivo define o modelo de dados para os produtos.
# Refatorado para ser um modelo de dados simples, compatível com arquivos CSV.

import json
from datetime import datetime

class Product:
    """
    Modelo de dados para os produtos.

    Atributos:
        id (int): A chave primária (ID do produto).
        name (str): O nome do produto.
        brand (str): A marca do produto.
        price (float): O preço do produto.
        status (str): O status do produto (por exemplo, "em estoque").
        images (list): Uma lista de strings com os caminhos das imagens.
        description (str): A descrição detalhada do produto.
        specs (str): Especificações técnicas do produto, formatadas como texto ou JSON.
        seller_id (int): O ID do usuário que adicionou o produto.
    """
    def __init__(self, id, name, brand, price, status, images, description, specs, seller_id):
        self.id = id
        self.name = name
        self.brand = brand
        self.price = price
        self.status = status
        self.images = images
        self.description = description
        self.specs = specs
        self.seller_id = seller_id
    
    def to_dict(self):
        """
        Serializa o objeto Product para um dicionário, útil para salvar no CSV.
        O campo 'images' é convertido para uma string JSON.
        """
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'price': self.price,
            'status': self.status,
            'images': json.dumps(self.images),
            'description': self.description,
            'specs': self.specs,
            'seller_id': self.seller_id
        }

    @classmethod
    def from_dict(cls, data):
        """
        Cria um objeto Product a partir de um dicionário, lido do CSV.
        O campo 'images' é convertido de uma string JSON para uma lista.
        """
        try:
            images = json.loads(data['images']) if data['images'] else []
        except (json.JSONDecodeError, TypeError):
            images = []
        return cls(
            id=int(data['id']),
            name=data['name'],
            brand=data['brand'],
            price=float(data['price']),
            status=data['status'],
            images=images,
            description=data.get('description'),
            specs=data.get('specs'),
            seller_id=int(data['seller_id'])
        )
