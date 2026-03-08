// core-services.js — shared accordion for service page FAQ teasers
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.faq-item').forEach(item => {
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!btn || !answer) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');
            // Close all
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                openItem.classList.remove('open');
                openItem.querySelector('.faq-answer').classList.remove('open');
            });
            // Open clicked if it was closed
            if (!isOpen) {
                item.classList.add('open');
                answer.classList.add('open');
            }
        });
    });
});
