// Get the booking form and its input elements.
const bookingForm = document.getElementById("booking-form");
const roomTypeIdInput = document.getElementById("room-type-id");
const checkInInput = document.getElementById("check-in");
const checkOutInput = document.getElementById("check-out");
const guestsInput = document.getElementById("number-of-guests");

// Get the booking summary elements.
const roomPriceElement = document.getElementById("room-price");
const summaryRoomPriceElement =
    document.getElementById("summary-room-price");
const nightsElement = document.getElementById("number-of-nights");
const totalPriceElement = document.getElementById("total-price");

// Get the message and button elements.
const bookingMessage = document.getElementById("booking-message");
const bookingButton = document.getElementById("booking-button");
const checkOutFeedback =
    document.getElementById("check-out-feedback");

// Temporary room data.
// Later, Person 3's hotel/room page will provide this data.
const roomPricePerNight = Number(roomPriceElement.textContent);
const maximumGuests = 2;

// Convert a number to a formatted price.
function formatPrice(price) {
    return price.toLocaleString("en-EG");
}

// Get today's date in YYYY-MM-DD format.
function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Add a number of days to a YYYY-MM-DD date.
function addDays(dateText, numberOfDays) {
    const dateParts = dateText.split("-");

    const date = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
    );

    date.setDate(date.getDate() + numberOfDays);

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Convert YYYY-MM-DD into UTC milliseconds.
// UTC avoids daylight-saving and timezone calculation problems.
function convertDateToUtcMilliseconds(dateText) {
    if (!dateText) {
        return null;
    }

    const dateParts = dateText.split("-");

    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]) - 1;
    const day = Number(dateParts[2]);

    return Date.UTC(year, month, day);
}

// Calculate the number of nights.
function calculateNights() {
    const checkInMilliseconds =
        convertDateToUtcMilliseconds(checkInInput.value);

    const checkOutMilliseconds =
        convertDateToUtcMilliseconds(checkOutInput.value);

    if (
        checkInMilliseconds === null ||
        checkOutMilliseconds === null ||
        checkOutMilliseconds <= checkInMilliseconds
    ) {
        return 0;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    return (
        checkOutMilliseconds - checkInMilliseconds
    ) / millisecondsPerDay;
}

// Update the minimum allowed check-out date.
function updateCheckOutMinimumDate() {
    if (!checkInInput.value) {
        checkOutInput.min = "";
        return;
    }

    const minimumCheckOutDate =
        addDays(checkInInput.value, 1);

    checkOutInput.min = minimumCheckOutDate;

    // Clear check-out when it is no longer valid.
    if (
        checkOutInput.value &&
        checkOutInput.value < minimumCheckOutDate
    ) {
        checkOutInput.value = "";
    }
}

// Update the price summary.
function updateBookingSummary() {
    const numberOfNights = calculateNights();

    const totalPrice =
        numberOfNights * roomPricePerNight;

    nightsElement.textContent = numberOfNights;
    totalPriceElement.textContent = formatPrice(totalPrice);
}

// Validate that check-out is after check-in.
function validateDates() {
    const numberOfNights = calculateNights();

    if (!checkOutInput.value) {
        checkOutInput.setCustomValidity(
            "Please select a check-out date."
        );

        checkOutFeedback.textContent =
            "Please select a check-out date.";

        return false;
    }

    if (numberOfNights <= 0) {
        checkOutInput.setCustomValidity(
            "Check-out must be after check-in."
        );

        checkOutFeedback.textContent =
            "Check-out must be after the check-in date.";

        return false;
    }

    checkOutInput.setCustomValidity("");
    return true;
}

// Validate the number of guests.
function validateGuests() {
    const numberOfGuests = Number(guestsInput.value);

    if (
        numberOfGuests < 1 ||
        numberOfGuests > maximumGuests
    ) {
        guestsInput.setCustomValidity(
            `The room accepts 1 to ${maximumGuests} guests.`
        );

        return false;
    }

    guestsInput.setCustomValidity("");
    return true;
}

// Display a message above the booking form.
function showMessage(message, type) {
    bookingMessage.textContent = message;
    bookingMessage.className = `alert alert-${type}`;
    bookingMessage.classList.remove("d-none");

    bookingMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// Hide the booking message.
function hideMessage() {
    bookingMessage.classList.add("d-none");
}

// Set the minimum check-in date to today.
const todayDate = getTodayDate();

checkInInput.min = todayDate;

// Display the room price in the summary.
summaryRoomPriceElement.textContent =
    formatPrice(roomPricePerNight);

// Run when the check-in date changes.
checkInInput.addEventListener("change", function () {
    hideMessage();

    updateCheckOutMinimumDate();
    validateDates();
    updateBookingSummary();
});

// Run when the check-out date changes.
checkOutInput.addEventListener("change", function () {
    hideMessage();

    validateDates();
    updateBookingSummary();
});

// Run when the number of guests changes.
guestsInput.addEventListener("input", function () {
    hideMessage();
    validateGuests();
});

// Run when the booking form is submitted.
bookingForm.addEventListener("submit", function (event) {
    event.preventDefault();

    hideMessage();

    const datesAreValid = validateDates();
    const guestsAreValid = validateGuests();

    bookingForm.classList.add("was-validated");

    if (
        !bookingForm.checkValidity() ||
        !datesAreValid ||
        !guestsAreValid
    ) {
        showMessage(
            "Please correct the booking information.",
            "danger"
        );

        return;
    }

    const numberOfNights = calculateNights();

    const totalPrice =
        numberOfNights * roomPricePerNight;

    // This object matches CreateBookingRequestDto in the API.
    const bookingRequest = {
        roomTypeId: Number(roomTypeIdInput.value),
        checkIn: checkInInput.value,
        checkOut: checkOutInput.value,
        numberOfGuests: Number(guestsInput.value)
    };

    // Temporary result used until API integration is available.
    const temporaryBookingResult = {
        id: Date.now(),
        hotelName: "Nile View Hotel",
        roomTypeName: "Deluxe Room",
        roomTypeId: bookingRequest.roomTypeId,
        checkIn: bookingRequest.checkIn,
        checkOut: bookingRequest.checkOut,
        numberOfGuests: bookingRequest.numberOfGuests,
        nights: numberOfNights,
        totalPrice: totalPrice,
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    console.log("Booking request:", bookingRequest);
    console.log(
        "Temporary booking result:",
        temporaryBookingResult
    );

    // Save it temporarily in the browser.
    localStorage.setItem(
        "latestBooking",
        JSON.stringify(temporaryBookingResult)
    );

    // Save the booking in a temporary list for My Bookings.
    const savedBookings =
        JSON.parse(localStorage.getItem("myBookings")) || [];

    savedBookings.push(temporaryBookingResult);

    localStorage.setItem(
        "myBookings",
        JSON.stringify(savedBookings)
    );

    // Open the booking confirmation page.
    window.location.href = "booking-result.html";
});