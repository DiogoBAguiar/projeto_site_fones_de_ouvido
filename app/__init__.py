# app/__init__.py
# Este arquivo implementa o padrão de fábrica de aplicação.
# Ajustado para inicializar o SQLAlchemy e registrar os Blueprints de forma organizada.

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

# Cria uma instância do SQLAlchemy.
# Esta instância é global e será associada à aplicação mais tarde,
# dentro da função de fábrica.
db = SQLAlchemy()

def create_app(config_class=Config):
    """
    Fábrica de aplicação para criar a instância do Flask.
    Essa função permite a criação de múltiplas instâncias da aplicação
    com diferentes configurações (e.g., desenvolvimento, produção).
    """
    # Cria a instância do Flask. O 'template_folder' é definido
    # explicitamente para garantir que o Flask encontre os templates
    # corretamente, independentemente de onde o script 'run.py' é executado.
    app = Flask(__name__, template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates'))
    
    # Carrega as configurações da classe Config.
    app.config.from_object(config_class)
    
    # Inicializa a extensão SQLAlchemy com a aplicação.
    # Esta é a parte crucial do padrão de fábrica, onde as extensões
    # se tornam cientes da aplicação.
    db.init_app(app)

    # Cria a pasta 'instance' para o banco de dados se ela não existir.
    if not os.path.exists(app.instance_path):
        os.makedirs(app.instance_path)
    
    # ==============================================================================
    # REGISTRO DE BLUEPRINTS E IMPORTAÇÃO DE MODELOS
    # ==============================================================================
    
    # Importa os modelos para garantir que as relações do SQLAlchemy
    # sejam criadas e que o 'db.create_all()' em run.py funcione corretamente.
    from app.models import user, product, review

    # Importa os Blueprints de cada arquivo de rota.
    from app.routes.public import public_bp
    from app.routes.user import user_bp
    from app.routes.admin import admin_page_bp, admin_api_bp, dashboard_api_bp
    
    # Registra os Blueprints na aplicação.
    # O 'url_prefix' é usado para agrupar rotas de forma lógica.
    app.register_blueprint(public_bp)
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(admin_page_bp)
    app.register_blueprint(admin_api_bp)
    app.register_blueprint(dashboard_api_bp)
    
    return app
