/* ============================================================
   config.js — Translations & Services Data
   AIC Links v2.0
   ============================================================ */
'use strict';

const TRANSLATIONS = {
    ar: {
        title:              'الكيمياء التطبيقية الصناعية',
        description:        'كلية العلوم - جامعة الزقازيق',
        studentNumber:      'الحصول على كود الطالب',
        payFees:            'دفع الرسوم الدراسية',
        registerCourses:    'تسجيل المقررات الدراسية',
        results:            'النتيجة',
        militaryEducation:  'التسجيل في التربية العسكرية',
        gpaCalculator:      'حساب المعدل الفصلي',
        medicalCheck:       'تسجيل الكشف الطبي',
        medicalCheckAlt:    'تسجيل الكشف الطبي (بديل)',
        copied:             'تم نسخ الرابط ✓',
        langName:           'العربية',
    },
    en: {
        title:              'Applied Industrial Chemistry',
        description:        'Faculty of Science - Zagazig University',
        studentNumber:      'Get Student Code',
        payFees:            'Pay Tuition Fees',
        registerCourses:    'Register Courses',
        results:            'Results',
        militaryEducation:  'Military Education Registration',
        gpaCalculator:      'GPA Calculator',
        medicalCheck:       'Medical Check Registration',
        medicalCheckAlt:    'Medical Check Registration (Alt)',
        copied:             'Link Copied ✓',
        langName:           'English',
    },
};

/* ── Services list ──────────────────────────
   كل بطاقة خدمة: مفتاح الترجمة، الأيقونة، الرابط
──────────────────────────────────────────── */
const SERVICES = [
    {
        key:  'medicalCheck',
        icon: 'fas fa-notes-medical',
        url:  'http://www.medical.zustudents.zu.edu.eg/',
    },
    {
        key:  'medicalCheckAlt',
        icon: 'fas fa-notes-medical',
        url:  'http://www.medical2.zustudents.zu.edu.eg/',
    },
    {
        key:  'studentNumber',
        icon: 'fas fa-id-badge',
        url:  'http://www.militaryeducation.zu.edu.eg/Views/General/GetStudInfo',
    },
    {
        key:  'payFees',
        icon: 'fas fa-credit-card',
        url:  'https://adminsci.eps.zu.edu.eg/Views/StudentViews/StudentLogin',
    },
    {
        key:  'registerCourses',
        icon: 'fas fa-book-open',
        url:  'http://www.studentactivities.zu.edu.eg/Students/Registration/ed_login.aspx',
    },
    {
        key:  'results',
        icon: 'fas fa-poll-h',
        url:  'http://www.studentactivities.zu.edu.eg/Students/Registration/ed_login.aspx',
    },
    {
        key:  'militaryEducation',
        icon: 'fas fa-shield-alt',
        url:  'http://www.militaryeducation.zu.edu.eg/Views/ED_Students/Login',
    },
    {
        key:  'gpaCalculator',
        icon: 'fas fa-calculator',
        url:  'https://alial-3rian.github.io/Applied-Chemistry/GPA.html',
    },
];
