/* ============================================================
   state.js — Centralized Application State
   ============================================================ */
'use strict';

const AppState = {
    lang:           localStorage.getItem('gpa_lang')    || 'ar',
    theme:          localStorage.getItem('gpa_theme')   || 'light',
    gradingSystem:  localStorage.getItem('gpa_grading') || '4.0',
    termCount:      0,

    /** ترجمة مفتاح */
    t(key, vars = {}) {
        const lang = TRANSLATIONS[this.lang] || TRANSLATIONS['ar'];
        let str = lang[key] || key;
        Object.entries(vars).forEach(([k, v]) => {
            str = str.replace(`{${k}}`, v);
        });
        return str;
    },

    /** حفظ الحالة في localStorage */
    save() {
        localStorage.setItem('gpa_lang',    this.lang);
        localStorage.setItem('gpa_theme',   this.theme);
        localStorage.setItem('gpa_grading', this.gradingSystem);
    },

    /** قراءة بيانات الطالب المحفوظة */
    loadData() {
        try {
            const raw = localStorage.getItem('gpa_data');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    },

    /** حفظ بيانات الطالب */
    saveData(data) {
        try {
            localStorage.setItem('gpa_data', JSON.stringify(data));
        } catch (e) {
            console.warn('Save failed:', e);
        }
    },

    /** مسح بيانات الطالب */
    clearData() {
        localStorage.removeItem('gpa_data');
    },
};
