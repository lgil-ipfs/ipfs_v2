// Handle Review Form
const reviewForm = document.getElementById('review-form');
const reviewSubmitBtn = document.getElementById('review-submit-btn');
const reviewSuccess = document.getElementById('review-status-success');
const reviewError = document.getElementById('review-status-error');

if (reviewForm) {
    reviewForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        reviewSuccess.classList.remove('visible');
        reviewError.classList.remove('visible');

        reviewSubmitBtn.disabled = true;
        reviewSubmitBtn.classList.add('loading');
        reviewSubmitBtn.querySelector('.btn-label').textContent = 'Sending...';

        const data = new FormData(reviewForm);
        try {
            const response = await fetch(reviewForm.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                reviewSuccess.classList.add('visible');
                reviewForm.reset();
                reviewSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                reviewError.classList.add('visible');
            }
        } catch (err) {
            reviewError.classList.add('visible');
        } finally {
            reviewSubmitBtn.disabled = false;
            reviewSubmitBtn.classList.remove('loading');
            reviewSubmitBtn.querySelector('.btn-label').textContent = 'Request Review';
        }
    });
}
