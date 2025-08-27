import os
from flask import (
    Blueprint, render_template, request, redirect, url_for, flash, jsonify, current_app, send_from_directory
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

        # Validações básicas
        if password and password != confirm_password:
            flash('As senhas não coincidem.', 'danger')
            return redirect(url_for('user.profile'))
        
        # Atualiza o nome de usuário e o email
        current_user.username = username
        current_user.email = email
        current_user.address = request.form.get('address')
        current_user.city = request.form.get('city')
        current_user.state = request.form.get('state')
        current_user.zip_code = request.form.get('zip')
        if password:
            current_user.password_hash = generate_password_hash(password)
        if profile_picture_file and profile_picture_file.filename != '':
            user_upload_folder = os.path.join(data_manager.DATA_FOLDER, 'uploads', 'users', str(current_user.id))
            
            os.makedirs(user_upload_folder, exist_ok=True)
            # Deleta a foto antiga, se existir
            if current_user.profile_picture:
                old_picture_filename = os.path.basename(current_user.profile_picture)
                old_picture_path = os.path.join(user_upload_folder, old_picture_filename)
                if os.path.exists(old_picture_path):
                    os.remove(old_picture_path)
                    
            # Salva o novo arquivo
            filename = secure_filename(profile_picture_file.filename)
            save_path = os.path.join(user_upload_folder, filename)
            profile_picture_file.save(save_path)
            
            # Atualiza o caminho da imagem no modelo de usuário
            current_user.profile_picture = url_for('user.profile_picture', filename=f"{current_user.id}/{filename}")
        
        # Salva o objeto User atualizado no arquivo CSV
        data_manager.save_user(current_user)
        
        flash('Seu perfil foi atualizado com sucesso!', 'success')

    except Exception as e:
        flash(f'Ocorreu um erro inesperado ao atualizar o perfil: {e}', 'danger')
    
    return redirect(url_for('user.profile'))

@user_bp.route('/profile-pictures/<path:filename>')
def profile_picture(filename):
    """
    Serve a foto de perfil do usuário a partir da pasta de dados,
    fora do diretório 'static'.
    """
    # A URL é formatada como "ID/nome_do_arquivo", então precisamos separar.
    user_id = filename.split('/')[0]
    file_name = "/".join(filename.split('/')[1:])
    folder_path = os.path.join(data_manager.DATA_FOLDER, 'uploads', 'users', user_id)
    return send_from_directory(folder_path, file_name)


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
            "profile_picture": current_user.profile_picture or '',
            "address": current_user.address or '',  
            "city": current_user.city or '',       
            "state": current_user.state or '',     
            "zip_code": current_user.zip_code or ''  
        })
    return jsonify({"error": "Usuário não autenticado"}), 401
