const guestTrigger = document.querySelector('#guests');
const guestMenu = document.querySelector('#guest-menu');
const toast = document.querySelector('#toast');
const hotelList = document.querySelector('#hotel-list');
const apiBaseUrl = window.hotelApi.baseUrl;

document.addEventListener('DOMContentLoaded', () => {
  loadHotels();
  document.querySelector('#searchForm').addEventListener('submit', handleSearch);
});

function updateGuestLabel() {
  const adults = Number(document.querySelector('#adults').textContent);
  const children = Number(document.querySelector('#children').textContent);
  const total = adults + children;
  guestTrigger.innerHTML = `${total} guest${total === 1 ? '' : 's'} <span>⌄</span>`;
}

guestTrigger.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = guestMenu.classList.toggle('open');
  guestMenu.setAttribute('aria-hidden', String(!isOpen));
});

guestMenu.addEventListener('click', (event) => {
  event.stopPropagation();
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const target = document.querySelector(`#${button.dataset.target}`);
  const currentValue = Number(target.textContent);
  const minimum = button.dataset.target === 'adults' ? 1 : 0;
  target.textContent = Math.max(minimum, button.dataset.action === 'plus' ? currentValue + 1 : currentValue - 1);
  updateGuestLabel();
});

document.addEventListener('click', () => {
  guestMenu.classList.remove('open');
  guestMenu.setAttribute('aria-hidden', 'true');
});

async function loadHotels(city) {
  hotelList.innerHTML = '<p class="text-center" role="status">Loading hotels...</p>';

  const url = new URL(`${apiBaseUrl}/hotels`);
  if (city) {
    url.searchParams.set('city', city);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(await window.hotelApi.errorMessage(response, 'Could not load hotels.'));
    }

    const hotels = await response.json();
    renderHotels(hotels);
  } catch (error) {
    hotelList.innerHTML = `<div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Could not load hotels.')}</div>`;
  }
}

function renderHotels(hotels) {
  if (!hotels.length) {
    hotelList.innerHTML = '<p class="text-center text-secondary" role="status">No hotels found.</p>';
    return;
  }

  hotelList.innerHTML = hotels.map((hotel, index) => createHotelCard(hotel, index)).join('');
  hotelList.querySelectorAll('.save-button').forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.toggle('saved');
      button.textContent = button.classList.contains('saved') ? '♥' : '♡';
    });
  });
}

function createHotelCard(hotel, index) {
  const imageClass = `image-${['one', 'two', 'three', 'four'][index % 4]}`;
  const stars = Math.max(0, Math.min(5, Number(hotel.stars) || 0));
  const starDisplay = '★'.repeat(stars) + '☆'.repeat(5 - stars);
  const name = escapeHtml(hotel.name || 'Hotel');
  const city = escapeHtml(hotel.city || 'Location unavailable');
  const thumbnail = hotel.thumbnailUrl
    ? ` style="background-image:url('${escapeAttribute(hotel.thumbnailUrl)}')"`
    : '';

  return `
    <article class="stay-card${index === 0 ? ' featured-card' : ''}" role="listitem">
      <div class="card-image ${imageClass}"${thumbnail}>
        <button class="save-button" type="button" aria-label="Save ${name} to wishlist">♡</button>
      </div>
      <div class="card-body">
        <p class="card-location">${city}</p>
        <h3 class="card-name">${name}</h3>
        <div class="card-meta">
          <div class="card-score">
            <span class="score-badge" aria-label="${stars} stars">${stars || '—'}</span>
            <div>
              <span class="score-label">${stars ? 'Guest rating' : 'New stay'}</span>
              <span class="score-count"></span>
            </div>
          </div>
          <div class="card-pricing">
            <div class="card-price">See room rates <small>/ night</small></div>
            <div class="card-free-cancel">✓ Free cancellation</div>
          </div>
        </div>
        <div class="card-stars" aria-label="${stars} stars">${starDisplay}</div>
      </div>
    </article>`;
}

function handleSearch(event) {
  event.preventDefault();
  const destination = document.querySelector('#destination').value.trim();
  loadHotels(destination);
  document.querySelector('#stays').scrollIntoView({ behavior: 'smooth' });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#096;');
}
