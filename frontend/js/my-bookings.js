const bookingsContainer =
    document.getElementById("bookings-container");

const emptyBookings =
    document.getElementById("empty-bookings");

const bookingsMessage =
    document.getElementById("bookings-message");

const allCountElement =
    document.getElementById("all-count");

const pendingCountElement =
    document.getElementById("pending-count");

const confirmedCountElement =
    document.getElementById("confirmed-count");

const cancelledCountElement =
    document.getElementById("cancelled-count");

// Read bookings saved by booking.js.
function getSavedBookings() {
    const savedBookings =
        localStorage.getItem("myBookings");

    if (!savedBookings) {
        return [];
    }

    try {
        return JSON.parse(savedBookings);
    } catch (error) {
        console.error("Could not read saved bookings:", error);
        return [];
    }
}

// Save the updated booking list.
function saveBookings(bookings) {
    localStorage.setItem(
        "myBookings",
        JSON.stringify(bookings)
    );
}

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

// Return the CSS class for a booking status.
function getStatusClass(status) {
    const normalizedStatus =
        String(status).toLowerCase();

    if (normalizedStatus === "confirmed") {
        return "status-confirmed";
    }

    if (normalizedStatus === "cancelled") {
        return "status-cancelled";
    }

    if (normalizedStatus === "rejected") {
        return "status-rejected";
    }

    return "status-pending";
}

// Display a page message.
function showMessage(message, type) {
    bookingsMessage.textContent = message;
    bookingsMessage.className = `alert alert-${type}`;
    bookingsMessage.classList.remove("d-none");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Update the status counters.
function updateStatusCounters(bookings) {
    const pendingCount = bookings.filter(
        booking =>
            String(booking.status).toLowerCase() ===
            "pending"
    ).length;

    const confirmedCount = bookings.filter(
        booking =>
            String(booking.status).toLowerCase() ===
            "confirmed"
    ).length;

    const cancelledOrRejectedCount = bookings.filter(
        booking => {
            const status =
                String(booking.status).toLowerCase();

            return (
                status === "cancelled" ||
                status === "rejected"
            );
        }
    ).length;

    allCountElement.textContent = bookings.length;
    pendingCountElement.textContent = pendingCount;
    confirmedCountElement.textContent = confirmedCount;
    cancelledCountElement.textContent =
        cancelledOrRejectedCount;
}

// Create the HTML for one booking card.
function createBookingCard(booking) {
    const status =
        booking.status || "Pending";

    const statusClass =
        getStatusClass(status);

    const canCancel =
        status.toLowerCase() === "confirmed";

    const cancelButton = canCancel
        ? `
            <button
                type="button"
                class="btn btn-outline-danger cancel-booking-button"
                data-booking-id="${booking.id}"
            >
                Cancel Booking
            </button>
        `
        : "";

    return `
        <div class="col-md-6 col-xl-4">
            <article class="booking-card">

                <div class="booking-card-header">
                    <span class="booking-number">
                        Booking #${booking.id}
                    </span>

                    <span
                        class="booking-status ${statusClass}"
                    >
                        ${status}
                    </span>
                </div>

                <div class="booking-card-body">

                    <h2 class="booking-hotel-name">
                        ${booking.hotelName || "Hotel"}
                    </h2>

                    <p class="booking-room-name">
                        ${booking.roomTypeName || "Room"}
                    </p>

                    <div class="booking-details">

                        <div class="booking-detail">
                            <span>Check-in</span>

                            <strong>
                                ${formatDate(booking.checkIn)}
                            </strong>
                        </div>

                        <div class="booking-detail">
                            <span>Check-out</span>

                            <strong>
                                ${formatDate(booking.checkOut)}
                            </strong>
                        </div>

                        <div class="booking-detail">
                            <span>Nights</span>

                            <strong>
                                ${booking.nights || 0}
                            </strong>
                        </div>

                        <div class="booking-detail">
                            <span>Guests</span>

                            <strong>
                                ${booking.numberOfGuests || 0}
                            </strong>
                        </div>

                    </div>

                    <div class="booking-price">
                        <span>Total price</span>

                        <strong>
                            EGP ${formatPrice(booking.totalPrice)}
                        </strong>
                    </div>

                    <div class="booking-actions">
                        ${cancelButton}
                    </div>

                </div>
            </article>
        </div>
    `;
}

// Display all bookings.
function displayBookings() {
    const bookings = getSavedBookings();

    updateStatusCounters(bookings);

    if (bookings.length === 0) {
        bookingsContainer.innerHTML = "";
        bookingsContainer.classList.add("d-none");
        emptyBookings.classList.remove("d-none");
        return;
    }

    emptyBookings.classList.add("d-none");
    bookingsContainer.classList.remove("d-none");

    // Show newest bookings first.
    const newestFirst = [...bookings].reverse();

    bookingsContainer.innerHTML =
        newestFirst.map(createBookingCard).join("");

    addCancelButtonEvents();
}

// Add events to all cancel buttons.
function addCancelButtonEvents() {
    const cancelButtons = document.querySelectorAll(
        ".cancel-booking-button"
    );

    cancelButtons.forEach(button => {
        button.addEventListener("click", function () {
            const bookingId =
                this.dataset.bookingId;

            cancelBooking(bookingId);
        });
    });
}

// Temporarily cancel a booking locally.
function cancelBooking(bookingId) {
    const shouldCancel = window.confirm(
        "Are you sure you want to cancel this booking?"
    );

    if (!shouldCancel) {
        return;
    }

    const bookings = getSavedBookings();

    const booking = bookings.find(
        item => String(item.id) === String(bookingId)
    );

    if (!booking) {
        showMessage(
            "The selected booking could not be found.",
            "danger"
        );

        return;
    }

    if (
        String(booking.status).toLowerCase() !==
        "confirmed"
    ) {
        showMessage(
            "Only confirmed bookings can be cancelled.",
            "warning"
        );

        return;
    }

    booking.status = "Cancelled";

    saveBookings(bookings);

    // Update latestBooking if it is the same booking.
    const latestBookingText =
        localStorage.getItem("latestBooking");

    if (latestBookingText) {
        try {
            const latestBooking =
                JSON.parse(latestBookingText);

            if (
                String(latestBooking.id) ===
                String(bookingId)
            ) {
                latestBooking.status = "Cancelled";

                localStorage.setItem(
                    "latestBooking",
                    JSON.stringify(latestBooking)
                );
            }
        } catch (error) {
            console.error(
                "Could not update latest booking:",
                error
            );
        }
    }

    displayBookings();

    showMessage(
        "The booking was cancelled successfully.",
        "success"
    );
}

displayBookings();