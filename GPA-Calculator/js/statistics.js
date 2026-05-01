/* ============================================================
   statistics.js — Charts & Advanced Statistics
   ============================================================ */
'use strict';

const Statistics = {
    _chart: null,

    render(termResults) {
        const section = document.getElementById('statistics-section');
        if (!section) return;

        if (!termResults.length) {
            section.style.display = 'none';
            return;
        }

        section.style.display = '';
        this._updateChart(termResults);
        this._updateCards(termResults);
    },

    _updateChart(termResults) {
        const canvas = document.getElementById('gpa-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        const isDark  = document.body.classList.contains('dark-mode');
        const gridClr = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
        const textClr = isDark ? '#8b949e' : '#64748b';
        const maxGPA  = AppState.gradingSystem === '5.0' ? 5 : 4;

        const labels = termResults.map((_, i) => `${AppState.t('termResult')} ${i + 1}`);
        const data   = termResults.map(r => parseFloat(r.gpaPoints.toFixed(3)));

        if (this._chart) { this._chart.destroy(); this._chart = null; }

        this._chart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: AppState.t('points'),
                    data,
                    borderColor:     '#3b82f6',
                    backgroundColor: 'rgba(59,130,246,0.08)',
                    pointBackgroundColor: data.map(v => {
                        if (v >= maxGPA * 0.85) return '#22c55e';
                        if (v >= maxGPA * 0.7)  return '#3b82f6';
                        if (v >= maxGPA * 0.55)  return '#f59e0b';
                        return '#ef4444';
                    }),
                    pointRadius:      5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2.5,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${AppState.t('points')}: ${ctx.parsed.y.toFixed(3)}`,
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: maxGPA,
                        grid:  { color: gridClr },
                        ticks: { color: textClr, stepSize: maxGPA / 4 },
                    },
                    x: {
                        grid:  { color: gridClr },
                        ticks: { color: textClr },
                    },
                },
            },
        });
    },

    _updateCards(termResults) {
        const container = document.getElementById('stats-cards');
        if (!container) return;

        const savedData = AppState.loadData();
        if (!savedData?.terms) return;

        const stats = Calculations.getAdvancedStats(
            savedData.terms.map(t => ({ subjects: t.subjects }))
        );

        container.innerHTML = UI.renderStatsCards(stats);
    },
};
