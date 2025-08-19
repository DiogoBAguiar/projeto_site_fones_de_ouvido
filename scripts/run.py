from flask import Flask, render_template, request, flash, redirect, url_for
import csv
import hashlib, os
from werkzeug.security import generate_password_hash, check_password_hash

# Inicializa a aplicação Flask
# Adiciona o argumento template_folder para dizer ao Flask onde encontrar os templates
app = Flask(__name__, template_folder='app/templates')
# A chave secreta deve ser uma variável de ambiente em produção para maior segurança.
# Acessa a variável de ambiente SECRET_KEY ou usa um valor padrão se não existir.
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'uma-chave-secreta-forte-e-aleatoria'

# --- Funções de validação de senha ---
# Estas funções foram movidas para uma classe ou arquivo de utilidades para melhor organização em projetos maiores.
def teste_tamanho(senha: str) -> bool:
    """Verifica se a senha tem pelo menos 8 caracteres."""
    return len(senha) >= 8

def teste_maiscula(senha: str) -> bool:
    """Verifica se a senha contém pelo menos uma letra maiúscula."""
    return any(c.isupper() for c in senha)

def teste_minuscula(senha: str) -> bool:
    """Verifica se a senha contém pelo menos duas letras minúsculas."""
    return sum(1 for c in senha if c.islower()) >= 2

def teste_numero(senha: str) -> bool:
    """Verifica se a senha contém pelo menos um dígito."""
    return any(c.isdigit() for c in senha)

def teste_especial(senha: str) -> bool:
    """Verifica se a senha contém pelo menos dois caracteres especiais (não alfanuméricos)."""
    return sum(1 for c in senha if not c.isalnum()) >= 2

# A função de conexão com o MySQL não está sendo usada no código atual
# e foi removida para simplificar. A documentação sugere SQLAlchemy,
# que é a abordagem mais adequada para um projeto como este.

# --- Rota de register ---
@app.route("/register", methods=["GET", "POST"])
def login():
    """Rota para a página de login."""
    if request.method == "POST":
        email = request.form["email"]
        senha = request.form["senha"]

        # Busca o usuário no arquivo CSV (implementação temporária)
        usuarios = {}
        try:
            with open("usuarios.csv", mode="r", newline="") as arquivo:
                reader = csv.reader(arquivo)
                for linha in reader:
                    if linha:
                        usuarios[linha[0]] = linha[1]  # {email: senha_hashed}
        except FileNotFoundError:
            flash("Nenhum usuário cadastrado. Por favor, cadastre-se primeiro.")
            return render_template("public/login.html") # Caminho corrigido

        # Verifica se o email existe e se a senha está correta
        if email in usuarios and check_password_hash(usuarios[email], senha):
            flash("Login realizado com sucesso!")
            # TODO: Implementar lógica de sessão e redirecionar para a página inicial ou painel do usuário.
            return redirect(url_for("index")) # Exemplo de redirecionamento para uma rota 'index'
        else:
            flash("Email ou senha inválidos.")
            return render_template("public/login.html", email=email) # Caminho corrigido

    return render_template("public/login.html") # Caminho corrigido

# --- Rota de cadastro ---
@app.route("/cadastro", methods=["GET", "POST"])
def cadastro():
    """Rota para a página de cadastro de novo usuário."""
    if request.method == "POST":
        email = request.form["email"]
        senha = request.form["senha"]
        
        # Validação da senha
        if not (teste_tamanho(senha) and teste_maiscula(senha) and teste_minuscula(senha) and teste_numero(senha) and teste_especial(senha)):
            flash("Senha inválida! Certifique-se de atender todos os requisitos.")
            return render_template("public/register.html", email=email) # Caminho corrigido

        # Lê usuários existentes para verificar se o email já foi cadastrado
        usuarios_emails = []
        try:
            with open("usuarios.csv", mode="r", newline="") as arquivo:
                reader = csv.reader(arquivo)
                for linha in reader:
                    if linha:
                        usuarios_emails.append(linha[0])
        except FileNotFoundError:
            pass
        
        if email in usuarios_emails:
            flash("Usuário já cadastrado!")
            return render_template("public/register.html", email=email) # Caminho corrigido

        # Salva o novo usuário com a senha hasheada
        hashed_senha = generate_password_hash(senha)
        with open("usuarios.csv", mode="a", newline="") as arquivo:
            writer = csv.writer(arquivo)
            writer.writerow([email, hashed_senha])

        flash("Cadastro realizado com sucesso!")
        return redirect(url_for("login")) # Redireciona para a rota de login

    return render_template("public/register.html") # Caminho corrigido

# --- Rota de exemplo para a página inicial ---
@app.route("/")
def index():
    """Rota de exemplo para a página inicial do site."""
    return render_template("public/index.html")

# --- Rota de login  ---
@app.route("/login", methods = ["GET","POST"])
def login():
    if request.method == "POST":
       email = request.form["email"]
       senha = request.form["senha"]
       with open("usuarios.csv", mode="r", newline="", encoding="utf-8") as arquivo:
        reader = csv.DictReader(arquivo)
        usuarios = {}
        for linha in reader:
            usuarios[linha["email"]] = linha["senha"]

        if usuarios.get(email) == hash_md5(senha):
            flash("Login realizado com sucesso!")
            return redirect(url_for("welcome", email=email))
        
        flash("Login inválido!")
        return render_template("login.html", email=email)

# Se rodar diretamente este arquivo, inicia o servidor.
if __name__ == "__main__":
    app.run(debug=True)
