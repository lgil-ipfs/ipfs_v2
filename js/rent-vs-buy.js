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
    const elRenewalTerm = document.getElementById('renewalTerm');
    const elRenewalRate = document.getElementById('renewalRate');

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
    const elLabelMortgagePmt = document.getElementById('label-mortgage-pmt');
    const elLabelRentIncrease = document.getElementById('label-rent-increase-note');

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
        const initialRate = num('mortgageRate');
        const renewalRate = num('renewalRate');
        const renewalTerm = parseInt(elRenewalTerm.value);
        const amortYears = 25;

        const initialPayment = calcMonthlyPayment(mortgagePrincipal, initialRate, amortYears);

        // Ongoing Costs (monthly)
        const propTaxMonth = (num('propertyTaxRate') / 100 * condoPrice) / 12;
        const strataMonth = num('strataCondo');
        const insuranceMonth = num('homeInsurance') / 12;

        const growthRate = num('growthCondo') / 100;
        const rentIncrease = num('rentIncrease') / 100;
        const investReturn = num('investmentReturn');
        const startRent = num('currentRent');

        // BUY SCENARIO: Calculate cumulative cash flow with renewal
        let totalCashPaidBuy = buyUpfrontNeeded;
        let runningMortgagePrincipal = mortgagePrincipal;
        let currentPmt = initialPayment;

        for (let m = 1; m <= months; m++) {
            // Check for renewal
            if (m === renewalTerm * 12 + 1) {
                const remainingBalance = calcRemainingBalance(mortgagePrincipal, initialRate, amortYears, renewalTerm * 12);
                currentPmt = calcMonthlyPayment(remainingBalance, renewalRate, amortYears - renewalTerm);
            }
            totalCashPaidBuy += currentPmt + propTaxMonth + strataMonth + insuranceMonth;
        }

        const futureValue = condoPrice * Math.pow(1 + growthRate, horizonYears);
        const currentMonthsHorizon = horizonYears * 12;
        let remainingLoan;
        if (horizonYears <= renewalTerm) {
            remainingLoan = calcRemainingBalance(mortgagePrincipal, initialRate, amortYears, currentMonthsHorizon);
        } else {
            const balanceAtRenewal = calcRemainingBalance(mortgagePrincipal, initialRate, amortYears, renewalTerm * 12);
            remainingLoan = calcRemainingBalance(balanceAtRenewal, renewalRate, amortYears - renewalTerm, (horizonYears - renewalTerm) * 12);
        }
        const sellingCosts = futureValue * 0.05;
        const netEquityAtEnd = futureValue - remainingLoan - sellingCosts;
        const netCostBuy = totalCashPaidBuy - netEquityAtEnd;

        // RENT SCENARIO
        let totalRentPaid = 0;
        for (let y = 0; y < horizonYears; y++) {
            totalRentPaid += (startRent * Math.pow(1 + rentIncrease, y)) * 12;
        }
        const avgBuyOutflow = (totalCashPaidBuy - buyUpfrontNeeded) / months;
        const avgRentMonthly = totalRentPaid / months;
        const monthlySaving = avgBuyOutflow - avgRentMonthly;
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
            let cashBuy_y = buyUpfrontNeeded;
            let tempPmt = initialPayment;
            for (let m = 1; m <= monthsY; m++) {
                if (m === renewalTerm * 12 + 1) {
                    const balAtRen = calcRemainingBalance(mortgagePrincipal, initialRate, amortYears, renewalTerm * 12);
                    tempPmt = calcMonthlyPayment(balAtRen, renewalRate, amortYears - renewalTerm);
                }
                cashBuy_y += tempPmt + propTaxMonth + strataMonth + insuranceMonth;
            }

            const FV_y = condoPrice * Math.pow(1 + growthRate, y);
            let loan_y;
            if (y <= renewalTerm) {
                loan_y = calcRemainingBalance(mortgagePrincipal, initialRate, amortYears, monthsY);
            } else {
                const balAtRen = calcRemainingBalance(mortgagePrincipal, initialRate, amortYears, renewalTerm * 12);
                loan_y = calcRemainingBalance(balAtRen, renewalRate, amortYears - renewalTerm, (y - renewalTerm) * 12);
            }
            const sell_y = FV_y * 0.05;
            const eq_y = FV_y - loan_y - sell_y;
            buyData.push(cashBuy_y - eq_y);

            // Rent stats for year Y
            let rentPaid_y = 0;
            for (let i = 0; i < y; i++) rentPaid_y += (startRent * Math.pow(1 + rentIncrease, i)) * 12;
            const avgOutflowY = (cashBuy_y - buyUpfrontNeeded) / monthsY;
            const avgRentY = rentPaid_y / monthsY;
            const save_y = calcFV(buyUpfrontNeeded, avgOutflowY - avgRentY, investReturn, y);
            rentData.push(rentPaid_y - (save_y - buyUpfrontNeeded));
        }

        updateChart(chartLabels, buyData, rentData);

        // ─── 5. UI UPDATES ──────────────────────────────────────────────────
        elBuyNetTotal.textContent = fmt(netCostBuy);
        elRentNetTotal.textContent = fmt(netCostRent);
        elBuyMonthlyAvg.textContent = fmt(avgBuyOutflow);
        elRentMonthlyAvg.textContent = fmt(avgRentMonthly);
        elLabelMortgagePmt.textContent = fmt(initialPayment);
        elLabelRentIncrease.textContent = num('rentIncrease') + '%';

        elBuyCashOut.textContent = fmt(totalCashPaidBuy);
        elRentCashOut.textContent = fmt(totalRentPaid);
        elBuyEntryCosts.textContent = fmt(closingEntryCosts);
        elRentEntryCosts.textContent = "$0";
        elBuyEquityEnd.textContent = fmt(netEquityAtEnd);
        elRentSavingsEnd.textContent = fmt(rentSavingsAtEnd);
        elBuyNetCostRow.textContent = fmt(netCostBuy);
        elRentNetCostRow.textContent = fmt(netCostRent);

        const diff = Math.abs(netCostBuy - netCostRent);
        let verdictText = "";
        if (netCostBuy < netCostRent) {
            elVerdictCard.className = 'rvb-verdict rvb-verdict--better-buy';
            verdictText = `Buying is better by ${fmt(diff)} over ${horizonYears} years.`;
            elNarrativeBox.innerHTML = `By staying for <strong>${horizonYears} years</strong>, you build <strong>${fmt(netEquityAtEnd)}</strong> in home equity. At renewal in year ${renewalTerm}, your rate shifts to ${renewalRate}%, affecting your cash flow but preserving the long-term equity advantage.`;
        } else {
            elVerdictCard.className = 'rvb-verdict rvb-verdict--better-rent';
            verdictText = `Renting is better by ${fmt(diff)} over ${horizonYears} years.`;
            elNarrativeBox.innerHTML = `In a <strong>${horizonYears}-year</strong> horizon, transaction costs and current market rates make renting more efficient. Even with a projected rate of ${renewalRate}% later, renting and investing at ${num('investmentReturn')}% yields <strong>${fmt(rentSavingsAtEnd)}</strong> in total savings.`;
        }

        // Break-even
        let crossoverYear = -1;
        for (let i = 0; i < buyData.length; i++) {
            if (buyData[i] < rentData[i]) {
                crossoverYear = i + 1;
                break;
            }
        }
        if (crossoverYear !== -1) {
            verdictText += ` (Break-even at year ${crossoverYear})`;
        }
        elVerdictSummary.textContent = verdictText;
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
