const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');
const errorMsg = document.getElementById('form-error');

if (form) {
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Reset messages
        successMsg.classList.remove('visible');
        errorMsg.classList.remove('visible');

        // Loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.querySelector('.btn-label').textContent = 'Sending...';

        const data = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                successMsg.classList.add('visible');
                form.reset();
                // Scroll success message into view
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                errorMsg.classList.add('visible');
            }
        } catch (err) {
            errorMsg.classList.add('visible');
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.querySelector('.btn-label').textContent = 'Send Message';
        }
    });
}
