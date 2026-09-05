const reviewsApiUrl = window.hotelApi.baseUrl;
const reviewHeaders = window.hotelApi.headers("User");
const hotelId = Number(new URLSearchParams(window.location.search).get("hotelId")) || 1;
let currentReviews = [];
let displayedCount = 5;
let currentFilter = "all";
let currentSort = "recent";

document.addEventListener("DOMContentLoaded", async () => {
    initializeStarRating();
    initializeFilters();
    initializeForm();
    document.getElementById("loadMoreBtn").addEventListener("click", () => {
        displayedCount += 5;
        renderReviews();
    });
    await loadReviews();
    await loadCompletedBookings();
});

async function loadReviews() {
    const list = document.getElementById("reviewsList");
    list.innerHTML = '<p class="text-center">Loading reviews...</p>';
    try {
        const response = await fetch(`${reviewsApiUrl}/hotels/${hotelId}/reviews`);
        if (!response.ok) throw new Error(await window.hotelApi.errorMessage(response, "Could not load reviews."));
        currentReviews = await response.json();
        renderReviews();
    } catch (error) {
        list.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`;
    }
}

function renderReviews() {
    const list = document.getElementById("reviewsList");
    const empty = document.getElementById("emptyState");
    const more = document.getElementById("loadMoreContainer");
    let reviews = currentFilter === "all"
        ? [...currentReviews]
        : currentReviews.filter(review => review.rating === Number(currentFilter));

    reviews.sort((a, b) => {
        if (currentSort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        if (currentSort === "highest") return b.rating - a.rating;
        if (currentSort === "lowest") return a.rating - b.rating;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    document.getElementById("totalReviews").textContent = currentReviews.length;
    const average = currentReviews.length
        ? currentReviews.reduce((sum, review) => sum + review.rating, 0) / currentReviews.length
        : 0;
    document.querySelector(".score-number").textContent = average.toFixed(1);

    if (!reviews.length) {
        list.style.display = "none";
        empty.style.display = "block";
        more.style.display = "none";
        return;
    }

    list.style.display = "block";
    empty.style.display = "none";
    list.innerHTML = reviews.slice(0, displayedCount).map(createReviewCard).join("");
    more.style.display = displayedCount < reviews.length ? "block" : "none";
}

function createReviewCard(review) {
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const initials = review.userName.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
    return `<article class="review-card">
        <div class="review-header">
            <div class="review-avatar">${escapeHtml(initials)}</div>
            <div class="review-meta">
                <div class="reviewer-name">${escapeHtml(review.userName)} <span class="verified-badge">✓ Verified stay</span></div>
                <div class="review-rating">${stars}</div>
                <div class="review-date">${new Date(review.createdAt).toLocaleDateString()}</div>
            </div>
        </div>
        <p class="review-comment">${escapeHtml(review.comment || "No written comment.")}</p>
    </article>`;
}

function initializeFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    buttons.forEach(button => button.addEventListener("click", () => {
        buttons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        currentFilter = button.dataset.filter;
        displayedCount = 5;
        renderReviews();
    }));
    document.getElementById("sortReviews").addEventListener("change", event => {
        currentSort = event.target.value;
        renderReviews();
    });
}

function initializeStarRating() {
    const stars = document.querySelectorAll(".star");
    stars.forEach(star => star.addEventListener("click", () => {
        const rating = Number(star.dataset.rating);
        document.getElementById("ratingValue").value = rating;
        stars.forEach(item => item.textContent = Number(item.dataset.rating) <= rating ? "★" : "☆");
    }));
}

async function loadCompletedBookings() {
    const select = document.getElementById("hotelSelect");
    try {
        const response = await fetch(`${reviewsApiUrl}/me/bookings`, { headers: reviewHeaders });
        if (!response.ok) throw new Error();
        const bookings = (await response.json()).filter(booking =>
            booking.hotelId === hotelId &&
            booking.status.toLowerCase() === "completed" &&
            !currentReviews.some(review => review.bookingId === booking.id)
        );
        select.innerHTML = '<option value="">Choose a completed stay...</option>' +
            bookings.map(booking => `<option value="${booking.id}">Booking #${booking.id} · ${escapeHtml(booking.hotelName)} · ${escapeHtml(booking.roomTypeName)}</option>`).join("");
    } catch {
        select.innerHTML = '<option value="">Completed stays could not be loaded</option>';
    }
}

function initializeForm() {
    document.getElementById("reviewForm").addEventListener("submit", async event => {
        event.preventDefault();
        const bookingId = Number(document.getElementById("hotelSelect").value);
        const rating = Number(document.getElementById("ratingValue").value);
        const comment = document.getElementById("reviewComment").value.trim();
        if (!bookingId || rating < 1 || comment.length < 10) {
            showReviewMessage("Choose a completed stay, rating, and a comment of at least 10 characters.", "danger");
            return;
        }

        const submit = event.target.querySelector('[type="submit"]');
        submit.disabled = true;
        try {
            const response = await fetch(`${reviewsApiUrl}/hotels/${hotelId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...reviewHeaders },
                body: JSON.stringify({ bookingId, rating, comment })
            });
            if (!response.ok) throw new Error(await window.hotelApi.errorMessage(response, "Could not submit review."));
            bootstrap.Modal.getOrCreateInstance(document.getElementById("addReviewModal")).hide();
            event.target.reset();
            document.querySelectorAll(".star").forEach(star => star.textContent = "☆");
            await loadReviews();
            showReviewMessage("Your review was submitted successfully.", "success");
        } catch (error) {
            showReviewMessage(error.message, "danger");
        } finally {
            submit.disabled = false;
        }
    });
}

function showReviewMessage(message, type) {
    let alert = document.getElementById("reviewsMessage");
    if (!alert) {
        alert = document.createElement("div");
        alert.id = "reviewsMessage";
        document.querySelector(".reviews-container").prepend(alert);
    }
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
}

function escapeHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
}
