/* ============================================================
   share.js — Share & Clipboard Utilities
   ============================================================ */
'use strict';

const Share = {

    bindAll() {
        document.querySelectorAll('.share-button').forEach(btn => {
            // إزالة أي listener قديم بنسخ العنصر
            const fresh = btn.cloneNode(true);
            btn.replaceWith(fresh);
            fresh.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                const url  = fresh.dataset.url  || window.location.href;
                const text = fresh.dataset.text || document.title;
                this._share(url, text, fresh);
            });
        });
    },

    _share(url, text, btn) {
        // حل الروابط النسبية
        const absUrl = url.startsWith('http')
            ? url
            : new URL(url, window.location.href).href;

        btn.classList.add('loading');

        if (navigator.share) {
            navigator.share({ title: document.title, text, url: absUrl })
                .catch(() => this._copy(absUrl, btn))
                .finally(() => btn.classList.remove('loading'));
        } else {
            this._copy(absUrl, btn);
            setTimeout(() => btn.classList.remove('loading'), 600);
        }
    },

    _copy(url, btn) {
        const lang = localStorage.getItem('aic_lang') || 'ar';
        const msg  = TRANSLATIONS[lang]?.copied || 'تم نسخ الرابط ✓';

        (navigator.clipboard?.writeText(url) ?? Promise.reject())
            .then(() => this._toast(msg))
            .catch(() => {
                // fallback قديم
                const tmp = document.createElement('input');
                document.body.appendChild(tmp);
                tmp.value = url;
                tmp.select();
                document.execCommand('copy');
                document.body.removeChild(tmp);
                this._toast(msg);
            });
    },

    _toast(message) {
        const old = document.querySelector('.toast');
        if (old) old.remove();

        const t = document.createElement('div');
        t.className = 'toast';
        t.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    },
};
