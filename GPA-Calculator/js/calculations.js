/* ============================================================
   calculations.js — Core GPA Calculation Engine v2.1
   
   ✅ مُصحَّح بناءً على مقارنة التطبيق بالسجل الجامعي:
   
   الخطأ القديم: نسبة = مجموع_ناجحين ÷ (مواد_بدون_لائحة × 100)
   الصواب:       نسبة = مجموع_ناجحين ÷ (كـل_المواد × 100)
   
   مثال تحقق:
     3 ناجح (67+71+60=198) + 1 راسب عادي + 4 راسب لائحة = 8 مواد
     النسبة = 198 / (8×100) = 24.750% ✅ (مطابق السجل الجامعي)
   ============================================================ */
'use strict';

const Calculations = {

    getGradeInfo(degree) {
        if (degree === null || degree === undefined) return { points: 0, grade: 'F' };
        const system = GRADING_SYSTEMS[AppState.gradingSystem] || GRADING_SYSTEMS['4.0'];
        for (const entry of system) {
            if (degree >= entry.min) return { points: entry.points, grade: entry.grade };
        }
        return { points: 0, grade: 'F' };
    },

    degreeFromGrade(grade) {
        const system = GRADING_SYSTEMS[AppState.gradingSystem] || GRADING_SYSTEMS['4.0'];
        const found = system.find(e => e.grade === grade);
        return found ? found.min : 0;
    },

    /**
     * احسب نتيجة فصل واحد
     */
    calcTerm(subjects) {
        let sumPass     = 0;   // Σ درجات الناجحين
        let countAll    = 0;   // كل المواد (مقام النسبة) ✅
        let passHours   = 0;   // ساعات الناجحين
        let totalHours  = 0;   // كل الساعات (مقام GPA)
        let gpaWeighted = 0;   // Σ(نقاط × ساعات)

        for (const sub of subjects) {
            const deg   = parseFloat(sub.degree);
            const hrs   = parseFloat(sub.hours) || 0;
            const bylaw = sub.bylaw === true || sub.bylaw === 'true';

            countAll++;       // ✅ كل مادة تُحسب في المقام
            totalHours += hrs;

            if (bylaw) {
                gpaWeighted += 0; // نقاط صفر، ساعاتها موجودة في totalHours
                continue;
            }

            const { points } = this.getGradeInfo(isNaN(deg) ? null : deg);
            gpaWeighted += points * hrs;

            if (!isNaN(deg) && deg >= 60) {
                sumPass   += deg;
                passHours += hrs;
            }
        }

        // ✅ الصيغة الصحيحة: مجموع_ناجحين ÷ (كل_المواد × 100)
        const percentage = countAll > 0 ? (sumPass / (countAll * 100)) * 100 : 0;
        const gpaPoints  = totalHours > 0 ? gpaWeighted / totalHours : 0;
        const grade      = this.gradeFromPercentage(percentage);

        return { sumPass, percentage, gpaPoints, passHours, totalHours, countAll, grade };
    },

    /**
     * احسب المعدل التراكمي الكلي
     */
    calcCumulativeClean(termResults, prevCum) {
        const sumTerms   = termResults.reduce((s, t) => s + t.sumPass,                      0);
        const countTerms = termResults.reduce((s, t) => s + t.countAll,                     0);
        const gpaWtTerms = termResults.reduce((s, t) => s + t.gpaPoints * t.totalHours,     0);
        const hrsTerms   = termResults.reduce((s, t) => s + t.totalHours,                   0);
        const passHrsT   = termResults.reduce((s, t) => s + t.passHours,                    0);

        const pPts = parseFloat(prevCum?.points)     || 0;
        const pHrs = parseFloat(prevCum?.hours)      || 0;
        const pPct = parseFloat(prevCum?.percentage) || 0;

        // GPA التراكمي
        const totalGpaWt  = gpaWtTerms + (pPts * pHrs);
        const totalHrsAll = hrsTerms   + pHrs;
        const gpaPoints   = totalHrsAll > 0 ? totalGpaWt / totalHrsAll : 0;

        // النسبة التراكمية
        let percentage;
        if (pHrs > 0 && pPct > 0) {
            // مرجحة بالساعات مع التراكمي السابق
            const termPct = countTerms > 0 ? (sumTerms / (countTerms * 100)) * 100 : 0;
            percentage = ((pPct * pHrs) + (termPct * hrsTerms)) / (pHrs + hrsTerms);
        } else {
            // بدون تراكمي سابق
            percentage = countTerms > 0 ? (sumTerms / (countTerms * 100)) * 100 : 0;
        }

        const grade     = this.gradeFromPercentage(percentage);
        const passHours = passHrsT + pHrs;

        return { totalSum: sumTerms, percentage, gpaPoints, passHours, grade };
    },

    gradeFromPercentage(pct) {
        const system = GRADING_SYSTEMS[AppState.gradingSystem] || GRADING_SYSTEMS['4.0'];
        for (const entry of system) {
            if (pct >= entry.min) return entry.grade;
        }
        return 'F';
    },

    getAdvancedStats(termsData) {
        let allSubjects = [], termSummaries = [];

        termsData.forEach((term, idx) => {
            term.subjects
                .filter(s => !s.bylaw && s.degree !== '' && !isNaN(parseFloat(s.degree)))
                .forEach(s => allSubjects.push({
                    name: s.name || `مقرر ${idx + 1}`,
                    degree: parseFloat(s.degree),
                    term: idx + 1,
                }));

            const r = this.calcTerm(term.subjects);
            if (r.countAll > 0) termSummaries.push({ index: idx+1, percentage: r.percentage, gpaPoints: r.gpaPoints });
        });

        const ss = [...allSubjects].sort((a, b) => b.degree - a.degree);
        const st = [...termSummaries].sort((a, b) => b.gpaPoints - a.gpaPoints);

        return {
            bestSubject:  ss[0]      || null,
            worstSubject: ss.at(-1)  || null,
            bestTerm:     st[0]      || null,
            worstTerm:    st.at(-1)  || null,
            termSummaries,
        };
    },
};
