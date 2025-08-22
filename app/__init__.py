# app/__init__.py
# Implementa o padrão de fábrica de aplicação (Application Factory).

import os
from flask import Flask, jsonify, request, redirect, url_for
from flask_login import LoginManager
from config import config

# Instancia as extensões do Flask fora da fábrica
login_manager = LoginManager()
login_manager.login_view = 'public.login'
login_manager.login_message_category = 'info'

@login_manager.unauthorized_handler
def unauthorized():
    """
    Handler customizado para acessos não autorizados.
    Se a requisição for para uma API, retorna um erro JSON.
    Caso contrário, redireciona para a página de login.
    """
    if request.path.startswith('/api/'):
        return jsonify(error="Autenticação necessária para acessar este recurso."), 401
    return redirect(url_for('public.login'))


def create_app(config_name):
    """
    Fábrica de Aplicação: cria e configura uma instância da aplicação Flask.
    """
    app = Flask(__name__)

    # 1. Carrega a configuração
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    # 2. Inicializa as extensões
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        from .utils import data_manager
        return data_manager.get_user_by_id(user_id)

    # Garante que a pasta de uploads exista
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    # 3. Registra os Blueprints
    from .routes.public import public_bp as public_blueprint
    app.register_blueprint(public_blueprint)

    from .routes.user import user_bp as user_blueprint
    app.register_blueprint(user_blueprint, url_prefix='/user')

    from .routes.admin import admin_page_bp as admin_page_blueprint
    app.register_blueprint(admin_page_blueprint, url_prefix='/admin')
    
    from .routes.admin import admin_api_bp as admin_api_blueprint
    app.register_blueprint(admin_api_blueprint, url_prefix='/api/admin')

    return app
