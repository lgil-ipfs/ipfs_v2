const InputState = {
    defaults: null,
    
    async loadDefaults() {
        try {
            const response = await fetch('data/defaults.json');
            this.defaults = await response.json();
            this.populateInputs();
        } catch (e) {
            console.error('Failed to load defaults', e);
        }
    },
    
    populateInputs() {
        if (!this.defaults) return;
        
        for (const [key, value] of Object.entries(this.defaults)) {
            const el = document.getElementById(key);
            if (el) {
                el.value = value;
            }
        }
    },
    
    get() {
        return {
            annualIncome: parseFloat(document.getElementById('annualIncome').value) || 0,
            annualExpenses: parseFloat(document.getElementById('annualExpenses').value) || 0,
            currentSavings: parseFloat(document.getElementById('currentSavings').value) || 0,
            currentAge: parseInt(document.getElementById('currentAge').value) || 0,
            nominalReturn: parseFloat(document.getElementById('nominalReturn').value) || 0,
            inflationRate: parseFloat(document.getElementById('inflationRate').value) || 0,
            ciBenefit: parseFloat(document.getElementById('ciBenefit').value) || 0,
            diagnosisYearOffset: parseInt(document.getElementById('diagnosisYearOffset').value) || 0,
            incomeDisruptionMonths: parseInt(document.getElementById('incomeDisruptionMonths').value) || 0,
            incomeReplacementPct: parseFloat(document.getElementById('incomeReplacementPct').value) || 0,
            recoveryPeriodMonths: parseInt(document.getElementById('recoveryPeriodMonths').value) || 0,
            illnessExpensesPerYear: parseFloat(document.getElementById('illnessExpensesPerYear').value) || 0,
            oneTimeIllnessCost: parseFloat(document.getElementById('oneTimeIllnessCost').value) || 0
        };
    }
};

window.InputState = InputState;
