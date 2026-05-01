/* ============================================================
   storage.js — Persistence, Export (PDF + Excel), Share
   ============================================================ */
'use strict';

const Storage = {

    /* ── Auto-Save ── */
    autoSave() {
        const terms = [];
        document.querySelectorAll('.term').forEach(term => {
            const subjects = [];
            term.querySelectorAll('tbody tr').forEach(row => {
                subjects.push({
                    name:   row.querySelector('.subject-name')?.value  || '',
                    hours:  row.querySelector('.subject-hour')?.value  || '',
                    degree: row.querySelector('.subject-degree')?.value || '',
                    rating: row.querySelector('.subject-rating')?.value || '',
                    bylaw:  row.querySelector('.subject-bylaw')?.checked || false,
                });
            });
            terms.push({ termId: term.id.split('-')[1], subjects });
        });

        const prevCum = {
            percentage: document.querySelector('.prev-percentage')?.value || '',
            points:     document.querySelector('.prev-points')?.value     || '',
            hours:      document.querySelector('.prev-hours')?.value      || '',
        };

        AppState.saveData({ terms, prevCum, gradingSystem: AppState.gradingSystem });
    },

    /* ── Load Saved Data ── */
    load(onTermCreated) {
        const data = AppState.loadData();
        if (!data) return false;

        // استعادة إعدادات نظام التقدير
        if (data.gradingSystem) AppState.gradingSystem = data.gradingSystem;

        // استعادة التراكمي السابق
        if (data.prevCum) {
            const setVal = (sel, val) => {
                const el = document.querySelector(sel);
                if (el) el.value = val || '';
            };
            setVal('.prev-percentage', data.prevCum.percentage);
            setVal('.prev-points',     data.prevCum.points);
            setVal('.prev-hours',      data.prevCum.hours);
        }

        // استعادة الفصول
        const container = document.getElementById('terms-container');
        if (data.terms?.length) {
            container.innerHTML = '';
            data.terms.forEach(termData => {
                const termNum = parseInt(termData.termId) || (AppState.termCount + 1);
                container.insertAdjacentHTML('beforeend', UI.renderTerm(termNum));
                AppState.termCount = Math.max(AppState.termCount, termNum);

                const termEl = document.getElementById(`term-${termNum}`);
                if (!termEl) return;

                const tbody = termEl.querySelector('tbody');
                tbody.innerHTML = '';

                termData.subjects.forEach((sub, idx) => {
                    tbody.insertAdjacentHTML('beforeend', UI.renderSubjectRow(idx + 1));
                    const row = tbody.lastElementChild;
                    const set = (sel, val) => { const el = row.querySelector(sel); if (el) el.value = val; };
                    set('.subject-name',   sub.name);
                    set('.subject-hour',   sub.hours);
                    set('.subject-degree', sub.degree);
                    set('.subject-rating', sub.rating);
                    const bylawEl = row.querySelector('.subject-bylaw');
                    if (bylawEl) bylawEl.checked = sub.bylaw === true || sub.bylaw === 'true';

                    // تحديث حالة الصف
                    if (bylawEl?.checked) {
                        row.classList.add('row-bylaws');
                        const degInput = row.querySelector('.subject-degree');
                        if (degInput) { degInput.value = ''; degInput.disabled = true; }
                    }
                });

                if (onTermCreated) onTermCreated(termEl, termNum);
            });

            UI.reassignTermNumbers();
        }
        return true;
    },

    /* ════════════════════════════════════════
       EXPORT PDF
    ════════════════════════════════════════ */
    exportPDF() {
        const btn = document.getElementById('export-pdf');
        btn?.classList.add('loading');
        if (btn) btn.disabled = true;

        setTimeout(() => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const t   = k => AppState.t(k);
                const isRTL = AppState.lang === 'ar';

                const titleStyle  = { fontSize: 16, fontStyle: 'bold' };
                const headerFill  = [37, 99, 235];
                const tableTheme  = 'grid';
                let y = 14;

                const addTitle = (text) => {
                    pdf.setFontSize(titleStyle.fontSize);
                    pdf.setFont(undefined, 'bold');
                    pdf.text(text, 105, y, { align: 'center' });
                    y += 6;
                };

                const addTable = (head, body) => {
                    pdf.autoTable({
                        head: [head], body,
                        startY: y,
                        theme: tableTheme,
                        styles:     { halign: 'center', fontSize: 11 },
                        headStyles: { fillColor: headerFill, fontStyle: 'bold' },
                    });
                    y = pdf.autoTable.previous.finalY + 10;
                };

                // 1) التراكمي الكلي
                addTitle(t('cumulativeTerm'));
                addTable(
                    [t('percentage'), t('grade'), t('points'), t('hours')],
                    [[
                        document.querySelector('.cum-percentage')?.textContent || '—',
                        document.querySelector('.cum-grade')?.textContent      || '—',
                        document.querySelector('.cum-points')?.textContent     || '—',
                        document.querySelector('.cum-hours')?.textContent      || '—',
                    ]]
                );

                // 2) نتائج الفصول
                addTitle(t('comparison'));
                const termRows = [];
                document.querySelectorAll('.term').forEach((term, i) => {
                    termRows.push([
                        `${t('termResult')} ${i + 1}`,
                        term.querySelector('.term-total')?.textContent      || '—',
                        term.querySelector('.term-percentage')?.textContent || '—',
                        term.querySelector('.term-grade')?.textContent      || '—',
                        term.querySelector('.term-points')?.textContent     || '—',
                        term.querySelector('.term-hours')?.textContent      || '—',
                    ]);
                });
                if (termRows.length) {
                    addTable(
                        [t('termResult'), t('total'), t('percentage'), t('grade'), t('points'), t('hours')],
                        termRows
                    );
                }

                // 3) تفاصيل مواد كل فصل
                const savedData = AppState.loadData();
                if (savedData?.terms) {
                    savedData.terms.forEach((term, i) => {
                        if (y > 250) { pdf.addPage(); y = 14; }
                        addTitle(`${t('subjectName')} — ${t('termResult')} ${i + 1}`);
                        const subRows = term.subjects
                            .filter(s => s.name || s.degree || s.hours)
                            .map(s => [
                                s.name   || '—',
                                s.hours  || '—',
                                s.bylaw ? '★' : (s.degree || '—'),
                                s.rating || '—',
                            ]);
                        if (subRows.length) {
                            addTable(
                                [t('subjectName'), t('hours'), t('degree'), t('grade')],
                                subRows
                            );
                        }
                    });
                }

                // Footer
                const pages = pdf.internal.getNumberOfPages();
                for (let p = 1; p <= pages; p++) {
                    pdf.setPage(p);
                    pdf.setFontSize(8);
                    pdf.setTextColor(150);
                    pdf.text(
                        `GPA Calculator v${APP_VERSION} | © 2021-2026 Ali Al-3rian | ${new Date().toLocaleDateString()}`,
                        105, pdf.internal.pageSize.height - 6,
                        { align: 'center' }
                    );
                }

                pdf.save('GPA_Report.pdf');
                UI.toast(t('exportSuccess'), 'success');
            } catch (err) {
                console.error(err);
                UI.toast('Export failed', 'error');
            } finally {
                btn?.classList.remove('loading');
                if (btn) btn.disabled = false;
            }
        }, 300);
    },

    /* ════════════════════════════════════════
       EXPORT EXCEL
    ════════════════════════════════════════ */
    exportExcel() {
        const btn = document.getElementById('export-excel');
        btn?.classList.add('loading');
        if (btn) btn.disabled = true;

        setTimeout(() => {
            try {
                if (typeof XLSX === 'undefined') {
                    UI.toast('XLSX library not loaded', 'error');
                    return;
                }

                const wb = XLSX.utils.book_new();
                const t  = k => AppState.t(k);

                // Sheet 1: ملخص تراكمي
                const summaryData = [
                    [t('percentage'), t('grade'), t('points'), t('hours')],
                    [
                        document.querySelector('.cum-percentage')?.textContent || '',
                        document.querySelector('.cum-grade')?.textContent      || '',
                        document.querySelector('.cum-points')?.textContent     || '',
                        document.querySelector('.cum-hours')?.textContent      || '',
                    ],
                ];
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), t('cumulativeTerm'));

                // Sheet 2: مقارنة الفصول
                const compRows = [[t('termResult'), t('total'), t('percentage'), t('grade'), t('points'), t('hours')]];
                document.querySelectorAll('.term').forEach((term, i) => {
                    compRows.push([
                        `${t('termResult')} ${i + 1}`,
                        term.querySelector('.term-total')?.textContent      || '',
                        term.querySelector('.term-percentage')?.textContent || '',
                        term.querySelector('.term-grade')?.textContent      || '',
                        term.querySelector('.term-points')?.textContent     || '',
                        term.querySelector('.term-hours')?.textContent      || '',
                    ]);
                });
                XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(compRows), t('comparison'));

                // Sheet per term: تفاصيل المواد
                const savedData = AppState.loadData();
                savedData?.terms?.forEach((term, i) => {
                    const rows = [[t('subjectName'), t('hours'), t('degree'), t('grade'), t('bylawFail')]];
                    term.subjects.forEach(s => {
                        if (s.name || s.degree || s.hours) {
                            rows.push([
                                s.name   || '',
                                s.hours  || '',
                                s.bylaw ? '★' : (s.degree || ''),
                                s.rating || '',
                                s.bylaw ? '✓' : '',
                            ]);
                        }
                    });
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), `${t('termResult')} ${i + 1}`);
                });

                XLSX.writeFile(wb, 'GPA_Report.xlsx');
                UI.toast(t('exportSuccess'), 'success');
            } catch (err) {
                console.error(err);
                UI.toast('Export failed', 'error');
            } finally {
                btn?.classList.remove('loading');
                if (btn) btn.disabled = false;
            }
        }, 200);
    },

    /* ── Share ── */
    share() {
        const t    = k => AppState.t(k);
        const pct  = document.querySelector('.cum-percentage')?.textContent || '';
        const pts  = document.querySelector('.cum-points')?.textContent     || '';
        const grade = document.querySelector('.cum-grade')?.textContent     || '';
        const text = `${t('shareMessage')}\n${t('percentage')}: ${pct}\n${t('points')}: ${pts}\n${t('grade')}: ${grade}`;

        if (navigator.share) {
            navigator.share({ title: t('title'), text })
                .catch(() => this._copyToClipboard(text));
        } else {
            this._copyToClipboard(text);
        }
    },

    _copyToClipboard(text) {
        navigator.clipboard?.writeText(text)
            .then(() => UI.toast(AppState.t('copySuccess'), 'success'))
            .catch(() => UI.toast(AppState.t('shareError'), 'error'));
    },
};
