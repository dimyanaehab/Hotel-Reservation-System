// ==================== Reviews Page JavaScript - LumaStay Theme ====================

// Dummy Reviews Data
const dummyReviews = [
    {
        id: 1,
        customerName: 'Sarah Mitchell',
        avatar: 'SM',
        hotelName: 'Casa Brava · Mallorca',
        rating: 5,
        comment: 'An absolutely stunning property with incredible attention to detail. The views were breathtaking, and the hospitality was exceptional. Every moment felt carefully curated. Would return in a heartbeat.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        verified: true,
        helpful: 24,
        response: {
            author: 'Property Manager',
            text: 'Thank you so much for your wonderful review! We\'re delighted you enjoyed your stay with us.'
        }
    },
    {
        id: 2,
        customerName: 'Michael Chen',
        avatar: 'MC',
        hotelName: 'The Greenhouse · Portugal',
        rating: 5,
        comment: 'Perfect escape from the city. The surrounding nature and peaceful atmosphere made this stay unforgettable. Staff was incredibly welcoming, and the breakfast was phenomenal.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        verified: true,
        helpful: 18
    },
    {
        id: 3,
        customerName: 'Emily Rodriguez',
        avatar: 'ER',
        hotelName: 'Villa Sora · Japan',
        rating: 4,
        comment: 'Beautiful traditional Japanese architecture blended with modern comforts. The gardens were serene, and the location was perfect for exploring Kyoto. Minor hiccup with check-in, but overall wonderful.',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        verified: true,
        helpful: 12
    },
    {
        id: 4,
        customerName: 'David Thompson',
        avatar: 'DT',
        hotelName: 'Mountain View Lodge · Colorado',
        rating: 5,
        comment: 'The mountain views are spectacular! Perfect location for hiking and outdoor activities. The lodge has a cozy, welcoming atmosphere. Will definitely be back next winter.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        verified: false,
        helpful: 8
    },
    {
        id: 5,
        customerName: 'Jennifer Park',
        avatar: 'JP',
        hotelName: 'Casa Brava · Mallorca',
        rating: 5,
        comment: 'This place exceeded every expectation. The architecture, the food, the service – everything was perfect. A true gem on the island.',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        verified: true,
        helpful: 31
    },
    {
        id: 6,
        customerName: 'Robert Williams',
        avatar: 'RW',
        hotelName: 'Seaside Resort · California',
        rating: 4,
        comment: 'Great beachfront location with excellent amenities. The sunset views from our room were incredible. Only wish the restaurant had more variety.',
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        verified: true,
        helpful: 15
    },
    {
        id: 7,
        customerName: 'Amanda Foster',
        avatar: 'AF',
        hotelName: 'The Greenhouse · Portugal',
        rating: 5,
        comment: 'A hidden paradise! The property is surrounded by lush gardens and the rooms are beautifully designed. Perfect for a romantic getaway.',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        verified: true,
        helpful: 22
    },
    {
        id: 8,
        customerName: 'James Anderson',
        avatar: 'JA',
        hotelName: 'Villa Sora · Japan',
        rating: 3,
        comment: 'Nice property but could use some updates. The location is great and staff was friendly. Good value overall.',
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        verified: false,
        helpful: 5
    }
];

// Current state
let currentReviews = [...dummyReviews];
let displayedCount = 5;
let currentFilter = 'all';
let currentSort = 'recent';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadReviews();
    initializeStarRating();
    initializeFilters();
    initializeForm();
});

// Load and display reviews
function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    const emptyState = document.getElementById('emptyState');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    // Filter reviews
    let filteredReviews = currentFilter === 'all' 
        ? [...currentReviews] 
        : currentReviews.filter(r => r.rating === parseInt(currentFilter));
    
    // Sort reviews
    filteredReviews = sortReviews(filteredReviews, currentSort);
    
    // Update total count
    document.getElementById('totalReviews').textContent = currentReviews.length;
    
    // Show empty state if no reviews
    if (filteredReviews.length === 0) {
        reviewsList.style.display = 'none';
        emptyState.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return;
    }
    
    // Show reviews
    reviewsList.style.display = 'block';
    emptyState.style.display = 'none';
    
    // Display reviews
    const reviewsToShow = filteredReviews.slice(0, displayedCount);
    reviewsList.innerHTML = reviewsToShow.map(review => createReviewCard(review)).join('');
    
    // Show/hide load more button
    if (displayedCount >= filteredReviews.length) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'block';
    }
}

// Create review card HTML
function createReviewCard(review) {
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const verifiedBadge = review.verified 
        ? '<span class="verified-badge">✓ Verified stay</span>' 
        : '';
    
    const responseHtml = review.response 
        ? `
        <div class="review-response">
            <div class="response-header">
                <span class="response-badge">Response</span>
                <span class="response-author">${review.response.author}</span>
            </div>
            <p class="response-text">${review.response.text}</p>
        </div>
        ` 
        : '';
    
    return `
        <div class="review-card" data-rating="${review.rating}">
            <div class="review-header">
                <div class="review-avatar">${review.avatar}</div>
                <div class="review-meta">
                    <div class="reviewer-name">${review.customerName}${verifiedBadge}</div>
                    <div class="review-property">${review.hotelName}</div>
                    <div class="review-rating">${stars}</div>
                    <div class="review-date">${formatDate(review.date)}</div>
                </div>
            </div>
            <p class="review-comment">${review.comment}</p>
            ${responseHtml}
            <div class="review-actions">
                <button class="review-action" onclick="likeReview(${review.id})">
                    👍 Helpful (${review.helpful})
                </button>
                <button class="review-action" onclick="shareReview(${review.id})">
                    ↗ Share
                </button>
                <button class="review-action" onclick="reportReview(${review.id})">
                    ⚑ Report
                </button>
            </div>
        </div>
    `;
}

// Initialize filters
function initializeFilters() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter and reload
            currentFilter = this.dataset.filter;
            displayedCount = 5;
            loadReviews();
        });
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sortReviews');
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        loadReviews();
    });
}

// Remove the generateStars function since we're using Unicode stars
// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Sort reviews
function sortReviews(reviews, sortBy) {
    const sorted = [...reviews];
    
    switch(sortBy) {
        case 'recent':
            return sorted.sort((a, b) => b.date - a.date);
        case 'oldest':
            return sorted.sort((a, b) => a.date - b.date);
        case 'highest':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'lowest':
            return sorted.sort((a, b) => a.rating - b.rating);
        default:
            return sorted;
    }
}

// Initialize filters
function initializeFilters() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('[data-filter]');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter and reload
            currentFilter = this.dataset.filter;
            displayedCount = 5;
            loadReviews();
        });
    });
    
    // Sort dropdown
    const sortSelect = document.getElementById('sortReviews');
    sortSelect.addEventListener('change', function() {
        currentSort = this.value;
        loadReviews();
    });
}

// Load more reviews
document.getElementById('loadMoreBtn')?.addEventListener('click', function() {
    displayedCount += 5;
    loadReviews();
});

// Initialize star rating in modal
function initializeStarRating() {
    const stars = document.querySelectorAll('#starRating .star');
    const ratingValue = document.getElementById('ratingValue');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            ratingValue.value = rating;
            
            // Update visual state
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.textContent = '★';
                    s.classList.add('active');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('active');
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.textContent = '★';
                } else {
                    s.textContent = '☆';
                }
            });
        });
    });
    
    document.getElementById('starRating').addEventListener('mouseleave', function() {
        const currentRating = parseInt(ratingValue.value);
        stars.forEach((s, index) => {
            if (index < currentRating) {
                s.textContent = '★';
            } else {
                s.textContent = '☆';
            }
        });
    });
}

// Initialize review form
function initializeForm() {
    const reviewForm = document.getElementById('reviewForm');
    
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const hotelName = document.getElementById('hotelSelect').value;
        const rating = parseInt(document.getElementById('ratingValue').value);
        const comment = document.getElementById('reviewComment').value;
        
        // Validate rating
        if (rating === 0) {
            showAlert('Please select a rating', 'warning');
            return;
        }
        
        // Create new review
        const newReview = {
            id: currentReviews.length + 1,
            customerName: 'You',
            avatar: 'YO',
            hotelName: hotelName,
            rating: rating,
            comment: comment,
            date: new Date(),
            verified: false,
            helpful: 0
        };
        
        // Add to reviews array
        currentReviews.unshift(newReview);
        
        // Show success message
        showSuccessModal();
        
        // Reset form
        reviewForm.reset();
        document.getElementById('ratingValue').value = '0';
        document.querySelectorAll('#starRating .star').forEach(star => {
            star.textContent = '☆';
            star.classList.remove('active');
        });
        
        // Reload reviews
        setTimeout(() => {
            displayedCount = 5;
            loadReviews();
        }, 2000);
    });
}

// Show success modal
function showSuccessModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('addReviewModal'));
    modal.hide();
    
    showAlert('Thank you for your review! It has been submitted successfully.', 'success');
}

// Alert notification
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 90px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Review actions
function likeReview(reviewId) {
    const review = currentReviews.find(r => r.id === reviewId);
    if (review) {
        review.helpful++;
        loadReviews();
        showAlert('Thank you for your feedback!', 'success');
    }
}

function shareReview(reviewId) {
    showAlert('Share functionality coming soon!', 'info');
}

function reportReview(reviewId) {
    if (confirm('Are you sure you want to report this review?')) {
        showAlert('Review has been reported. Thank you!', 'warning');
    }
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const nav = document.getElementById('mainNav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});
