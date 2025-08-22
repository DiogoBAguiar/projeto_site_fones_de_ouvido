# app/models/filter.py
# Define o modelo de dados para os filtros de produtos.

from typing import Dict, Any, Optional

class Filter:
    """
    Representa um filtro aplicável aos produtos (ex: marca, tipo, cor).

    Esta classe serve como um modelo de dados para manipular informações de filtros
    que são lidas e escritas no arquivo filters.csv.
    """
    def __init__(self,
                 id: Optional[int],
                 name: str,
                 type: str):
        """
        Inicializa uma instância de Filtro.

        Args:
            id (Optional[int]): O ID único do filtro. Pode ser None para novos filtros.
            name (str): O nome do filtro (ex: 'Decibell', 'Sem Fio', 'Azul').
            type (str): O tipo do filtro (ex: 'brand', 'type', 'color').
        """
        self.id = id
        self.name = name
        self.type = type

    def to_dict(self) -> Dict[str, Any]:
        """
        Converte a instância do filtro para um dicionário, ideal para salvar em CSV ou API.

        Returns:
            Dict[str, Any]: Um dicionário representando o filtro.
        """
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Filter':
        """
        Cria uma instância de Filter a partir de um dicionário (geralmente de uma linha de CSV).

        Args:
            data (Dict[str, Any]): O dicionário com os dados do filtro.

        Returns:
            Filter: Uma nova instância da classe Filter.
        """
        return cls(
            id=int(data.get('id', 0)),
            name=data.get('name', 'Desconhecido'),
            type=data.get('type', 'geral')
        )

    def __repr__(self) -> str:
        """
        Retorna uma representação legível do objeto, útil para fins de depuração.
        """
        return f"<Filter id={self.id} type='{self.type}' name='{self.name}'>"
