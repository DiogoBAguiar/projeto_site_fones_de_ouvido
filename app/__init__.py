# app/__init__.py
# Este arquivo implementa o padrão de fábrica de aplicação.
# Agora, ele é totalmente independente de um banco de dados e cria os arquivos CSV necessários.

import os
import csv
from flask import Flask
from config import Config
from app.utils import data_manager # Importa para usar as constantes de caminho

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
    # CRIAÇÃO AUTOMÁTICA DE ARQUIVOS CSV
    # ==============================================================================
    def create_csv_if_not_exists(filepath, fieldnames):
        if not os.path.exists(filepath):
            with open(filepath, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
    
    # Cria os arquivos principais
    create_csv_if_not_exists(data_manager.USERS_CSV, data_manager.USERS_FIELDNAMES)
    create_csv_if_not_exists(data_manager.PRODUCTS_CSV, data_manager.PRODUCTS_FIELDNAMES)
    create_csv_if_not_exists(data_manager.REVIEWS_CSV, data_manager.REVIEWS_FIELDNAMES)
    create_csv_if_not_exists(data_manager.FILTERS_CSV, data_manager.FILTERS_FIELDNAMES)

    # Cria os arquivos do dashboard
    create_csv_if_not_exists(os.path.join(data_manager.DATA_FOLDER, 'kpis.csv'), ['timeRange', 'metric', 'value', 'description', 'changeType'])
    create_csv_if_not_exists(os.path.join(data_manager.DATA_FOLDER, 'analytics.csv'), ['timeRange', 'date', 'sales', 'visits'])
    create_csv_if_not_exists(os.path.join(data_manager.DATA_FOLDER, 'recent_sales.csv'), ['timeRange', 'email', 'amount'])

    # ==============================================================================
    # REGISTRO DE BLUEPRINTS E IMPORTAÇÃO DE MODELOS
    # ==============================================================================
    
    # Os modelos ainda serão importados, mas apenas para que o Flask-Login
    # saiba onde procurar a classe User.
    from app.models import user, product, review
    from app.models import filter as filter_model

    # Importa os Blueprints de cada arquivo de rota.
    from app.routes.public import public_bp
    from app.routes.user import user_bp
    from app.routes.admin import admin_page_bp, admin_api_bp, dashboard_api_bp
    
    # Registra os Blueprints na aplicação.
    app.register_blueprint(public_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_page_bp)
    app.register_blueprint(admin_api_bp)
    app.register_blueprint(dashboard_api_bp)
    
    return app
