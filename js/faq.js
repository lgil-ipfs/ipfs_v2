document.addEventListener('DOMContentLoaded', () => {
    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all items
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.style.maxHeight = null;
            });

            // Toggle the clicked item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Search Logic
    const searchInput = document.getElementById('faq-search');
    const categories = document.querySelectorAll('.faq-category');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            categories.forEach(category => {
                let categoryVisible = false;
                const items = category.querySelectorAll('.faq-item');

                items.forEach(item => {
                    const questionText = item.querySelector('h3').textContent.toLowerCase();
                    const answerText = item.querySelector('.faq-answer p').textContent.toLowerCase();

                    if (questionText.includes(searchTerm) || answerText.includes(searchTerm)) {
                        item.style.display = 'block';
                        categoryVisible = true;
                    } else {
                        item.style.display = 'none';
                    }
                });

                // Show/Hide category header based on search results within it
                category.style.display = categoryVisible ? 'block' : 'none';
            });
        });
    }
});
