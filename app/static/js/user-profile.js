// user-profile.js
// Este script lida com a lógica da página de perfil do usuário.

document.addEventListener('DOMContentLoaded', () => {

    const API_PROFILE_URL = window.location.origin + '/user/api/profile';
    const formProfile = document.getElementById('edit-profile-form');
    const profilePictureInput = document.getElementById('profile-picture-input');
    const profilePictureImg = document.getElementById('profile-picture-display');
    const formUsername = document.getElementById('username');
    const formEmail = document.getElementById('email');
    
    // NOVOS CAMPOS: Seleciona os elementos de endereço
    const formAddress = document.getElementById('address');
    const formCity = document.getElementById('city');
    const formState = document.getElementById('state');
    const formZip = document.getElementById('zip');

    // Função para carregar os dados do perfil do usuário
    async function fetchUserProfile() {
        try {
            const response = await fetch(API_PROFILE_URL);
            if (!response.ok) {
                throw new Error('Erro ao buscar dados do perfil.');
            }
            const user = await response.json();
            
            // Popula o formulário com os dados do usuário
            formUsername.value = user.username;
            formEmail.value = user.email;
            
            // Popula os novos campos de endereço
            formAddress.value = user.address;
            formCity.value = user.city;
            formState.value = user.state;
            formZip.value = user.zip_code;
            
            // Corrige o caminho da foto de perfil
            if (user.profile_picture) {
                profilePictureImg.src = user.profile_picture;
            } else {
                 profilePictureImg.src = "{{ url_for('static', filename='images/perfil_padrao.png') }}";
            }
        } catch (error) {
            console.error("Erro ao carregar o perfil:", error);
        }
    }

    // Lógica para pré-visualizar a imagem de perfil
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (profilePictureImg) {
                        profilePictureImg.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // A lógica de envio do formulário está no HTML (POST para a rota)
    // O Flask lida com o processamento e o redirecionamento.

    fetchUserProfile();
});
