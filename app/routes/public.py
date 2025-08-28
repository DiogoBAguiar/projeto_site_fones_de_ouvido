import uuid
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

from app.models.user import User
from app.utils import data_manager

# Cria o Blueprint para agrupar as rotas públicas.
public_bp = Blueprint('public', __name__)


@public_bp.before_app_request
def before_request():
    """Registra uma visita única por sessão, exceto para APIs e arquivos estáticos."""
    if request.path.startswith('/api/') or request.path.startswith('/static/'):
        return
    
    # Gera um ID de sessão único se ainda não existir
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    
    # Verifica se a visita já foi registrada nesta sessão
    if 'visit_counted' not in session:
        data_manager.register_visit(session['session_id'])
        session['visit_counted'] = True

# --- ROTAS DE ERRO ---
@public_bp.app_errorhandler(404)
def page_not_found(e):
    """Renderiza a página de erro 404 - Página Não Encontrada."""
    return render_template('public/404.html'), 404

@public_bp.app_errorhandler(500)
def internal_server_error(e):
    """Renderiza a página de erro 500 - Erro Interno do Servidor."""
   
    return render_template('public/500.html'), 500


# --- ROTAS DE PÁGINAS (HTML) ---

@public_bp.route('/')
def home():
    """Renderiza a página inicial."""
    return render_template('public/index.html')

@public_bp.route('/products')
def products():
    """Renderiza a página de listagem de todos os produtos."""
    return render_template('public/products.html')

@public_bp.route('/products-details/<int:product_id>')
def products_details(product_id):
    """Renderiza a página de detalhes de um produto específico."""
    product = data_manager.get_product_by_id(product_id)
    if not product:
        # Se o produto não for encontrado, redireciona para a página de erro 404.
        return redirect(url_for('public.page_not_found'))
    return render_template('public/products-details.html', product=product)

@public_bp.route('/checkout')
@login_required
def checkout():
    """Renderiza a página de finalização de compra."""
    return render_template('public/checkout.html')

# --- ROTAS DE AUTENTICAÇÃO ---

@public_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Processa o login do usuário."""
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('senha')
        user = data_manager.get_user_by_email(email)
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            return redirect(url_for('public.home'))
        else:
            flash('Email ou senha inválidos. Por favor, tente novamente.', 'danger')
            
    return render_template('public/login.html')

@public_bp.route('/register', methods=['GET', 'POST'])
def register():
    """Processa o registro de um novo usuário."""
    if current_user.is_authenticated:
        return redirect(url_for('public.home'))

    if request.method == 'POST':
        username = request.form.get('nome')
        email = request.form.get('email')
        password = request.form.get('senha')
        
        users = data_manager.get_users()
        if any(u.email == email for u in users):
            flash('Este email já está em uso. Por favor, escolha outro.', 'warning')
            return redirect(url_for('public.register'))

        hashed_password = generate_password_hash(password)
        new_user = User(
            id=None,
            username=username,
            email=email,
            password_hash=hashed_password,
            role='user'
        )
        data_manager.save_user(new_user)
        flash('Conta criada com sucesso! Por favor, faça o login.', 'success')
        return redirect(url_for('public.login'))

    return render_template('public/register.html')

@public_bp.route('/logout')
@login_required
def logout():
    """Desconecta o usuário."""
    logout_user()
    return redirect(url_for('public.home'))


# --- ROTAS DE API (JSON) ---

@public_bp.route('/api/products')
def get_all_products():
    """API: Retorna todos os produtos em formato JSON para a página de listagem."""
    try:
        all_products = data_manager.get_products()
        all_filters = data_manager.get_filters()
        
        filter_map = {f.id: f.name for f in all_filters}
        
        products_list = []
        for p in all_products:
            filter_names = [filter_map.get(fid) for fid in p.filters if fid in filter_map]
            
            product_type = ""
            type_filters = [f.name for f in all_filters if f.type == 'type']
            for t in type_filters:
                if t in filter_names:
                    product_type = t
                    break

            simplified_dict = {
                'id': p.id,
                'name': p.name,
                'brand': p.brand,
                'price': p.price,
                'status': p.status,
                'images': p.images,
                'description': p.description,
                'type': product_type,
                'filter_names': filter_names
            }
            products_list.append(simplified_dict)
            
        return jsonify(products_list)
    except Exception as e:
        print(f"Erro na API get_all_products: {e}")
        return jsonify({"error": "Não foi possível carregar os produtos."}), 500

@public_bp.route('/api/products/featured')
def get_featured_products():
    """API: Retorna até 4 produtos marcados como 'Em destaque' para a página inicial."""
    try:
        all_products = data_manager.get_products()
        featured_products = [p for p in all_products if p.status == 'Em destaque']
        
        products_list = []
        for p in featured_products[:4]:
            # Constrói o dicionário manualmente para garantir que 'images' seja uma lista
            product_dict = {
                'id': p.id,
                'name': p.name,
                'brand': p.brand,
                'price': p.price,
                'status': p.status,
                'images': p.images,  
                'description': p.description,
            }
            products_list.append(product_dict)
            
        return jsonify(products_list)
    except Exception as e:
        print(f"Erro na API get_featured_products: {e}")
        return jsonify({"error": "Não foi possível carregar os produtos em destaque."}), 500
