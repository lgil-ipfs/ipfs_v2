/* ============================================================
   IBERIAN PACIFIC: Account Comparison Tool
   Compares the before-tax and after-tax value of the same monthly
   savings in a TFSA, RRSP, FHSA, and non-registered account.
   Default return: 8% a year, net of fees (user-adjustable).
   ============================================================ */
(function () {
    'use strict';

    // Approximate combined federal + provincial marginal tax rates.
    // Each entry is [income up to, marginal rate].
    var TAX = {
        AB: [[21886, 0.15], [55867, 0.25], [111733, 0.305], [148269, 0.36], [173205, 0.38], [177922, 0.41], [246752, 0.42], [355845, 0.47], [Infinity, 0.48]],
        BC: [[45654, 0.2006], [55867, 0.227], [91310, 0.282], [104835, 0.31], [111733, 0.3279], [127299, 0.3829], [157748, 0.407], [173205, 0.439], [240716, 0.4612], [246752, 0.498], [Infinity, 0.535]],
        MB: [[36142, 0.258], [55867, 0.2775], [79625, 0.3325], [111733, 0.379], [173205, 0.434], [246752, 0.464], [Infinity, 0.504]],
        NB: [[49958, 0.244], [55867, 0.2982], [99916, 0.3532], [111733, 0.3752], [173205, 0.4384], [185064, 0.4684], [246752, 0.493], [Infinity, 0.533]],
        NL: [[41457, 0.237], [55867, 0.275], [82913, 0.33], [111733, 0.343], [148027, 0.398], [173205, 0.413], [207239, 0.443], [246752, 0.458], [264750, 0.473], [Infinity, 0.513]],
        NS: [[29590, 0.2379], [55867, 0.2995], [59180, 0.3545], [93000, 0.3712], [111733, 0.38], [150000, 0.435], [173205, 0.47], [246752, 0.50], [Infinity, 0.54]],
        ON: [[53359, 0.2005], [55867, 0.2415], [86698, 0.2965], [106717, 0.3148], [111733, 0.3389], [150000, 0.4341], [173205, 0.4497], [220000, 0.4829], [246752, 0.5197], [Infinity, 0.5353]],
        PE: [[32656, 0.2465], [55867, 0.2835], [64313, 0.3385], [111733, 0.372], [140000, 0.427], [173205, 0.461], [246752, 0.491], [Infinity, 0.528]],
        QC: [[55867, 0.2653], [103915, 0.3253], [111733, 0.3705], [126000, 0.4112], [173205, 0.4571], [246752, 0.4871], [Infinity, 0.5331]],
        SK: [[52057, 0.255], [55867, 0.275], [111733, 0.33], [148734, 0.385], [173205, 0.405], [246752, 0.435], [Infinity, 0.475]]
    };

    var FHSA_ANNUAL = 8000;
    var FHSA_LIFETIME = 40000;
    var FHSA_MAX_YEARS = 15;
    var CAP_GAINS_INCLUSION = 0.5;

    function $(id) { return document.getElementById(id); }
    function num(id) { return parseFloat($(id).value) || 0; }
    function money(v) {
        return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);
    }
    function pct(v) { return (v * 100).toFixed(1).replace(/\.0$/, '') + '%'; }

    function marginalRate(prov, income) {
        var brackets = TAX[prov] || TAX.ON;
        for (var i = 0; i < brackets.length; i++) {
            if (income <= brackets[i][0]) return brackets[i][1];
        }
        return brackets[brackets.length - 1][1];
    }

    var withdrawTouched = false;

    function calculate() {
        var income = num('ac-income');
        var mtr = marginalRate($('ac-province').value, income);
        if (!withdrawTouched) $('ac-withdraw-rate').value = (mtr * 100).toFixed(1);
        var wr = Math.min(Math.max(num('ac-withdraw-rate'), 0), 60) / 100;
        var initial = num('ac-initial');
        var monthly = num('ac-monthly');
        var years = Math.min(Math.max(Math.round(num('ac-years')), 1), 50);
        var r = num('ac-return') / 100;
        var yieldShare = num('ac-yield') / 100;
        var isUS = $('ac-us').checked;

        $('ac-mtr').textContent = pct(mtr);
        $('ac-wr').textContent = pct(wr);
        $('ac-yield-out').textContent = Math.round(yieldShare * 100) + '%';
        $('ac-years-out').textContent = years;
        $('ac-return-out').textContent = (r * 100).toFixed(2).replace(/\.?0+$/, '');

        var m = Math.pow(1 + r, 1 / 12) - 1;
        var months = years * 12;
        var totalContrib = initial + monthly * months;
        $('ac-total-contrib').textContent = money(totalContrib);

        var rrspDeductionCap = income * 0.18; // simplified annual RRSP room

        // Running balances
        var tfsa = initial;
        var rrsp = initial, rrspPot = 0, rrspRefunds = 0;
        var fhsa = 0, fhsaPot = 0, fhsaRefunds = 0, fhsaContrib = 0, fhsaYearContrib = 0;
        var nr = initial, nrCost = initial, nrAnnualTax = 0;

        // FHSA: initial deposit counts toward year one's limit
        var firstFhsa = Math.min(initial, FHSA_ANNUAL, FHSA_LIFETIME);
        fhsa = firstFhsa; fhsaContrib = firstFhsa; fhsaYearContrib = firstFhsa;
        var rrspYearContrib = initial;

        for (var k = 1; k <= months; k++) {
            var year = Math.ceil(k / 12);

            // Growth
            tfsa *= 1 + m;
            rrsp *= 1 + m; rrspPot *= 1 + m;
            fhsa *= 1 + m; fhsaPot *= 1 + m;

            var nrGrowth = nr * m;
            var nrYield = nrGrowth * yieldShare;
            var nrYieldTax = nrYield * mtr;
            nrAnnualTax += nrYieldTax;
            nr += nrGrowth - nrYieldTax;
            nrCost += nrYield - nrYieldTax; // reinvested income raises the cost base

            // Monthly contributions
            tfsa += monthly;
            rrsp += monthly; rrspYearContrib += monthly;
            nr += monthly; nrCost += monthly;
            if (year <= FHSA_MAX_YEARS) {
                var room = Math.min(FHSA_ANNUAL - fhsaYearContrib, FHSA_LIFETIME - fhsaContrib);
                var add = Math.max(0, Math.min(monthly, room));
                fhsa += add; fhsaContrib += add; fhsaYearContrib += add;
            }

            // Year end: deduction refunds are reinvested tax-free
            if (k % 12 === 0) {
                var rrspRefund = Math.min(rrspYearContrib, rrspDeductionCap) * mtr;
                rrspPot += rrspRefund; rrspRefunds += rrspRefund;
                var fhsaRefund = fhsaYearContrib * mtr;
                fhsaPot += fhsaRefund; fhsaRefunds += fhsaRefund;
                rrspYearContrib = 0; fhsaYearContrib = 0;
            }
        }

        var nrGain = Math.max(0, nr - nrCost);
        var nrSaleTax = nrGain * CAP_GAINS_INCLUSION * wr;
        var nrAfter = nr - nrSaleTax;

        var results = [
            {
                id: 'tfsa', name: 'TFSA', contrib: totalContrib, refunds: 0,
                before: tfsa, tax: 0, after: tfsa,
                note: 'Tax-free growth and withdrawals.'
            },
            {
                id: 'rrsp', name: 'RRSP', contrib: totalContrib, refunds: rrspRefunds,
                before: rrsp + rrspPot, tax: rrsp * wr, after: rrsp * (1 - wr) + rrspPot,
                note: 'Deductible today; withdrawals taxed at ' + pct(wr) + '.'
            },
            {
                id: 'fhsa', name: 'FHSA', contrib: fhsaContrib, refunds: fhsaRefunds,
                before: fhsa + fhsaPot, tax: 0, after: fhsa + fhsaPot,
                note: fhsaContrib < totalContrib
                    ? 'Only ' + money(fhsaContrib) + ' fits within FHSA limits ($8,000/yr, $40,000 total, 15 years).'
                    : 'Deductible and tax-free for a qualifying first home.'
            },
            {
                id: 'nonreg', name: 'Non-registered', contrib: totalContrib, refunds: 0,
                before: nr, tax: nrSaleTax, after: nrAfter, annualTax: nrAnnualTax,
                note: 'Income taxed yearly; half of gains taxed when sold.'
            }
        ];

        if (isUS) {
            // The IRS does not recognize TFSA/FHSA tax-free status: model them like a taxable account.
            ['tfsa', 'fhsa'].forEach(function (id) {
                var res = results.filter(function (x) { return x.id === id; })[0];
                var scale = res.contrib / totalContrib;
                res.name += '*';
                res.tax = nrSaleTax * scale;
                res.after = res.before - res.tax - nrAnnualTax * scale;
                res.note = 'U.S. persons: may be taxable in the U.S. Speak with a cross-border tax professional.';
            });
        }
        $('ac-us-warning').hidden = !isUS;
        if (isUS) {
            $('ac-us-warning').innerHTML = '<strong>U.S. persons:</strong> the IRS does not recognize the tax-free status of the TFSA or FHSA, so they are shown here as taxable. Please speak with a cross-border tax professional.';
        }

        render(results);
    }

    function render(results) {
        var maxBefore = Math.max.apply(null, results.map(function (r) { return r.before; })) || 1;
        var best = results.reduce(function (a, b) { return b.after > a.after ? b : a; });

        $('ac-chart').innerHTML = results.map(function (r) {
            return '<div class="ac-bar-row">' +
                '<div class="ac-bar-label">' + r.name + '</div>' +
                '<div class="ac-bar-track">' +
                '<div class="ac-bar before" style="width:' + (r.before / maxBefore * 100).toFixed(1) + '%"></div>' +
                '<div class="ac-bar after" style="width:' + (Math.max(r.after, 0) / maxBefore * 100).toFixed(1) + '%"></div>' +
                '</div>' +
                '<div class="ac-bar-val"><span>' + money(r.before) + '</span><strong>' + money(r.after) + '</strong></div>' +
                '</div>';
        }).join('');

        $('ac-grid').innerHTML = results.map(function (r) {
            var rows = '<div class="ac-row"><span>Your contributions</span><span>' + money(r.contrib) + '</span></div>';
            if (r.refunds) rows += '<div class="ac-row"><span>Tax refunds (reinvested)</span><span class="pos">+' + money(r.refunds) + '</span></div>';
            if (r.annualTax) rows += '<div class="ac-row"><span>Tax paid along the way</span><span class="neg">' + money(r.annualTax) + '</span></div>';
            rows += '<div class="ac-row"><span>Before-tax value</span><span>' + money(r.before) + '</span></div>';
            rows += '<div class="ac-row"><span>Tax when withdrawn</span><span class="' + (r.tax > 0 ? 'neg' : '') + '">' + (r.tax > 0 ? '-' : '') + money(r.tax) + '</span></div>';
            return '<article class="ac-account' + (r === best ? ' is-best' : '') + '">' +
                (r === best ? '<span class="ac-best">Highest after-tax value</span>' : '') +
                '<h3>' + r.name + '</h3>' +
                '<p class="ac-account-note">' + r.note + '</p>' +
                rows +
                '<div class="ac-total"><span>After-tax value</span><strong>' + money(r.after) + '</strong></div>' +
                '</article>';
        }).join('');
    }

    document.addEventListener('DOMContentLoaded', function () {
        $('ac-withdraw-rate').addEventListener('input', function () { withdrawTouched = true; });
        ['ac-income', 'ac-province', 'ac-withdraw-rate', 'ac-initial', 'ac-monthly', 'ac-years', 'ac-return', 'ac-yield', 'ac-us']
            .forEach(function (id) {
                $(id).addEventListener('input', calculate);
                $(id).addEventListener('change', calculate);
            });
        calculate();
    });
})();
