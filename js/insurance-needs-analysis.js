/* ============================================================
   IBERIAN PACIFIC: Insurance Needs Analysis
   Step-by-step analysis (like the Financial Wellness Assessment)
   that estimates life, disability, and critical illness needs,
   working from mortgage and debt down to income replacement and
   family property / legacy.
   ============================================================ */
(function () {
    'use strict';

    var STEPS = 5;
    var REAL_RETURN = 0.02;          // income replacement funds earn 2% after inflation
    var DI_MAX_SHARE = 2 / 3;        // insurers typically cover about two-thirds of income
    var CAP_GAINS_INCLUSION = 0.5;
    var step = 0;                    // 0 = intro, 1..5 = steps, 6 = results

    function $(id) { return document.getElementById(id); }
    function num(id) { return Math.max(parseFloat($(id).value) || 0, 0); }
    function money(v) {
        return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);
    }
    function roundUp(v, to) { return Math.ceil(v / to) * to; }

    function show(id) {
        document.querySelectorAll('.ina-screen').forEach(function (s) { s.classList.remove('active'); });
        $(id).classList.add('active');
    }

    function go(next) {
        step = next;
        var inSteps = step >= 1 && step <= STEPS;
        $('ina-stepper').hidden = !(inSteps || step === STEPS + 1);
        $('ina-nav').hidden = !inSteps;
        if (step === 0) show('ina-intro');
        else if (inSteps) show('ina-step-' + step);
        else { calculate(); show('ina-results'); }

        document.querySelectorAll('#ina-stepper li').forEach(function (li) {
            var n = parseInt(li.getAttribute('data-step'), 10);
            li.classList.toggle('is-done', n < step);
            li.classList.toggle('is-current', n === step);
        });
        $('ina-next').innerHTML = step === STEPS ? 'See My Results &rarr;' : 'Continue &rarr;';

        var anchor = $('ina-anchor');
        if (anchor && next !== 0) {
            var top = anchor.getBoundingClientRect().top + window.pageYOffset - 140;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    }

    function presentValue(annual, years, rate) {
        if (years <= 0 || annual <= 0) return 0;
        if (rate === 0) return annual * years;
        return annual * (1 - Math.pow(1 + rate, -years)) / rate;
    }

    function calculate() {
        var income = num('f-income');

        // Life insurance, from the biggest obligations down
        var mortgage = num('f-mortgage');
        var debts = num('f-debts');
        var finalExp = num('f-final');
        var education = num('f-education');
        var replaceShare = num('f-replace') / 100;
        var years = num('f-years');
        var annualNeed = income * replaceShare;
        var incomeNeed = presentValue(annualNeed, years, REAL_RETURN);

        var cottageTax = 0, cottageGain = 0;
        if ($('f-cottage').checked) {
            cottageGain = Math.max(0, num('f-cottage-value') - num('f-cottage-cost'));
            cottageTax = cottageGain * CAP_GAINS_INCLUSION * (Math.min(num('f-cottage-rate'), 60) / 100);
        }
        var legacy = $('f-legacy').checked ? num('f-legacy-amt') : 0;
        var savings = num('f-savings');
        var existingLife = num('f-life');

        var totalNeed = mortgage + debts + finalExp + education + incomeNeed + cottageTax + legacy;
        var lifeGap = Math.max(0, totalNeed - savings - existingLife);

        // Disability: monthly benefit, capped near two-thirds of income
        var expenses = num('f-expenses');
        var diTarget = Math.min(expenses, income * DI_MAX_SHARE / 12);
        var diGap = Math.max(0, diTarget - num('f-di'));

        // Critical illness: lump sum covering a recovery period
        var ciTarget = expenses * num('f-recovery');
        var ciGap = Math.max(0, ciTarget - num('f-ci'));

        renderSummary(lifeGap, diGap, ciGap, diTarget, ciTarget);
        renderLifeTable([
            ['Mortgage', mortgage],
            ['Other debts', debts],
            ['Final expenses', finalExp],
            ['Education fund', education],
            ['Income replacement: ' + money(annualNeed) + '/yr for ' + years + ' yrs', incomeNeed],
            cottageTax ? ['Tax on the family cottage', cottageTax] : null,
            legacy ? ['Gift to family or charity', legacy] : null
        ].filter(Boolean), totalNeed, savings, existingLife, lifeGap);
        renderCottage(cottageGain, cottageTax);
    }

    function renderSummary(lifeGap, diGap, ciGap, diTarget, ciTarget) {
        var cards = [
            {
                icon: 'fa-people-roof', title: 'Life insurance', value: money(roundUp(lifeGap, 5000)),
                note: lifeGap > 0 ? 'Additional coverage to protect your family\'s standard of living.' : 'Your current coverage and savings appear to meet this need.'
            },
            {
                icon: 'fa-briefcase-medical', title: 'Disability insurance', value: money(roundUp(diGap, 50)) + '<small>/month</small>',
                note: 'Target benefit of about ' + money(diTarget) + '/month, after the coverage you have.'
            },
            {
                icon: 'fa-heart-pulse', title: 'Critical illness insurance', value: money(roundUp(ciGap, 5000)),
                note: 'Lump sum to cover about ' + money(ciTarget) + ' of expenses during recovery.'
            }
        ];
        $('ina-summary').innerHTML = cards.map(function (c) {
            return '<article class="ina-result">' +
                '<div class="ina-need-icon"><i class="fa-solid ' + c.icon + '" aria-hidden="true"></i></div>' +
                '<h3>' + c.title + '</h3>' +
                '<div class="ina-result-value">' + c.value + '</div>' +
                '<p>' + c.note + '</p>' +
                '</article>';
        }).join('');
    }

    function renderLifeTable(rows, totalNeed, savings, existingLife, lifeGap) {
        var html = rows.map(function (r) {
            return '<div class="ina-row"><span>' + r[0] + '</span><strong>' + money(r[1]) + '</strong></div>';
        }).join('');
        html += '<div class="ina-row ina-row-sub"><span>Total need</span><strong>' + money(totalNeed) + '</strong></div>';
        html += '<div class="ina-row"><span>Less: savings your family could use</span><strong class="neg">-' + money(savings) + '</strong></div>';
        html += '<div class="ina-row"><span>Less: life insurance you already have</span><strong class="neg">-' + money(existingLife) + '</strong></div>';
        html += '<div class="ina-row ina-row-total"><span>Estimated additional life insurance</span><strong>' + money(lifeGap) + '</strong></div>';
        $('ina-life-table').innerHTML = html;
    }

    function renderCottage(gain, tax) {
        var box = $('ina-cottage-result');
        box.hidden = !tax;
        if (!tax) return;
        box.innerHTML = '<h3>Keeping the cottage in the family</h3>' +
            '<p>Your cottage has an estimated capital gain of <strong>' + money(gain) + '</strong>, which could mean a tax bill of about <strong>' +
            money(tax) + '</strong> on the final return. We\'ve included it in your life insurance need so your family can pay the tax without selling the property.</p>';
    }

    document.addEventListener('DOMContentLoaded', function () {
        $('ina-start').addEventListener('click', function () { go(1); });
        $('ina-next').addEventListener('click', function () { go(step + 1); });
        $('ina-back').addEventListener('click', function () { go(step - 1); });
        $('ina-restart').addEventListener('click', function () { go(0); });

        $('f-replace').addEventListener('input', function () { $('f-replace-out').textContent = this.value + '%'; });
        $('f-cottage').addEventListener('change', function () { $('ina-cottage').hidden = !this.checked; });
        $('f-legacy').addEventListener('change', function () { $('ina-legacy').hidden = !this.checked; });

        // Default "years of support" follows the youngest child until the user edits it
        var yearsTouched = false;
        $('f-years').addEventListener('input', function () { yearsTouched = true; });
        $('f-youngest').addEventListener('input', function () {
            if (!yearsTouched) $('f-years').value = Math.max(parseInt(this.value, 10) || 0, 0);
        });
    });
})();
