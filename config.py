# config.py
# Contém as classes de configuração para os diferentes ambientes da aplicação.

import os

# Define o diretório base da aplicação para construir caminhos de forma segura.
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    """Classe de configuração base com definições comuns a todos os ambientes."""
    # Chave secreta para proteger sessões e formulários contra CSRF.
    # É fundamental que em produção esta chave seja uma variável de ambiente segura.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'uma-chave-secreta-dificil-de-adivinhar'

    # Define a pasta padrão para o upload de arquivos.
    UPLOAD_FOLDER = os.path.join(basedir, 'app', 'static', 'uploads')
    
    # Configurações adicionais do Flask podem ser adicionadas aqui.
    @staticmethod
    def init_app(app):
        # Este método pode ser usado para inicializações específicas da configuração.
        pass

class DevelopmentConfig(Config):
    """Configurações para o ambiente de desenvolvimento."""
    DEBUG = True

class ProductionConfig(Config):
    """Configurações para o ambiente de produção."""
    DEBUG = False
    # Em produção, você pode querer adicionar outras configurações de segurança,
    # como SESSION_COOKIE_SECURE=True, se estiver usando HTTPS.

class TestingConfig(Config):
    """Configurações para o ambiente de testes."""
    TESTING = True
    # Desativa a proteção CSRF nos testes para simplificar as requisições.
    WTF_CSRF_ENABLED = False

# Dicionário que mapeia os nomes das configurações às suas respectivas classes.
# Isso permite carregar a configuração correta a partir de uma string no run.py.
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
