const bookingsContainer = document.getElementById('pending-bookings-container');
const emptyState = document.getElementById('no-pending-bookings');
const visibleCount = document.getElementById('visible-bookings-count');
const statusFilter = document.getElementById('bookingStatusFilter');
const searchInput = document.getElementById('adminBookingSearch');
const messageBox = document.getElementById('admin-bookings-message');
const apiUrl = window.hotelApi.baseUrl;
const authHeaders = window.hotelApi.headers();
let bookings = [];

statusFilter.addEventListener('change', renderBookings);
searchInput.addEventListener('input', renderBookings);
document.addEventListener('DOMContentLoaded', loadBookings);

async function loadBookings() {
  bookingsContainer.innerHTML = '<div class="col-12 text-center text-secondary py-5"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading bookings...</div>';

  try {
    const response = await fetch(`${apiUrl}/admin/bookings`, { headers: authHeaders });
    if (!response.ok) throw new Error(await window.hotelApi.errorMessage(response, 'Bookings could not be loaded.'));
    bookings = await response.json();
    updatePendingBadges();
    renderBookings();
  } catch (error) {
    bookings = [];
    bookingsContainer.innerHTML = '';
    emptyState.classList.remove('d-none');
    showMessage(error.message, 'danger');
  }
}

function renderBookings() {
  const status = statusFilter.value;
  const term = searchInput.value.trim().toLowerCase();
  const filtered = bookings.filter(booking => {
    const statusMatches = status === 'all' || booking.status.toLowerCase() === status;
    const searchable = [booking.id, booking.userName, booking.userEmail, booking.hotelName, booking.roomTypeName, booking.status]
      .join(' ').toLowerCase();
    return statusMatches && (!term || searchable.includes(term));
  });

  visibleCount.textContent = filtered.length;
  emptyState.classList.toggle('d-none', filtered.length > 0);
  bookingsContainer.classList.toggle('d-none', filtered.length === 0);
  bookingsContainer.innerHTML = filtered.map(createBookingCard).join('');
}

function createBookingCard(booking) {
  return `<div class="col-md-6 col-xl-4">
    <article class="admin-booking-card">
      <div class="admin-booking-card-header">
        <span class="booking-reference">Booking #${booking.id}</span>
        ${getStatusBadge(booking.status.toUpperCase())}
      </div>
      <div class="admin-booking-card-body">
        <h2>${escapeHtml(booking.hotelName || 'Hotel')}</h2>
        <p class="room-name">${escapeHtml(booking.roomTypeName || 'Room')}</p>
        <p class="booking-guest"><strong>${escapeHtml(booking.userName)}</strong><br><span>${escapeHtml(booking.userEmail)}</span></p>
        <div class="admin-booking-details">
          <div class="admin-booking-detail"><span>Check-in</span><strong>${formatBookingDate(booking.checkIn)}</strong></div>
          <div class="admin-booking-detail"><span>Check-out</span><strong>${formatBookingDate(booking.checkOut)}</strong></div>
          <div class="admin-booking-detail"><span>Nights</span><strong>${booking.nights}</strong></div>
          <div class="admin-booking-detail"><span>Guests</span><strong>${booking.numberOfGuests}</strong></div>
        </div>
        <div class="admin-booking-total"><span>Total price</span><strong>${formatCurrency(booking.totalPrice)}</strong></div>
        ${renderActions(booking)}
      </div>
    </article>
  </div>`;
}

function renderActions(booking) {
  const status = booking.status.toLowerCase();
  const buttons = [];
  if (status === 'pending') {
    buttons.push(actionButton(booking.id, 'confirm', 'Confirm', 'confirm-button'));
    buttons.push(actionButton(booking.id, 'reject', 'Reject', 'reject-button'));
    buttons.push(actionButton(booking.id, 'cancel', 'Cancel', 'reject-button'));
  } else if (status === 'confirmed') {
    if (new Date(`${booking.checkOut}T23:59:59`) <= new Date()) {
      buttons.push(actionButton(booking.id, 'complete', 'Complete stay', 'confirm-button'));
    }
    buttons.push(actionButton(booking.id, 'cancel', 'Cancel', 'reject-button'));
  }

  return buttons.length ? `<div class="admin-booking-actions">${buttons.join('')}</div>` : '';
}

function actionButton(id, action, label, className) {
  return `<button type="button" class="btn ${className}" onclick="changeBooking(${id}, '${action}')">${label}</button>`;
}

async function changeBooking(id, action) {
  const labels = { confirm: 'confirm', reject: 'reject', cancel: 'cancel', complete: 'complete' };
  if (!window.confirm(`Are you sure you want to ${labels[action]} booking #${id}?`)) return;

  try {
    const response = await fetch(`${apiUrl}/admin/bookings/${id}/${action}`, {
      method: 'PATCH',
      headers: authHeaders
    });
    if (!response.ok) throw new Error(await window.hotelApi.errorMessage(response, 'The booking could not be updated.'));
    showMessage(`Booking #${id} was updated successfully.`, 'success');
    await loadBookings();
  } catch (error) {
    showMessage(error.message, 'danger');
  }
}

function updatePendingBadges() {
  const pending = bookings.filter(booking => booking.status.toLowerCase() === 'pending').length;
  document.querySelectorAll('#pending-bookings-count').forEach(element => { element.textContent = pending; });
}

function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className = `admin-alert alert-${type}`;
  messageBox.classList.remove('d-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatBookingDate(value) {
  if (!value) return 'Not available';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value ?? '');
  return element.innerHTML;
}
