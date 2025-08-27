from datetime import datetime
from typing import Dict, Any, Optional
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin):
    """
    Representa um usuário no sistema.

    Esta classe herda de UserMixin do Flask-Login para fornecer as implementações
    padrão necessárias para o gerenciamento de sessão de usuários.
    """
    def __init__(self,
                 id: Optional[int],
                 username: str,
                 email: str,
                 password_hash: str,
                 role: str,
                 profile_picture: Optional[str] = None,
                 date_joined: Optional[datetime] = None,
                 address: Optional[str] = None, 
                 city: Optional[str] = None,    
                 state: Optional[str] = None,  
                 zip_code: Optional[str] = None): 
        """
        Inicializa uma instância de Usuário.

        Args:
            id (Optional[int]): O ID único do usuário. Pode ser None para novos usuários.
            username (str): O nome de usuário.
            email (str): O endereço de email (usado para login).
            password_hash (str): O hash seguro da senha do usuário.
            role (str): O papel do usuário (ex: 'user', 'admin').
            profile_picture (Optional[str]): O caminho URL para a foto de perfil.
            date_joined (Optional[datetime]): A data e hora do registro. Se None, usa o tempo atual.
            address (Optional[str]): Endereço do usuário.
            city (Optional[str]): Cidade do usuário.
            state (Optional[str]): Estado do usuário.
            zip_code (Optional[str]): Código postal (CEP) do usuário.
        """
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.profile_picture = profile_picture
        self.date_joined = date_joined or datetime.utcnow()
        self.address = address
        self.city = city
        self.state = state
        self.zip_code = zip_code

    def to_dict(self) -> Dict[str, Any]:
        """
        Converte a instância do usuário para um dicionário, ideal para salvar em CSV.
        
        Returns:
            Dict[str, Any]: Um dicionário representando o usuário.
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'password_hash': self.password_hash,
            'role': self.role,
            'profile_picture': self.profile_picture or '',
            'date_joined': self.date_joined.isoformat(),
            'address': self.address or '',
            'city': self.city or '',       
            'state': self.state or '',   
            'zip_code': self.zip_code or '' 
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        """
        Cria uma instância de User a partir de um dicionário (geralmente de uma linha de CSV).

        Args:
            data (Dict[str, Any]): O dicionário com os dados do usuário.

        Returns:
            User: Uma nova instância da classe User.
        """
        # Converte a data de string ISO para objeto datetime, com fallback para o tempo atual.
        try:
            date_joined = datetime.fromisoformat(data.get('date_joined'))
        except (ValueError, TypeError):
            date_joined = datetime.utcnow()
        
        return cls(
            id=int(data['id']),
            username=data.get('username', 'Usuário Anônimo'),
            email=data.get('email', ''),
            password_hash=data.get('password_hash', ''),
            role=data.get('role', 'user'),
            profile_picture=data.get('profile_picture'),
            date_joined=date_joined,
            address=data.get('address'), 
            city=data.get('city'),      
            state=data.get('state'),    
            zip_code=data.get('zip_code') 
        )

    def get_id(self) -> str:
        """
        Retorna o ID do usuário como uma string, conforme exigido pelo Flask-Login.
        """
        return str(self.id)
