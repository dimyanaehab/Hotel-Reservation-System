(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || 'null');
    } catch {
        clearSession();
    }

    if (token && isExpired(token)) {
        clearSession();
        user = null;
    }

    if (document.body.dataset.authRequired === 'true' && (!token || !user)) {
        const returnUrl = `${location.pathname.split('/').pop()}${location.search}`;
        location.replace(`login.html?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
    }

    const signInLink = document.querySelector('.host-link[href="login.html"]');
    if (signInLink) {
        signInLink.textContent = user ? 'My Bookings' : 'Sign in';
        signInLink.href = user ? 'my-bookings.html' : 'login.html';
    }

    document.querySelectorAll('.profile-button').forEach(button => {
        if (!user) {
            button.setAttribute('aria-label', 'Sign in');
            button.addEventListener('click', () => { location.href = 'login.html'; });
            return;
        }

        const initials = user.name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0].toUpperCase())
            .join('');
        const icon = button.querySelector('.profile-icon');
        if (icon) icon.textContent = initials || 'U';
        button.setAttribute('aria-label', `Open account menu for ${user.name}`);
        button.setAttribute('aria-expanded', 'false');

        const menu = document.createElement('div');
        menu.className = 'account-menu';
        menu.hidden = true;
        menu.innerHTML = `
            <div class="account-menu-user">
                <strong>${escapeHtml(user.name)}</strong>
                <span>${escapeHtml(user.email)}</span>
            </div>
            ${user.role === 'ADMIN' ? '<a href="admin/dashboard.html">Admin dashboard</a>' : ''}
            <a href="my-bookings.html">My bookings</a>
            <a href="reviews.html">Reviews</a>
            <button type="button" data-session-logout>Sign out</button>`;
        button.parentElement.appendChild(menu);

        button.addEventListener('click', event => {
            event.stopPropagation();
            menu.hidden = !menu.hidden;
            button.setAttribute('aria-expanded', String(!menu.hidden));
        });
        menu.addEventListener('click', event => event.stopPropagation());
        menu.querySelector('[data-session-logout]').addEventListener('click', () => {
            clearSession();
            location.href = 'login.html';
        });
        document.addEventListener('click', () => {
            menu.hidden = true;
            button.setAttribute('aria-expanded', 'false');
        });
    });

    function clearSession() {
        for (const storage of [localStorage, sessionStorage]) {
            storage.removeItem('authToken');
            storage.removeItem('user');
        }
    }

    function isExpired(jwt) {
        try {
            const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            return !payload.exp || payload.exp * 1000 <= Date.now();
        } catch {
            return true;
        }
    }

    function escapeHtml(value) {
        const element = document.createElement('div');
        element.textContent = String(value ?? '');
        return element.innerHTML;
    }
})();
