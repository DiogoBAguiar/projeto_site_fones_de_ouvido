from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Dados de produtos de exemplo (em um ambiente real, viriam de um banco de dados)
produtos_novidades = [
    {
        "id": 1,
        "nome": "Fone de Ouvido Sem Fio Decibell Pro X",
        "descricao": "Experimente a liberdade do som sem fios com o Decibell Pro X. Áudio imersivo, cancelamento de ruído ativo e bateria de longa duração para acompanhar seu ritmo.",
        "imagem_url": "https://placehold.co/600x400/414345/FFFFFF?text=Fone+Decibell+Pro+X"
    },
    {
        "id": 2,
        "nome": "Fone Intra-auricular Decibell Fit Sport",
        "descricao": "Projetado para atletas, o Decibell Fit Sport oferece um ajuste seguro e confortável, resistência à água e suor, e qualidade de som que te impulsiona.",
        "imagem_url": "https://placehold.co/600x400/232526/FFFFFF?text=Fone+Fit+Sport"
    },
    {
        "id": 3,
        "nome": "Headset Gamer Decibell Vortex",
        "descricao": "Domine o campo de batalha com o Decibell Vortex. Som surround 7.1, microfone retrátil e iluminação RGB para uma experiência de jogo inigualável.",
        "imagem_url": "https://placehold.co/600x400/414345/FFFFFF?text=Headset+Vortex"
    }
]

# Rota principal para servir o arquivo HTML
@app.route('app/template/index.html')
def index():
    """
    Renderiza a página principal do site de e-commerce.
    """
    return render_template('index.html')

# Rota da API para retornar os produtos de novidades
@app.route('/api/novidades', methods=['GET'])
def obter_novidades():
    """
    Retorna uma lista de produtos em destaque para a seção 'Novidades'.
    Em um cenário real, esta função poderia filtrar produtos por 'novidade', 'mais vendidos', etc.
    """
    return jsonify(produtos_novidades)

# --- Rotas de exemplo para futuras funcionalidades (não implementadas neste escopo) ---

@app.route('/api/login', methods=['POST'])
def login_usuario():
    """
    Rota para simular o login de um usuário.
    Em um ambiente real, processaria credenciais e autenticaria o usuário.
    """
    dados = request.json
    usuario = dados.get('usuario')
    senha = dados.get('senha')
    # Lógica de autenticação aqui
    if usuario == "teste" and senha == "senha123":
        return jsonify({"mensagem": "Login bem-sucedido!", "token": "abc123def456"}), 200
    else:
        return jsonify({"mensagem": "Credenciais inválidas."}), 401

@app.route('/api/carrinho/adicionar', methods=['POST'])
def adicionar_ao_carrinho():
    """
    Rota para simular a adição de um produto ao carrinho.
    """
    dados = request.json
    produto_id = dados.get('produto_id')
    quantidade = dados.get('quantidade', 1)
    # Lógica para adicionar ao carrinho (ex: em uma sessão ou banco de dados)
    return jsonify({"mensagem": f"Produto {produto_id} adicionado ao carrinho (x{quantidade})."}), 200

# Executa o aplicativo Flask
if __name__ == '__main__':
    # 'debug=True' permite recarregamento automático e depuração.
    # Em produção, use um servidor WSGI como Gunicorn ou uWSGI.
    app.run(debug=True)
