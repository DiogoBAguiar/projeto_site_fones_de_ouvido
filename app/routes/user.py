# app/routes/user.py
# Este Blueprint lida com as rotas específicas para usuários autenticados.
# Refatorado para usar arquivos CSV em vez de um banco de dados,
# e para incluir a lógica de atualização de perfil.

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_required, current_user
from app.models.user import User
from app.utils import data_manager
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
import os

# Cria o Blueprint com o nome 'user' e um prefixo de URL.
user_bp = Blueprint('user', __name__, url_prefix='/user')

# Define o caminho para a pasta de uploads
UPLOAD_FOLDER = 'app/static/uploads/profile_pictures'

@user_bp.route('/profile')
@login_required
def profile():
    """Rota para a página de perfil do usuário."""
    # A página de perfil será renderizada com base nos dados do usuário logado.
    return render_template('user/profile.html')

@user_bp.route('/profile/update', methods=['POST'])
@login_required
def update_profile():
    """Rota de API para atualizar as informações do perfil do usuário."""
    try:
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Garante que as informações obrigatórias estão presentes
        if not username or not email:
            flash('Nome de usuário e email são obrigatórios.', 'danger')
            return redirect(url_for('user.profile'))

        # Lógica para alterar a senha
        if password:
            hashed_password = generate_password_hash(password)
            current_user.password_hash = hashed_password
        
        # Lógica para upload de foto de perfil
        if 'profile_picture' in request.files:
            file = request.files['profile_picture']
            if file.filename != '':
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                filename = secure_filename(f'{current_user.id}_{file.filename}')
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(file_path)
                current_user.profile_picture = url_for('static', filename=f'uploads/profile_pictures/{filename}')
        
        # Cria um novo objeto User com as informações atualizadas
        updated_user = User(
            id=current_user.id,
            username=username,
            email=email,
            password_hash=current_user.password_hash,
            role=current_user.role,
            profile_picture=current_user.profile_picture,
            date_joined=current_user.date_joined
        )
        
        # Atualiza o arquivo CSV de usuários
        data_manager.update_user(updated_user)
        
        flash('Perfil atualizado com sucesso!', 'success')
        return redirect(url_for('user.profile'))
    
    except Exception as e:
        flash(f'Ocorreu um erro ao atualizar o perfil: {str(e)}', 'danger')
        return redirect(url_for('user.profile'))

@user_bp.route('/cart')
@login_required
def cart():
    """Rota para a página de carrinho do usuário."""
    # Lógica do carrinho aqui...
    return render_template('user/cart.html')

@user_bp.route('/api/profile', methods=['GET'])
@login_required
def get_user_profile():
    """Rota de API para obter os dados do perfil do usuário logado."""
    user_data = current_user.to_dict()
    return jsonify(user_data)
