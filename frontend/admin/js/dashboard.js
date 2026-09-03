// ==================== Dashboard Specific JavaScript ====================

// Dummy data for dashboard
const dummyData = {
    stats: {
        totalHotels: 12,
        totalBookings: 348,
        pendingBookings: 8,
        totalUsers: 1248
    },
    recentBookings: [
        {
            id: 'BK-2345',
            guestName: 'John Smith',
            hotel: 'Grand Plaza Hotel',
            checkIn: '2026-09-05',
            checkOut: '2026-09-10',
            amount: 1250,
            status: 'PENDING'
        },
        {
            id: 'BK-2344',
            guestName: 'Sarah Johnson',
            hotel: 'Seaside Resort',
            checkIn: '2026-09-08',
            checkOut: '2026-09-12',
            amount: 980,
            status: 'CONFIRMED'
        },
        {
            id: 'BK-2343',
            guestName: 'Michael Brown',
            hotel: 'Mountain View Lodge',
            checkIn: '2026-09-07',
            checkOut: '2026-09-09',
            amount: 600,
            status: 'CONFIRMED'
        },
        {
            id: 'BK-2342',
            guestName: 'Emily Davis',
            hotel: 'City Center Hotel',
            checkIn: '2026-09-10',
            checkOut: '2026-09-15',
            amount: 1750,
            status: 'PENDING'
        },
        {
            id: 'BK-2341',
            guestName: 'David Wilson',
            hotel: 'Beach Paradise Resort',
            checkIn: '2026-09-06',
            checkOut: '2026-09-08',
            amount: 450,
            status: 'CANCELLED'
        }
    ],
    recentActivity: [
        {
            icon: 'user-plus',
            title: 'New user registered',
            description: 'Alice Cooper joined the platform',
            time: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
            icon: 'calendar-check',
            title: 'New booking created',
            description: 'John Smith booked Grand Plaza Hotel',
            time: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
            icon: 'hotel',
            title: 'Hotel added',
            description: 'Luxury Beach Resort added by admin',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            icon: 'star',
            title: 'New review posted',
            description: 'Sarah Johnson rated Seaside Resort 5 stars',
            time: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        {
            icon: 'times-circle',
            title: 'Booking cancelled',
            description: 'David Wilson cancelled reservation',
            time: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }
    ],
    pendingActions: [
        {
            icon: 'clock',
            title: 'Booking awaiting confirmation',
            description: 'BK-2345 - Grand Plaza Hotel',
            time: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
            icon: 'exclamation-circle',
            title: 'Review pending moderation',
            description: '2 reviews waiting for approval',
            time: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
            icon: 'clock',
            title: 'Booking awaiting confirmation',
            description: 'BK-2344 - City Center Hotel',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
    ]
};

// Load statistics
function loadStatistics() {
    const stats = dummyData.stats;
    
    // Animate numbers
    animateNumber(document.getElementById('totalHotels'), stats.totalHotels);
    animateNumber(document.getElementById('totalBookings'), stats.totalBookings);
    animateNumber(document.getElementById('pendingBookings'), stats.pendingBookings);
    animateNumber(document.getElementById('totalUsers'), stats.totalUsers);
}

// Load recent bookings table
function loadRecentBookings() {
    const tableBody = document.getElementById('recentBookingsTable');
    
    const html = dummyData.recentBookings.map(booking => `
        <tr>
            <td><strong>${booking.id}</strong></td>
            <td>${booking.guestName}</td>
            <td>${booking.hotel}</td>
            <td>${formatDate(booking.checkIn)}</td>
            <td>${formatDate(booking.checkOut)}</td>
            <td><strong>${formatCurrency(booking.amount)}</strong></td>
            <td>${getStatusBadge(booking.status)}</td>
            <td>
                ${booking.status === 'PENDING' ? `
                    <button class="action-btn" onclick="confirmBooking('${booking.id}')" title="Confirm">✓</button>
                    <button class="action-btn" onclick="rejectBooking('${booking.id}')" title="Reject">✗</button>
                ` : ''}
                <button class="action-btn" onclick="viewBooking('${booking.id}')" title="View">→</button>
            </td>
        </tr>
    `).join('');
    
    tableBody.innerHTML = html;
}

// Load recent activity
function loadRecentActivity() {
    const activityList = document.getElementById('activityList');
    
    const iconMap = {
        'user-plus': '◉',
        'calendar-check': '◔',
        'hotel': '⌂',
        'star': '★',
        'times-circle': '⊗'
    };
    
    const html = dummyData.recentActivity.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                ${iconMap[activity.icon] || '◈'}
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${formatRelativeTime(activity.time)}</div>
            </div>
        </div>
    `).join('');
    
    activityList.innerHTML = html;
}

// Load pending actions
function loadPendingActions() {
    const pendingList = document.getElementById('pendingList');
    
    const iconMap = {
        'clock': '⏱',
        'exclamation-circle': '⚠'
    };
    
    const html = dummyData.pendingActions.map(action => `
        <div class="pending-item">
            <div class="pending-icon">
                ${iconMap[action.icon] || '◔'}
            </div>
            <div class="pending-content">
                <div class="pending-title">${action.title}</div>
                <div class="pending-time">${formatRelativeTime(action.time)}</div>
                <div class="pending-actions">
                    <button class="btn-approve">✓ Approve</button>
                    <button class="btn-reject">View</button>
                </div>
            </div>
        </div>
    `).join('');
    
    pendingList.innerHTML = html;
}

// Initialize charts
function initCharts() {
    // Booking Statistics Chart
    const bookingCtx = document.getElementById('bookingChart');
    if (bookingCtx) {
        new Chart(bookingCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Bookings',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#40554d',
                    backgroundColor: 'rgba(64, 85, 77, 0.08)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#40554d',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#d8ddd7'
                        },
                        ticks: {
                            color: '#6e7873'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6e7873'
                        }
                    }
                }
            }
        });
    }
    
    // Status Chart
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
                datasets: [{
                    data: [72, 15, 8, 5],
                    backgroundColor: [
                        '#40554d',
                        '#e6a44b',
                        '#c5625a',
                        '#6e7873'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Action handlers
function confirmBooking(bookingId) {
    if (confirm(`Confirm booking ${bookingId}?`)) {
        showToast(`Booking ${bookingId} confirmed successfully!`, 'success');
        // Reload the table
        setTimeout(() => {
            loadRecentBookings();
        }, 1000);
    }
}

function rejectBooking(bookingId) {
    if (confirm(`Reject booking ${bookingId}?`)) {
        showToast(`Booking ${bookingId} rejected!`, 'warning');
        // Reload the table
        setTimeout(() => {
            loadRecentBookings();
        }, 1000);
    }
}

function viewBooking(bookingId) {
    showToast(`Opening booking ${bookingId}...`, 'info');
    // Navigate to booking details
    setTimeout(() => {
        window.location.href = `booking-details.html?id=${bookingId}`;
    }, 500);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadStatistics();
    loadRecentBookings();
    loadRecentActivity();
    loadPendingActions();
    initCharts();
});
