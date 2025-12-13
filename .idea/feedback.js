// Feedback Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const feedbackForm = document.getElementById('feedbackForm');
    const starRating = document.getElementById('starRating');
    const stars = starRating.querySelectorAll('.star-large');
    const ratingValue = document.getElementById('ratingValue');
    const ratingText = document.getElementById('ratingText');
    const feedbackComments = document.getElementById('feedbackComments');
    const charCount = document.getElementById('charCount');
    const checkboxes = document.querySelectorAll('.feedback-checkbox');
    const submitBtn = document.querySelector('.feedback-submit-btn');

    // Rating text descriptions
    const ratingTexts = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    };

    // Star rating functionality
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            setRating(value);
        });

        star.addEventListener('mouseenter', function() {
            const value = parseInt(this.dataset.value);
            highlightStars(value);
            ratingText.textContent = ratingTexts[value];
        });
    });

    starRating.addEventListener('mouseleave', function() {
        const currentRating = parseInt(ratingValue.value);
        highlightStars(currentRating);
        if (currentRating > 0) {
            ratingText.textContent = ratingTexts[currentRating];
        } else {
            ratingText.textContent = 'Click to rate';
        }
    });

    function setRating(value) {
        ratingValue.value = value;
        highlightStars(value);
        ratingText.textContent = ratingTexts[value];
        clearError('ratingError');
    }

    function highlightStars(value) {
        stars.forEach((star, index) => {
            if (index < value) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Character counter
    feedbackComments.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;

        if (count > 300) {
            this.value = this.value.substring(0, 300);
            charCount.textContent = 300;
        }

        // Change color based on character count - Updated for Dark Theme
        if (count > 250) {
            charCount.style.color = '#e74c3c'; // Red warning
        } else if (count > 200) {
            charCount.style.color = '#cba660'; // Gold warning
        } else {
            charCount.style.color = '#5c707c'; // Default grey
        }

        clearError('commentsError');
    });

    // Checkbox validation
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Visual changes handled by CSS/browser default mostly for this theme
            clearError('aspectsError');
        });
    });

    // Form validation
    function validateForm() {
        let isValid = true;

        // Validate rating
        if (ratingValue.value === '0' || ratingValue.value === '') {
            showError('ratingError');
            isValid = false;
        }

        // Validate comments
        if (feedbackComments.value.trim() === '') {
            showError('commentsError');
            isValid = false;
        } else if (feedbackComments.value.trim().length < 10) {
            document.getElementById('commentsError').textContent = 'Please provide at least 10 characters';
            showError('commentsError');
            isValid = false;
        }

        // Validate at least one checkbox (Optional in reference, but kept based on your previous code)
        // If you want this optional, comment out this block
        const checkedBoxes = document.querySelectorAll('.feedback-checkbox:checked');
        if (checkedBoxes.length === 0) {
            showError('aspectsError');
            isValid = false;
        }

        return isValid;
    }

    function showError(errorId) {
        const errorElement = document.getElementById(errorId);
        errorElement.classList.add('show');
    }

    function clearError(errorId) {
        const errorElement = document.getElementById(errorId);
        errorElement.classList.remove('show');
    }

    // Form submission
    feedbackForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // Collect form data
        const formData = {
            rating: ratingValue.value,
            comments: feedbackComments.value.trim(),
            aspects: Array.from(document.querySelectorAll('.feedback-checkbox:checked')).map(cb => cb.value),
            timestamp: new Date().toISOString()
        };

        // Simulate API call
        setTimeout(() => {
            const existingFeedback = JSON.parse(localStorage.getItem('restaurantFeedback') || '[]');
            existingFeedback.push(formData);
            localStorage.setItem('restaurantFeedback', JSON.stringify(existingFeedback));

            showSuccessMessage();
            resetForm();

            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'SUBMIT FEEDBACK';
        }, 1500);
    });

    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message show';
        successDiv.innerHTML = `
            <h4><i class="fas fa-check-circle"></i> Thank You!</h4>
            <p>Your feedback has been submitted.</p>
        `;

        // Hide form content temporarily or just append message
        const formContent = document.querySelector('form');
        formContent.style.display = 'none';
        document.querySelector('.feedback-card').insertBefore(successDiv, formContent);

        // Reset after delay
        setTimeout(() => {
            successDiv.remove();
            formContent.style.display = 'block';
            formContent.reset(); // Native reset
        }, 4000);
    }

    function resetForm() {
        ratingValue.value = '0';
        highlightStars(0);
        ratingText.textContent = 'Click to rate';
        feedbackComments.value = '';
        charCount.textContent = '0';
        charCount.style.color = '#5c707c';

        checkboxes.forEach(cb => cb.checked = false);
    }
});