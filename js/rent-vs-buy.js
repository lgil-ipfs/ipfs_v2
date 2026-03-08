/**
 * RENT VS BUY ILLUSTRATOR — WOWA Redesign Calculation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─── 1. SELECTORS ──────────────────────────────────────────────────────────
    const inputs = document.querySelectorAll('.rvb-field__input, select');

    // Core inputs
    const elCondoPrice = document.getElementById('purchasePrice');
    const elDPValue = document.getElementById('downPaymentValue');
    const elDPMode = document.getElementById('dpMode');
    const elCurrentRent = document.getElementById('currentRent');
    const elHorizon = document.getElementById('horizonYears');
    const elMortgageRate = document.getElementById('mortgageRate');

    // Advanced inputs
    const elPropTaxRate = document.getElementById('propertyTaxRate');
    const elStrataCondo = document.getElementById('strataCondo');
    const elHomeInsurance = document.getElementById('homeInsurance');
    const elGrowthCondo = document.getElementById('growthCondo');
    const elRentIncrease = document.getElementById('rentIncrease');
    const elInvestReturn = document.getElementById('investmentReturn');

    // Display elements
    const elBuyNetTotal = document.getElementById('buy-net-total');
    const elRentNetTotal = document.getElementById('rent-net-total');
    const elBuyMonthlyAvg = document.getElementById('buy-monthly-avg');
    const elRentMonthlyAvg = document.getElementById('rent-monthly-avg');

    // Table elements
    const elBuyCashOut = document.getElementById('buy-cash-out');
    const elRentCashOut = document.getElementById('rent-cash-out');
    const elBuyEntryCosts = document.getElementById('buy-entry-costs');
    const elRentEntryCosts = document.getElementById('rent-entry-costs');
    const elBuyEquityEnd = document.getElementById('buy-equity-end');
    const elRentSavingsEnd = document.getElementById('rent-savings-end');
    const elBuyNetCostRow = document.getElementById('buy-net-cost-row');
    const elRentNetCostRow = document.getElementById('rent-net-cost-row');

    // Verdict & Labels
    const elVerdictSummary = document.getElementById('verdict-summary');
    const elLabelHorizon = document.getElementById('label-horizon');
    const elNarrativeBox = document.getElementById('narrative-box');
    const elVerdictCard = document.getElementById('rvb-verdict-card');

    let costChart = null;

    // ─── 2. HELPERS ────────────────────────────────────────────────────────────
    const fmt = (val) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
    const num = (id) => parseFloat(document.getElementById(id).value) || 0;

    // Canadian mortgage payment (semi-annual compounding)
    function calcMonthlyPayment(principal, annualRate, years) {
        if (principal <= 0) return 0;
        const r = annualRate / 100;
        const monthlyRate = Math.pow(1 + r / 2, 2 / 12) - 1;
        const totalPayments = years * 12;
        if (monthlyRate === 0) return principal / totalPayments;
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    // Mortgage balance after X months
    function calcRemainingBalance(principal, annualRate, years, monthsElapsed) {
        if (principal <= 0) return 0;
        const r = annualRate / 100;
        const monthlyRate = Math.pow(1 + r / 2, 2 / 12) - 1;
        const totalPayments = years * 12;
        const pmt = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
        if (monthlyRate === 0) return Math.max(0, principal - (pmt * monthsElapsed));
        const balance = principal * Math.pow(1 + monthlyRate, monthsElapsed) - (pmt * (Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate);
        return Math.max(0, balance);
    }

    // Future Value of investment
    function calcFV(principal, monthlyContrib, annualReturn, years) {
        const r = annualReturn / 100 / 12;
        const months = years * 12;
        const fvLump = principal * Math.pow(1 + r, months);
        let fvContrib = 0;
        if (r > 0) {
            fvContrib = monthlyContrib * (Math.pow(1 + r, months) - 1) / r;
        } else {
            fvContrib = monthlyContrib * months;
        }
        return fvLump + fvContrib;
    }

    // ─── 3. MAIN CALCULATION ──────────────────────────────────────────────────
    function calculate() {
        const horizonYears = parseInt(elHorizon.value);
        const months = horizonYears * 12;
        elLabelHorizon.textContent = horizonYears;

        // Basics
        const condoPrice = num('purchasePrice');
        const dpMode = elDPMode.value;
        const dpVal = num('downPaymentValue');
        const downPayment = dpMode === 'percent' ? (dpVal / 100) * condoPrice : dpVal;

        // Mortgage
        const entryCostsRate = 1.5;
        const closingEntryCosts = (entryCostsRate / 100) * condoPrice;
        const buyUpfrontNeeded = downPayment + closingEntryCosts;

        // CMHC Insurance
        let cmhcInsurance = 0;
        const dpPercent = (downPayment / condoPrice) * 100;
        if (dpPercent < 20) {
            if (dpPercent >= 15) cmhcInsurance = (condoPrice - downPayment) * 0.028;
            else if (dpPercent >= 10) cmhcInsurance = (condoPrice - downPayment) * 0.031;
            else cmhcInsurance = (condoPrice - downPayment) * 0.04;
        }

        const mortgagePrincipal = Math.max(0, condoPrice - downPayment + cmhcInsurance);
        const mortgageRate = num('mortgageRate');
        const amortYears = 25;
        const monthlyMortgage = calcMonthlyPayment(mortgagePrincipal, mortgageRate, amortYears);

        // Ongoing Costs
        const propTaxMonth = (num('propertyTaxRate') / 100 * condoPrice) / 12;
        const strataMonth = num('strataCondo');
        const insuranceMonth = num('homeInsurance') / 12;
        const buyTotalMonthly = monthlyMortgage + propTaxMonth + strataMonth + insuranceMonth;

        const growthRate = num('growthCondo') / 100;
        const rentIncrease = num('rentIncrease') / 100;
        const investReturn = num('investmentReturn');
        const startRent = num('currentRent');

        // BUY SCENARIO RESULTS (FOR SELECTED HORIZON)
        const futureValue = condoPrice * Math.pow(1 + growthRate, horizonYears);
        const remainingLoan = calcRemainingBalance(mortgagePrincipal, mortgageRate, amortYears, months);
        const sellingCosts = futureValue * 0.05;
        const netEquityAtEnd = futureValue - remainingLoan - sellingCosts;

        const totalCashPaidBuy = buyUpfrontNeeded + (buyTotalMonthly * months);
        const netCostBuy = totalCashPaidBuy - netEquityAtEnd;

        // RENT SCENARIO RESULTS (FOR SELECTED HORIZON)
        let totalRentPaid = 0;
        for (let y = 0; y < horizonYears; y++) {
            totalRentPaid += (startRent * Math.pow(1 + rentIncrease, y)) * 12;
        }
        const avgRentMonthly = totalRentPaid / months;
        const monthlySaving = buyTotalMonthly - (totalRentPaid / months);
        const rentSavingsAtEnd = calcFV(buyUpfrontNeeded, monthlySaving, investReturn, horizonYears);
        const netCostRent = totalRentPaid - (rentSavingsAtEnd - buyUpfrontNeeded);

        // ─── 4. CHART DATA GENERATION (1-25 YEARS) ──────────────────────────
        const chartLabels = [];
        const buyData = [];
        const rentData = [];

        for (let y = 1; y <= 25; y++) {
            chartLabels.push(`Year ${y}`);
            const monthsY = y * 12;

            // Buy stats for year Y
            const FV_y = condoPrice * Math.pow(1 + growthRate, y);
            const loan_y = calcRemainingBalance(mortgagePrincipal, mortgageRate, amortYears, monthsY);
            const sell_y = FV_y * 0.05;
            const eq_y = FV_y - loan_y - sell_y;
            const cash_buy_y = buyUpfrontNeeded + (buyTotalMonthly * monthsY);
            buyData.push(cash_buy_y - eq_y);

            // Rent stats for year Y
            let rentPaid_y = 0;
            for (let i = 0; i < y; i++) rentPaid_y += (startRent * Math.pow(1 + rentIncrease, i)) * 12;
            const monthlySaving_y = buyTotalMonthly - (rentPaid_y / monthsY);
            const save_y = calcFV(buyUpfrontNeeded, monthlySaving_y, investReturn, y);
            rentData.push(rentPaid_y - (save_y - buyUpfrontNeeded));
        }

        updateChart(chartLabels, buyData, rentData);

        // ─── 5. UI UPDATES ──────────────────────────────────────────────────
        elBuyNetTotal.textContent = fmt(netCostBuy);
        elRentNetTotal.textContent = fmt(netCostRent);
        elBuyMonthlyAvg.textContent = fmt(buyTotalMonthly);
        elRentMonthlyAvg.textContent = fmt(avgRentMonthly);

        elBuyCashOut.textContent = fmt(totalCashPaidBuy);
        elRentCashOut.textContent = fmt(totalRentPaid);
        elBuyEntryCosts.textContent = fmt(closingEntryCosts);
        elRentEntryCosts.textContent = "$0";
        elBuyEquityEnd.textContent = fmt(netEquityAtEnd);
        elRentSavingsEnd.textContent = fmt(rentSavingsAtEnd);
        elBuyNetCostRow.textContent = fmt(netCostBuy);
        elRentNetCostRow.textContent = fmt(netCostRent);

        const diff = Math.abs(netCostBuy - netCostRent);
        if (netCostBuy < netCostRent) {
            elVerdictCard.classList.remove('rvb-verdict--better-rent');
            elVerdictCard.classList.add('rvb-verdict--better-buy');
            elVerdictSummary.textContent = `Buying is better by ${fmt(diff)} over ${horizonYears} years.`;
            elNarrativeBox.innerHTML = `By staying for <strong>${horizonYears} years</strong>, you build <strong>${fmt(netEquityAtEnd)}</strong> in home equity. This capital accumulation outweighs owning costs.`;
        } else {
            elVerdictCard.classList.remove('rvb-verdict--better-buy');
            elVerdictCard.classList.add('rvb-verdict--better-rent');
            elVerdictSummary.textContent = `Renting is better by ${fmt(diff)} over ${horizonYears} years.`;
            elNarrativeBox.innerHTML = `In a <strong>${horizonYears}-year</strong> horizon, the high transaction costs make renting more efficient. Your capital ends with <strong>${fmt(rentSavingsAtEnd)}</strong> in savings.`;
        }

        // Break-even year calculation
        let crossoverYear = -1;
        for (let i = 0; i < buyData.length; i++) {
            if (buyData[i] < rentData[i]) {
                crossoverYear = i + 1;
                break;
            }
        }
        if (crossoverYear !== -1) {
            elVerdictSummary.textContent += ` (Break-even at year ${crossoverYear})`;
        }
    }

    function updateChart(labels, buyData, rentData) {
        const ctx = document.getElementById('costChart').getContext('2d');
        if (costChart) {
            costChart.data.labels = labels;
            costChart.data.datasets[0].data = buyData;
            costChart.data.datasets[1].data = rentData;
            costChart.update('none');
            return;
        }
        costChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Net Cost: Buy',
                        data: buyData,
                        borderColor: '#6B2737',
                        backgroundColor: 'rgba(107, 39, 55, 0.1)',
                        fill: true, tension: 0.3
                    },
                    {
                        label: 'Net Cost: Rent',
                        data: rentData,
                        borderColor: '#C9A84C',
                        backgroundColor: 'rgba(201, 168, 76, 0.1)',
                        fill: true, tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { ticks: { callback: (val) => fmt(val) } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`
                        }
                    }
                }
            }
        });
    }

    // ─── 6. EVENTS ─────────────────────────────────────────────────────────
    inputs.forEach(input => input.addEventListener('input', calculate));
    calculate();
});
