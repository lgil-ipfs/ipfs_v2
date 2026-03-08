/**
 * RENT VS BUY ILLUSTRATOR — WOWA Redesign Calculation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─── 1. SELECTORS ──────────────────────────────────────────────────────────
    const inputs = document.querySelectorAll('.rvb-field__input, select');
    const radioInputs = document.querySelectorAll('input[name="dpMode"]');

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

    // ─── 2. HELPERS ────────────────────────────────────────────────────────────
    const fmt = (val) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
    const num = (id) => parseFloat(document.getElementById(id).value) || 0;

    // Canadian mortgage payment (semi-annual compounding)
    function calcMonthlyPayment(principal, annualRate, years) {
        if (principal <= 0) return 0;
        const r = annualRate / 100;
        // Canadian rule: Rate is semi-annual
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
        const entryCostsRate = 1.5; // Fixed for simplicity as per "Canadian basics"
        const closingEntryCosts = (entryCostsRate / 100) * condoPrice;
        const buyUpfrontNeeded = downPayment + closingEntryCosts;

        // CMHC Insurance (Simplified Canadian logic)
        let cmhcInsurance = 0;
        const dpPercent = (downPayment / condoPrice) * 100;
        if (dpPercent < 20) {
            // Rough CMHC tiers: 4% for 5% dp, 3.1% for 10% dp, 2.8% for 15% dp
            if (dpPercent >= 15) cmhcInsurance = (condoPrice - downPayment) * 0.028;
            else if (dpPercent >= 10) cmhcInsurance = (condoPrice - downPayment) * 0.031;
            else cmhcInsurance = (condoPrice - downPayment) * 0.04;
        }

        const mortgagePrincipal = Math.max(0, condoPrice - downPayment + cmhcInsurance);
        const mortgageRate = num('mortgageRate');
        const amortYears = 25; // Default Canadian
        const monthlyMortgage = calcMonthlyPayment(mortgagePrincipal, mortgageRate, amortYears);

        // Ongoing Costs
        const propTaxMonth = (num('propertyTaxRate') / 100 * condoPrice) / 12;
        const strataMonth = num('strataCondo');
        const maintenanceMonth = 150; // Simplified average
        const insuranceMonth = num('homeInsurance') / 12;
        const buyTotalMonthly = monthlyMortgage + propTaxMonth + strataMonth + insuranceMonth;

        // Buying End Results
        const growthRate = num('growthCondo') / 100;
        const futureValue = condoPrice * Math.pow(1 + growthRate, horizonYears);
        const remainingLoan = calcRemainingBalance(mortgagePrincipal, mortgageRate, amortYears, months);
        const sellingCosts = futureValue * 0.05; // 5% real estate commissions/legal
        const netEquityAtEnd = futureValue - remainingLoan - sellingCosts;

        const totalCashPaidBuy = buyUpfrontNeeded + (buyTotalMonthly * months);
        const netCostBuy = totalCashPaidBuy - netEquityAtEnd;

        // RENT SCENARIO
        const startRent = num('currentRent');
        const rentIncrease = num('rentIncrease') / 100;
        const investReturn = num('investmentReturn');

        let totalRentPaid = 0;
        for (let y = 0; y < horizonYears; y++) {
            totalRentPaid += (startRent * Math.pow(1 + rentIncrease, y)) * 12;
        }
        const avgRentMonthly = totalRentPaid / months;

        // Opportunity Cost (Rent Savings)
        // Renter keeps the buy upfront (DP + Closing)
        // Monthly difference: Renters invest the difference between Buy Monthly and Rent Monthly
        const monthlySaving = buyTotalMonthly - avgRentMonthly;
        const rentSavingsAtEnd = calcFV(buyUpfrontNeeded, monthlySaving, investReturn, horizonYears);
        const netCostRent = totalRentPaid - (rentSavingsAtEnd - buyUpfrontNeeded);

        // ─── 4. UI UPDATES ─────────────────────────────────────────────────────
        elBuyNetTotal.textContent = fmt(netCostBuy);
        elRentNetTotal.textContent = fmt(netCostRent);
        elBuyMonthlyAvg.textContent = fmt(buyTotalMonthly);
        elRentMonthlyAvg.textContent = fmt(avgRentMonthly);

        // Table updates
        elBuyCashOut.textContent = fmt(totalCashPaidBuy);
        elRentCashOut.textContent = fmt(totalRentPaid);
        elBuyEntryCosts.textContent = fmt(closingEntryCosts);
        elRentEntryCosts.textContent = "$0";
        elBuyEquityEnd.textContent = fmt(netEquityAtEnd);
        elRentSavingsEnd.textContent = fmt(rentSavingsAtEnd);
        elBuyNetCostRow.textContent = fmt(netCostBuy);
        elRentNetCostRow.textContent = fmt(netCostRent);

        // Verdict logic
        const diff = Math.abs(netCostBuy - netCostRent);
        if (netCostBuy < netCostRent) {
            elVerdictCard.classList.remove('rvb-verdict--better-rent');
            elVerdictCard.classList.add('rvb-verdict--better-buy');
            elVerdictSummary.textContent = `Buying is better by ${fmt(diff)} over ${horizonYears} years.`;
            elNarrativeBox.innerHTML = `By staying for <strong>${horizonYears} years</strong>, you build <strong>${fmt(netEquityAtEnd)}</strong> in home equity. This capital accumulation significantly outweighs the costs of mortgage interest and property taxes compared to paying rent.`;
        } else {
            elVerdictCard.classList.remove('rvb-verdict--better-buy');
            elVerdictCard.classList.add('rvb-verdict--better-rent');
            elVerdictSummary.textContent = `Renting is better by ${fmt(diff)} over ${horizonYears} years.`;
            elNarrativeBox.innerHTML = `In a <strong>${horizonYears}-year</strong> horizon, the high costs of entering and exiting the market (closing costs and commissions) make renting more efficient. By investing your capital at <strong>${num('investmentReturn')}%</strong>, you end up with <strong>${fmt(rentSavingsAtEnd)}</strong> in total savings.`;
        }

        // FIND CROSSOVER
        let crossoverYear = -1;
        for (let y = 1; y <= 30; y++) {
            const monthsY = y * 12;
            const FV_y = condoPrice * Math.pow(1 + growthRate, y);
            const loan_y = calcRemainingBalance(mortgagePrincipal, mortgageRate, amortYears, monthsY);
            const sell_y = FV_y * 0.05;
            const eq_y = FV_y - loan_y - sell_y;
            const cash_buy_y = buyUpfrontNeeded + (buyTotalMonthly * monthsY);
            const cost_buy_y = cash_buy_y - eq_y;

            let rent_y = 0;
            for (let i = 0; i < y; i++) rent_y += (startRent * Math.pow(1 + rentIncrease, i)) * 12;
            const avg_r_y = rent_y / monthsY;
            const save_y = calcFV(buyUpfrontNeeded, buyTotalMonthly - avg_r_y, investReturn, y);
            const cost_rent_y = rent_y - (save_y - buyUpfrontNeeded);

            if (cost_buy_y < cost_rent_y) {
                crossoverYear = y;
                break;
            }
        }

        if (crossoverYear !== -1) {
            elVerdictSummary.textContent += ` (Break-even at year ${crossoverYear})`;
        }
    }

    // ─── 5. EVENTS ─────────────────────────────────────────────────────────────
    inputs.forEach(input => {
        input.addEventListener('input', calculate);
    });

    // Initial run
    calculate();
});
