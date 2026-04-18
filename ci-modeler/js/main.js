document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load Article Content
    try {
        const response = await fetch('content/article.json');
        const article = await response.json();
        
        article.sections.forEach((section, index) => {
            const sectionId = `article-section-${index + 1}`;
            const el = document.getElementById(sectionId);
            if (el) {
                let html = `<h2>${section.heading}</h2>`;
                section.body.forEach(p => {
                    html += `<p>${p}</p>`;
                });
                el.innerHTML = html;
            }
        });
    } catch (e) {
        console.error("Failed to load article content", e);
    }

    // 2. Load Defaults and Run Modeler
    await window.InputState.loadDefaults();
    
    const refreshModeler = () => {
        const inputs = window.InputState.get();
        const results = window.Calculator.run(inputs);
        window.ChartManager.update(results, inputs);
        window.Annotations.render(results, inputs);
        window.Summary.render(results, inputs);
    };

    // Initial render
    refreshModeler();

    // 3. Setup Listeners with Debounce
    let debounceTimer;
    document.querySelector('.modeler-inputs').addEventListener('input', (e) => {
        if (e.target.tagName.toLowerCase() === 'input') {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                refreshModeler();
            }, 300);
        }
    });
});
