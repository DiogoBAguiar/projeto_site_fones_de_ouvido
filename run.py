# run.py
# Este é o ponto de entrada da sua aplicação Flask.
# Agora, ele usa o data_manager para gerenciar os dados do usuário.

import os
from app import create_app
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from app.models.user import User
from app.utils import data_manager

# Cria a instância da aplicação Flask.
app = create_app()

# Inicializa as extensões de segurança.
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)
login_manager.login_view = 'public.login'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    """
    Função de callback do Flask-Login.
    Carrega o usuário a partir do arquivo CSV usando o data_manager.
    """
    return data_manager.get_user_by_id(user_id)

if __name__ == '__main__':
    # Esta é a nova arquitetura: não há mais chamadas ao SQLAlchemy.
    app.run(debug=True)
