const Summary = {
    render(results, inputs) {
        const container = document.getElementById('summary-table');
        if (!container) return;

        const diagnosisAge = inputs.currentAge + inputs.diagnosisYearOffset;
        const endRecoveryAge = Math.floor(diagnosisAge + (inputs.incomeDisruptionMonths / 12) + (inputs.recoveryPeriodMonths / 12));
        
        const formatMoney = (val) => {
            return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(Math.round(val));
        };

        const getValuesAtAge = (age) => {
            const index = results.ages.indexOf(age);
            if (index === -1) return { noEvent: 0, insured: 0, insuredRop: 0, uninsured: 0 };
            return {
                noEvent: results.noEvent[index],
                insured: results.insured[index],
                insuredRop: results.insuredRop[index],
                uninsured: results.uninsured[index]
            };
        };

        const atDiag = getValuesAtAge(diagnosisAge);
        const atRec = getValuesAtAge(endRecoveryAge);
        const at65 = getValuesAtAge(65);
        const at85 = getValuesAtAge(85);

        const html = `
            <table class="summary-table">
                <thead>
                    <tr>
                        <th>Milestone</th>
                        <th>No CI (Baseline)</th>
                        <th>CI Insured (With Illness)</th>
                        <th>CI Insured (ROP, No Illness)</th>
                        <th>Uninsured (With Illness)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Net Worth at Diagnosis</td>
                        <td>${formatMoney(atDiag.noEvent)}</td>
                        <td><span class="val-favourable">${formatMoney(atDiag.insured)}</span></td>
                        <td>${formatMoney(atDiag.insuredRop)}</td>
                        <td><span class="val-unfavourable">${formatMoney(atDiag.uninsured)}</span></td>
                    </tr>
                    <tr>
                        <td>Net Worth after Recovery</td>
                        <td>${formatMoney(atRec.noEvent)}</td>
                        <td><span class="val-favourable">${formatMoney(atRec.insured)}</span></td>
                        <td>${formatMoney(atRec.insuredRop)}</td>
                        <td><span class="val-unfavourable">${formatMoney(atRec.uninsured)}</span></td>
                    </tr>
                    <tr>
                        <td>Net Worth at Age 65</td>
                        <td>${formatMoney(at65.noEvent)}</td>
                        <td><span class="val-favourable">${formatMoney(at65.insured)}</span></td>
                        <td>${formatMoney(at65.insuredRop)}</td>
                        <td><span class="val-unfavourable">${formatMoney(at65.uninsured)}</span></td>
                    </tr>
                    <tr>
                        <td>Net Worth at Age 85</td>
                        <td>${formatMoney(at85.noEvent)}</td>
                        <td><span class="val-favourable">${formatMoney(at85.insured)}</span></td>
                        <td>${formatMoney(at85.insuredRop)}</td>
                        <td><span class="val-unfavourable">${formatMoney(at85.uninsured)}</span></td>
                    </tr>
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }
};

window.Summary = Summary;
