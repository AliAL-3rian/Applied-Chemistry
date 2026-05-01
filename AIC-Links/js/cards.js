/* ============================================================
   cards.js — Dynamic Service Cards Renderer
   ============================================================ */
'use strict';

const Cards = {

    render(lang) {
        const container = document.getElementById('cards-container');
        if (!container) return;

        const t = TRANSLATIONS[lang] || TRANSLATIONS['ar'];

        container.innerHTML = SERVICES.map(service => `
            <div class="card">
                <a href="${service.url}"
                   class="card-link"
                   ${service.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}
                   aria-label="${t[service.key] || service.key}">
                    <i class="${service.icon}" aria-hidden="true"></i>
                    <span>${t[service.key] || service.key}</span>
                </a>
                <button class="share-button"
                        data-url="${service.url}"
                        data-text="${t[service.key] || service.key}"
                        aria-label="مشاركة">
                    <i class="fas fa-share-alt" aria-hidden="true"></i>
                </button>
            </div>
        `).join('');

        // ربط أزرار المشاركة بعد الرسم
        Share.bindAll();
    },
};
