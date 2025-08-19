# app/models/filter.py
# Este arquivo define o modelo de banco de dados para a tabela de filtros.

from app import db

class Filter(db.Model):
    """
    Modelo para a tabela 'filters'.

    Atributos:
        id (int): A chave primária da tabela.
        name (str): O nome do filtro (ex: 'Decibell', 'Sem Fio', 'Azul').
        type (str): O tipo do filtro (ex: 'brand', 'connectivity', 'color').
    """
    __tablename__ = 'filters'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)
    type = db.Column(db.String(64), nullable=False)

    def __repr__(self):
        """Retorna uma representação legível do objeto para fins de depuração."""
        return f'<Filter {self.type}: {self.name}>'
