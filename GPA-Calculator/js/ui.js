/* ============================================================
   ui.js — DOM Rendering & UI Builders
   ============================================================ */
'use strict';

const UI = {

    /* ════════════════════════════════════════
       BANNERS
    ════════════════════════════════════════ */

    renderPreviousCumulativeBanner() {
        return `
        <div class="banner-bar previous-cumulative fade-in">
            <div class="banner-Title">
                <h2><i class="fas fa-history" style="color:var(--primary);margin-inline-end:8px"></i>
                    <span data-t="previousCumulative">${AppState.t('previousCumulative')}</span>
                </h2>
                <div class="tooltip">
                    <i class="fas fa-info-circle" style="color:var(--text-muted);font-size:16px"></i>
                    <span class="tooltip-text" data-t="previousCumulativeTip">${AppState.t('previousCumulativeTip')}</span>
                </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start">
                <div class="banner-Inputbox">
                    <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:5px"
                           data-t="percentage">${AppState.t('percentage')}</label>
                    <input type="number" min="0" max="100" step="0.001"
                           class="form-control prev-percentage"
                           placeholder="${AppState.t('prevPercentagePH')}" />
                    <span class="error-message"></span>
                </div>
                <div class="banner-Inputbox">
                    <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:5px"
                           data-t="points">${AppState.t('points')}</label>
                    <input type="number" min="0" max="5" step="0.001"
                           class="form-control prev-points"
                           placeholder="${AppState.t('prevPointsPH')}" />
                    <span class="error-message"></span>
                </div>
                <div class="banner-Inputbox">
                    <label style="font-size:12px;color:var(--text-muted);display:block;margin-bottom:5px"
                           data-t="hours">${AppState.t('hours')}</label>
                    <input type="number" min="0" step="1"
                           class="form-control prev-hours"
                           placeholder="${AppState.t('prevHoursPH')}" />
                    <span class="error-message"></span>
                </div>
            </div>
        </div>`;
    },

    renderCumulativeBanner() {
        return `
        <div class="banner-bar cumulative-term fade-in"
             style="border-top:3px solid var(--primary)">
            <div class="banner-Title">
                <h2><i class="fas fa-chart-line" style="color:var(--primary);margin-inline-end:8px"></i>
                    <span data-t="cumulativeTerm">${AppState.t('cumulativeTerm')}</span>
                </h2>
                <div class="tooltip">
                    <i class="fas fa-info-circle" style="color:var(--text-muted);font-size:16px"></i>
                    <span class="tooltip-text" data-t="cumulativeTermTip">${AppState.t('cumulativeTermTip')}</span>
                </div>
            </div>
            <div class="banner-container">
                <div class="banner-box">
                    <p data-t="percentage">${AppState.t('percentage')}</p>
                    <h3 class="cum-percentage" style="color:var(--primary)">0.000%</h3>
                </div>
                <div class="banner-box">
                    <p data-t="grade">${AppState.t('grade')}</p>
                    <h3 class="cum-grade">—</h3>
                </div>
                <div class="banner-box">
                    <p data-t="points">${AppState.t('points')}</p>
                    <h3 class="cum-points">0.000</h3>
                </div>
                <div class="banner-box">
                    <p data-t="hours">${AppState.t('hours')}</p>
                    <h3 class="cum-hours">0</h3>
                </div>
            </div>
        </div>`;
    },

    /* ════════════════════════════════════════
       TERMS
    ════════════════════════════════════════ */

    renderTerm(termNumber) {
        let rows = '';
        for (let i = 1; i <= DEFAULT_SUBJECTS; i++) {
            rows += this.renderSubjectRow(i);
        }

        return `
        <div class="banner-bar term slide-in" id="term-${termNumber}">
            <div class="banner-Title">
                <h2>
                    <span class="term-label" data-t="termResult">${AppState.t('termResult')}</span>
                    <span class="term-number" style="margin-inline-start:6px;color:var(--primary)">${termNumber}</span>
                </h2>
                <button class="delete-term btn btn-danger" title="${AppState.t('deleteTerm')}">
                    <i class="fas fa-trash-alt"></i>
                    <span data-t="deleteTerm">${AppState.t('deleteTerm')}</span>
                </button>
            </div>

            <!-- ملخص الفصل -->
            <div class="banner-container" style="margin-bottom:16px">
                <div class="banner-box">
                    <p data-t="total">${AppState.t('total')}</p>
                    <h3 class="term-total">0</h3>
                </div>
                <div class="banner-box">
                    <p data-t="percentage">${AppState.t('percentage')}</p>
                    <h3 class="term-percentage">0.000%</h3>
                </div>
                <div class="banner-box">
                    <p data-t="grade">${AppState.t('grade')}</p>
                    <h3 class="term-grade">—</h3>
                </div>
                <div class="banner-box">
                    <p data-t="points">${AppState.t('points')}</p>
                    <h3 class="term-points">0.000</h3>
                </div>
                <div class="banner-box">
                    <p data-t="hours">${AppState.t('hours')}</p>
                    <h3 class="term-hours">0</h3>
                </div>
            </div>

            <!-- جدول المواد -->
            <div style="overflow-x:auto">
                <table class="term-table">
                    <thead>
                        <tr>
                            <th data-t="subjectName">${AppState.t('subjectName')}</th>
                            <th data-t="hours">${AppState.t('hours')}</th>
                            <th data-t="degree">${AppState.t('degree')}</th>
                            <th data-t="points">${AppState.t('points')}</th>
                            <th data-t="grade">${AppState.t('grade')}</th>
                            <th style="width:36px">
                                <span title="${AppState.t('bylawFail')}">★</span>
                            </th>
                            <th style="width:48px"></th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>

            <div class="Term-btn">
                <a href="#" class="add-subject">
                    <i class="fas fa-plus-circle"></i>
                    <span data-t="addSubject">${AppState.t('addSubject')}</span>
                </a>
            </div>
        </div>`;
    },

    renderSubjectRow(num) {
        const ph = AppState.t('subjectPH');
        return `
        <tr class="slide-in">
            <td>
                <input type="text" class="subject-name form-control"
                       placeholder="${ph} ${String(num).padStart(2,'0')}" />
            </td>
            <td style="width:90px">
                <div class="banner-Inputbox" style="margin:0">
                    <input type="number" min="0.5" max="${MAX_HOURS}" step="0.5"
                           class="subject-hour form-control"
                           placeholder="${AppState.t('hoursPH')}" />
                    <span class="error-message"></span>
                </div>
            </td>
            <td style="width:100px">
                <div class="banner-Inputbox" style="margin:0">
                    <input type="number" min="0" max="100" step="0.5"
                           class="subject-degree form-control"
                           placeholder="${AppState.t('degreePH')}" />
                    <span class="error-message"></span>
                </div>
            </td>
            <td style="width:80px;text-align:center">
                <span class="subject-point" style="font-weight:700;color:var(--primary)">—</span>
            </td>
            <td style="width:80px">
                <select class="subject-rating form-control">
                    <option value="">—</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                </select>
            </td>
            <td style="width:36px;text-align:center">
                <input type="checkbox" class="subject-bylaw"
                       title="${AppState.t('bylawFail')}"
                       style="width:16px;height:16px;cursor:pointer;accent-color:var(--warning)" />
            </td>
            <td style="width:48px;text-align:center">
                <button class="delete-subject" title="حذف">
                    <i class="fas fa-times" style="color:var(--danger);font-size:15px"></i>
                </button>
            </td>
        </tr>`;
    },

    /* ════════════════════════════════════════
       UPDATE TERM DISPLAY
    ════════════════════════════════════════ */

    updateTermDisplay(termEl, result) {
        termEl.querySelector('.term-total').textContent    = result.sumPass.toFixed(2);
        termEl.querySelector('.term-percentage').textContent = `${result.percentage.toFixed(3)}%`;
        termEl.querySelector('.term-grade').textContent    = result.grade;
        termEl.querySelector('.term-points').textContent   = result.gpaPoints.toFixed(3);
        termEl.querySelector('.term-hours').textContent    = result.passHours.toFixed(1);

        // لون التقدير
        const gradeEl = termEl.querySelector('.term-grade');
        this._colorGrade(gradeEl, result.grade);
    },

    updateCumulativeDisplay(result) {
        document.querySelector('.cum-percentage').textContent = `${result.percentage.toFixed(3)}%`;
        document.querySelector('.cum-grade').textContent      = result.grade;
        document.querySelector('.cum-points').textContent     = result.gpaPoints.toFixed(3);
        document.querySelector('.cum-hours').textContent      = result.passHours.toFixed(1);

        const gradeEl = document.querySelector('.cum-grade');
        this._colorGrade(gradeEl, result.grade);
    },

    _colorGrade(el, grade) {
        el.style.color = '';
        if (['A+','A'].includes(grade))      el.style.color = 'var(--success)';
        else if (['B+','B'].includes(grade)) el.style.color = 'var(--primary)';
        else if (['C+','C'].includes(grade)) el.style.color = 'var(--warning)';
        else if (grade === 'D')              el.style.color = 'var(--warning-hover)';
        else if (grade === 'F')              el.style.color = 'var(--danger)';
    },

    /* ════════════════════════════════════════
       TOAST
    ════════════════════════════════════════ */

    toast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
        const t = document.createElement('div');
        t.className = `toast toast-${type}`;
        t.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i> ${message}`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3200);
    },

    /* ════════════════════════════════════════
       COMPARISON TABLE
    ════════════════════════════════════════ */

    renderComparisonTable(termResults) {
        if (!termResults.length) return '';

        const sorted = [...termResults].map((r, i) => ({ ...r, idx: i + 1 }));
        const best  = [...sorted].sort((a, b) => b.gpaPoints - a.gpaPoints)[0];
        const worst = [...sorted].sort((a, b) => a.gpaPoints - b.gpaPoints)[0];

        const rows = sorted.map(r => {
            const isBest  = r.idx === best.idx;
            const isWorst = r.idx === worst.idx && best.idx !== worst.idx;
            const cls     = isBest ? 'highlight-best' : isWorst ? 'highlight-worst' : '';
            const icon    = isBest ? '🏆' : isWorst ? '⚠️' : '';
            return `
            <tr class="${cls}">
                <td>${icon} ${AppState.t('termResult')} ${r.idx}</td>
                <td>${r.sumPass.toFixed(2)}</td>
                <td>${r.percentage.toFixed(3)}%</td>
                <td style="font-weight:700">${r.gpaPoints.toFixed(3)}</td>
                <td>${r.passHours}</td>
                <td>${r.grade}</td>
            </tr>`;
        }).join('');

        return `
        <div class="comparison-section fade-in">
            <h2><i class="fas fa-balance-scale" style="color:var(--primary);margin-inline-end:8px"></i>
                <span data-t="comparison">${AppState.t('comparison')}</span>
            </h2>
            <div style="overflow-x:auto">
                <table class="term-table">
                    <thead>
                        <tr>
                            <th>${AppState.t('termResult')}</th>
                            <th>${AppState.t('total')}</th>
                            <th>${AppState.t('percentage')}</th>
                            <th>${AppState.t('points')}</th>
                            <th>${AppState.t('hours')}</th>
                            <th>${AppState.t('grade')}</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        </div>`;
    },

    /* ════════════════════════════════════════
       STATISTICS CARDS
    ════════════════════════════════════════ */

    renderStatsCards(stats) {
        if (!stats.bestSubject && !stats.worstSubject) return '';

        const card = (title, data, color) => data ? `
            <div class="banner-box" style="border-top:3px solid ${color}">
                <p style="color:${color};font-weight:700">${title}</p>
                <h3 style="font-size:18px;color:var(--text)">${data.name || '—'}</h3>
                <span style="font-size:13px;color:var(--text-muted)">${data.degree ?? data.gpaPoints?.toFixed(3) ?? ''}</span>
            </div>` : '';

        return `
        <div class="banner-container" style="margin-top:12px">
            ${card(AppState.t('bestSubject'),  stats.bestSubject,  'var(--success)')}
            ${card(AppState.t('worstSubject'), stats.worstSubject, 'var(--danger)')}
            ${stats.bestTerm  ? card(`${AppState.t('bestTerm')} (${AppState.t('termResult')} ${stats.bestTerm.index})`,  { name: `${stats.bestTerm.gpaPoints.toFixed(3)} نقطة`, degree: '' }, 'var(--primary)') : ''}
            ${stats.worstTerm ? card(`${AppState.t('worstTerm')} (${AppState.t('termResult')} ${stats.worstTerm.index})`, { name: `${stats.worstTerm.gpaPoints.toFixed(3)} نقطة`, degree: '' }, 'var(--warning)') : ''}
        </div>`;
    },

    /* ════════════════════════════════════════
       REASSIGN TERM NUMBERS
    ════════════════════════════════════════ */

    reassignTermNumbers() {
        const terms = document.querySelectorAll('.term');
        terms.forEach((term, i) => {
            const n = i + 1;
            term.id = `term-${n}`;
            const numEl = term.querySelector('.term-number');
            if (numEl) numEl.textContent = n;
        });
        AppState.termCount = terms.length;
    },

    /* ════════════════════════════════════════
       TRANSLATE ALL
    ════════════════════════════════════════ */

    applyTranslations() {
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            el.textContent = AppState.t(key);
        });

        // اتجاه الصفحة
        const isRTL = AppState.lang === 'ar';
        document.documentElement.lang = AppState.lang;
        document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';

        // تحديث placeholders
        document.querySelectorAll('input[placeholder]').forEach(inp => {
            const cls = [...inp.classList];
            if (cls.includes('prev-percentage')) inp.placeholder = AppState.t('prevPercentagePH');
            if (cls.includes('prev-points'))     inp.placeholder = AppState.t('prevPointsPH');
            if (cls.includes('prev-hours'))      inp.placeholder = AppState.t('prevHoursPH');
        });

        // اسم اللغة الحالية
        const langLabel = document.getElementById('current-language');
        if (langLabel) langLabel.textContent = AppState.lang === 'ar' ? 'العربية' : 'English';

        // نظام التقدير
        const sysLabel = document.getElementById('current-grading-system');
        if (sysLabel) sysLabel.textContent = AppState.t(`gradingSystem${AppState.gradingSystem.replace('.','')}`);
    },
};
