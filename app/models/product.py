# app/models/product.py
# Define o modelo de dados para os produtos da aplicação.

import json
from typing import List, Dict, Any, Optional

class Product:
    """
    Representa um produto no catálogo da loja.

    Esta classe serve como um modelo de dados para manipular informações de produtos
    que são lidas e escritas em arquivos CSV.
    """
    def __init__(self,
                 id: Optional[int],
                 name: str,
                 brand: str,
                 price: float,
                 status: str,
                 images: List[str],
                 description: str,
                 specs: str,
                 seller_id: int,
                 filters: Optional[List[int]] = None):
        """
        Inicializa uma instância de Produto.

        Args:
            id (Optional[int]): O ID único do produto. Pode ser None para novos produtos.
            name (str): O nome do produto.
            brand (str): A marca do produto.
            price (float): O preço do produto.
            status (str): O status (ex: 'Em estoque', 'Em destaque').
            images (List[str]): Uma lista de caminhos URL para as imagens do produto.
            description (str): A descrição detalhada do produto.
            specs (str): As especificações técnicas do produto.
            seller_id (int): O ID do usuário que vende/cadastrou o produto.
            filters (Optional[List[int]]): Uma lista de IDs de filtros associados.
        """
        self.id = id
        self.name = name
        self.brand = brand
        self.price = price
        self.status = status
        self.images = images if images is not None else []
        self.description = description
        self.specs = specs
        self.seller_id = seller_id
        self.filters = filters if filters is not None else []

    def to_dict(self, simplify: bool = False) -> Dict[str, Any]:
        """
        Converte a instância do produto para um dicionário.

        Args:
            simplify (bool): Se True, retorna uma versão simplificada do dicionário,
                             adequada para listagens públicas na API.

        Returns:
            Dict[str, Any]: Um dicionário representando o produto.
        """
        data = {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'price': self.price,
            'status': self.status,
            'images': self.images,
        }
        if not simplify:
            # Para salvar no CSV ou para visualizações detalhadas, serializa tudo
            data.update({
                'description': self.description,
                'specs': self.specs,
                'seller_id': self.seller_id,
                'filters': self.filters
            })
            # Converte listas para string JSON para armazenamento no CSV
            data['images'] = json.dumps(self.images)
            data['filters'] = json.dumps(self.filters)
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Product':
        """
        Cria uma instância de Produto a partir de um dicionário (geralmente de uma linha de CSV).

        Args:
            data (Dict[str, Any]): O dicionário com os dados do produto.

        Returns:
            Product: Uma nova instância da classe Product.
        """
        # Tenta carregar 'images' e 'filters' de uma string JSON, com fallback para lista vazia.
        try:
            images = json.loads(data.get('images', '[]'))
        except (json.JSONDecodeError, TypeError):
            images = []

        try:
            filters = json.loads(data.get('filters', '[]'))
        except (json.JSONDecodeError, TypeError):
            filters = []

        return cls(
            id=int(data['id']),
            name=data.get('name', 'Nome Indisponível'),
            brand=data.get('brand', 'Marca Indisponível'),
            price=float(data.get('price', 0.0)),
            status=data.get('status', 'Indisponível'),
            description=data.get('description', ''),
            specs=data.get('specs', ''),
            seller_id=int(data.get('seller_id', 0)),
            images=images,
            filters=filters
        )
