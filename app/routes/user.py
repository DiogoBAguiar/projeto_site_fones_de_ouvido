# app/routes/user.py
# Este Blueprint lida com as rotas específicas para usuários autenticados.

from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from app import db # Importa a instância do SQLAlchemy
from app.models.user import User # Importa o modelo de Usuário
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os

# Cria o Blueprint com o nome 'user' e um prefixo de URL.
user_bp = Blueprint('user', __name__)

# Define o caminho para a pasta de uploads
UPLOAD_FOLDER = 'app/static/uploads/profile_pictures'

@user_bp.route('/profile')
@login_required
def profile():
    """Rota para a página de perfil do usuário."""
    return render_template('user/profile.html')

@user_bp.route('/profile/update', methods=['POST'])
@login_required
def update_profile():
    """Rota para atualizar as informações do perfil do usuário."""
    try:
        # Pega os dados do formulário
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Atualiza os dados do usuário atual
        current_user.username = username
        current_user.email = email

        # Lógica para alterar a senha
        if password:
            if password == confirm_password:
                current_user.password_hash = generate_password_hash(password).decode('utf-8')
            else:
                flash('As senhas não coincidem.', 'danger')
                return redirect(url_for('user.profile'))

        # Lógica para upload de foto de perfil
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file.filename != '':
                # Garante que a pasta de uploads existe
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                # Salva a imagem com um nome seguro
                filename = secure_filename(file.filename)
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                # Salva o caminho da imagem no banco de dados
                current_user.profile_picture = url_for('static', filename=f'uploads/profile_pictures/{filename}')

        db.session.commit()
        flash('Perfil atualizado com sucesso!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Ocorreu um erro ao atualizar o perfil: {str(e)}', 'danger')
    
    return redirect(url_for('user.profile'))

@user_bp.route('/cart')
@login_required
def cart():
    """Rota para a página de carrinho do usuário."""
    return render_template('user/cart.html')
