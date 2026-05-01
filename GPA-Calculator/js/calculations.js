/* ============================================================
   calculations.js — Core GPA Calculation Engine
   
   القواعد المُستنتجة من تحليل نماذج الجامعة:
   
   نتيجة الفصل:
     • مجموع   = Σ درجات الناجحين فقط
     • نسبة    = مجموع ÷ (عدد المواد بدون راسب_لائحة × 100)
     • ساعات   = Σ ساعات الناجحين فقط
     • نقاط GPA = Σ(gpa_points × ساعات) لكل المواد ÷ Σ(كل الساعات)
                  (الراسب لائحة gpa=0 لكن ساعاته تدخل المقام)
   
   التراكمي الكلي:
     • مجموع   = Σ مجاميع نتيجة الفصول
     • نسبة    = Σمجاميع ÷ (Σ عدد المواد بدون لائحة × 100)
     • ساعات   = Σ ساعات الناجحين في كل الفصول
     • نقاط    = Σ(gpa×ساعة كل المواد) ÷ Σ(كل ساعات كل المواد)
   ============================================================ */
'use strict';

/* ── Public API ── */
const Calculations = {

    /**
     * احسب نقاط GPA ودرجة التقدير لدرجة معينة
     * @param {number|null} degree - الدرجة (null = راسب لائحة)
     * @returns {{ points: number, grade: string }}
     */
    getGradeInfo(degree) {
        if (degree === null || degree === undefined) {
            return { points: 0, grade: 'F' };
        }
        const system = GRADING_SYSTEMS[AppState.gradingSystem] || GRADING_SYSTEMS['4.0'];
        for (const entry of system) {
            if (degree >= entry.min) {
                return { points: entry.points, grade: entry.grade };
            }
        }
        return { points: 0, grade: 'F' };
    },

    /**
     * حوّل درجة تقدير (A+, B, ...) إلى درجة رقمية
     * @param {string} grade
     * @returns {number}
     */
    degreeFromGrade(grade) {
        const system = GRADING_SYSTEMS[AppState.gradingSystem] || GRADING_SYSTEMS['4.0'];
        const found = system.find(e => e.grade === grade);
        return found ? found.min : 0;
    },

    /**
     * احسب نتيجة فصل واحد من بياناته الكاملة
     * @param {Array} subjects - مصفوفة المواد
     * @returns {TermResult}
     */
    calcTerm(subjects) {
        let sumPass      = 0;   // مجموع درجات الناجحين
        let countNoLaw   = 0;   // عدد المواد بدون راسب_لائحة
        let passHours    = 0;   // ساعات الناجحين فقط
        let totalHours   = 0;   // كل الساعات (بما فيها راسب لائحة)
        let gpaWeighted  = 0;   // Σ(نقاط × ساعات) لكل المواد

        for (const sub of subjects) {
            const deg    = parseFloat(sub.degree);
            const hrs    = parseFloat(sub.hours) || 0;
            const bylaw  = sub.bylaw === true || sub.bylaw === 'true';
            const passed = !bylaw && !isNaN(deg) && deg >= 60;

            totalHours += hrs;

            if (bylaw) {
                // راسب لائحة: يدخل مقام GPA بنقاط صفر، لا يُحسب في أي مجموع
                gpaWeighted += 0 * hrs;
                continue;
            }

            // مادة عادية (ناجح أو راسب)
            countNoLaw++;
            const { points } = this.getGradeInfo(isNaN(deg) ? null : deg);
            gpaWeighted += points * hrs;

            if (passed) {
                sumPass   += deg;
                passHours += hrs;
            }
        }

        const percentage = countNoLaw > 0
            ? (sumPass / (countNoLaw * 100)) * 100
            : 0;

        const gpaPoints = totalHours > 0
            ? gpaWeighted / totalHours
            : 0;

        const grade = this.gradeFromPercentage(percentage);

        return {
            sumPass,        // المجموع
            percentage,     // النسبة %
            gpaPoints,      // النقاط
            passHours,      // الساعات المجتازة
            totalHours,     // كل الساعات
            countNoLaw,     // عدد المواد بدون لائحة
            grade,
        };
    },

    /**
     * احسب المعدل التراكمي الكلي
     * @param {TermResult[]} termResults  - نتائج الفصول
     * @param {object}       prevCum      - التراكمي السابق (اختياري)
     * @returns {CumulativeResult}
     */
    calcCumulative(termResults, prevCum) {
        let totalSum     = 0;
        let totalNoLaw   = 0;
        let totalGpaWt   = 0;
        let totalHrsAll  = 0;
        let totalPassHrs = 0;

        // أضف التراكمي السابق إذا وُجد
        if (prevCum && prevCum.hours > 0) {
            const pPct  = parseFloat(prevCum.percentage) || 0;
            const pPts  = parseFloat(prevCum.points)     || 0;
            const pHrs  = parseFloat(prevCum.hours)      || 0;
            // نحسب عدد المواد الافتراضي من النسبة والمجموع
            // مجموع = pPct% × (n×100) → لكن لدينا النقاط والساعات فقط
            // نحن نعامله كـ: gpaWeighted += pPts × pHrs
            totalGpaWt   += pPts  * pHrs;
            totalHrsAll  += pHrs;
            totalPassHrs += pHrs;
            // نسبة: نعامل التراكمي السابق ككتلة بنسبته
            totalSum     += pPct * pHrs;  // سنقسم على totalHrsAll لاحقاً للنسبة المرجحة
            totalNoLaw   += pHrs;         // تقريب: نعتبر كل ساعة ≈ مادة للوزن
        }

        for (const t of termResults) {
            totalSum     += t.sumPass;
            totalNoLaw   += t.countNoLaw;
            totalGpaWt   += t.gpaPoints * t.totalHours;
            totalHrsAll  += t.totalHours;
            totalPassHrs += t.passHours;
        }

        // ملاحظة: إذا كان هناك تراكمي سابق بنسبة مئوية، نحسب النسبة مرجحة بالساعات
        let percentage = 0;
        if (prevCum && prevCum.hours > 0) {
            // النسبة = (Σ نسبة×ساعات) / Σ ساعات
            percentage = totalNoLaw > 0 ? totalSum / totalNoLaw : 0;
        } else {
            // بدون تراكمي سابق: النسبة = Σمجاميع / (Σ مواد_بدون_لائحة × 100)
            const n = termResults.reduce((s, t) => s + t.countNoLaw, 0);
            const m = termResults.reduce((s, t) => s + t.sumPass, 0);
            percentage = n > 0 ? (m / (n * 100)) * 100 : 0;
            totalSum   = m;
            totalNoLaw = n;
        }

        const gpaPoints = totalHrsAll > 0 ? totalGpaWt / totalHrsAll : 0;
        const grade     = this.gradeFromPercentage(percentage);

        return {
            totalSum: Math.round(totalSum * 1000) / 1000,
            percentage,
            gpaPoints,
            passHours: totalPassHrs,
            grade,
        };
    },

    /**
     * احسب التراكمي الصحيح (بدون التراكمي السابق للنسبة والمجموع)
     */
    calcCumulativeClean(termResults, prevCum) {
        // مجموع ناجحين من الفصول الحالية
        const sumTerms   = termResults.reduce((s, t) => s + t.sumPass, 0);
        const nTerms     = termResults.reduce((s, t) => s + t.countNoLaw, 0);
        const gpaWtTerms = termResults.reduce((s, t) => s + t.gpaPoints * t.totalHours, 0);
        const hrsTerms   = termResults.reduce((s, t) => s + t.totalHours, 0);
        const passHrsT   = termResults.reduce((s, t) => s + t.passHours, 0);

        // بيانات التراكمي السابق
        const pPts  = parseFloat(prevCum?.points)      || 0;
        const pHrs  = parseFloat(prevCum?.hours)       || 0;
        const pPct  = parseFloat(prevCum?.percentage)  || 0;

        // GPA التراكمي: يشمل السابق والحالي
        const totalGpaWt  = gpaWtTerms + (pPts * pHrs);
        const totalHrsAll = hrsTerms   + pHrs;
        const gpaPoints   = totalHrsAll > 0 ? totalGpaWt / totalHrsAll : 0;

        // النسبة: مرجحة بالساعات إذا كان هناك تراكمي سابق، وإلا بعدد المواد
        let percentage, totalSum, totalNoLaw;
        if (pHrs > 0 && pPct > 0) {
            // Weighted average بالساعات
            const wtSum = (pPct * pHrs) + (nTerms > 0 ? (sumTerms / (nTerms * 100)) * 100 * hrsTerms : 0);
            const wtTot = pHrs + hrsTerms;
            percentage  = wtTot > 0 ? wtSum / wtTot : 0;
            totalSum    = sumTerms + pPts * pHrs;
            totalNoLaw  = nTerms;
        } else {
            // بدون تراكمي سابق
            totalSum    = sumTerms;
            totalNoLaw  = nTerms;
            percentage  = totalNoLaw > 0 ? (totalSum / (totalNoLaw * 100)) * 100 : 0;
        }

        const passHours = passHrsT + pHrs;
        const grade     = this.gradeFromPercentage(percentage);

        return {
            totalSum,
            percentage,
            gpaPoints,
            passHours,
            grade,
        };
    },

    /**
     * حدد درجة التقدير من النسبة المئوية
     */
    gradeFromPercentage(pct) {
        const system = GRADING_SYSTEMS[AppState.gradingSystem] || GRADING_SYSTEMS['4.0'];
        for (const entry of system) {
            if (pct >= entry.min) return entry.grade;
        }
        return 'F';
    },

    /**
     * إحصائيات متقدمة: أفضل/أضعف مادة وفصل
     */
    getAdvancedStats(termsData) {
        let allSubjects = [];
        let termSummaries = [];

        termsData.forEach((term, idx) => {
            const validSubs = term.subjects.filter(s =>
                !s.bylaw && s.degree !== '' && !isNaN(parseFloat(s.degree))
            );
            validSubs.forEach(s => {
                allSubjects.push({
                    name:   s.name || `مقرر ${idx + 1}`,
                    degree: parseFloat(s.degree),
                    term:   idx + 1,
                });
            });

            const result = this.calcTerm(term.subjects);
            if (result.countNoLaw > 0) {
                termSummaries.push({
                    index:      idx + 1,
                    percentage: result.percentage,
                    gpaPoints:  result.gpaPoints,
                });
            }
        });

        const sortedSubs = [...allSubjects].sort((a, b) => b.degree - a.degree);
        const sortedTerms = [...termSummaries].sort((a, b) => b.gpaPoints - a.gpaPoints);

        return {
            bestSubject:  sortedSubs[0]  || null,
            worstSubject: sortedSubs.at(-1) || null,
            bestTerm:     sortedTerms[0]  || null,
            worstTerm:    sortedTerms.at(-1) || null,
            termSummaries,
        };
    },
};
