# run.py
# Este é o ponto de entrada da sua aplicação.
# Ele importa e executa a fábrica de aplicação.

from app import create_app

# Cria a instância da aplicação Flask.
app = create_app()

if __name__ == '__main__':
    # Inicia o servidor Flask em modo de depuração.
    app.run(debug=True)
