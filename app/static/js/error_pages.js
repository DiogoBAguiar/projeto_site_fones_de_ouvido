// static/js/error_pages.js
document.addEventListener('DOMContentLoaded', () => {
    const errorCodeElement = document.querySelector('.error-code');
    if (errorCodeElement) {
        const originalText = errorCodeElement.textContent;
        errorCodeElement.textContent = '';
        let i = 0;

        function typeWriter() {
            if (i < originalText.length) {
                errorCodeElement.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 150);
            }
        }

        typeWriter();
    }
});
