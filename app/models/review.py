# app/models/review.py
# Define o modelo de banco de dados para a tabela de avaliações.
# Adicionado campo 'date_posted' para registrar a data da avaliação.

from app import db
from datetime import datetime

class Review(db.Model):
    """Modelo para a tabela 'reviews'."""
    __tablename__ = 'reviews' # Adicionado o nome da tabela para consistência
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    media_url = db.Column(db.String(256), nullable=True)
    # Novo campo para a data da postagem da avaliação
    date_posted = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Chave estrangeira para o usuário que fez a avaliação.
    # Corrigido para referenciar 'users.id'
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # Chave estrangeira para o produto avaliado.
    # Corrigido para referenciar 'products.id'
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    def __repr__(self):
        return f'<Review {self.rating}>'
