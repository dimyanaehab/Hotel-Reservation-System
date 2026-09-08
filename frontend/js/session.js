(function () {
  const tokenKey = 'authToken';
  const userKey = 'user';

  function readStored(key) {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  }

  function clearSession() {
    [localStorage, sessionStorage].forEach(storage => {
      storage.removeItem(tokenKey);
      storage.removeItem(userKey);
      storage.removeItem('userRole');
      storage.removeItem('latestBooking');
    });
  }

  function decodePayload(token) {
    try {
      const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    } catch {
      return null;
    }
  }

  function currentUser() {
    const token = readStored(tokenKey);
    if (!token) return null;

    const payload = decodePayload(token);
    if (!payload || (payload.exp && payload.exp * 1000 <= Date.now())) {
      clearSession();
      return null;
    }

    try {
      const user = JSON.parse(readStored(userKey) || 'null');
      return user ? { token, user } : null;
    } catch {
      clearSession();
      return null;
    }
  }

  function loginUrl() {
    const page = `${location.pathname.split('/').pop()}${location.search}`;
    return `login.html?returnUrl=${encodeURIComponent(page)}`;
  }

  function renderNavigation(session) {
    const header = document.querySelector('.site-header');
    const nav = header?.querySelector('.main-nav');
    const actions = header?.querySelector('.header-actions');
    if (header && nav && actions && !header.querySelector('.mobile-nav-toggle')) {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'mobile-nav-toggle';
      toggle.setAttribute('aria-label', 'Open navigation');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
      actions.appendChild(toggle);
      const closeNav = () => {
        header.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      };
      toggle.addEventListener('click', event => {
        event.stopPropagation();
        const open = header.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? '×' : '☰';
      });
      nav.addEventListener('click', closeNav);
      document.addEventListener('keydown', event => event.key === 'Escape' && closeNav());
      document.addEventListener('click', event => !header.contains(event.target) && closeNav());
    }

    document.querySelectorAll('.host-link').forEach(link => {
      link.textContent = session ? 'My Bookings' : 'Sign in';
      link.href = session ? 'my-bookings.html' : loginUrl();
    });

    document.querySelectorAll('[data-auth-only]').forEach(element => {
      element.hidden = !session;
    });

    document.querySelectorAll('.profile-button').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        if (!session) {
          location.href = loginUrl();
          return;
        }

        let menu = document.querySelector('.account-menu');
        if (!menu) {
          menu = document.createElement('div');
          menu.className = 'account-menu';
          const adminLink = session.user.role === 'ADMIN'
            ? '<a href="admin/dashboard.html">Admin dashboard</a>'
            : '';
          menu.innerHTML = `
            <div class="account-menu-user"><strong></strong><small></small></div>
            <a href="my-bookings.html">My bookings</a>
            ${adminLink}
            <button type="button" data-session-logout>Sign out</button>`;
          menu.querySelector('strong').textContent = session.user.name || 'Account';
          menu.querySelector('small').textContent = session.user.email || '';
          document.querySelector('.site-header').appendChild(menu);
          menu.querySelector('[data-session-logout]').addEventListener('click', () => {
            clearSession();
            location.href = 'login.html';
          });
        }
        menu.classList.toggle('open');
      });
    });

    document.addEventListener('click', () => {
      document.querySelector('.account-menu')?.classList.remove('open');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const session = currentUser();
    if (document.body.dataset.authRequired === 'true' && !session) {
      location.replace(loginUrl());
      return;
    }
    renderNavigation(session);
  });

  window.hotelSession = { current: currentUser, clear: clearSession };
})();
