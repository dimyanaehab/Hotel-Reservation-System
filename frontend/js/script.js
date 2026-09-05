const guestTrigger = document.querySelector('#guests');
const guestMenu = document.querySelector('#guest-menu');
const toast = document.querySelector('#toast');
const profileButton = document.querySelector('.profile-button');

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

document.querySelectorAll('.save-button').forEach((button) => {
  button.addEventListener('click', () => {
    button.classList.toggle('saved');
    button.textContent = button.classList.contains('saved') ? '♥' : '♡';
  });
});

document.querySelector('#search-button').addEventListener('click', () => {
  const destination = document.querySelector('#destination').value.trim();
  toast.textContent = destination ? `Searching stays in ${destination}...` : 'Where would you like to go?';
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 2600);
});

profileButton.addEventListener('click', () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  window.location.href = token ? 'my-bookings.html' : 'login.html';
});
