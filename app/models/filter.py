# app/models/filter.py
# Este arquivo define o modelo de dados para a tabela de filtros.
# Refatorado para ser um modelo de dados simples, compatível com arquivos CSV.

class Filter:
    """
    Modelo de dados para a tabela 'filters'.

    Atributos:
        id (int): A chave primária da tabela.
        name (str): O nome do filtro (ex: 'Decibell', 'Sem Fio', 'Azul').
        type (str): O tipo do filtro (ex: 'brand', 'connectivity', 'color').
    """
    def __init__(self, id, name, type):
        self.id = id
        self.name = name
        self.type = type

    def __repr__(self):
        """Retorna uma representação legível do objeto para fins de depuração."""
        return f'<Filter {self.type}: {self.name}>'

    @classmethod
    def from_dict(cls, data):
        """
        Cria um objeto Filter a partir de um dicionário, lido do CSV.
        """
        return cls(
            id=int(data['id']),
            name=data['name'],
            type=data['type']
        )
