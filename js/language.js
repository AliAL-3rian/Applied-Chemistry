/* ============================================================
   language.js — Internationalization (AR / EN)
   ============================================================ */
'use strict';

const Language = {
    _current: localStorage.getItem('aic_lang') || 'ar',

    init() {
        this.apply(this._current);
        this._bindDropdown();
    },

    apply(lang) {
        this._current = lang;
        document.documentElement.lang = lang;
        document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('aic_lang', lang);

        // تحديث عنوان الصفحة
        document.title = TRANSLATIONS[lang].title + ' - جامعة الزقازيق';

        // تحديث زر اللغة
        const langBtn = document.getElementById('language-button');
        if (langBtn) {
            langBtn.innerHTML = `<i class="fas fa-globe"></i> ${TRANSLATIONS[lang].langName}`;
        }

        // ترجمة العناصر الثابتة
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (TRANSLATIONS[lang][key]) el.textContent = TRANSLATIONS[lang][key];
        });

        // إعادة رسم بطاقات الخدمات بالترجمة الجديدة
        if (typeof Cards !== 'undefined') Cards.render(lang);
    },

    _bindDropdown() {
        const btn  = document.getElementById('language-button');
        const menu = document.querySelector('.dropdown-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', e => {
            e.stopPropagation();
            menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
        });

        document.getElementById('arabic-btn')?.addEventListener('click', () => {
            this.apply('ar');
            menu.style.display = 'none';
        });

        document.getElementById('english-btn')?.addEventListener('click', () => {
            this.apply('en');
            menu.style.display = 'none';
        });

        document.addEventListener('click', e => {
            if (!btn.contains(e.target) && !menu.contains(e.target)) {
                menu.style.display = 'none';
            }
        });
    },
};
