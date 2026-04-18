const Calculator = {
    run(inputs) {
        const {
            annualIncome,
            annualExpenses,
            currentSavings,
            currentAge,
            nominalReturn,
            inflationRate,
            ciBenefit,
            diagnosisYearOffset,
            incomeDisruptionMonths,
            incomeReplacementPct,
            recoveryPeriodMonths,
            illnessExpensesPerYear,
            oneTimeIllnessCost,
            ciAnnualPremium,
            ropAge
        } = inputs;

        const realReturn = (1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1;
        const maxAge = 85;
        const diagnosisAge = currentAge + diagnosisYearOffset;
        const disruptionYears = incomeDisruptionMonths / 12;
        const recoveryYears = recoveryPeriodMonths / 12;
        
        let baseline = currentSavings;
        let uninsured = currentSavings;
        let insured = currentSavings;
        let insuredRop = currentSavings;

        const results = {
            ages: [],
            noEvent: [],
            uninsured: [],
            insured: [],
            insuredRop: []
        };

        for (let age = currentAge; age <= maxAge; age++) {
            results.ages.push(age);
            
            // Record start of year balances
            results.noEvent.push(baseline);
            results.uninsured.push(uninsured);
            results.insured.push(insured);
            results.insuredRop.push(insuredRop);

            // Baseline scenario (No Event)
            baseline = Math.max(0, baseline * (1 + realReturn) + (annualIncome - annualExpenses));

            // Uninsured scenario
            let un_income = annualIncome;
            let un_expenses = annualExpenses;
            
            if (age === diagnosisAge) {
                uninsured -= oneTimeIllnessCost;
            }
            
            if (age >= diagnosisAge && age < diagnosisAge + disruptionYears) {
                un_income = annualIncome * (incomeReplacementPct / 100);
            }
            
            if (age >= diagnosisAge && age < diagnosisAge + recoveryYears) {
                un_expenses += illnessExpensesPerYear;
            }
            
            uninsured = Math.max(0, uninsured * (1 + realReturn) + (un_income - un_expenses));

            // Insured scenario (with Diagnosis)
            let in_income = annualIncome;
            let in_expenses = annualExpenses;
            
            // Premium cost up to diagnosis
            if (age <= diagnosisAge) {
                in_expenses += ciAnnualPremium;
            }
            
            if (age === diagnosisAge) {
                insured -= oneTimeIllnessCost;
                insured += ciBenefit;
            }
            
            if (age >= diagnosisAge && age < diagnosisAge + disruptionYears) {
                in_income = annualIncome * (incomeReplacementPct / 100);
            }
            
            if (age >= diagnosisAge && age < diagnosisAge + recoveryYears) {
                in_expenses += illnessExpensesPerYear;
            }
            
            insured = Math.max(0, insured * (1 + realReturn) + (in_income - in_expenses));

            // Insured ROP scenario (No Diagnosis)
            let rop_expenses = annualExpenses;
            
            if (age < ropAge) {
                rop_expenses += ciAnnualPremium;
            } else if (age === ropAge) {
                // Return of premium at ropAge
                const totalPremiumsPaid = ciAnnualPremium * (ropAge - currentAge);
                insuredRop += totalPremiumsPaid;
            }
            
            insuredRop = Math.max(0, insuredRop * (1 + realReturn) + (annualIncome - rop_expenses));
        }

        return results;
    }
};

window.Calculator = Calculator;
