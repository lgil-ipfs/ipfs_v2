/**
 * RENT VS BUY & MORTGAGE ILLUSTRATOR — Enhanced Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─── 1. SELECTORS ──────────────────────────────────────────────────────────
    const inputs = document.querySelectorAll('.rvb-field__input, select');
    const elCondoPrice = document.getElementById('purchasePrice');
    const elDPValue = document.getElementById('downPaymentValue');
    const elDPMode = document.getElementById('dpMode');
    const elMinDPLabel = document.getElementById('min-dp-label');
    const elMortgageRate = document.getElementById('mortgageRate');
    const elAmortization = document.getElementById('amortization');
    const elFrequency = document.getElementById('paymentFrequency');

    const elGrossIncome = document.getElementById('grossIncome');
    const elMonthlyDebts = document.getElementById('monthlyDebts');
    const elStressTestRate = document.getElementById('stressTestRate');

    const elPropTaxRate = document.getElementById('propertyTaxRate');
    const elStrataCondo = document.getElementById('strataCondo');
    const elHeating = document.getElementById('heatingUtilities');
    const elHomeInsurance = document.getElementById('homeInsurance');
    const elCMHCOverride = document.getElementById('cmhcOverride');

    const elCurrentRent = document.getElementById('currentRent');
    const elGrowthCondo = document.getElementById('growthCondo');
    const elRentIncrease = document.getElementById('rentIncrease');
    const elInvestReturn = document.getElementById('investmentReturn');

    // Display elements
    const elStatusGDS = document.getElementById('status-gds');
    const elStatusTDS = document.getElementById('status-tds');
    const elStatusAfford = document.getElementById('status-affordability');
    const elLabelMortgagePmt = document.getElementById('label-mortgage-pmt');
    const elLabelQualifyingPmt = document.getElementById('label-qualifying-pmt');
    const elLabelTotalInterest = document.getElementById('label-total-interest');
    const elBuyNetTotal = document.getElementById('buy-net-total');
    const elRentNetTotal = document.getElementById('rent-net-total');
    const elNarrativeBox = document.getElementById('narrative-box');
    const elVerdictSummary = document.getElementById('verdict-summary');
    const elVerdictCard = document.getElementById('rvb-verdict-card');

    let costChart = null;

    // ─── 2. HELPERS ────────────────────────────────────────────────────────────
    const fmt = (val) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
    const num = (id) => parseFloat(document.getElementById(id).value) || 0;

    // Canadian mortgage payment (semi-annual compounding)
    function calcPeriodicPayment(principal, annualRate, years, freq) {
        if (principal <= 0) return 0;
        const r = annualRate / 100;
        // Canadian rule: Interest is compounded semi-annually
        const effectiveRatePerFreq = Math.pow(Math.pow(1 + r / 2, 2), 1 / freq) - 1;
        const totalPayments = years * freq;
        if (effectiveRatePerFreq === 0) return principal / totalPayments;
        return principal * (effectiveRatePerFreq * Math.pow(1 + effectiveRatePerFreq, totalPayments)) / (Math.pow(1 + effectiveRatePerFreq, totalPayments) - 1);
    }

    // Mortgage balance after X periods
    function calcRemainingBalance(principal, annualRate, years, freq, periodsElapsed) {
        if (principal <= 0) return 0;
        const r = annualRate / 100;
        const effectiveRatePerFreq = Math.pow(Math.pow(1 + r / 2, 2), 1 / freq) - 1;
        const totalPayments = years * freq;
        const pmt = principal * (effectiveRatePerFreq * Math.pow(1 + effectiveRatePerFreq, totalPayments)) / (Math.pow(1 + effectiveRatePerFreq, totalPayments) - 1);
        if (effectiveRatePerFreq === 0) return Math.max(0, principal - (pmt * periodsElapsed));
        const balance = principal * Math.pow(1 + effectiveRatePerFreq, periodsElapsed) - (pmt * (Math.pow(1 + effectiveRatePerFreq, periodsElapsed) - 1) / effectiveRatePerFreq);
        return Math.max(0, balance);
    }

    function getMinDownPayment(price) {
        if (price <= 500000) return price * 0.05;
        if (price <= 1000000) return (500000 * 0.05) + ((price - 500000) * 0.10);
        return price * 0.20;
    }

    function getCMHCPremium(principal, downPayment, price) {
        const override = elCMHCOverride.value;
        if (override !== "" && !isNaN(override)) return parseFloat(override);

        const dpPercent = (downPayment / price) * 100;
        if (dpPercent >= 20) return 0;
        if (dpPercent >= 15) return principal * 0.028;
        if (dpPercent >= 10) return principal * 0.031;
        return principal * 0.04;
    }

    // ─── 3. MAIN CALCULATION ──────────────────────────────────────────────────
    function calculate() {
        const price = num('purchasePrice');
        const minDP = getMinDownPayment(price);
        elMinDPLabel.textContent = `Minimum Down Payment: ${fmt(minDP)}`;

        const dpMode = elDPMode.value;
        const dpInputVal = num('downPaymentValue');
        let downPayment = dpMode === 'percent' ? (dpInputVal / 100) * price : dpInputVal;

        // Validation: Ensure DP >= Minimum
        if (downPayment < minDP) {
            downPayment = minDP;
            elDPValue.classList.add('u-error'); // Placeholder for UI hint
        } else {
            elDPValue.classList.remove('u-error');
        }

        const mortgagePrincipalRaw = price - downPayment;
        const cmhcPremium = getCMHCPremium(mortgagePrincipalRaw, downPayment, price);
        const totalMortgage = mortgagePrincipalRaw + cmhcPremium;

        // Update CMHC Label in table
        document.getElementById('label-cmhc-total').textContent = fmt(cmhcPremium);

        const rate = num('mortgageRate');
        const amort = parseInt(elAmortization.value);
        const freq = parseInt(elFrequency.value);

        // Payment calculations
        const periodicPmt = calcPeriodicPayment(totalMortgage, rate, amort, freq);
        const monthlyEquivalentPmt = (periodicPmt * freq) / 12;
        elLabelMortgagePmt.textContent = fmt(periodicPmt);

        // Stress test
        const stressRate = Math.max(5.25, rate + 2.0);
        elStressTestRate.value = stressRate.toFixed(2);
        const qualifyingPmt = calcPeriodicPayment(totalMortgage, stressRate, amort, freq);
        elLabelQualifyingPmt.textContent = fmt(qualifyingPmt);

        // Interest stats
        const totalInterest = (periodicPmt * amort * freq) - totalMortgage;
        elLabelTotalInterest.textContent = fmt(totalInterest);

        // Ongoing Costs (Monthly)
        const propTaxMonth = (num('propertyTaxRate') / 100 * price) / 12;
        const strataMonth = num('strataCondo');
        const heatingMonth = num('heatingUtilities');
        const insuranceMonth = num('homeInsurance') / 12;
        const totalMortgageMonthly = monthlyEquivalentPmt;
        const totalCarryingMonthly = totalMortgageMonthly + propTaxMonth + strataMonth + heatingMonth + insuranceMonth;

        document.getElementById('buy-monthly-avg').textContent = fmt(totalCarryingMonthly);

        // Qualification Ratios
        const grossIncome = num('grossIncome');
        const monthlyGross = grossIncome / 12;
        const otherDebts = num('monthlyDebts');

        // GDS: (PIT + Heat + Strata/2) / Income
        const gdsPIT = monthlyEquivalentPmt + propTaxMonth + heatingMonth + (strataMonth / 2);
        const gdsRatio = (gdsPIT / monthlyGross) * 100;

        // TDS: (PIT + Heat + Strata/2 + Debts) / Income
        const tdsRatio = ((gdsPIT + otherDebts) / monthlyGross) * 100;

        updateQualificationCard(elStatusGDS, gdsRatio, 39);
        updateQualificationCard(elStatusTDS, tdsRatio, 44);

        // Max Affordability (Simple iteration)
        const maxAffordablePrice = estimateMaxPrice(monthlyGross, otherDebts, stressRate, amort, propTaxMonth / price);
        elStatusAfford.querySelector('.rvb-status-card__val').textContent = fmt(maxAffordablePrice);

        // Buy vs Rent Comparisons (25 Year Horizon)
        const horizon = 25;
        const growth = num('growthCondo') / 100;
        const rentRate = num('currentRent');
        const rentIncrease = num('rentIncrease') / 100;
        const investReturn = num('investmentReturn');

        // Buy results after 25 years
        const futureValue = price * Math.pow(1 + growth, horizon);
        const remainingLoan = calcRemainingBalance(totalMortgage, rate, amort, freq, horizon * freq);
        const sellingCosts = futureValue * 0.05;
        const netEquityBuy = futureValue - remainingLoan - sellingCosts;

        const entryCosts = (price * 0.015); // Fixed 1.5% for CAD entry
        const cashFlowBuy = entryCosts + downPayment + (totalCarryingMonthly * horizon * 12);
        const netCostBuy = cashFlowBuy - netEquityBuy;

        // Rent results after 25 years
        let totalRentPaid = 0;
        for (let y = 0; y < horizon; y++) {
            totalRentPaid += (rentRate * Math.pow(1 + rentIncrease, y)) * 12;
        }

        // Opportunity cost: investing the DP + Entry + Monthly Diff
        const avgBuyOutflow = (cashFlowBuy - (entryCosts + downPayment)) / (horizon * 12);
        const avgRentOutflow = totalRentPaid / (horizon * 12);
        const netCostDiff = avgBuyOutflow - avgRentOutflow;
        const rentSavingsEnd = calcFV(downPayment + entryCosts, netCostDiff, investReturn, horizon);
        const netCostRent = totalRentPaid - (rentSavingsEnd - (downPayment + entryCosts));

        // UI Updates
        elBuyNetTotal.textContent = fmt(netCostBuy);
        elRentNetTotal.textContent = fmt(netCostRent);
        document.getElementById('buy-equity-end').textContent = fmt(netEquityBuy);
        document.getElementById('rent-savings-end').textContent = fmt(rentSavingsEnd);
        document.getElementById('label-monthly-diff').textContent = fmt(netCostDiff);

        updateVerdict(netCostBuy, netCostRent, horizon);
        updateChartData(price, downPayment, entryCosts, totalMortgage, rate, amort, freq, totalCarryingMonthly, rentRate, rentIncrease, investReturn);
    }

    function updateQualificationCard(el, ratio, limit) {
        const valEl = el.querySelector('.rvb-status-card__val');
        valEl.textContent = ratio.toFixed(1) + '%';
        if (ratio <= limit) {
            el.className = 'rvb-status-card rvb-status-card--pass';
        } else {
            el.className = 'rvb-status-card rvb-status-card--fail';
        }
    }

    function estimateMaxPrice(monthlyGross, otherDebts, rate, amort, taxRate) {
        // Target: (PIT + Heat + Strata/2 + Debts) = 0.44 * monthlyGross
        const targetPmt = (0.44 * monthlyGross) - otherDebts - 150 - 200; // Minus heat and half strata estimates
        if (targetPmt <= 0) return 0;

        // Reverse payment formula for periodic payment to get principal
        const r = rate / 100;
        const monthlyRate = Math.pow(Math.pow(1 + r / 2, 2), 1 / 12) - 1;
        const totalMonths = amort * 12;
        const principal = targetPmt * (Math.pow(1 + monthlyRate, totalMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, totalMonths));

        // Assuming 20% down for max affordability illustration
        return principal / 0.8;
    }

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

    function updateVerdict(buyCost, rentCost, horizon) {
        const diff = Math.abs(buyCost - rentCost);
        if (buyCost < rentCost) {
            elVerdictCard.className = 'rvb-verdict rvb-verdict--better-buy';
            elVerdictSummary.textContent = `Homeownership builds ${fmt(Math.abs(buyCost))} in net wealth over 25 years.`;
            elNarrativeBox.innerHTML = `Over <strong>25 years</strong>, the equity accumulation and market appreciation of your home far outweigh the interest and carrying costs. Even with conservative growth, you end up with a fully paid asset.`;
        } else {
            elVerdictCard.className = 'rvb-verdict rvb-verdict--better-rent';
            elVerdictSummary.textContent = `Renting saves ${fmt(diff)} compared to buying over 25 years.`;
            elNarrativeBox.innerHTML = `In this scenario, high carrying costs and market stagnation make renting more efficient. By investing your down payment and monthly savings at <strong>${num('investmentReturn')}%</strong>, you build a liquid portfolio that exceeds home equity.`;
        }
    }

    function updateChartData(price, downPayment, entry, mortgage, rate, amort, freq, carrying, rent, rentInc, invest) {
        const labels = [];
        const buyData = [];
        const rentData = [];

        const growthVal = num('growthCondo') / 100;

        for (let y = 1; y <= 25; y++) {
            labels.push(`Year ${y}`);

            // Buy year y
            const monthsY = y * 12;
            const cashBuyY = entry + downPayment + (carrying * monthsY);
            const FV_y = price * Math.pow(1 + growthVal, y);
            const loan_y = calcRemainingBalance(mortgage, rate, amort, freq, y * freq);
            const eq_y = FV_y - loan_y - (FV_y * 0.05);
            buyData.push(cashBuyY - eq_y);

            // Rent year y
            let rentPaidY = 0;
            for (let i = 0; i < y; i++) rentPaidY += (rent * Math.pow(1 + rentInc, i)) * 12;
            const diffY = carrying - (rentPaidY / monthsY);
            const saveY = calcFV(downPayment + entry, diffY, invest, y);
            rentData.push(rentPaidY - (saveY - (downPayment + entry)));
        }

        if (costChart) {
            costChart.data.labels = labels;
            costChart.data.datasets[0].data = buyData;
            costChart.data.datasets[1].data = rentData;
            costChart.update();
        } else {
            const ctx = document.getElementById('costChart').getContext('2d');
            costChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Net Cost: Buy', data: buyData, borderColor: '#6B2737', backgroundColor: 'rgba(107, 39, 55, 0.1)', fill: true, tension: 0.3 },
                        { label: 'Net Cost: Rent', data: rentData, borderColor: '#C9A84C', backgroundColor: 'rgba(201, 168, 76, 0.1)', fill: true, tension: 0.3 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: { y: { ticks: { callback: (val) => fmt(val) } } },
                    plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}` } } }
                }
            });
        }
    }

    // ─── 4. EVENTS ─────────────────────────────────────────────────────────
    inputs.forEach(input => input.addEventListener('input', calculate));
    calculate();
});
