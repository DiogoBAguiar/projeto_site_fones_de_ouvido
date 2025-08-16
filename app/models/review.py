# app/models/review.py
# Define o modelo de banco de dados para a tabela de avaliações.

from app import db

class Review(db.Model):
    """Modelo para a tabela 'reviews'."""
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    media_url = db.Column(db.String(256), nullable=True)
    
    # Chave estrangeira para o usuário que fez a avaliação.
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Chave estrangeira para o produto avaliado.
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    
    def __repr__(self):
        return f'<Review {self.rating}>'
