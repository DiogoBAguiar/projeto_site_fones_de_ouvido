# app/__init__.py
# Este arquivo implementa o padrão de fábrica de aplicação.

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

# Cria uma instância do SQLAlchemy para gerenciar o banco de dados.
db = SQLAlchemy()

def create_app(config_class=Config):
    """Fábrica de aplicação para criar a instância do Flask."""
    app = Flask(__name__)
    
    # Carrega as configurações da classe Config.
    app.config.from_object(config_class)
    
    # Inicializa a extensão SQLAlchemy com a aplicação.
    db.init_app(app)

    # Cria a pasta 'instance' para o banco de dados se ela não existir.
    # É uma boa prática do Flask para arquivos de instância.
    if not os.path.exists('instance'):
        os.makedirs('instance')
    
    # ==============================================================================
    # REGISTRO DE BLUEPRINTS
    # ==============================================================================
    
    # Importa os Blueprints de cada arquivo de rota.
    from app.routes.public import public_bp
    from app.routes.user import user_bp
    from app.routes.admin import admin_bp
    
    # Registra os Blueprints na aplicação.
    app.register_blueprint(public_bp)
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    
    return app

