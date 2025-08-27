from typing import Dict, Any, Optional

class Filter:
    
    def __init__(self,
                 id: Optional[int],
                 name: str,
                 type: str):
       
        self.id = id
        self.name = name
        self.type = type

    def to_dict(self) -> Dict[str, Any]:
       
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Filter':
       
        return cls(
            id=int(data.get('id', 0)),
            name=data.get('name', 'Desconhecido'),
            type=data.get('type', 'geral')
        )

    def __repr__(self) -> str:
       
        return f"<Filter id={self.id} type='{self.type}' name='{self.name}'>"
