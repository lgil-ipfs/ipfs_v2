/*  ═══════════════════════════════════════════════════════════════════════
    MORTGAGE FREEDOM PROGRAM — Calculation Engine & Visualization
    Iberian Pacific Financial Services
    ═══════════════════════════════════════════════════════════════════════ */

(function () {
    "use strict";

    // ─── DOM REFS ───
    const $ = (id) => document.getElementById(id);

    // Chart instances (destroy before re-render)
    let charts = {};

    // ─── UTILITY ───
    const parseCurrency = (v) => {
        if (typeof v === "number") return v;
        return parseFloat(String(v).replace(/[^0-9.\-]/g, "")) || 0;
    };
    const parsePercent = (v) => {
        if (typeof v === "number") return v;
        const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
        return (n > 1 ? n / 100 : n) || 0;
    };
    const fmt = (n) =>
        n.toLocaleString("en-CA", {
            style: "currency",
            currency: "CAD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    const fmtK = (n) => {
        if (Math.abs(n) >= 1e6)
            return "$" + (n / 1e6).toFixed(1) + "M";
        if (Math.abs(n) >= 1e3)
            return "$" + (n / 1e3).toFixed(0) + "K";
        return fmt(n);
    };
    const fmtD = (n) =>
        n.toLocaleString("en-CA", {
            style: "currency",
            currency: "CAD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    // ─── FORMAT INPUTS ON BLUR ───
    function setupInputFormatting() {
        const currencyFields = [
            "houseValue", "mortgageOutstanding", "consumerDebts",
            "leveragedAmount", "monthlyIncome", "mortgagePayment", "debtPayment",
        ];
        currencyFields.forEach((id) => {
            const el = $(id);
            if (!el) return;
            el.addEventListener("blur", () => {
                const v = parseCurrency(el.value);
                el.value = v.toLocaleString("en-CA");
            });
            el.addEventListener("input", updateComputedFields);
        });

        const pctFields = [
            "mortgageRate", "badDebtRate", "goodDebtRate",
            "growthRate", "swpRate", "taxRate",
        ];
        pctFields.forEach((id) => {
            const el = $(id);
            if (!el) return;
            el.addEventListener("blur", () => {
                const v = parsePercent(el.value);
                el.value = (v * 100).toFixed(2) + "%";
            });
        });

        $("creditLimit").addEventListener("change", updateComputedFields);
    }

    function updateComputedFields() {
        const hv = parseCurrency($("houseValue").value);
        const cl = parseFloat($("creditLimit").value);
        const mo = parseCurrency($("mortgageOutstanding").value);
        const cd = parseCurrency($("consumerDebts").value);
        const lev = parseCurrency($("leveragedAmount").value);
        const mp = parseCurrency($("mortgagePayment").value);
        const dp = parseCurrency($("debtPayment").value);

        const m1Limit = hv * cl;
        $("m1Limit").value = m1Limit.toLocaleString("en-CA");

        const totalDebt = mp + dp;
        $("totalDebtService").value = totalDebt.toLocaleString("en-CA");

        // Monthly interest on leveraged sub-account (good debt)
        const goodRate = parsePercent($("goodDebtRate").value);
        const badRate = parsePercent($("badDebtRate").value);
        const swpRate = parsePercent($("swpRate").value);

        // Investment initial monthly income: initial_investment * swp / 12
        const initInvestment = lev;
        const monthlyInvIncome = (initInvestment * swpRate) / 12;

        const goodInterest = (lev * goodRate) / 12;
        const totalConsolidated = mo + cd;
        const badInterest = (totalConsolidated * badRate) / 12;

        const monthlyInvestment = totalDebt + monthlyInvIncome - goodInterest - badInterest;
        $("monthlyInvestment").value = monthlyInvestment.toLocaleString("en-CA", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    // ─── GATHER INPUTS ───
    function gatherInputs() {
        return {
            houseValue: parseCurrency($("houseValue").value),
            creditLimitPct: parseFloat($("creditLimit").value),
            mortgageOutstanding: parseCurrency($("mortgageOutstanding").value),
            consumerDebts: parseCurrency($("consumerDebts").value),
            leveragedAmount: parseCurrency($("leveragedAmount").value),
            monthlyIncome: parseCurrency($("monthlyIncome").value),
            mortgagePayment: parseCurrency($("mortgagePayment").value),
            debtPayment: parseCurrency($("debtPayment").value),
            mortgageRate: parsePercent($("mortgageRate").value),
            badDebtRate: parsePercent($("badDebtRate").value),
            goodDebtRate: parsePercent($("goodDebtRate").value),
            growthRate: parsePercent($("growthRate").value),
            swpRate: parsePercent($("swpRate").value),
            taxRate: parsePercent($("taxRate").value),
            navPerUnit: 25,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  CORE CALCULATION ENGINE
    // ═══════════════════════════════════════════════════════════════════════
    function runCalculations(inp) {
        const YEARS = 25;
        const MONTHS = YEARS * 12;

        // Derived
        const m1Limit = inp.houseValue * inp.creditLimitPct;
        const totalConsolidated = inp.mortgageOutstanding + inp.consumerDebts;
        const initialM1Balance = totalConsolidated + inp.leveragedAmount;
        const totalDebtPayment = inp.mortgagePayment + inp.debtPayment;

        // Investment fund initial setup
        const initialInvestment = inp.leveragedAmount;
        const monthlyNavGrowth = inp.growthRate / 12;
        const monthlySWP = inp.swpRate / 12;
        let initialUnits = initialInvestment / inp.navPerUnit;
        const monthlyGoodInterest = (inp.leveragedAmount * inp.goodDebtRate) / 12;
        const monthlyBadInterest = (totalConsolidated * inp.badDebtRate) / 12;
        const monthlyInvestmentContrib =
            totalDebtPayment + (initialInvestment * inp.swpRate) / 12 - monthlyGoodInterest - monthlyBadInterest;

        // ── Arrays (monthly granularity) ──
        let badDebt = new Array(MONTHS);       // Non-deductible mortgage/consumer debt
        let goodDebt = new Array(MONTHS);      // Leveraged investment loan
        let investValue = new Array(MONTHS);   // Investment fund market value
        let investUnits = new Array(MONTHS);   // Units held
        let navValues = new Array(MONTHS);     // NAV per unit
        let investIncome = new Array(MONTHS);  // Monthly income from fund
        let goodInterestPaid = new Array(MONTHS);

        // ── Investment Fund NAV Schedule ──
        // NAV grows monthly by growthRate / 12 (compound)
        for (let m = 0; m < MONTHS; m++) {
            navValues[m] = inp.navPerUnit * Math.pow(1 + monthlyNavGrowth, m + 1);
        }

        // ── Month-by-month simulation ──
        let prevBadDebt = totalConsolidated;
        let prevGoodDebt = inp.leveragedAmount;
        let prevUnits = initialUnits;
        let prevNav = inp.navPerUnit;

        // Leveraged balance accumulation (like Sheet1 rows 56-67)
        let leveragedAccum = inp.leveragedAmount + monthlyInvestmentContrib;

        for (let m = 0; m < MONTHS; m++) {
            const currentNav = navValues[m];

            // Investment income = SWP rate × prev accumulated value / 12
            // Using unit-based: prevUnits * prevNav * monthlySWP
            const monthInvIncome = prevUnits * prevNav * monthlySWP;
            investIncome[m] = monthInvIncome;

            // ── Bad Debt (M1 mortgage portion) ──
            // Interest on bad debt
            const badInt = prevBadDebt > 0 ? prevBadDebt * (inp.badDebtRate / 12) : 0;

            // Good debt interest adjustment (added to bad debt interest like Sheet1)
            const goodInt = prevGoodDebt > 0 ? prevGoodDebt * (inp.goodDebtRate / 12) : 0;
            goodInterestPaid[m] = goodInt;

            // Principal paid on bad debt = total payment - bad interest - good interest + investment income
            // From Sheet1: Principal = Payment - Interest + InvestmentIncome
            // Where Interest includes both bad debt interest and good debt interest adjustments
            if (prevBadDebt > 0) {
                const totalInterest = badInt + goodInt;
                const principalPaid = totalDebtPayment - totalInterest + monthInvIncome;
                const newBadDebt = prevBadDebt - principalPaid;
                badDebt[m] = Math.max(0, newBadDebt);
            } else {
                badDebt[m] = 0;
            }

            // ── Good Debt (Leveraged loan) ──
            if (badDebt[m] > 0) {
                // While bad debt exists, leveraged balance grows by monthly investment
                leveragedAccum += monthlyInvestmentContrib;
                goodDebt[m] = leveragedAccum;
            } else {
                // Once bad debt is gone, start paying down good debt
                const gdInt = prevGoodDebt * (inp.goodDebtRate / 12);
                const paydown = totalDebtPayment + monthInvIncome - gdInt;
                const newGoodDebt = prevGoodDebt - paydown;
                goodDebt[m] = Math.max(0, newGoodDebt);
            }

            // ── Investment Fund ──
            // Units purchased = monthly contribution / current NAV
            const unitsPurchased = monthlyInvestmentContrib / currentNav;
            // Units redeemed for income
            const unitsRedeemed = monthInvIncome / currentNav;
            const currentUnits = prevUnits + unitsPurchased - unitsRedeemed;
            investUnits[m] = currentUnits;
            investValue[m] = currentUnits * currentNav;

            // Set prev for next iteration
            prevBadDebt = badDebt[m];
            prevGoodDebt = goodDebt[m];
            prevUnits = currentUnits;
            prevNav = currentNav;
        }

        // ── Annual summaries ──
        let annualBadDebt = [];
        let annualGoodDebt = [];
        let annualInvestValue = [];
        let annualInvestIncome = [];
        let annualGoodInterest = [];
        let annualTaxRefund = [];
        let annualAvgGoodDebt = [];
        let annualDeductibleInterest = [];
        let annualBreakeven = [];

        for (let y = 0; y < YEARS; y++) {
            const endMonth = y * 12 + 11;
            annualBadDebt.push(badDebt[endMonth]);
            annualGoodDebt.push(goodDebt[endMonth]);
            annualInvestValue.push(investValue[endMonth]);

            // Annual investment income (sum of 12 months)
            let yearIncome = 0;
            let yearGoodInt = 0;
            let avgGD = 0;
            for (let m = y * 12; m <= endMonth; m++) {
                yearIncome += investIncome[m];
                yearGoodInt += goodInterestPaid[m];
                avgGD += goodDebt[m];
            }
            annualInvestIncome.push(yearIncome);
            annualGoodInterest.push(yearGoodInt);

            avgGD /= 12;
            annualAvgGoodDebt.push(avgGD);
            const deductible = avgGD * inp.goodDebtRate;
            annualDeductibleInterest.push(deductible);
            annualTaxRefund.push(deductible * inp.taxRate);

            // Breakeven = bad debt + good debt - investment value
            annualBreakeven.push(
                badDebt[endMonth] + goodDebt[endMonth] - investValue[endMonth]
            );
        }

        // ── Current mortgage (no MFP) for comparison ──
        let currentMortgage = [];
        let cmBalance = totalConsolidated;
        const cmRate = inp.mortgageRate / 12;
        const cmPayment = inp.mortgagePayment;
        for (let y = 0; y < YEARS; y++) {
            for (let m = 0; m < 12; m++) {
                if (cmBalance <= 0) { cmBalance = 0; break; }
                const interest = cmBalance * cmRate;
                const principal = cmPayment - interest;
                cmBalance = Math.max(0, cmBalance - principal);
            }
            currentMortgage.push(cmBalance);
        }

        // Find year bad debt hits zero
        let badDebtFreeYear = YEARS;
        for (let y = 0; y < YEARS; y++) {
            if (annualBadDebt[y] <= 0) { badDebtFreeYear = y + 1; break; }
        }

        // Find year current mortgage hits zero
        let currentMortgageFreeYear = YEARS;
        for (let y = 0; y < YEARS; y++) {
            if (currentMortgage[y] <= 0) { currentMortgageFreeYear = y + 1; break; }
        }

        // ── Monthly flow data for diagram ──
        let flowData = [];
        for (let y = 0; y < YEARS; y++) {
            const em = y * 12 + 11; // end of year
            const sm = y * 12;      // start of year
            const bd = badDebt[em];
            const gd = goodDebt[em];
            const iv = investValue[em];
            const gi = annualGoodInterest[y] / 12; // avg monthly good interest
            const bi = bd > 0 ? bd * (inp.badDebtRate / 12) : 0;
            const invInc = investIncome[em];
            const totalInt = gi + bi;
            const refund = annualTaxRefund[y];
            // Monthly principal going to bad debt
            const principalToBad = bd > 0 ? totalDebtPayment - totalInt + invInc : 0;
            // Amounts going to good debt paydown
            const principalToGood = bd <= 0 ? totalDebtPayment + invInc - (gd * inp.goodDebtRate / 12) : 0;

            flowData.push({
                year: y + 1,
                badDebt: bd,
                goodDebt: gd,
                investValue: iv,
                totalDebtPayment: totalDebtPayment,
                investIncome: invInc,
                goodInterest: gi,
                badInterest: bi,
                totalInterest: totalInt,
                taxRefund: refund,
                monthlyInvestContrib: monthlyInvestmentContrib,
                principalToBadDebt: principalToBad,
                principalToGoodDebt: principalToGood,
                creditRoom: m1Limit - bd - gd,
                houseValue: inp.houseValue,
                m1Limit: m1Limit,
            });
        }

        return {
            annualBadDebt,
            annualGoodDebt,
            annualInvestValue,
            annualInvestIncome,
            annualGoodInterest,
            annualDeductibleInterest,
            annualTaxRefund,
            annualBreakeven,
            currentMortgage,
            badDebtFreeYear,
            currentMortgageFreeYear,
            flowData,
            totalTaxRefunds: annualTaxRefund.reduce((a, b) => a + b, 0),
            m1Limit,
            totalDebtPayment,
            monthlyInvestmentContrib,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  RENDER KPIs
    // ═══════════════════════════════════════════════════════════════════════
    function renderKPIs(data) {
        const yearsSaved = data.currentMortgageFreeYear - data.badDebtFreeYear;
        $("kpiBadDebtYears").textContent = `Year ${data.badDebtFreeYear}`;
        $("kpiBadDebtSub").textContent =
            yearsSaved > 0
                ? `${yearsSaved} year${yearsSaved > 1 ? "s" : ""} ahead of traditional`
                : "debt free";
        $("kpiPortfolio").textContent = fmtK(data.annualInvestValue[24]);
        $("kpiTaxRefunds").textContent = fmtK(data.totalTaxRefunds);
        $("kpiCashflow").textContent = fmtK(data.annualInvestIncome[24]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  CHART RENDERING
    // ═══════════════════════════════════════════════════════════════════════

    const CHART_COLORS = {
        bad: "#c0392b",
        badFill: "rgba(192,57,43,0.7)",
        good: "#2a9d4e",
        goodFill: "rgba(42,157,78,0.7)",
        invest: "#2563eb",
        investFill: "rgba(37,99,235,0.65)",
        currentMtg: "rgba(150,150,150,0.4)",
        gold: "#D4AF37",
        goldFill: "rgba(212,175,55,0.6)",
        maroon: "#630F0F",
        maroonFill: "rgba(99,15,15,0.6)",
        purple: "#6c3483",
        purpleFill: "rgba(108,52,131,0.6)",
        teal: "#1abc9c",
        tealFill: "rgba(26,188,156,0.5)",
    };

    const yearLabels = Array.from({ length: 25 }, (_, i) => i + 1);

    const commonScaleOpts = {
        grid: { color: "rgba(0,0,0,0.04)", drawBorder: false },
        ticks: {
            font: { family: "'Jost', sans-serif", size: 11 },
            color: "#8a8a8a",
        },
        border: { display: false },
    };

    const commonTooltip = {
        backgroundColor: "#2C2C2C",
        titleFont: { family: "'Jost', sans-serif", size: 12, weight: "600" },
        bodyFont: { family: "'Jost', sans-serif", size: 11 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
        },
    };

    function destroyChart(key) {
        if (charts[key]) {
            charts[key].destroy();
            charts[key] = null;
        }
    }

    // 1. ACCOUNT BALANCES (Stacked area-like bar chart)
    function renderBalancesChart(data) {
        destroyChart("balances");
        const ctx = $("chartBalances").getContext("2d");
        charts.balances = new Chart(ctx, {
            type: "bar",
            data: {
                labels: yearLabels,
                datasets: [
                    {
                        label: "Non-Deductible Debt",
                        data: data.annualBadDebt,
                        backgroundColor: CHART_COLORS.badFill,
                        borderColor: CHART_COLORS.bad,
                        borderWidth: 1,
                        stack: "debt",
                        order: 2,
                    },
                    {
                        label: "Investment Loan (Good Debt)",
                        data: data.annualGoodDebt,
                        backgroundColor: CHART_COLORS.goodFill,
                        borderColor: CHART_COLORS.good,
                        borderWidth: 1,
                        stack: "debt",
                        order: 1,
                    },
                    {
                        label: "Investment Account",
                        data: data.annualInvestValue,
                        backgroundColor: CHART_COLORS.investFill,
                        borderColor: CHART_COLORS.invest,
                        borderWidth: 1.5,
                        stack: "invest",
                        order: 3,
                    },
                    {
                        label: "Traditional Mortgage",
                        data: data.currentMortgage,
                        type: "line",
                        borderColor: "rgba(120,120,120,0.6)",
                        borderWidth: 2,
                        borderDash: [6, 4],
                        pointRadius: 0,
                        fill: false,
                        order: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: { display: false },
                    tooltip: commonTooltip,
                },
                scales: {
                    x: {
                        ...commonScaleOpts,
                        title: { display: true, text: "Year", font: { size: 11, family: "'Jost'" }, color: "#aaa" },
                    },
                    y: {
                        ...commonScaleOpts,
                        beginAtZero: true,
                        ticks: {
                            ...commonScaleOpts.ticks,
                            callback: (v) => fmtK(v),
                        },
                    },
                },
            },
        });

        // Custom legend
        const legend = $("legendBalances");
        legend.innerHTML = `
      <span><span class="dot" style="background:${CHART_COLORS.badFill}"></span>Non-Deductible Debt</span>
      <span><span class="dot" style="background:${CHART_COLORS.goodFill}"></span>Investment Loan</span>
      <span><span class="dot" style="background:${CHART_COLORS.investFill}"></span>Investment Account</span>
      <span><span class="dot" style="background:rgba(120,120,120,0.6);width:20px;height:2px;border-radius:0"></span>Traditional Mortgage</span>
    `;
    }

    // 2. ANNUAL CASH FLOW
    function renderCashflowChart(data) {
        destroyChart("cashflow");
        const ctx = $("chartCashflow").getContext("2d");
        charts.cashflow = new Chart(ctx, {
            type: "bar",
            data: {
                labels: yearLabels,
                datasets: [
                    {
                        label: "Annual Investment Income",
                        data: data.annualInvestIncome,
                        backgroundColor: (ctx) => {
                            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 350);
                            gradient.addColorStop(0, "rgba(26,188,156,0.8)");
                            gradient.addColorStop(1, "rgba(26,188,156,0.3)");
                            return gradient;
                        },
                        borderColor: CHART_COLORS.teal,
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: commonTooltip,
                },
                scales: {
                    x: { ...commonScaleOpts },
                    y: {
                        ...commonScaleOpts,
                        beginAtZero: true,
                        ticks: { ...commonScaleOpts.ticks, callback: (v) => fmtK(v) },
                    },
                },
            },
        });
    }

    // 3. TAX REFUNDS
    function renderTaxRefundsChart(data) {
        destroyChart("taxRefunds");
        const ctx = $("chartTaxRefunds").getContext("2d");
        charts.taxRefunds = new Chart(ctx, {
            type: "bar",
            data: {
                labels: yearLabels,
                datasets: [
                    {
                        label: "Estimated Tax Refund",
                        data: data.annualTaxRefund,
                        backgroundColor: (ctx) => {
                            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 350);
                            gradient.addColorStop(0, "rgba(108,52,131,0.75)");
                            gradient.addColorStop(1, "rgba(108,52,131,0.25)");
                            return gradient;
                        },
                        borderColor: CHART_COLORS.purple,
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: commonTooltip,
                },
                scales: {
                    x: { ...commonScaleOpts },
                    y: {
                        ...commonScaleOpts,
                        beginAtZero: true,
                        ticks: { ...commonScaleOpts.ticks, callback: (v) => fmtK(v) },
                    },
                },
            },
        });
        $("totalRefundLabel").textContent =
            `Total Estimated Tax Refunds: ${fmtD(data.totalTaxRefunds)}`;
    }

    // 4. DEDUCTIBLE INTEREST
    function renderDeductibleChart(data) {
        destroyChart("deductible");
        const ctx = $("chartDeductible").getContext("2d");
        charts.deductible = new Chart(ctx, {
            type: "bar",
            data: {
                labels: yearLabels,
                datasets: [
                    {
                        label: "Deductible Interest",
                        data: data.annualDeductibleInterest,
                        backgroundColor: CHART_COLORS.goldFill,
                        borderColor: CHART_COLORS.gold,
                        borderWidth: 1,
                        borderRadius: 4,
                        yAxisID: "y",
                    },
                    {
                        label: "Tax Savings",
                        data: data.annualTaxRefund,
                        type: "line",
                        borderColor: CHART_COLORS.maroon,
                        backgroundColor: "rgba(99,15,15,0.1)",
                        borderWidth: 2.5,
                        pointRadius: 3,
                        pointBackgroundColor: CHART_COLORS.maroon,
                        fill: true,
                        tension: 0.3,
                        yAxisID: "y",
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            font: { family: "'Jost'", size: 11 },
                            usePointStyle: true,
                            pointStyle: "rectRounded",
                        },
                    },
                    tooltip: commonTooltip,
                },
                scales: {
                    x: { ...commonScaleOpts },
                    y: {
                        ...commonScaleOpts,
                        beginAtZero: true,
                        ticks: { ...commonScaleOpts.ticks, callback: (v) => fmtK(v) },
                    },
                },
            },
        });
    }

    // 5. BREAKEVEN / NET DEBT
    function renderBreakevenChart(data) {
        destroyChart("breakeven");
        const ctx = $("chartBreakeven").getContext("2d");
        charts.breakeven = new Chart(ctx, {
            type: "line",
            data: {
                labels: yearLabels,
                datasets: [
                    {
                        label: "MFP Net Debt Position",
                        data: data.annualBreakeven,
                        borderColor: CHART_COLORS.maroon,
                        backgroundColor: (ctx) => {
                            const chart = ctx.chart;
                            const gradient = chart.ctx.createLinearGradient(0, 0, 0, chart.height);
                            gradient.addColorStop(0, "rgba(192,57,43,0.15)");
                            gradient.addColorStop(0.5, "rgba(255,255,255,0)");
                            gradient.addColorStop(1, "rgba(42,157,78,0.15)");
                            return gradient;
                        },
                        borderWidth: 3,
                        fill: true,
                        tension: 0.3,
                        pointRadius: 4,
                        pointBackgroundColor: (ctx) =>
                            ctx.parsed.y > 0 ? CHART_COLORS.bad : CHART_COLORS.good,
                        pointBorderColor: "#fff",
                        pointBorderWidth: 2,
                    },
                    {
                        label: "Traditional Mortgage",
                        data: data.currentMortgage,
                        borderColor: "rgba(150,150,150,0.5)",
                        borderWidth: 2,
                        borderDash: [6, 4],
                        pointRadius: 0,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: "index", intersect: false },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            font: { family: "'Jost'", size: 11 },
                            usePointStyle: true,
                        },
                    },
                    tooltip: commonTooltip,
                    annotation: undefined, // ensure no errors
                },
                scales: {
                    x: {
                        ...commonScaleOpts,
                        title: { display: true, text: "Year", font: { size: 11, family: "'Jost'" }, color: "#aaa" },
                    },
                    y: {
                        ...commonScaleOpts,
                        ticks: { ...commonScaleOpts.ticks, callback: (v) => fmtK(v) },
                    },
                },
            },
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  FLOW DIAGRAM
    // ═══════════════════════════════════════════════════════════════════════

    function initFlowSlider(data) {
        const slider = $("flowYearSlider");
        if (slider && !slider.hasAttribute('data-bound')) {
            slider.addEventListener("input", (e) => {
                const y = parseInt(e.target.value);
                $("sliderYearLabel").textContent = y === 0 ? "Start of Year 1: The Initial Set-up" : `End of Year ${y}`;
                renderFlowDiagram(data.flowData[Math.max(0, y - 1)], data, y);
            });
            slider.setAttribute('data-bound', 'true');
        }
        if (slider) {
            slider.value = 0;
            $("sliderYearLabel").textContent = "Start of Year 1: The Initial Set-up";
        }
        renderFlowDiagram(data.flowData[0], data, 0);
    }

    function renderFlowDiagram(fd, data, yearValue) {
        const diag = $("flowDiagram");

        let isStart = yearValue === 0;

        // Base Initial Setup values
        let m1Start = data.flowData[0].houseValue - data.flowData[0].creditRoom - data.flowData[0].goodDebt;
        if (isStart) m1Start = data.m1Limit - (data.flowData[0].goodDebt - data.monthlyInvestmentContrib) - (data.m1Limit - data.flowData[0].badDebt - data.flowData[0].goodDebt);
        // Rough approx for initial bad debt:
        let initialBadDebt = data.flowData[0].badDebt + fd.principalToBadDebt;
        let initialGoodDebt = data.flowData[0].goodDebt - data.monthlyInvestmentContrib;

        let bd_disp = isStart ? initialBadDebt : fd.badDebt;
        let gd_disp = isStart ? initialGoodDebt : fd.goodDebt;
        let iv_disp = isStart ? initialGoodDebt : fd.investValue;
        let rr_disp = Math.max(0, fd.m1Limit - bd_disp - gd_disp);
        let refund_disp = isStart ? 0 : fd.taxRefund;

        const totalInt = fd.goodInterest + fd.badInterest;
        const monthlyInv = fd.monthlyInvestContrib;
        const swpInc = fd.investIncome / 12;

        let totalPmt = data.totalDebtPayment + swpInc;

        diag.innerHTML = `
          <div class="exact-flow">
            <!-- LEFT COL: REAL ESTATE -->
            <div class="ef-col ef-real-estate">
                <h4>Real Estate</h4>
                <div class="ef-dashed-box" style="height: 120px;">
                    <div class="ef-dash-line">${fmt(fd.houseValue)}</div>
                    <div class="ef-dash-line" style="margin-top:20px;">${fmt(fd.m1Limit)}</div>
                    <div class="ef-dash-line" style="margin-top:20px;">${fmt(rr_disp)}</div>
                    <div class="ef-label-side">75%</div>
                </div>
                ${bd_disp > 0 ? `
                <div class="ef-good-debt">
                    Good Debt:<br>${fmt(gd_disp)}
                </div>
                <div class="ef-bad-debt">
                    Bad Debt:<br>${fmt(bd_disp)}
                </div>` : `
                <div class="ef-good-debt" style="padding: 60px 0; border-radius: 0 0 10px 10px;">
                    Good Debt:<br>${fmt(gd_disp)}
                </div>`}
                <div class="ef-bank-account-label">Bank Account</div>
            </div>

            <!-- RIGHT COL: INVESTMENT -->
            <div class="ef-col ef-investment">
                <h4>Investment</h4>
                <div class="ef-dashed-box" style="height: 220px;"></div>
                <div class="ef-investment-growth">
                    Investment<br>${fmt(iv_disp)}
                </div>
            </div>

            <!-- CENTER & FLOATING ELEMENTS -->
            ${!isStart ? `
            <div class="ef-tax-refund">
                <div style="font-size:0.8rem;">Estimated Tax Refund</div>
                ${fmt(refund_disp)}
            </div>` : ''}

            <!-- Interest Box -->
            <div class="ef-interest-box">
                <div style="background:#6bcc68; width:100%; height:25px; position:absolute; top:-25px; left:0; line-height:25px; font-weight:bold; color:#fff;">
                    ${fmt(fd.goodInterest * 12)}
                </div>
                ${fmt(fd.badInterest * 12)}
            </div>
            <div class="ef-total-interest">
                Total Interest:<br>${fmt(totalInt * 12)}
            </div>

            <!-- Income Flow Box -->
            <div class="ef-blue-box">
                ${fmt(totalPmt)}
            </div>
            <div style="position:absolute; bottom:143px; left:50%; transform:translateX(-50%); font-weight:bold; color:#000;">
                ${fmt(data.totalDebtPayment)}
            </div>

            <!-- Bucket Base -->
            <div class="ef-income-bucket">
                <div class="ef-bucket-shape">
                    <span>Income</span>
                </div>
            </div>

            <!-- Dynamic Labels Floating on Canvas -->
            <div class="ef-arrow-label ef-label-red" style="left: 270px; bottom: 155px; transform: rotate(-25deg);">
               ${fmt(bd_disp > 0 ? (fd.principalToBadDebt * 12) : (fd.principalToGoodDebt * 12))} to Principal
            </div>

            <div class="ef-arrow-label ef-label-yellow" style="left: 450px; bottom: 225px; transform: rotate(-65deg); font-size: 0.95rem;">
               ${fmt(totalInt * 12)}
            </div>

            <div class="ef-arrow-label ef-label-yellow" style="left: 480px; top: 180px;">
               ${fmt(monthlyInv * 12)} to Investment Account
            </div>

            <div style="position:absolute; right: 260px; bottom: 180px; font-weight:bold; color:#000; font-size: 0.9rem;">
               ${fmt(swpInc)}
            </div>

            <!-- SVG Background Arrows -->
            <svg class="ef-arrow-svg" viewBox="0 0 900 600" preserveAspectRatio="none">
               <defs>
                   <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                       <path d="M 0 0 L 10 5 L 0 10 z" fill="#6bcc68" />
                   </marker>
                   <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                       <path d="M 0 0 L 10 5 L 0 10 z" fill="#ff5e5e" />
                   </marker>
                   <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                       <path d="M 0 0 L 10 5 L 0 10 z" fill="#757575" />
                   </marker>
               </defs>

               <line x1="450" y1="500" x2="450" y2="445" stroke="#757575" stroke-width="5" marker-end="url(#arrow-gray)" />

               <line x1="400" y1="420" x2="250" y2="480" stroke="#ff5e5e" stroke-width="5" marker-end="url(#arrow-red)" />

               <line x1="480" y1="420" x2="520" y2="280" stroke="#757575" stroke-width="5" marker-end="url(#arrow-gray)" />
               <line x1="480" y1="420" x2="520" y2="280" stroke="#757575" stroke-width="5" marker-start="url(#arrow-gray)" />

               <line x1="250" y1="360" x2="420" y2="280" stroke="#6bcc68" stroke-width="5" marker-end="url(#arrow-green)" />
               
               <line x1="580" y1="190" x2="680" y2="400" stroke="#6bcc68" stroke-width="5" marker-end="url(#arrow-green)" />

               <line x1="680" y1="480" x2="510" y2="425" stroke="#6bcc68" stroke-width="5" marker-end="url(#arrow-green)" />
            </svg>

          </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════════════
    //  MAIN
    // ═══════════════════════════════════════════════════════════════════════

    function runAndRender() {
        const inp = gatherInputs();
        const data = runCalculations(inp);

        // Show results
        $("results").classList.add("visible");

        // Render
        renderKPIs(data);
        renderBalancesChart(data);
        renderCashflowChart(data);
        renderTaxRefundsChart(data);
        renderDeductibleChart(data);
        renderBreakevenChart(data);
        initFlowSlider(data);

        // Scroll to results
        $("results").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Init
    document.addEventListener("DOMContentLoaded", () => {
        setupInputFormatting();
        updateComputedFields();
        $("btnCalculate").addEventListener("click", runAndRender);

        // Auto-calculate on load for demo
        setTimeout(runAndRender, 300);
    });
})();
