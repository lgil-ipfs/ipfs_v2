const CLIENT_PASSWORD = "1234LUCASGIL";
const DATA_URL = "https://script.google.com/macros/s/AKfycbwKGLLvT5yytNzAcvjM1omJtLUxVFd_p0CzMgAWoO2rYAyOtIpzcR4GCuzAqiVDXBItlA/exec?client=LUCAS-GIL";

document.addEventListener('DOMContentLoaded', () => {
    const gate = document.getElementById('password-gate');
    const app = document.getElementById('app-content');
    const input = document.getElementById('password-input');
    const submitBtn = document.getElementById('submit-btn');
    const errorMsg = document.getElementById('password-error');

    // Check if already authenticated
    if (sessionStorage.getItem('auth_lucas_gil') === 'true') {
        unlockApp();
    }

    function handleLogin() {
        if (input.value === CLIENT_PASSWORD) {
            sessionStorage.setItem('auth_lucas_gil', 'true');
            unlockApp();
        } else {
            input.parentElement.classList.add('shake');
            errorMsg.style.opacity = '1';
            setTimeout(() => {
                input.parentElement.classList.remove('shake');
            }, 400);
        }
    }

    submitBtn.addEventListener('click', handleLogin);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
        // Hide error on typing
        errorMsg.style.opacity = '0';
    });

    function unlockApp() {
        gate.style.display = 'none';
        app.style.display = 'flex';
        fetchData();
    }

    async function fetchData() {
        const container = document.getElementById('pipeline-container');
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data && data.stages && data.stages.length > 0) {
                renderPipeline(data.stages, container);
            } else {
                container.innerHTML = '<div class="error-state">No status updates currently available.</div>';
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            container.innerHTML = '<div class="error-state">Status information is currently unavailable. Please contact your advisor.</div>';
        }
    }

    function getStatusClass(status) {
        const s = (status || '').toLowerCase();
        if (s.includes('complete')) return 'status-complete';
        if (s.includes('in progress')) return 'status-in-progress';
        if (s.includes('hold')) return 'status-on-hold';
        if (s.includes('revision')) return 'status-needs-revision';
        if (s.includes('decision')) return 'status-decision-pending';
        return 'status-pending';
    }

    function renderPipeline(stages, container) {
        container.innerHTML = '';
        stages.forEach(stage => {
            const stageEl = document.createElement('div');
            stageEl.className = 'stage-item';
            stageEl.setAttribute('data-status', stage.Status || 'Pending');

            const statusClass = getStatusClass(stage.Status || '');

            let notesHtml = '';
            if (stage['Advisor Notes'] && stage['Advisor Notes'].trim() !== '') {
                notesHtml = `
                    <div class="advisor-notes">
                        <span class="advisor-notes-label">Advisor Notes</span>
                        ${escapeHtml(stage['Advisor Notes'])}
                    </div>
                `;
            }

            stageEl.innerHTML = `
                <div class="stage-marker"></div>
                <div class="stage-header">
                    <div class="stage-name">${escapeHtml(stage.Stage || 'Stage')}</div>
                    <div class="status-badge ${statusClass}">${escapeHtml(stage.Status || 'Pending')}</div>
                </div>
                <div class="stage-meta">
                    <div class="meta-item">
                        <span class="meta-label">Last Updated</span>
                        <span class="meta-value">${escapeHtml(stage['Last Updated'] || '—')}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Est. Completion</span>
                        <span class="meta-value">${escapeHtml(stage['Est. Completion'] || '—')}</span>
                    </div>
                </div>
                ${notesHtml}
            `;
            container.appendChild(stageEl);
        });
    }

    function escapeHtml(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});
