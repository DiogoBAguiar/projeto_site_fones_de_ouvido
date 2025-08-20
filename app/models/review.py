# app/models/review.py
# Define o modelo de dados para a tabela de avaliações.
# Refatorado para ser um modelo de dados simples, compatível com arquivos CSV.

from datetime import datetime

class Review:
    """
    Modelo de dados para a tabela 'reviews'.

    Atributos:
        id (int): A chave primária (ID da avaliação).
        rating (int): A nota da avaliação (1 a 5).
        comment (str): O comentário da avaliação.
        media_url (str): O URL de uma foto ou vídeo, se houver.
        date_posted (datetime): Data e hora da avaliação.
        user_id (int): O ID do usuário que fez a avaliação.
        product_id (int): O ID do produto avaliado.
    """
    def __init__(self, id, rating, comment, media_url, date_posted, user_id, product_id):
        self.id = id
        self.rating = rating
        self.comment = comment
        self.media_url = media_url
        self.date_posted = date_posted
        self.user_id = user_id
        self.product_id = product_id

    def to_dict(self):
        """
        Serializa o objeto Review para um dicionário, útil para salvar no CSV.
        O campo 'date_posted' é convertido para uma string no formato ISO 8601.
        """
        return {
            'id': self.id,
            'rating': self.rating,
            'comment': self.comment,
            'media_url': self.media_url,
            'date_posted': self.date_posted.isoformat() if isinstance(self.date_posted, datetime) else self.date_posted,
            'user_id': self.user_id,
            'product_id': self.product_id
        }

    @classmethod
    def from_dict(cls, data):
        """
        Cria um objeto Review a partir de um dicionário, lido do CSV.
        O campo 'date_posted' é convertido de volta para um objeto datetime.
        """
        return cls(
            id=int(data['id']),
            rating=int(data['rating']),
            comment=data.get('comment'),
            media_url=data.get('media_url'),
            date_posted=datetime.fromisoformat(data['date_posted']) if 'date_posted' in data and data['date_posted'] else datetime.utcnow(),
            user_id=int(data['user_id']),
            product_id=int(data['product_id'])
        )

