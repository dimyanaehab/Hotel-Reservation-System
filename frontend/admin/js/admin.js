// ==================== Admin Dashboard Global JavaScript ====================

// Sidebar Toggle for Mobile
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });
}

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
    if (window.innerWidth <= 992) {
        if (sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(event.target) && !mobileToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        }
    }
});

// Logout Handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
            // Clear auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('authToken');
            sessionStorage.removeItem('user');
            
            // Redirect to login
            window.location.href = '../login.html';
        }
    });
}

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

    // If not authenticated or not admin, redirect to login
    if (!token || user.role !== 'ADMIN') {
        window.location.href = '../login.html';
        return false;
    }
    
    return true;
}

// Update user profile in navbar
function updateUserProfile() {
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    
    if (user.name) {
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = user.name;
        }
        
        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=c5a572&color=fff`;
        }
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-EG', {
        style: 'currency',
        currency: 'EGP',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

// Format relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(dateString);
    }
}

// Get status badge HTML
function getStatusBadge(status) {
    const statusMap = {
        'PENDING': { class: 'status-pending', text: 'Pending' },
        'CONFIRMED': { class: 'status-confirmed', text: 'Confirmed' },
        'CANCELLED': { class: 'status-cancelled', text: 'Cancelled' },
        'REJECTED': { class: 'status-cancelled', text: 'Rejected' },
        'COMPLETED': { class: 'status-completed', text: 'Completed' }
    };
    
    const statusInfo = statusMap[status] || { class: 'status-pending', text: status };
    return `<span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>`;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${getToastIcon(type)}"></i>
        </div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Animate numbers
function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Initialize tooltips
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Add CSS for toast notifications
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-notification {
        background: white;
        border-radius: 10px;
        padding: 1rem 1.5rem;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        animation: slideInRight 0.3s ease;
        border-left: 4px solid;
    }
    
    .toast-success { border-left-color: #10b981; }
    .toast-error { border-left-color: #ef4444; }
    .toast-warning { border-left-color: #f59e0b; }
    .toast-info { border-left-color: #3b82f6; }
    
    .toast-icon {
        font-size: 1.5rem;
    }
    
    .toast-success .toast-icon { color: #10b981; }
    .toast-error .toast-icon { color: #ef4444; }
    .toast-warning .toast-icon { color: #f59e0b; }
    .toast-info .toast-icon { color: #3b82f6; }
    
    .toast-message {
        flex: 1;
        font-weight: 500;
        color: #1f2937;
    }
    
    .toast-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 0.5rem;
        font-size: 1rem;
    }
    
    .toast-close:hover {
        color: #1f2937;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(toastStyles);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Update user profile
    updateUserProfile();
    
    // Initialize tooltips
    initTooltips();

    updateNavigationBookingCount();
});

async function updateNavigationBookingCount() {
    const badge = document.getElementById('pending-bookings-count');
    if (!badge) return;

    try {
        const response = await fetch(`${window.hotelApi.baseUrl}/admin/bookings?status=Pending`, {
            headers: window.hotelApi.headers()
        });
        if (response.ok) badge.textContent = (await response.json()).length;
    } catch {
        badge.textContent = '—';
    }
}
