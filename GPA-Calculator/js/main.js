/* ============================================================
   main.js — Application Bootstrap & Event Wiring
   GPA Calculator v2.0
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* ════════════════════════════════════════
       INIT
    ════════════════════════════════════════ */
    _applyTheme(AppState.theme);
    _applyGradingLabel();

    // حقن البانرات الثابتة
    document.getElementById('previous-cumulative-container')
        ?.insertAdjacentHTML('beforeend', UI.renderPreviousCumulativeBanner());
    document.getElementById('cumulative-term-container')
        ?.insertAdjacentHTML('beforeend', UI.renderCumulativeBanner());

    UI.applyTranslations();

    // تحميل البيانات المحفوظة
    const loaded = Storage.load(termEl => {
        _recalcTerm(termEl);
    });

    // إذا لم يوجد بيانات، أضف فصلاً ابتدائياً
    if (!loaded || !document.querySelectorAll('.term').length) {
        _addTerm();
    }

    _recalcAll();

    /* ════════════════════════════════════════
       HEADER BUTTONS
    ════════════════════════════════════════ */

    // ── Theme Toggle ──
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
        _applyTheme(AppState.theme);
        AppState.save();
        Statistics.render(_collectTermResults());
    });

    // ── Language ──
    document.getElementById('language-button')?.addEventListener('click', () => {
        _toggleDropdown('.language-dropdown .dropdown-menu');
    });

    document.querySelectorAll('.language-dropdown .dropdown-item').forEach(btn => {
        btn.addEventListener('click', () => {
            AppState.lang = btn.dataset.lang;
            AppState.save();
            _closeAllDropdowns();
            // إعادة رسم الفصول بالترجمة الجديدة
            _rerenderTermLabels();
            UI.applyTranslations();
            _recalcAll();
        });
    });

    // ── Grading System ──
    document.getElementById('grading-system-button')?.addEventListener('click', () => {
        _toggleDropdown('.grading-system-dropdown .dropdown-menu');
    });

    document.querySelectorAll('.grading-system-dropdown .dropdown-item').forEach(btn => {
        btn.addEventListener('click', () => {
            AppState.gradingSystem = btn.dataset.grading;
            AppState.save();
            _applyGradingLabel();
            _closeAllDropdowns();
            _recalcAll();
            Storage.autoSave();
        });
    });

    /* ════════════════════════════════════════
       MAIN ACTIONS
    ════════════════════════════════════════ */

    document.getElementById('add-term')?.addEventListener('click', e => {
        e.preventDefault();
        _addTerm();
    });

    document.getElementById('export-pdf')?.addEventListener('click', () => {
        Storage.autoSave();
        Storage.exportPDF();
    });

    document.getElementById('export-excel')?.addEventListener('click', () => {
        Storage.autoSave();
        Storage.exportExcel();
    });

    document.getElementById('share-results')?.addEventListener('click', () => {
        Storage.share();
    });

    document.getElementById('reset-data')?.addEventListener('click', () => {
        if (!confirm(AppState.lang === 'ar'
            ? 'هل تريد إعادة تعيين جميع البيانات؟'
            : 'Reset all data?')) return;

        AppState.clearData();
        document.getElementById('terms-container').innerHTML = '';
        document.querySelector('.prev-percentage') && (document.querySelector('.prev-percentage').value = '');
        document.querySelector('.prev-points')     && (document.querySelector('.prev-points').value = '');
        document.querySelector('.prev-hours')      && (document.querySelector('.prev-hours').value = '');
        AppState.termCount = 0;
        _addTerm();
        _recalcAll();
        UI.toast(AppState.t('resetSuccess'), 'info');
    });

    /* ════════════════════════════════════════
       DELEGATED EVENTS — DYNAMIC ELEMENTS
    ════════════════════════════════════════ */

    // ── Add Subject ──
    document.body.addEventListener('click', e => {
        const addBtn = e.target.closest('.add-subject');
        if (addBtn) {
            e.preventDefault();
            const tbody = addBtn.closest('.term').querySelector('tbody');
            const count = tbody.querySelectorAll('tr').length + 1;
            tbody.insertAdjacentHTML('beforeend', UI.renderSubjectRow(count));
            Storage.autoSave();
        }

        // ── Delete Term ──
        const delTerm = e.target.closest('.delete-term');
        if (delTerm) {
            e.preventDefault();
            delTerm.closest('.term').remove();
            UI.reassignTermNumbers();
            _recalcAll();
            Storage.autoSave();
        }

        // ── Delete Subject ──
        const delSub = e.target.closest('.delete-subject');
        if (delSub) {
            e.preventDefault();
            const row  = delSub.closest('tr');
            const term = delSub.closest('.term');
            row.remove();
            _recalcTerm(term);
            _recalcCumulative();
            Storage.autoSave();
        }

        // ── Close dropdowns on outside click ──
        if (!e.target.closest('.language-dropdown') &&
            !e.target.closest('.grading-system-dropdown')) {
            _closeAllDropdowns();
        }
    });

    // ── Input: degree / hours ──
    document.body.addEventListener('input', e => {
        const inp = e.target;

        if (inp.classList.contains('subject-degree') ||
            inp.classList.contains('subject-hour')) {
            if (!Validation.validate(inp)) return;
            const row  = inp.closest('tr');
            const term = inp.closest('.term');
            _calcSubjectPoints(row);
            _recalcTerm(term);
            _recalcCumulative();
            Storage.autoSave();
        }

        if (inp.classList.contains('prev-percentage') ||
            inp.classList.contains('prev-points')     ||
            inp.classList.contains('prev-hours')) {
            if (!Validation.validate(inp)) return;
            _recalcCumulative();
            Storage.autoSave();
        }
    });

    // ── Select: grade (A+, B, ...) → auto-fill degree ──
    document.body.addEventListener('change', e => {
        const sel = e.target;
        if (sel.classList.contains('subject-rating')) {
            const grade    = sel.value;
            const row      = sel.closest('tr');
            const degInput = row?.querySelector('.subject-degree');
            if (grade && degInput && !degInput.disabled) {
                degInput.value = Calculations.degreeFromGrade(grade) || '';
                _calcSubjectPoints(row);
                const term = sel.closest('.term');
                _recalcTerm(term);
                _recalcCumulative();
                Storage.autoSave();
            }
        }
    });

    // ── Checkbox: bylaw (راسب لائحة) ──
    document.body.addEventListener('change', e => {
        const chk = e.target;
        if (chk.classList.contains('subject-bylaw')) {
            const row      = chk.closest('tr');
            const degInput = row?.querySelector('.subject-degree');
            const ratSel   = row?.querySelector('.subject-rating');

            if (chk.checked) {
                // تعطيل الدرجة وجعلها صفراً
                if (degInput) { degInput.value = ''; degInput.disabled = true; }
                if (ratSel)   { ratSel.value   = 'F'; ratSel.disabled = true; }
                row?.classList.add('row-bylaws');
                const ptEl = row?.querySelector('.subject-point');
                if (ptEl) ptEl.textContent = '0.000';
            } else {
                if (degInput) { degInput.disabled = false; }
                if (ratSel)   { ratSel.disabled = false; }
                row?.classList.remove('row-bylaws');
            }

            const term = chk.closest('.term');
            _recalcTerm(term);
            _recalcCumulative();
            Storage.autoSave();
        }
    });

    /* ════════════════════════════════════════
       PREVIOUS CUMULATIVE
    ════════════════════════════════════════ */
    document.querySelector('.prev-percentage')
        ?.addEventListener('blur', () => _recalcCumulative());

    /* ════════════════════════════════════════
       HELPERS
    ════════════════════════════════════════ */

    function _addTerm() {
        AppState.termCount++;
        const html = UI.renderTerm(AppState.termCount);
        document.getElementById('terms-container')
            ?.insertAdjacentHTML('beforeend', html);
        UI.reassignTermNumbers();
        _recalcCumulative();
    }

    function _calcSubjectPoints(row) {
        if (!row) return;
        const degInput = row.querySelector('.subject-degree');
        const hrInput  = row.querySelector('.subject-hour');
        const bylawChk = row.querySelector('.subject-bylaw');
        const ptEl     = row.querySelector('.subject-point');
        const ratSel   = row.querySelector('.subject-rating');

        const bylaw  = bylawChk?.checked;
        const degree = parseFloat(degInput?.value);
        const hours  = parseFloat(hrInput?.value) || 0;

        if (bylaw) {
            if (ptEl) ptEl.textContent = '0.000';
            return;
        }

        if (!isNaN(degree)) {
            const { points, grade } = Calculations.getGradeInfo(degree);
            if (ptEl) ptEl.textContent = (points * hours).toFixed(3);
            if (ratSel && !ratSel.disabled) ratSel.value = grade;

            // لون الصف
            row.classList.remove('row-fail', 'row-bylaws');
            if (degree < 60) row.classList.add('row-fail');
        } else {
            if (ptEl) ptEl.textContent = '—';
        }
    }

    function _collectSubjects(termEl) {
        const subjects = [];
        termEl.querySelectorAll('tbody tr').forEach(row => {
            const degInput = row.querySelector('.subject-degree');
            const hrInput  = row.querySelector('.subject-hour');
            const bylawChk = row.querySelector('.subject-bylaw');
            subjects.push({
                degree: degInput?.disabled ? null : (degInput?.value || ''),
                hours:  hrInput?.value || '',
                bylaw:  bylawChk?.checked || false,
                name:   row.querySelector('.subject-name')?.value || '',
            });
        });
        return subjects;
    }

    function _recalcTerm(termEl) {
        if (!termEl) return;
        const subjects = _collectSubjects(termEl);
        const result   = Calculations.calcTerm(subjects);
        UI.updateTermDisplay(termEl, result);

        // تحديث نقاط كل صف
        termEl.querySelectorAll('tbody tr').forEach(row => _calcSubjectPoints(row));

        return result;
    }

    function _collectTermResults() {
        const results = [];
        document.querySelectorAll('.term').forEach(termEl => {
            const subjects = _collectSubjects(termEl);
            results.push(Calculations.calcTerm(subjects));
        });
        return results;
    }

    function _recalcCumulative() {
        const termResults = _collectTermResults();
        const prevCum = {
            percentage: document.querySelector('.prev-percentage')?.value || '',
            points:     document.querySelector('.prev-points')?.value     || '',
            hours:      document.querySelector('.prev-hours')?.value      || '',
        };
        const cumResult = Calculations.calcCumulativeClean(termResults, prevCum);
        UI.updateCumulativeDisplay(cumResult);

        // تحديث مقارنة الفصول
        const compContainer = document.getElementById('comparison-container');
        if (compContainer) {
            compContainer.innerHTML = termResults.some(r => r.countNoLaw > 0)
                ? UI.renderComparisonTable(termResults)
                : '';
        }

        // الإحصائيات والرسم البياني
        Statistics.render(termResults);
    }

    function _recalcAll() {
        document.querySelectorAll('.term').forEach(termEl => {
            termEl.querySelectorAll('tbody tr').forEach(row => _calcSubjectPoints(row));
            _recalcTerm(termEl);
        });
        _recalcCumulative();
    }

    function _applyTheme(theme) {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${theme}-mode`);
        const icon = document.getElementById('theme-icon');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    function _applyGradingLabel() {
        const el = document.getElementById('current-grading-system');
        if (el) el.textContent = AppState.t(`gradingSystem${AppState.gradingSystem.replace('.','')}`);
    }

    function _toggleDropdown(selector) {
        const menu = document.querySelector(selector);
        if (!menu) return;
        const isOpen = menu.style.display === 'flex';
        _closeAllDropdowns();
        if (!isOpen) menu.style.display = 'flex';
    }

    function _closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = '');
    }

    function _rerenderTermLabels() {
        document.querySelectorAll('.term').forEach((term, i) => {
            const lbl = term.querySelector('.term-label');
            const num = term.querySelector('.term-number');
            if (lbl) lbl.textContent = AppState.t('termResult');
            if (num) num.textContent = i + 1;
        });
    }
});
