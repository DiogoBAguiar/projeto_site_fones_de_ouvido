# app/models/review.py
# Define o modelo de dados para as avaliações de produtos.

from datetime import datetime
from typing import Dict, Any, Optional

class Review:
    """
    Representa uma avaliação (review) de um produto feita por um usuário.

    Esta classe serve como um modelo de dados para manipular informações de avaliações
    que são lidas e escritas no arquivo reviews.csv.
    """
    def __init__(self,
                 id: Optional[int],
                 rating: int,
                 comment: str,
                 media_url: Optional[str],
                 date_posted: datetime,
                 user_id: int,
                 product_id: int):
        """
        Inicializa uma instância de Avaliação.

        Args:
            id (Optional[int]): O ID único da avaliação. Pode ser None para novas avaliações.
            rating (int): A nota da avaliação (geralmente de 1 a 5).
            comment (str): O texto do comentário.
            media_url (Optional[str]): Um URL para uma imagem ou vídeo enviado com a avaliação.
            date_posted (datetime): A data e hora em que a avaliação foi postada.
            user_id (int): O ID do usuário que fez a avaliação.
            product_id (int): O ID do produto que foi avaliado.
        """
        self.id = id
        self.rating = rating
        self.comment = comment
        self.media_url = media_url
        self.date_posted = date_posted or datetime.utcnow()
        self.user_id = user_id
        self.product_id = product_id

    def to_dict(self) -> Dict[str, Any]:
        """
        Converte a instância da avaliação para um dicionário, ideal para salvar em CSV ou API.

        Returns:
            Dict[str, Any]: Um dicionário representando a avaliação.
        """
        return {
            'id': self.id,
            'rating': self.rating,
            'comment': self.comment,
            'media_url': self.media_url or '', # Garante que não seja None
            'date_posted': self.date_posted.isoformat(),
            'user_id': self.user_id,
            'product_id': self.product_id
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Review':
        """
        Cria uma instância de Review a partir de um dicionário (geralmente de uma linha de CSV).

        Args:
            data (Dict[str, Any]): O dicionário com os dados da avaliação.

        Returns:
            Review: Uma nova instância da classe Review.
        """
        # Converte a data de string ISO para objeto datetime, com fallback para o tempo atual.
        try:
            date_posted = datetime.fromisoformat(data.get('date_posted'))
        except (ValueError, TypeError):
            date_posted = datetime.utcnow()

        return cls(
            id=int(data.get('id', 0)),
            rating=int(data.get('rating', 0)),
            comment=data.get('comment', ''),
            media_url=data.get('media_url'),
            date_posted=date_posted,
            user_id=int(data.get('user_id', 0)),
            product_id=int(data.get('product_id', 0))
        )

    def __repr__(self) -> str:
        """
        Retorna uma representação legível do objeto, útil para fins de depuração.
        """
        return f"<Review id={self.id} product_id={self.product_id} rating={self.rating}>"
