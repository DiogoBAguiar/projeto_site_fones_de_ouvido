# config.py
# Este arquivo contém as classes de configuração para sua aplicação Flask.
# Refatorado para remover a dependência do Flask-SQLAlchemy.

import os

class Config:
    """Classe base de configuração. Define as configurações comuns."""
    # A chave secreta é usada para sessões, CSRF e outros recursos de segurança.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'uma-chave-secreta-forte-e-aleatoria'
    
    # As configurações de banco de dados SQLALCHEMY foram removidas
    # para usar uma arquitetura baseada em CSV.
    # SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    # SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configurações do Flask-Login
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True

class DevelopmentConfig(Config):
    """Configurações para o ambiente de desenvolvimento."""
    DEBUG = True
    SESSION_COOKIE_SECURE = False
    REMEMBER_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Configurações para o ambiente de produção."""
    DEBUG = False
