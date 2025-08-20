# app/__init__.py
# Este arquivo implementa o padrão de fábrica de aplicação.
# Agora, ele é totalmente independente de um banco de dados.

import os
import csv  # Adicionado para criar os arquivos CSV
from flask import Flask
from config import Config

def create_app(config_class=Config):
    """
    Fábrica de aplicação para criar a instância do Flask.
    """
    app = Flask(__name__, template_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates'))
    
    # Carrega as configurações da classe Config.
    app.config.from_object(config_class)
    
    # Cria a pasta para arquivos estáticos e CSVs se ela não existir.
    data_folder = os.path.join(app.root_path, '..', 'banco_de_dados')
    if not os.path.exists(data_folder):
        os.makedirs(data_folder)
    
    # ==============================================================================
    # REGISTRO DE BLUEPRINTS E IMPORTAÇÃO DE MODELOS
    # ==============================================================================
    
    # Os modelos ainda serão importados, mas apenas para que o Flask-Login
    # saiba onde procurar a classe User.
    from app.models import user, product, review

    # Importa os Blueprints de cada arquivo de rota.
    from app.routes.public import public_bp
    from app.routes.user import user_bp
    from app.routes.admin import admin_page_bp, admin_api_bp, dashboard_api_bp
    
    # Registra os Blueprints na aplicação.
    app.register_blueprint(public_bp)
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(admin_page_bp)
    app.register_blueprint(admin_api_bp)
    app.register_blueprint(dashboard_api_bp)
    
    return app
