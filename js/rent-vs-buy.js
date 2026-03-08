/**
 * RENT VS BUY ILLUSTRATOR — Canadian Calculation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─── 1. SELECTORS ──────────────────────────────────────────────────────────
    const inputs = document.querySelectorAll('.rvb-field__input, input[type="checkbox"]');
    const radioInputs = document.querySelectorAll('input[name="dpMode"]');

    // Core inputs
    const elHorizon = document.getElementById('horizonYears');
    const elCondoPrice = document.getElementById('purchasePrice');
    const elTownhousePrice = document.getElementById('townhousePrice');
    const elDPValue = document.getElementById('downPaymentValue');
    const elCurrentRent = document.getElementById('currentRent');

    const elRate = document.getElementById('mortgageRate');
    const elAmort = document.getElementById('amortization');
    const elFreq = document.getElementById('frequency');

    const elPropTaxRate = document.getElementById('propertyTaxRate');
    const elStrataCondo = document.getElementById('strataCondo');
    const elMaintenanceRate = document.getElementById('maintenanceRate');
    const elHomeInsurance = document.getElementById('homeInsurance');
    const elClosingRate = document.getElementById('closingCostsRate');
    const elSellingRate = document.getElementById('sellingCostsRate');

    const elRentIncrease = document.getElementById('rentIncrease');
    const elRenterInsurance = document.getElementById('renterInsurance');
    const elRentUtilities = document.getElementById('rentUtilities');

    const elGrowthCondo = document.getElementById('growthCondo');
    const elGrowthTownhouse = document.getElementById('growthTownhouse');
    const elInvestReturn = document.getElementById('investmentReturn');
    const elPrincipalRes = document.getElementById('principalRes');

    // Display elements
    const elLabelsHorizon = document.querySelectorAll('.label-horizon');
    const elLabelHorizonTitle = document.getElementById('label-horizon-title');
    const elLabelHorizonSub = document.getElementById('label-horizon-sub');

    const elBuyNetTotal = document.getElementById('buy-net-total');
    const elRentNetTotal = document.getElementById('rent-net-total');

    const elBuyUpfront = document.getElementById('buyUpfront');
    const elBuyMonthly = document.getElementById('buyMonthly');
    const elBuyEquity = document.getElementById('buyEquity');

    const elRentUpfront = document.getElementById('rentUpfront');
    const elRentMonthly = document.getElementById('rentMonthly');
    const elRentSavings = document.getElementById('rentSavings');

    const elNarrative = document.getElementById('rvb-narrative');
    const elFutureTownhouse = document.getElementById('future-townhouse-price');
    const elBuyPercentageCovered = document.getElementById('buy-percentage-covered');

    const tabButtons = document.querySelectorAll('.rvb-scenarios__tab');
    const summaryCards = document.querySelectorAll('.rvb-summary-card');

    // ─── 2. STATE ──────────────────────────────────────────────────────────────
    let activeScenario = 'buy'; // 'buy' or 'rent'

    // ─── 3. HELPERS ────────────────────────────────────────────────────────────
    const fmt = (val) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
    const num = (id) => parseFloat(document.getElementById(id).value) || 0;

    // Canadian mortgage payment (semi-annual compounding)
    function calcMonthlyPayment(principal, annualRate, years, frequency) {
        const r = annualRate / 100;
        // Canadian rule: Rate is semi-annual
        const monthlyRate = Math.pow(1 + r / 2, 2 / 12) - 1;
        const totalPayments = years * 12; // Standardizing to monthly for comparison

        if (monthlyRate === 0) return principal / totalPayments;

        const pmt = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);

        // Adjust for frequency if needed (not strictly used for comparison but good to have)
        if (frequency == 26) return (pmt * 12) / 26;
        if (frequency == 52) return (pmt * 12) / 52;
        return pmt;
    }

    // Mortgage balance after X months
    function calcRemainingBalance(principal, annualRate, years, monthsElapsed) {
        const r = annualRate / 100;
        const monthlyRate = Math.pow(1 + r / 2, 2 / 12) - 1;
        const totalPayments = years * 12;
        const pmt = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);

        if (monthlyRate === 0) return principal - (pmt * monthsElapsed);

        const balance = principal * Math.pow(1 + monthlyRate, monthsElapsed) - (pmt * (Math.pow(1 + monthlyRate, monthsElapsed) - 1) / monthlyRate);
        return Math.max(0, balance);
    }

    // Future Value of investment
    function calcFV(principal, monthlyContrib, annualReturn, years) {
        const r = annualReturn / 100 / 12;
        const months = years * 12;

        // FV of lumpsum
        const fvLump = principal * Math.pow(1 + r, months);

        // FV of monthly contributions
        let fvContrib = 0;
        if (r > 0) {
            fvContrib = monthlyContrib * (Math.pow(1 + r, months) - 1) / r;
        } else {
            fvContrib = monthlyContrib * months;
        }

        return fvLump + fvContrib;
    }

    // ─── 4. MAIN CALCULATION ──────────────────────────────────────────────────
    function calculate() {
        const horizonYears = num('horizonYears');
        const months = horizonYears * 12;

        // Update Labels
        elLabelsHorizon.forEach(l => l.textContent = horizonYears);
        if (elLabelHorizonTitle) elLabelHorizonTitle.textContent = horizonYears;
        if (elLabelHorizonSub) elLabelHorizonSub.textContent = horizonYears;

        // Basics
        const condoPrice = num('purchasePrice');
        const dpMode = document.querySelector('input[name="dpMode"]:checked').value;
        const dpVal = num('downPaymentValue');
        const downPayment = dpMode === 'percent' ? (dpVal / 100) * condoPrice : dpVal;

        const mortgagePrincipal = Math.max(0, condoPrice - downPayment);
        const rate = num('mortgageRate');
        const amort = num('amortization');

        // Costs
        const propTaxMonth = (num('propertyTaxRate') / 100 * condoPrice) / 12;
        const strataMonth = num('strataCondo');
        const maintenanceMonth = (num('maintenanceRate') / 100 * condoPrice) / 12;
        const insuranceMonth = num('homeInsurance') / 12;

        // BUY SCENARIO
        const buyClosingCosts = (num('closingCostsRate') / 100) * condoPrice;
        const buyUpfrontNeeded = downPayment + buyClosingCosts;

        const mortgagePayment = calcMonthlyPayment(mortgagePrincipal, rate, amort, 12);
        const buyTotalMonthly = mortgagePayment + propTaxMonth + strataMonth + maintenanceMonth + insuranceMonth;

        const totalCashPaidBuy = buyUpfrontNeeded + (buyTotalMonthly * months);

        // End of period Buying
        const futureCondoPrice = condoPrice * Math.pow(1 + (num('growthCondo') / 100), horizonYears);
        const remainingMortgage = calcRemainingBalance(mortgagePrincipal, rate, amort, months);
        const sellingCosts = (num('sellingCostsRate') / 100) * futureCondoPrice;

        // Net Equity
        const netEquityAtEnd = futureCondoPrice - remainingMortgage - sellingCosts;
        const netCostBuy = totalCashPaidBuy - netEquityAtEnd;

        // RENT SCENARIO
        const baseRent = num('currentRent');
        const utilitiesRent = num('rentUtilities');
        const rentInsMonth = num('renterInsurance') / 12;
        const rentInc = num('rentIncrease') / 100;

        let totalRentPaid = 0;
        let avgRentMonthly = 0;
        for (let y = 0; y < horizonYears; y++) {
            const yearlyRent = baseRent * Math.pow(1 + rentInc, y);
            totalRentPaid += (yearlyRent + utilitiesRent + rentInsMonth) * 12;
        }
        avgRentMonthly = totalRentPaid / months;

        // Renter's Opportunity (Invest the money they didn't spend upfront)
        const rentInvestReturn = num('investmentReturn');

        // Cash difference (Monthly)
        // If renting is cheaper monthly, we invest the difference.
        // If buying is cheaper monthly, the renter has to reach into "other" savings (negative contribution).
        const monthlyDifference = buyTotalMonthly - avgRentMonthly;

        // Savings at end for Renter
        // They keep the buy upfront (DP + Closing) and invest it.
        const rentSavingsAtEnd = calcFV(buyUpfrontNeeded, monthlyDifference, rentInvestReturn, horizonYears);
        const netCostRent = totalRentPaid - (rentSavingsAtEnd - buyUpfrontNeeded); // "Profit" from investment reduces cost

        // ─── 5. UI UPDATES ─────────────────────────────────────────────────────
        elBuyNetTotal.textContent = fmt(netCostBuy);
        elRentNetTotal.textContent = fmt(netCostRent);

        elBuyUpfront.textContent = fmt(buyUpfrontNeeded);
        elBuyMonthly.textContent = fmt(buyTotalMonthly);
        elBuyEquity.textContent = fmt(netEquityAtEnd);

        elRentUpfront.textContent = fmt(buyUpfrontNeeded); // They have this cash available
        elRentMonthly.textContent = fmt(avgRentMonthly);
        elRentSavings.textContent = fmt(rentSavingsAtEnd);

        // Future Context
        const futureTownhousePrice = num('townhousePrice') * Math.pow(1 + (num('growthTownhouse') / 100), horizonYears);
        elFutureTownhouse.textContent = fmt(futureTownhousePrice);

        const coverage = (netEquityAtEnd / futureTownhousePrice) * 100;
        elBuyPercentageCovered.textContent = coverage.toFixed(1) + '%';

        // Highlighting Logic
        const diff = Math.abs(netCostBuy - netCostRent);
        const winner = netCostBuy < netCostRent ? 'buy' : 'rent';

        summaryCards.forEach(c => c.classList.remove('rvb-summary-card--highlight'));
        if (winner === 'buy') {
            document.getElementById('summary-card-buy').classList.add('rvb-summary-card--highlight');
        } else {
            document.getElementById('summary-card-rent').classList.add('rvb-summary-card--highlight');
        }

        // Narrative
        let narrativeText = `Over ${horizonYears} years, `;
        if (winner === 'buy') {
            narrativeText += `buying the condo is estimated to be <strong>${fmt(diff)} more cost-effective</strong> than renting. `;
            narrativeText += `While monthly cash flow is higher when buying, you build significant equity that offsets the costs of ownership and selling.`;
        } else {
            narrativeText += `renting is estimated to be <strong>${fmt(diff)} more cost-effective</strong> than buying. `;
            narrativeText += `By avoiding the friction of buying/selling costs and strata fees over a short period, and keeping your capital invested at ${rentInvestReturn}%, you end up ahead.`;
        }
        elNarrative.innerHTML = narrativeText;
    }

    // ─── 6. INTERACTIVITY ─────────────────────────────────────────────────────

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('rvb-scenarios__tab--active'));
            btn.classList.add('rvb-scenarios__tab--active');
            activeScenario = btn.dataset.scenario;

            // Highlight the corresponding card manually when tabbed
            summaryCards.forEach(c => c.classList.remove('rvb-summary-card--highlight'));
            if (activeScenario === 'buy') {
                document.getElementById('summary-card-buy').classList.add('rvb-summary-card--highlight');
            } else {
                document.getElementById('summary-card-rent').classList.add('rvb-summary-card--highlight');
            }
        });
    });

    // Auto-recalc on all inputs
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calculate();
            // After recalc, ensure the manually selected tab/highlight is preserved if we want, 
            // OR let the auto-winner take over. The prompt says "allow the user to highlight one",
            // but also "non-technical client should understand key result in seconds".
            // Let's stick to auto-winner for now but allow manual toggle to stay if clicked.
        });
    });

    radioInputs.forEach(radio => {
        radio.addEventListener('change', () => {
            const val = elDPValue.value;
            // Maybe handle conversion here if we want to be fancy, but simple recalc is fine
            calculate();
        });
    });

    // Initial run
    calculate();
});
