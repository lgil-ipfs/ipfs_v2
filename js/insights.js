// CLIENT-SIDE FILTERING & SEARCH
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('article-search');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const articles = document.querySelectorAll('.article-card');

    function filterArticles() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;

        articles.forEach(article => {
            const titleElement = article.querySelector('h3, h2');
            const descElement = article.querySelector('p');

            if (!titleElement || !descElement) return;

            const title = titleElement.textContent.toLowerCase();
            const desc = descElement.textContent.toLowerCase();
            const category = article.dataset.category;

            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);
            const matchesFilter = activeFilter === 'all' || category === activeFilter;

            if (matchesSearch && matchesFilter) {
                article.style.display = 'flex';
            } else {
                article.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterArticles);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterArticles();
        });
    });
});
