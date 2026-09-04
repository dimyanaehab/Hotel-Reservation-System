const confirmationContent =
    document.getElementById("confirmation-content");

const noBookingContent =
    document.getElementById("no-booking-content");

const bookingIdElement =
    document.getElementById("booking-id");

const bookingStatusElement =
    document.getElementById("booking-status");

const hotelNameElement =
    document.getElementById("result-hotel-name");

const roomNameElement =
    document.getElementById("result-room-name");

const checkInElement =
    document.getElementById("result-check-in");

const checkOutElement =
    document.getElementById("result-check-out");

const nightsElement =
    document.getElementById("result-nights");

const guestsElement =
    document.getElementById("result-guests");

const totalPriceElement =
    document.getElementById("result-total-price");

// Format a number as a price.
function formatPrice(price) {
    return Number(price).toLocaleString("en-EG");
}

// Format a YYYY-MM-DD date for display.
function formatDate(dateText) {
    if (!dateText) {
        return "Not available";
    }

    const parts = dateText.split("-");

    if (parts.length !== 3) {
        return dateText;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const day = Number(parts[2]);

    const date = new Date(year, month, day);

    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

// Change the appearance of the status badge.
function updateStatusBadge(status) {
    const normalizedStatus =
        String(status || "Pending").toLowerCase();

    bookingStatusElement.className = "status-badge";

    if (normalizedStatus === "confirmed") {
        bookingStatusElement.classList.add(
            "status-confirmed"
        );
    } else if (normalizedStatus === "cancelled") {
        bookingStatusElement.classList.add(
            "status-cancelled"
        );
    } else if (normalizedStatus === "rejected") {
        bookingStatusElement.classList.add(
            "status-rejected"
        );
    } else {
        bookingStatusElement.classList.add(
            "status-pending"
        );
    }

    bookingStatusElement.textContent =
        status || "Pending";
}

// Read the most recently created booking.
function displayBookingResult() {
    const savedBooking =
        localStorage.getItem("latestBooking");

    if (!savedBooking) {
        confirmationContent.classList.add("d-none");
        noBookingContent.classList.remove("d-none");
        return;
    }

    try {
        const booking = JSON.parse(savedBooking);

        bookingIdElement.textContent =
            booking.id ?? "Not available";

        hotelNameElement.textContent =
            booking.hotelName ?? "Not available";

        roomNameElement.textContent =
            booking.roomTypeName ?? "Not available";

        checkInElement.textContent =
            formatDate(booking.checkIn);

        checkOutElement.textContent =
            formatDate(booking.checkOut);

        nightsElement.textContent =
            booking.nights ?? 0;

        guestsElement.textContent =
            booking.numberOfGuests ?? 0;

        totalPriceElement.textContent =
            formatPrice(booking.totalPrice ?? 0);

        updateStatusBadge(booking.status);

        confirmationContent.classList.remove("d-none");
        noBookingContent.classList.add("d-none");
    } catch (error) {
        console.error(
            "Could not read booking information:",
            error
        );

        confirmationContent.classList.add("d-none");
        noBookingContent.classList.remove("d-none");
    }
}

displayBookingResult();