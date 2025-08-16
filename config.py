# config.py
# Este arquivo contém as classes de configuração para sua aplicação Flask.

import os

class Config:
    """Classe base de configuração. Define as configurações comuns."""
    # A chave secreta é usada para sessões, CSRF e outros recursos de segurança.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'uma-chave-secreta-forte-e-aleatoria'
    
    # Configuração do banco de dados SQLite. O banco de dados será criado na pasta 'instance'.
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    """Configurações para o ambiente de desenvolvimento."""
    DEBUG = True

class ProductionConfig(Config):
    """Configurações para o ambiente de produção."""
    DEBUG = False
    # Para produção, deveria usar um banco de dados mais robusto, como PostgreSQL ou MySQL.
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
