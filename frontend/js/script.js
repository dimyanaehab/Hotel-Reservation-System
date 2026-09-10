const guestTrigger = document.querySelector('#guests');
const guestMenu = document.querySelector('#guest-menu');
const toast = document.querySelector('#toast');
const hotelList = document.querySelector('#hotel-list');
const destinationList = document.querySelector('#destination-list');
const apiBaseUrl = window.hotelApi.baseUrl;
const checkInInput = document.querySelector('#check-in');
const checkOutInput = document.querySelector('#check-out');

document.addEventListener('DOMContentLoaded', () => {
  const queryCity = new URLSearchParams(window.location.search).get('city')?.trim() || '';
  loadHotels({ city: queryCity }, !queryCity);
  if (queryCity) {
    document.querySelector('#destination').value = queryCity;
    loadDestinations();
  }
  document.querySelector('#searchForm').addEventListener('submit', handleSearch);
  const today = new Date().toISOString().split('T')[0];
  checkInInput.min = today;
  checkOutInput.min = today;
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

async function loadHotels({ city = '', checkIn = '', checkOut = '', guests = null } = {}, updateDestinations = false) {
  hotelList.innerHTML = '<p class="text-center" role="status">Loading hotels...</p>';

  const url = new URL(`${apiBaseUrl}/hotels`);
  if (city) {
    url.searchParams.set('city', city);
  }
  if (checkIn) {
    url.searchParams.set('checkIn', checkIn);
  }
  if (checkOut) {
    url.searchParams.set('checkOut', checkOut);
  }
  if (guests) {
    url.searchParams.set('guests', guests);
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(await window.hotelApi.errorMessage(response, 'Could not load hotels.'));
    }

    const hotels = await response.json();
    if (updateDestinations) {
      renderDestinations(hotels);
    }
    renderHotels(hotels);
  } catch (error) {
    hotelList.innerHTML = `<div class="alert alert-danger" role="alert">${escapeHtml(error.message || 'Could not load hotels.')}</div>`;
  }
}

async function loadDestinations() {
  try {
    const response = await fetch(`${apiBaseUrl}/hotels`);
    if (!response.ok) {
      throw new Error(await window.hotelApi.errorMessage(response, 'Could not load destinations.'));
    }

    renderDestinations(await response.json());
  } catch (error) {
    destinationList.innerHTML = `<p class="text-center text-secondary" role="status">${escapeHtml(error.message || 'Could not load destinations.')}</p>`;
  }
}

function renderDestinations(hotels) {
  const destinations = hotels.reduce((counts, hotel) => {
    const city = String(hotel.city || '').trim();
    if (city) {
      counts[city] = (counts[city] || 0) + 1;
    }
    return counts;
  }, {});

  const topDestinations = Object.entries(destinations)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 6)
    .map(([city]) => city);

  if (!topDestinations.length) {
    destinationList.innerHTML = '<p class="text-center text-secondary" role="status">No destinations found.</p>';
    return;
  }

  destinationList.innerHTML = topDestinations.map((city, index) => {
    const image = destinationImages[city.toLowerCase()] || destinationImages.default;
    const safeCity = escapeHtml(city);
    return `
      <a class="dest-tile" href="index.html?city=${encodeURIComponent(city)}" aria-label="View stays in ${safeCity}">
        <img src="${escapeAttribute(image)}" alt="${safeCity}" loading="lazy">
        <div class="dest-tile-label">${safeCity}</div>
      </a>`;
  }).join('');
}

const destinationImages = {
  riyadh: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=800&q=85',
  dubai: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=85',
  'abu dhabi': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=85',
  jeddah: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=85',
  cairo: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=85',
  muscat: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=800&q=85',
  istanbul: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800&q=85',
  london: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=85',
  paris: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?w=800&q=85',
  rome: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85',
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=85',
  default: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=800&q=85'
};

function renderHotels(hotels) {
  if (!hotels.length) {
    hotelList.innerHTML = '<p class="text-center text-secondary" role="status">No hotels found.</p>';
    return;
  }

  hotelList.innerHTML = hotels.map((hotel, index) => createHotelCard(hotel, index)).join('');
  hotelList.querySelectorAll('.stay-card').forEach((card) => {
    const navigateToHotel = () => {
      window.location.href = `hotel-details.html?hotelId=${encodeURIComponent(card.dataset.hotelId)}`;
    };
    card.addEventListener('click', (event) => {
      if (!event.target.closest('.save-button')) {
        navigateToHotel();
      }
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        navigateToHotel();
      }
    });
  });
  hotelList.querySelectorAll('.save-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
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
    <article class="stay-card${index === 0 ? ' featured-card' : ''}" role="link" tabindex="0" data-hotel-id="${hotel.id}">
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
  const checkIn = checkInInput.value;
  const checkOut = checkOutInput.value;
  const guests = Number(document.querySelector('#adults').textContent) +
    Number(document.querySelector('#children').textContent);

  if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
    showSearchError('Please select both check-in and check-out dates.');
    return;
  }

  if (checkIn && checkOut && checkIn >= checkOut) {
    showSearchError('Check-out must be after check-in.');
    return;
  }

  loadHotels({ city: destination, checkIn, checkOut, guests });
  document.querySelector('#stays').scrollIntoView({ behavior: 'smooth' });
}

function showSearchError(message) {
  hotelList.innerHTML = `<div class="alert alert-warning" role="alert">${escapeHtml(message)}</div>`;
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
