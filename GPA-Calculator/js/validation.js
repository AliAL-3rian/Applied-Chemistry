/* ============================================================
   validation.js — Input Validation
   ============================================================ */
'use strict';

const Validation = {

    /** تحقق من input وأظهر رسالة الخطأ */
    validate(input) {
        const value = input.value.trim();
        const errorEl = input.closest('.banner-Inputbox')?.querySelector('.error-message')
                     || input.parentElement?.querySelector('.error-message');

        const clearError = () => {
            input.classList.remove('input-error');
            if (errorEl) errorEl.textContent = '';
        };

        const setError = (msg) => {
            input.classList.add('input-error');
            if (errorEl) errorEl.textContent = msg;
            return false;
        };

        clearError();
        if (value === '') return true; // حقل فارغ مقبول

        const num = parseFloat(value);
        if (isNaN(num)) return setError(AppState.t('invalidDegree'));

        if (input.classList.contains('subject-degree')) {
            if (num < 0 || num > 100) return setError(AppState.t('invalidDegree'));
        }

        if (input.classList.contains('subject-hour')) {
            if (num <= 0 || num > MAX_HOURS) return setError(AppState.t('invalidHours'));
        }

        if (input.classList.contains('prev-percentage')) {
            if (num < 0 || num > 100) return setError(AppState.t('invalidPercentage'));
        }

        if (input.classList.contains('prev-points')) {
            const max = AppState.gradingSystem === '5.0' ? 5 : 4;
            if (num < 0 || num > max) return setError(AppState.t('invalidPoints', { max }));
        }

        if (input.classList.contains('prev-hours')) {
            if (num < 0) return setError(AppState.t('invalidHours'));
        }

        return true;
    },

    /** تحقق من نوع المادة: ناجح / راسب / راسب_لائحة */
    getSubjectType(degreeValue, bylawChecked) {
        if (bylawChecked) return 'bylaw';
        const deg = parseFloat(degreeValue);
        if (isNaN(deg) || degreeValue.trim() === '') return 'empty';
        if (deg >= 60) return 'pass';
        return 'fail';
    },
};
