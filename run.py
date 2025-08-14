from flask import Flask, render_template, request, flash, redirect, url_for
import csv

app = Flask(__name__)
app.secret_key = "LArapio123@"

# --- Funções de validação de senha ---
def teste_tamanho(senha: str) -> bool:
    return len(senha) >= 8

def teste_maiscula(senha: str) -> bool:
    return any(c.isupper() for c in senha)

def teste_minuscula(senha: str) -> bool:
    return sum(1 for c in senha if c.islower()) >= 2

def teste_numero(senha: str) -> bool:
    return any(c.isdigit() for c in senha)

def teste_especial(senha: str) -> bool:
    return sum(1 for c in senha if not c.isalnum()) >= 2

# --- Rota de login / cadastro ---
@app.route("/login", methods=["GET", "POST"])
def login():
    email = ""
    if request.method == "POST":
        email = request.form["email"]
        senha = request.form["senha"]

        # Verifica senha
        if not (teste_tamanho(senha) and teste_maiscula(senha) and teste_minuscula(senha) and teste_numero(senha) and teste_especial(senha)):
            flash("Senha inválida! Certifique-se de atender todos os requisitos.")
            return render_template("login.html", email=email)

        # Lê usuários existentes
        usuarios = []
        try:
            with open("usuarios.csv", mode="r", newline="") as arquivo:
                reader = csv.reader(arquivo)
                for linha in reader:
                    if linha:
                        usuarios.append(linha[0])  # pega emails
        except FileNotFoundError:
            pass

        if email in usuarios:
            flash("Usuário já cadastrado!")
            return render_template("login.html", email=email)

        # Salvar novo usuário
        with open("usuarios.csv", mode="a", newline="") as arquivo:
            writer = csv.writer(arquivo)
            writer.writerow([email, senha])

        flash("Cadastro realizado com sucesso!")
        return redirect(url_for("login"))

    return render_template("login.html", email=email)

