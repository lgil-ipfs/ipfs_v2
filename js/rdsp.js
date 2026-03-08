document.addEventListener('DOMContentLoaded', () => {
    // Chart initialization
    const ctx = document.getElementById('rdsp-chart').getContext('2d');
    let rdspChart = null;

    // DOM Elements
    const inputs = {
        age: document.getElementById('rdsp-age'),
        income: document.getElementById('rdsp-income'),
        stratMax: document.getElementById('strat-max'),
        stratCustom: document.getElementById('strat-custom'),
        customWrap: document.getElementById('custom-contrib-wrap'),
        customContrib: document.getElementById('custom-contrib'),
        growth: document.getElementById('rdsp-growth'),
        period: document.getElementById('rdsp-period')
    };

    const displays = {
        age: document.getElementById('age-val'),
        growth: document.getElementById('growth-val'),
        period: document.getElementById('period-val'),
        badge: document.getElementById('income-badge'),
        outContrib: document.getElementById('out-contrib'),
        outGrants: document.getElementById('out-grants'),
        outBonds: document.getElementById('out-bonds'),
        outTotal: document.getElementById('out-total')
    };

    // State
    let strategy = 'max'; // 'max' or 'custom'
    let customAmount = 1500;

    // Formatting
    const formatCur = (num) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(num);

    // Income thresholds (2024 approximate)
    const THRESHOLD_BOND = 32797;
    const THRESHOLD_ENHANCED = 106717;

    function updateBadge() {
        const income = Number(inputs.income.value) || 0;
        if (income <= THRESHOLD_BOND) {
            displays.badge.textContent = "Bond eligible — up to $1,000/year added automatically";
            displays.badge.style.backgroundColor = '#e8f5e9';
            displays.badge.style.color = '#2e7d32';
        } else if (income <= THRESHOLD_ENHANCED) {
            displays.badge.textContent = "Enhanced grant rate applies (up to $3,500/yr)";
            displays.badge.style.backgroundColor = '#e3f2fd';
            displays.badge.style.color = '#1565c0';
        } else {
            displays.badge.textContent = "Base grant rate applies — $1 for $1 up to $1,000/year";
            displays.badge.style.backgroundColor = '#fdfbf7';
            displays.badge.style.color = '#555';
        }
    }

    function getOptimalContribution() {
        const income = Number(inputs.income.value) || 0;
        return (income <= THRESHOLD_ENHANCED) ? 1500 : 1000;
    }

    function calculateProjection() {
        const startAge = parseInt(inputs.age.value);
        const endAge = parseInt(inputs.period.value);
        const income = Number(inputs.income.value) || 0;
        const growthRate = parseFloat(inputs.growth.value) / 100;

        // Ensure period is ahead of start age
        if (endAge <= startAge) {
            inputs.period.value = startAge + 1;
            displays.period.textContent = startAge + 1;
            return calculateProjection();
        }

        const years = endAge - startAge;

        // Determine annual contribution
        let annualContrib = strategy === 'max' ? getOptimalContribution() : Number(inputs.customContrib.value);

        let totalContrib = 0;
        let totalGrants = 0;
        let totalBonds = 0;
        let balance = 0;

        let chartLabels = [];
        let chartContribs = [];
        let chartGrants = [];
        let chartBonds = [];
        let chartTotals = [];

        for (let i = 0; i <= years; i++) {
            const currentAge = startAge + i;
            let yrContrib = 0;
            let yrGrant = 0;
            let yrBond = 0;

            // RDSP rules: grants/bonds only until end of year turning 49
            // Lifetime limit max: 200k contrib, 70k grant, 20k bond
            if (currentAge <= 49 && i > 0) { // i=0 is just starting point
                // Apply limits
                if (totalContrib + annualContrib > 200000) {
                    yrContrib = Math.max(0, 200000 - totalContrib);
                } else {
                    yrContrib = annualContrib;
                }

                // Calculate Bond
                if (income <= THRESHOLD_BOND && totalBonds < 20000) {
                    yrBond = Math.min(1000, 20000 - totalBonds);
                }

                // Calculate Grant
                if (totalGrants < 70000) {
                    if (income <= THRESHOLD_ENHANCED) {
                        // $3 on first $500, $2 on next $1000
                        let t1 = Math.min(yrContrib, 500) * 3;
                        let rem = Math.max(0, yrContrib - 500);
                        let t2 = Math.min(rem, 1000) * 2;
                        yrGrant = Math.min(t1 + t2, 70000 - totalGrants);
                    } else {
                        // $1 for $1 up to $1000
                        yrGrant = Math.min(Math.min(yrContrib, 1000), 70000 - totalGrants);
                    }
                }
            } else if (i > 0) {
                // Post-49, can still contribute until 59 theoretically, but simplifying
                // Actually RDSP allows contribs until Dec 31 year turning 59.
                if (currentAge <= 59 && totalContrib + annualContrib <= 200000) {
                    yrContrib = annualContrib;
                } else if (currentAge <= 59 && totalContrib < 200000) {
                    yrContrib = 200000 - totalContrib;
                }
            }

            // Add to totals
            totalContrib += yrContrib;
            totalGrants += yrGrant;
            totalBonds += yrBond;

            // Apply growth on previous year's balance, then add new funds
            // Assuming funds added at end of year for simplicity
            if (i > 0) {
                balance = balance * (1 + growthRate) + yrContrib + yrGrant + yrBond;
            }

            chartLabels.push(`Age ${currentAge}`);
            chartContribs.push(totalContrib);
            chartGrants.push(totalGrants);
            chartBonds.push(totalBonds);
            chartTotals.push(balance);
        }

        // Update Output Numbers
        displays.outContrib.textContent = formatCur(totalContrib);
        displays.outGrants.textContent = formatCur(totalGrants);
        displays.outBonds.textContent = formatCur(totalBonds);
        displays.outTotal.textContent = formatCur(balance);

        // Update Chart
        drawChart(chartLabels, chartContribs, chartGrants, chartBonds, chartTotals);
    }

    function drawChart(labels, contribs, grants, bonds, totals) {
        if (rdspChart) {
            rdspChart.destroy();
        }

        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Your Contributions',
                        data: contribs,
                        borderColor: '#9b2b22', // maroon
                        backgroundColor: 'rgba(155, 43, 34, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Grants',
                        data: grants,
                        borderColor: '#b4995f', // gold
                        backgroundColor: 'rgba(180, 153, 95, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Bonds',
                        data: bonds,
                        borderColor: '#e8dcba', // light gold
                        backgroundColor: 'rgba(232, 220, 186, 0.2)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Total Plan Value (with growth)',
                        data: totals,
                        borderColor: '#1a1a24', // charcoal
                        backgroundColor: 'transparent',
                        borderWidth: 3,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.4
                    }
                ]
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
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        };

        rdspChart = new Chart(ctx, config);
    }

    // Event Listeners
    inputs.age.addEventListener('input', (e) => {
        displays.age.textContent = e.target.value;

        // Ensure period slider min is updated
        const ageNum = parseInt(e.target.value);
        inputs.period.min = ageNum + 1;
        if (parseInt(inputs.period.value) <= ageNum) {
            inputs.period.value = ageNum + 10;
            displays.period.textContent = inputs.period.value;
        }

        calculateProjection();
    });

    inputs.income.addEventListener('input', () => {
        updateBadge();
        calculateProjection();
    });

    inputs.growth.addEventListener('input', (e) => {
        displays.growth.textContent = e.target.value + '%';
        calculateProjection();
    });

    inputs.period.addEventListener('input', (e) => {
        displays.period.textContent = e.target.value;
        calculateProjection();
    });

    inputs.customContrib.addEventListener('input', () => {
        if (strategy === 'custom') calculateProjection();
    });

    // Toggles
    inputs.stratMax.addEventListener('click', () => {
        strategy = 'max';
        inputs.stratMax.classList.add('active');
        inputs.stratCustom.classList.remove('active');
        inputs.customWrap.style.display = 'none';
        calculateProjection();
    });

    inputs.stratCustom.addEventListener('click', () => {
        strategy = 'custom';
        inputs.stratCustom.classList.add('active');
        inputs.stratMax.classList.remove('active');
        inputs.customWrap.style.display = 'flex';
        // init custom value based on income
        inputs.customContrib.value = getOptimalContribution();
        calculateProjection();
    });

    // Init
    updateBadge();
    inputs.period.min = parseInt(inputs.age.value) + 1;
    calculateProjection();
});
