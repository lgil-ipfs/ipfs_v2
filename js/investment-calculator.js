// Investment Comparison Calculator Logic

document.addEventListener('DOMContentLoaded', () => {

    // Tax Brackets approx for 2024 (Federal + Provincial Combined Marginal Rates)
    // Structure: [Up to Income, MTR]
    const taxData = {
        'AB': [[3477, 0.00], [21886, 0.15], [55867, 0.25], [111733, 0.305], [148269, 0.36], [173205, 0.38], [177922, 0.41], [246752, 0.42], [355845, 0.47], [9999999, 0.48]],
        'BC': [[45654, 0.2006], [55867, 0.227], [91310, 0.282], [104835, 0.31], [111733, 0.3279], [127299, 0.3829], [157748, 0.407], [173205, 0.439], [240716, 0.4612], [246752, 0.498], [9999999, 0.535]],
        'MB': [[36142, 0.258], [55867, 0.2775], [79625, 0.3325], [111733, 0.379], [173205, 0.434], [246752, 0.464], [9999999, 0.504]],
        'NB': [[49958, 0.244], [55867, 0.2982], [99916, 0.3532], [111733, 0.3752], [173205, 0.4384], [185064, 0.4684], [246752, 0.493], [9999999, 0.533]],
        'NL': [[41457, 0.237], [55867, 0.275], [82913, 0.33], [111733, 0.343], [148027, 0.398], [173205, 0.413], [207239, 0.443], [246752, 0.458], [264750, 0.473], [9999999, 0.513]],
        'NS': [[29590, 0.2379], [55867, 0.2995], [59180, 0.3545], [74999, 0.377], [93000, 0.3712], [111733, 0.38], [150000, 0.435], [173205, 0.47], [246752, 0.50], [9999999, 0.54]],
        'ON': [[53359, 0.2005], [55867, 0.2415], [86698, 0.2965], [106717, 0.3148], [111733, 0.3389], [150000, 0.4341], [173205, 0.4497], [220000, 0.4829], [246752, 0.5197], [9999999, 0.5353]],
        'PE': [[32656, 0.2465], [55867, 0.2835], [64313, 0.3385], [111733, 0.372], [140000, 0.427], [173205, 0.461], [246752, 0.491], [9999999, 0.528]],
        'QC': [[55867, 0.2653], [103915, 0.3253], [111733, 0.3705], [126000, 0.4112], [173205, 0.4571], [246752, 0.4871], [9999999, 0.5331]],
        'SK': [[52057, 0.255], [55867, 0.275], [111733, 0.33], [148734, 0.385], [173205, 0.405], [246752, 0.435], [9999999, 0.475]]
    };

    function getMTR(prov, inc) {
        let pb = taxData[prov] || taxData['ON'];
        for (let b of pb) {
            if (inc <= b[0]) return b[1];
        }
        return pb[pb.length - 1][1];
    }

    // UI Elements
    const elIncome = document.getElementById('income');
    const elProvince = document.getElementById('province');
    const elInitDep = document.getElementById('initial-dep');
    const elMonthDep = document.getElementById('monthly-dep');
    const elYears = document.getElementById('years');
    const elGrowth = document.getElementById('growth-rate');
    const elYield = document.getElementById('yield-rate');
    const btnCalc = document.getElementById('run-calc');

    // Displays
    const dMTR = document.getElementById('display-mtr');
    const dMTRCalc = document.getElementById('display-mtr-calc');
    const dYears = document.getElementById('display-years');
    const dGrowth = document.getElementById('display-growth');
    const dYield = document.getElementById('yield-display');
    const grid = document.getElementById('accounts-grid');
    const chartBars = document.getElementById('chart-bars');

    elYield.addEventListener('input', (e) => {
        dYield.innerText = e.target.value + '%';
    });

    function formatCur(val) {
        return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(val);
    }

    function calculateProjections() {
        const inc = parseFloat(elIncome.value) || 0;
        const prov = elProvince.value;
        const init = parseFloat(elInitDep.value) || 0;
        const monthly = parseFloat(elMonthDep.value) || 0;
        const years = parseInt(elYears.value, 10) || 1;
        const totalGrowthRate = (parseFloat(elGrowth.value) || 0) / 100;
        const yieldPercent = (parseFloat(elYield.value) || 0) / 100;

        // 1. Get MTR
        const mtr = getMTR(prov, inc);
        dMTR.innerText = (mtr * 100).toFixed(2) + '%';
        dMTRCalc.innerText = (mtr * 100).toFixed(2);
        dYears.innerText = years;
        dGrowth.innerText = (totalGrowthRate * 100).toFixed(1);

        const annualContrib = monthly * 12;
        const totalContrib = init + (annualContrib * years);

        // Growth assumptions
        const yieldRate = totalGrowthRate * yieldPercent;
        const deferredRate = totalGrowthRate * (1 - yieldPercent);

        let results = [];

        // 2. TFSA (Tax-Free)
        // FV = P(1+r)^t + C[ ((1+r)^t - 1) / r ]
        let tfsaVal = calcFV(init, annualContrib, totalGrowthRate, years);
        results.push({
            id: 'tfsa',
            name: 'TFSA',
            refund: 0,
            gross: tfsaVal,
            taxOnSale: 0,
            net: tfsaVal
        });

        // 3. FHSA (Tax-Free Growth + Tax-Deductible Contributions)
        // Assume qualified home purchase -> fully tax free withdrawal
        let fhsaVal = calcFV(init, annualContrib, totalGrowthRate, years);
        let fhsaRefund = totalContrib * mtr; // Note: simplified, assumes entirely deducted at current MTR
        results.push({
            id: 'fhsa',
            name: 'FHSA',
            refund: fhsaRefund,
            gross: fhsaVal,
            taxOnSale: 0,
            net: fhsaVal
        });

        // 4. RRSP (Tax-Deferred Growth + Deductible + Taxed on Withdrawal)
        let rrspVal = calcFV(init, annualContrib, totalGrowthRate, years);
        let rrspRefund = totalContrib * mtr;
        // Taxed at full marginal rate on withdrawal
        let rrspTax = rrspVal * mtr;
        let rrspNet = rrspVal - rrspTax;
        results.push({
            id: 'rrsp',
            name: 'RRSP',
            refund: rrspRefund,
            gross: rrspVal,
            taxOnSale: rrspTax,
            net: rrspNet
        });

        // 5. Non-Registered Space (Tax Drag Annually + Cap Gains at End)
        // Each year, yield is taxed at MTR.
        let nonRegVal = init;
        let totalCostBase = init;

        for (let i = 1; i <= years; i++) {
            nonRegVal += annualContrib;
            totalCostBase += annualContrib;

            let yearYield = nonRegVal * yieldRate;
            let yieldTax = yearYield * mtr;
            let yearDeferred = nonRegVal * deferredRate;

            // Reinvest after-tax yield
            let reinvested = yearYield - yieldTax;
            totalCostBase += reinvested;

            nonRegVal += (reinvested + yearDeferred);
        }

        let capGains = Math.max(0, nonRegVal - totalCostBase);
        let nrTaxOnSale = capGains * 0.5 * mtr;
        let nrNet = nonRegVal - nrTaxOnSale;

        results.push({
            id: 'nonreg',
            name: 'Non-Registered',
            refund: 0,
            gross: nonRegVal,
            taxOnSale: nrTaxOnSale,
            net: nrNet
        });

        renderResults(results, totalContrib);
    }

    function calcFV(pv, pmt, r, n) {
        if (n === 0) return pv;
        if (r === 0) return pv + (pmt * n);
        return pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
    }

    function renderResults(res, totalContrib) {
        grid.innerHTML = '';
        chartBars.innerHTML = '';

        // Find max Gross for chart scaling
        let maxGross = Math.max(...res.map(r => r.gross));

        res.forEach(r => {
            // Build Card
            let refundMarkup = '';
            if (r.id === 'fhsa' || r.id === 'rrsp') {
                refundMarkup = `
                    <div class="ac-row">
                        <span>Initial Tax Refund<br><small>(Total value generated)</small></span>
                        <span class="val positive">+$${formatCur(r.refund).replace('$', '')}</span>
                    </div>
                `;
            }

            let taxDragMarkup = '';
            if (r.id === 'nonreg') {
                taxDragMarkup = `
                    <div class="ac-row">
                        <span>Annual Tax Drag</span>
                        <span class="val negative">Varies yearly</span>
                    </div>
                `;
            }

            let card = document.createElement('div');
            card.className = `account-card acc-${r.id}`;
            card.innerHTML = `
                <div class="account-card-header">
                    <div class="icon"><i class="fa-solid fa-piggy-bank"></i></div>
                    <h3>${r.name}</h3>
                </div>
                <div class="ac-row">
                    <span>Total Submissions</span>
                    <span class="val">${formatCur(totalContrib)}</span>
                </div>
                ${refundMarkup}
                ${taxDragMarkup}
                <div class="ac-row">
                    <span>Gross End Value</span>
                    <span class="val">${formatCur(r.gross)}</span>
                </div>
                <div class="ac-row">
                    <span>Tax Details on Sale</span>
                    <span class="val ${r.taxOnSale > 0 ? 'negative' : ''}">${r.taxOnSale > 0 ? '-' : ''}${formatCur(r.taxOnSale)}</span>
                </div>
                <div class="ac-total">
                    <span>Net After-Tax Balance</span>
                    <strong>${formatCur(r.net)}</strong>
                </div>
            `;
            grid.appendChild(card);

            // Build Chart Bar
            let pNet = (r.net / maxGross) * 100;
            let pTax = (r.taxOnSale / maxGross) * 100;

            let row = document.createElement('div');
            row.className = `bar-row acc-${r.id}`;
            row.innerHTML = `
                <div class="bar-label">${r.name}</div>
                <div class="bar-track">
                    <div class="bar-fill-net" style="width: ${pNet}%"></div>
                    ${pTax > 0 ? `<div class="bar-fill-tax" style="width: ${pTax}%"></div>` : ''}
                </div>
                <div class="bar-val">${formatCur(r.net)}</div>
            `;
            chartBars.appendChild(row);
        });
    }

    btnCalc.addEventListener('click', calculateProjections);

    // Init run
    setTimeout(calculateProjections, 200);
});
