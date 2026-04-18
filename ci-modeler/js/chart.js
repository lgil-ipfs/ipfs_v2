const ChartManager = {
    chartInstance: null,

    init() {
        // Prepare chart context
        const ctx = document.getElementById('ci-chart').getContext('2d');
        
        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    },
                    annotation: {
                        annotations: {}
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Age'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Net Worth'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000) {
                                    return '$' + (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return '$' + (value / 1000).toFixed(0) + 'k';
                                }
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    },

    update(results, inputs) {
        if (!this.chartInstance) this.init();

        const diagnosisAge = inputs.currentAge + inputs.diagnosisYearOffset;

        this.chartInstance.data.labels = results.ages;
        this.chartInstance.data.datasets = [
            {
                label: 'No CI Event (Baseline)',
                data: results.noEvent,
                borderColor: '#3F5E7A',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 0
            },
            {
                label: 'CI — Uninsured',
                data: results.uninsured,
                borderColor: '#C0392B',
                borderWidth: 3,
                fill: false,
                tension: 0.4,
                pointRadius: 1,
                pointHoverRadius: 5
            },
            {
                label: 'CI — Insured (With Illness)',
                data: results.insured,
                borderColor: '#27AE60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 1,
                pointHoverRadius: 5
            },
            {
                label: 'CI — Insured (ROP, No Illness)',
                data: results.insuredRop,
                borderColor: '#E67E22', // Orange for ROP line
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointRadius: 0
            }
        ];

        this.chartInstance.options.plugins.annotation.annotations = {
            diagnosisLine: {
                type: 'line',
                xMin: diagnosisAge,
                xMax: diagnosisAge,
                borderColor: '#888',
                borderWidth: 1,
                borderDash: [4, 4],
                label: {
                    display: true,
                    content: 'Diagnosis',
                    position: 'start',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    font: { size: 10 }
                }
            }
        };

        this.chartInstance.update();
    }
};

window.ChartManager = ChartManager;
