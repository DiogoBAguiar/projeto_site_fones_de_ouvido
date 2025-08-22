# run.py
# Ponto de entrada principal para a aplicação Decibell.

import os
from app import create_app

# Carrega a configuração a partir de uma variável de ambiente (FLASK_CONFIG).
# Se a variável não estiver definida, o modo 'development' (desenvolvimento) será usado como padrão.
config_name = os.getenv('FLASK_CONFIG') or 'development'

# Cria a instância da aplicação Flask utilizando a fábrica de aplicação ('create_app')
# e a configuração selecionada.
app = create_app(config_name)

if __name__ == '__main__':
    # Executa a aplicação.
    # O modo de depuração (debug mode) e outras configurações são controlados
    # pelo arquivo de configuração carregado (ex: DevelopmentConfig).
    app.run()
