# app/routes/user.py
# Lida com as rotas para usuários autenticados, como a página de perfil.

import os
from flask import (
    Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app
)
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename

from app.utils import data_manager

# Cria o Blueprint para agrupar as rotas de usuário.
# O prefixo '/user' já é definido no app/__init__.py ao registrar o blueprint.
user_bp = Blueprint('user', __name__)


# --- ROTAS DE PÁGINAS (HTML) ---

@user_bp.route('/profile')
@login_required
def profile():
    """Renderiza a página de perfil do usuário."""
    return render_template('user/profile.html')


@user_bp.route('/profile/update', methods=['POST'])
@login_required
def update_profile():
    """Processa a atualização dos dados do perfil do usuário."""
    try:
        # Coleta os dados do formulário
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        profile_picture_file = request.files.get('profile_picture')

        # Validação dos dados
        if email != current_user.email and data_manager.get_user_by_email(email):
            flash('O novo email informado já está em uso por outra conta.', 'danger')
            return redirect(url_for('user.profile'))

        if password and password != confirm_password:
            flash('As novas senhas não coincidem.', 'danger')
            return redirect(url_for('user.profile'))

        # Atualiza os dados do objeto 'current_user'
        current_user.username = username
        current_user.email = email

        # Se uma nova senha foi fornecida, atualiza o hash
        if password:
            current_user.password_hash = generate_password_hash(password)

        # Se uma nova foto de perfil foi enviada, salva o arquivo
        if profile_picture_file and profile_picture_file.filename != '':
            # Cria um nome de arquivo seguro para evitar conflitos e problemas de segurança
            filename = f"user_{current_user.id}_{secure_filename(profile_picture_file.filename)}"
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            
            # Cria a pasta de uploads se não existir
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            
            profile_picture_file.save(save_path)
            # Salva o caminho relativo para ser usado no template HTML
            current_user.profile_picture = f"/static/uploads/{filename}"

        # Salva o objeto User atualizado no arquivo CSV
        data_manager.save_user(current_user)
        
        flash('Seu perfil foi atualizado com sucesso!', 'success')

    except Exception as e:
        flash(f'Ocorreu um erro inesperado ao atualizar o perfil: {e}', 'danger')
    
    return redirect(url_for('user.profile'))


# --- ROTAS DE API DO USUÁRIO (JSON) ---

@user_bp.route('/api/profile')
@login_required
def get_profile_data():
    """API: Retorna os dados do perfil do usuário logado em formato JSON."""
    if current_user.is_authenticated:
        return jsonify({
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "profile_picture": current_user.profile_picture,
            "date_joined": current_user.date_joined.isoformat()
        })
    return jsonify({"error": "Usuário não autenticado"}), 401
