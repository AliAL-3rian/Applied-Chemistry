/* ============================================================
   theme.js — Dark / Light Mode Management
   ============================================================ */
'use strict';

const Theme = {
    _current: localStorage.getItem('aic_theme') || 'light',

    init() {
        this.apply(this._current);

        document.getElementById('theme-toggle')
            ?.addEventListener('click', () => this.toggle());
    },

    apply(theme) {
        this._current = theme;
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${theme}-mode`);

        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        localStorage.setItem('aic_theme', theme);
    },

    toggle() {
        this.apply(this._current === 'light' ? 'dark' : 'light');
    },
};