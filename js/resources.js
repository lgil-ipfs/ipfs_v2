// resources.js — Cash Flow Planner + Financial Wellness Assessment

document.addEventListener('DOMContentLoaded', () => {

    /* ─────────────────────────────────────────────────────
       1. CATEGORY FILTER TABS
    ───────────────────────────────────────────────────── */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const resSections = document.querySelectorAll('.resources-section[data-cat]');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.cat;
            resSections.forEach(sec => {
                sec.style.display = (cat === 'all' || sec.dataset.cat === cat) ? '' : 'none';
            });
        });
    });

    /* ─────────────────────────────────────────────────────
       2. FINANCIAL WELLNESS ASSESSMENT
    ───────────────────────────────────────────────────── */
    const wellnessForm = document.getElementById('wellness-form');
    const scoreNumber = document.getElementById('score-number');
    const scoreRing = document.getElementById('score-ring');
    const toolResults = document.getElementById('wellness-results');
    const resultMsg = document.getElementById('result-message');

    const categories = ['emergency', 'debt', 'insurance', 'retirement', 'cashflow'];
    const categoryLabels = {
        emergency: 'Emergency Fund',
        debt: 'Debt Management',
        insurance: 'Insurance Coverage',
        retirement: 'Retirement Planning',
        cashflow: 'Cash Flow Control',
    };

    const resultMessages = [
        { min: 80, msg: "Your financial foundation is strong. You're positioned well — now is the time to optimize for tax efficiency and long-term growth. We'd love to help you take it further.", label: 'Strong Foundation' },
        { min: 60, msg: "You're on solid ground in several areas, but there are meaningful gaps worth addressing. A coordinated review could unlock significant value.", label: 'Good Progress' },
        { min: 40, msg: "You've started building, but some gaps are creating real risk. Let's walk through your situation and identify the highest-priority changes.", label: 'Needs Attention' },
        { min: 0, msg: "It's not too late — in fact, this is exactly the right time to get clarity. Many of our best client relationships started exactly here. Let's talk.", label: 'Early Stage' },
    ];

    if (wellnessForm) {
        wellnessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = new FormData(wellnessForm);
            let totalScore = 0;
            const catScores = {};

            categories.forEach(cat => {
                const val = parseInt(data.get(cat) || '0', 10);
                catScores[cat] = val * 25; // 0–100 per category
                totalScore += val;
            });

            const pct = Math.round((totalScore / (categories.length * 4)) * 100);

            // Update score ring
            scoreNumber.textContent = pct;
            scoreRing.style.background = `conic-gradient(var(--gold) ${pct}%, #eee ${pct}%)`;

            // Fill result bars
            categories.forEach(cat => {
                const bar = document.getElementById(`bar-${cat}`);
                if (bar) {
                    setTimeout(() => { bar.style.width = catScores[cat] + '%'; }, 100);
                }
                const labelEl = document.getElementById(`bar-label-${cat}`);
                if (labelEl) labelEl.textContent = catScores[cat] + '%';
            });

            // Result message
            const match = resultMessages.find(r => pct >= r.min);
            if (resultMsg) resultMsg.textContent = match.msg;

            const resultTitle = document.getElementById('result-title');
            if (resultTitle) resultTitle.textContent = match.label;

            toolResults.classList.add('visible');
            toolResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // Reset
        const resetBtn = document.getElementById('wellness-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                wellnessForm.reset();
                toolResults.classList.remove('visible');
                categories.forEach(cat => {
                    const bar = document.getElementById(`bar-${cat}`);
                    if (bar) bar.style.width = '0%';
                });
                scoreNumber.textContent = '--';
                scoreRing.style.background = 'conic-gradient(var(--gold) 0%, #eee 0%)';
            });
        }
    }

    /* ─────────────────────────────────────────────────────
       3. CASH FLOW PLANNER
    ───────────────────────────────────────────────────── */
    const cfInputs = document.querySelectorAll('.cf-input-row input');

    const getVal = (id) => parseFloat(document.getElementById(id)?.value || 0) || 0;

    function updateCashflow() {
        const income = getVal('cf-income');

        // Needs
        const housing = getVal('cf-housing');
        const utilities = getVal('cf-utilities');
        const groceries = getVal('cf-groceries');
        const transport = getVal('cf-transport');
        const insurance = getVal('cf-insurance');
        const debtMin = getVal('cf-debt');
        const needs = housing + utilities + groceries + transport + insurance + debtMin;

        // Wants
        const dining = getVal('cf-dining');
        const entertainment = getVal('cf-entertainment');
        const subscriptions = getVal('cf-subscriptions');
        const personal = getVal('cf-personal');
        const wants = dining + entertainment + subscriptions + personal;

        // Savings
        const savings = income - needs - wants;

        // Update summary cards
        const el = (id) => document.getElementById(id);
        const fmt = (n) => '$' + Math.max(0, n).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

        if (el('cf-total-needs')) el('cf-total-needs').textContent = fmt(needs);
        if (el('cf-total-wants')) el('cf-total-wants').textContent = fmt(wants);
        if (el('cf-total-savings')) el('cf-total-savings').textContent = fmt(Math.max(0, savings));

        // Update allocation bar
        if (income > 0) {
            const needsPct = Math.min(100, (needs / income) * 100);
            const wantsPct = Math.min(100 - needsPct, (wants / income) * 100);
            const savingsPct = Math.max(0, 100 - needsPct - wantsPct);

            const needsBar = document.getElementById('cf-bar-needs');
            const wantsBar = document.getElementById('cf-bar-wants');
            const savingsBar = document.getElementById('cf-bar-savings');

            if (needsBar) needsBar.style.width = needsPct + '%';
            if (wantsBar) wantsBar.style.width = wantsPct + '%';
            if (savingsBar) savingsBar.style.width = savingsPct + '%';

            if (el('cf-pct-needs')) el('cf-pct-needs').textContent = Math.round(needsPct) + '%';
            if (el('cf-pct-wants')) el('cf-pct-wants').textContent = Math.round(wantsPct) + '%';
            if (el('cf-pct-savings')) el('cf-pct-savings').textContent = Math.round(savingsPct) + '%';
        }
    }

    cfInputs.forEach(input => input.addEventListener('input', updateCashflow));
});
