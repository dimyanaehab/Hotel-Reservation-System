const pendingBookingsContainer =
    document.getElementById("pending-bookings-container");

const noPendingBookings =
    document.getElementById("no-pending-bookings");

const pendingBookingsCounts =
    document.querySelectorAll("#pending-bookings-count");

const adminBookingsMessage =
    document.getElementById("admin-bookings-message");

const adminBookingsApiUrl = window.hotelApi.baseUrl;
const adminHeaders = window.hotelApi.headers("Admin");

// Format a price.
function formatPrice(price) {
    return Number(price || 0).toLocaleString("en-EG");
}

// Format a YYYY-MM-DD date.
function formatDate(dateText) {
    if (!dateText) {
        return "Not available";
    }

    const parts = dateText.split("-");

    if (parts.length !== 3) {
        return dateText;
    }

    const date = new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

// Display a success or error message.
function showMessage(message, type) {
    adminBookingsMessage.textContent = message;
    adminBookingsMessage.className =
        `alert alert-${type}`;

    adminBookingsMessage.classList.remove("d-none");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Create one pending booking card.
function createPendingBookingCard(booking) {
    return `
        <div class="col-md-6 col-xl-4">
            <article class="admin-booking-card">

                <div class="admin-booking-card-header">
                    <span class="booking-reference">
                        Booking #${booking.id}
                    </span>

                    <span class="pending-status">
                        Pending
                    </span>
                </div>

                <div class="admin-booking-card-body">

                    <h2>
                        ${booking.hotelName || "Hotel"}
                    </h2>

                    <p class="room-name">
                        ${booking.roomTypeName || "Room"}
                    </p>

                    <div class="admin-booking-details">

                        <div class="admin-booking-detail">
                            <span>Check-in</span>

                            <strong>
                                ${formatDate(booking.checkIn)}
                            </strong>
                        </div>

                        <div class="admin-booking-detail">
                            <span>Check-out</span>

                            <strong>
                                ${formatDate(booking.checkOut)}
                            </strong>
                        </div>

                        <div class="admin-booking-detail">
                            <span>Nights</span>

                            <strong>
                                ${booking.nights || 0}
                            </strong>
                        </div>

                        <div class="admin-booking-detail">
                            <span>Guests</span>

                            <strong>
                                ${booking.numberOfGuests || 0}
                            </strong>
                        </div>

                    </div>

                    <div class="admin-booking-total">
                        <span>Total price</span>

                        <strong>
                            EGP ${formatPrice(booking.totalPrice)}
                        </strong>
                    </div>

                    <div class="admin-booking-actions">

                        <button
                            type="button"
                            class="btn btn-success confirm-button"
                            data-booking-id="${booking.id}"
                        >
                            Confirm
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline-danger reject-button"
                            data-booking-id="${booking.id}"
                        >
                            Reject
                        </button>

                    </div>

                </div>
            </article>
        </div>
    `;
}

// Display pending bookings.
async function displayPendingBookings() {
    let pendingBookings;
    try {
        const response = await fetch(`${adminBookingsApiUrl}/admin/bookings?status=Pending`, { headers: adminHeaders });
        if (!response.ok) throw new Error("Could not load pending bookings.");
        pendingBookings = await response.json();
    } catch (error) {
        showMessage(error.message, "danger");
        return;
    }

    pendingBookingsCounts.forEach(element => {
        element.textContent = pendingBookings.length;
    });

    if (pendingBookings.length === 0) {
        pendingBookingsContainer.innerHTML = "";
        pendingBookingsContainer.classList.add("d-none");
        noPendingBookings.classList.remove("d-none");
        return;
    }

    noPendingBookings.classList.add("d-none");
    pendingBookingsContainer.classList.remove("d-none");

    const newestFirst = [...pendingBookings].reverse();

    pendingBookingsContainer.innerHTML =
        newestFirst
            .map(createPendingBookingCard)
            .join("");

    addBookingActionEvents();
}

// Add events to the Confirm and Reject buttons.
function addBookingActionEvents() {
    const confirmButtons =
        document.querySelectorAll(".confirm-button");

    const rejectButtons =
        document.querySelectorAll(".reject-button");

    confirmButtons.forEach(button => {
        button.addEventListener("click", function () {
            const bookingId = this.dataset.bookingId;
            confirmBooking(bookingId);
        });
    });

    rejectButtons.forEach(button => {
        button.addEventListener("click", function () {
            const bookingId = this.dataset.bookingId;
            rejectBooking(bookingId);
        });
    });
}

// Confirm a pending booking.
async function confirmBooking(bookingId) {
    const shouldConfirm = window.confirm(
        "Are you sure you want to confirm this booking?"
    );

    if (!shouldConfirm) {
        return;
    }

    await updateBookingStatus(bookingId, "confirm", "confirmed");
}

// Reject a pending booking.
async function rejectBooking(bookingId) {
    const shouldReject = window.confirm(
        "Are you sure you want to reject this booking?"
    );

    if (!shouldReject) {
        return;
    }

    await updateBookingStatus(bookingId, "reject", "rejected");
}

async function updateBookingStatus(bookingId, action, pastTense) {
    try {
        const response = await fetch(`${adminBookingsApiUrl}/admin/bookings/${bookingId}/${action}`, {
            method: "PATCH",
            headers: adminHeaders
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `The booking could not be ${pastTense}.`);
        await displayPendingBookings();
        showMessage(`The booking was ${pastTense} successfully.`, "success");
    } catch (error) {
        showMessage(error.message, "danger");
    }
}

displayPendingBookings();
