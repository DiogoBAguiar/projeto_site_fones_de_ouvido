import json
from typing import List, Dict, Any, Optional

class Product:

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
        Converte a instância do produto em um dicionário, escapando quebras de linha.
        """
        data = {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'price': self.price,
            'status': self.status,
            'images': self.images,
            # Escapa quebras de linha para evitar quebras no CSV
            'description': self.description.replace('\n', '\\n'),
            'specs': self.specs.replace('\n', '\\n'),
        }
        if not simplify:
            data.update({
                'seller_id': self.seller_id,
                'filters': self.filters
            })
            # Converte listas para strings JSON para salvar no CSV
            data['images'] = json.dumps(self.images)
            data['filters'] = json.dumps(self.filters)
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Product':
        """
        Cria uma instância de Product a partir de um dicionário, restaurando quebras de linha.
        """
        try:
            images = json.loads(data.get('images', '[]'))
        except (json.JSONDecodeError, TypeError):
            images = []

        try:
            filters = json.loads(data.get('filters', '[]'))
        except (json.JSONDecodeError, TypeError):
            filters = []
        
        # Restaura as quebras de linha escapadas
        description = data.get('description', '').replace('\\n', '\n')
        specs = data.get('specs', '').replace('\\n', '\n')

        return cls(
            id=int(data['id']),
            name=data.get('name', 'Nome Indisponível'),
            brand=data.get('brand', 'Marca Indisponível'),
            price=float(data.get('price', 0.0)),
            status=data.get('status', 'Indisponível'),
            description=description,
            specs=specs,
            seller_id=int(data.get('seller_id', 0)),
            images=images,
            filters=filters
        )
