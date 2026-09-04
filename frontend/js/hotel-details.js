// Change this value later if the team uses a different API address.
const API_BASE = window.hotelApi.baseUrl;
const query = new URLSearchParams(window.location.search);
const hotelId = Number(query.get('hotelId')) || 1;

// TEMPORARY MOCK: Used only when the room API, database, or CORS is unavailable.
const mockRoomTypes = [
  {
    id: 101,
    hotelId,
    name: 'Deluxe King Room',
    capacity: 2,
    bedType: 'King bed',
    basePrice: 180,
    description: 'A comfortable room with a spacious king bed.'
  },
  {
    id: 102,
    hotelId,
    name: 'Family Suite',
    capacity: 4,
    bedType: 'Two queen beds',
    basePrice: 260,
    description: 'Extra space for families and small groups.'
  }
];

document.addEventListener('DOMContentLoaded', loadRoomTypes);

async function loadRoomTypes() {
  document.getElementById('hotelIdLabel').textContent = hotelId;

  try {
    const response = await fetch(`${API_BASE}/hotels/${hotelId}/room-types`);
    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const roomTypes = await response.json();
    renderRoomTypes(roomTypes, false);
  } catch (error) {
    showPageMessage(
      "TEMPORARY Development Mode: API unavailable. Temporary sample data is being displayed.",
      'warning'
    );
    renderRoomTypes(mockRoomTypes, true);
  }
}

function renderRoomTypes(roomTypes, isMock) {
  const container = document.getElementById('roomTypes');

  if (roomTypes.length === 0) {
    container.innerHTML = '<p class="text-secondary">No room types are available for this hotel.</p>';
    return;
  }

  container.innerHTML = roomTypes.map(room => `
    <div class="col-lg-6">
      <article class="card room-card">
        <div class="room-placeholder">${escapeHtml(room.name)}</div>
        <div class="card-body p-4">
          <div class="d-flex justify-content-between gap-3">
            <h3 class="h4">${escapeHtml(room.name)}</h3>
            <strong>$${Number(room.basePrice).toFixed(2)} / night</strong>
          </div>
          <p class="text-secondary mb-2">${escapeHtml(room.bedType)} · Up to ${room.capacity} guests</p>
          <p>${escapeHtml(room.description || 'No description provided.')}</p>
          ${isMock ? '<span class="badge text-bg-warning mb-3">Mock room</span>' : ''}
          <div class="row g-2 mt-2">
            <div class="col-md-6">
              <label class="form-label" for="checkIn-${room.id}">Check in</label>
              <input class="form-control" id="checkIn-${room.id}" type="date">
            </div>
            <div class="col-md-6">
              <label class="form-label" for="checkOut-${room.id}">Check out</label>
              <input class="form-control" id="checkOut-${room.id}" type="date">
            </div>
          </div>
          <button class="btn btn-dark mt-3" type="button" onclick="checkAvailability(${room.id}, ${isMock}, this)">Check Availability</button>
          <div id="availability-${room.id}" class="availability-message mt-3" aria-live="polite"></div>
        </div>
      </article>
    </div>
  `).join('');
}

async function checkAvailability(roomTypeId, isMock, button) {
  const from = document.getElementById(`checkIn-${roomTypeId}`).value;
  const to = document.getElementById(`checkOut-${roomTypeId}`).value;
  const message = document.getElementById(`availability-${roomTypeId}`);

  if (!from || !to) {
    showAvailabilityResult(
      message,
      'Please select both check-in and check-out dates.',
      'Select Dates',
      'error'
    );
    return;
  }

  if (to <= from) {
    showAvailabilityResult(
      message,
      'Check-out date must be after the check-in date.',
      'Check Your Dates',
      'error'
    );
    return;
  }

  if (isMock) {
    showAvailabilityResult(
      message,
      'TEMPORARY Development Mode: 2 sample rooms available.',
      '✓ Room Available',
      'available',
      from,
      to
    );
    return;
  }

  const originalButtonText = button.innerHTML;
  button.disabled = true;
  button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Checking...';
  message.innerHTML = `
    <div class="availability-loading">
      <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
      Checking availability...
    </div>`;

  try {
    const url = `${API_BASE}/room-types/${roomTypeId}/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const result = await response.json();
    const hasMissingInventory = result.dailyAvailability.some(day => !day.hasInventory);

    if (hasMissingInventory) {
      showAvailabilityResult(
        message,
        'Availability has not been set for all of the selected dates.',
        'Availability Not Set',
        'warning',
        from,
        to
      );
    } else if (result.available) {
      const roomWord = result.availableRooms === 1 ? 'room' : 'rooms';
      showAvailabilityResult(
        message,
        `${result.availableRooms} ${roomWord} available for your selected dates.`,
        '✓ Room Available',
        'available',
        from,
        to
      );
    } else {
      showAvailabilityResult(
        message,
        'This room is not available for the full selected stay. Please choose different dates.',
        '✕ Not Available',
        'unavailable',
        from,
        to
      );
    }
  } catch (error) {
    showAvailabilityResult(
      message,
      "We couldn't check availability right now. Please try again.",
      'Something Went Wrong',
      'error'
    );
  } finally {
    button.disabled = false;
    button.innerHTML = originalButtonText;
  }
}

function showAvailabilityResult(element, text, title, type, from, to) {
  let dates = '';
  if (from && to) {
    dates = `
      <div class="availability-dates">
        <span><strong>Check-in:</strong> ${formatDate(from)}</span>
        <span><strong>Check-out:</strong> ${formatDate(to)}</span>
      </div>`;
  }

  const roomTypeId = element.id.replace('availability-', '');
  const bookingLink = type === 'available' && from && to
    ? `<a class="btn btn-dark mt-3" href="booking.html?roomTypeId=${encodeURIComponent(roomTypeId)}&checkIn=${encodeURIComponent(from)}&checkOut=${encodeURIComponent(to)}">Book this room</a>`
    : '';

  element.innerHTML = `
    <div class="availability-result ${type}">
      <div class="d-flex gap-2 align-items-start">
        <span class="availability-icon" aria-hidden="true">${type === 'available' ? '✓' : type === 'warning' ? '!' : '✕'}</span>
        <div>
          <strong class="d-block mb-1">${escapeHtml(title)}</strong>
          <span>${escapeHtml(text)}</span>
          ${dates}
          ${bookingLink}
        </div>
      </div>
    </div>`;
}

function showPageMessage(text, type) {
  const message = document.getElementById('pageMessage');
  message.textContent = text;
  message.className = `alert alert-${type}`;
}

async function readError(response) {
  const text = await response.text();
  return text || `Request failed with status ${response.status}.`;
}

function formatDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value);
  return element.innerHTML;
}
