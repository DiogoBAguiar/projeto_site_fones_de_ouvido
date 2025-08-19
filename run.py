# run.py
# Este é o ponto de entrada da sua aplicação Flask.
# Ele importa a fábrica de aplicação e executa o servidor.
#
# Adicionadas importações e inicialização para Flask-Login e Bcrypt,
# que são essenciais para o sistema de autenticação seguro.

from app import create_app, db
from flask_login import LoginManager
from flask_bcrypt import Bcrypt
from app.models.user import User

# Cria a instância da aplicação Flask.
app = create_app()

# Inicializa as extensões de segurança.
# Flask-Bcrypt: para hashear e verificar senhas de forma segura.
bcrypt = Bcrypt(app)
# Flask-Login: para gerenciar sessões de usuários (login, logout, etc.).
login_manager = LoginManager(app)
# Define a página para a qual o usuário deve ser redirecionado se tentar
# acessar uma rota protegida sem estar logado.
login_manager.login_view = 'public.login'
# Define a categoria da mensagem de flash para logins.
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    """
    Função de callback do Flask-Login.
    Carrega um usuário a partir do seu ID para gerenciar a sessão.
    Retorna o objeto do usuário.
    """
    return User.query.get(int(user_id))

if __name__ == '__main__':
    # O bloco de código abaixo garante que as tabelas do banco de dados
    # sejam criadas automaticamente se ainda não existirem.
    # Isso é feito dentro do 'app context' para que a aplicação saiba
    # a qual banco de dados se conectar.
    with app.app_context():
        db.create_all()
    # Inicia o servidor Flask em modo de depuração.
    app.run(debug=True)
