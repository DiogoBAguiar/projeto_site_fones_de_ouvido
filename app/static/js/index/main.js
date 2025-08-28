// js/index/main.js
import { initUI, renderCartUI } from './ui.js';
import { initSlider } from './slider.js';
import { initSearch } from './search.js'; // <-- Adicione esta linha

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    renderCartUI();
    initSlider();
    initSearch(); // <-- Adicione esta linha
});