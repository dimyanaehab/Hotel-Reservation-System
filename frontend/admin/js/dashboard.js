const dashboardApiUrl = window.hotelApi.baseUrl;
const dashboardHeaders = window.hotelApi.headers("Admin");
let dashboardBookings = [];
let bookingChart;
let statusChart;

document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {
    try {
        const response = await fetch(`${dashboardApiUrl}/admin/bookings`, { headers: dashboardHeaders });
        if (!response.ok) throw new Error(await window.hotelApi.errorMessage(response, "Could not load dashboard data."));
        dashboardBookings = await response.json();
        renderStatistics();
        renderRecentBookings();
        renderActivity();
        renderPendingActions();
        renderCharts();
    } catch (error) {
        const container = document.querySelector(".dashboard-container");
        const alert = document.createElement("div");
        alert.className = "alert alert-danger";
        alert.textContent = error.message;
        container.prepend(alert);
    }
}

function renderStatistics() {
    const pending = dashboardBookings.filter(item => item.status.toLowerCase() === "pending");
    document.getElementById("totalHotels").textContent = new Set(dashboardBookings.map(item => item.hotelId)).size;
    document.getElementById("totalBookings").textContent = dashboardBookings.length;
    document.getElementById("pendingBookings").textContent = pending.length;
    document.getElementById("totalUsers").textContent = new Set(dashboardBookings.map(item => item.userId)).size;
    document.querySelectorAll(".stats-sample-label").forEach(label => label.textContent = "Live");
    const trends = document.querySelectorAll(".stats-trend");
    ["Current", "All time", "Action needed", "Guests"].forEach((text, index) => {
        if (trends[index]) trends[index].textContent = text;
    });
    const badge = document.querySelector('a[href="pending-bookings.html"] .nav-badge');
    if (badge) badge.textContent = pending.length;
}

function renderRecentBookings() {
    const table = document.getElementById("recentBookingsTable");
    const bookings = dashboardBookings.slice(0, 5);
    table.innerHTML = bookings.length ? bookings.map(booking => `<tr>
        <td>#${booking.id}</td>
        <td><strong>${escapeDashboardHtml(booking.userName)}</strong><br><small>${escapeDashboardHtml(booking.userEmail)}</small></td>
        <td>${escapeDashboardHtml(booking.hotelName)}</td>
        <td>${formatDate(booking.checkIn)}</td>
        <td>${formatDate(booking.checkOut)}</td>
        <td>${formatCurrency(booking.totalPrice)}</td>
        <td>${getStatusBadge(booking.status.toUpperCase())}</td>
        <td>${booking.status.toLowerCase() === "pending" ? `
            <button class="action-btn confirm" onclick="changeDashboardBooking(${booking.id}, 'confirm')">✓</button>
            <button class="action-btn reject" onclick="changeDashboardBooking(${booking.id}, 'reject')">✕</button>` : ""}</td>
    </tr>`).join("") : '<tr><td colspan="8" class="text-center py-4">No bookings yet.</td></tr>';
}

function renderActivity() {
    const list = document.getElementById("activityList");
    const recent = dashboardBookings.slice(0, 5);
    list.innerHTML = recent.length ? recent.map(booking => `<div class="activity-item">
        <div class="activity-icon">◔</div>
        <div class="activity-content">
            <div class="activity-title">Booking #${booking.id} is ${escapeDashboardHtml(booking.status.toLowerCase())}</div>
            <div class="activity-time">${formatRelativeTime(booking.createdAt)}</div>
        </div>
    </div>`).join("") : '<p class="text-secondary">No recent activity.</p>';
}

function renderPendingActions() {
    const list = document.getElementById("pendingList");
    const pending = dashboardBookings.filter(item => item.status.toLowerCase() === "pending").slice(0, 4);
    list.innerHTML = pending.length ? pending.map(booking => `<div class="pending-item">
        <div class="pending-icon">⏱</div>
        <div class="pending-content">
            <div class="pending-title">Booking #${booking.id} · ${escapeDashboardHtml(booking.hotelName)}</div>
            <div class="pending-time">${formatRelativeTime(booking.createdAt)}</div>
            <div class="pending-actions">
                <button class="btn-approve" onclick="changeDashboardBooking(${booking.id}, 'confirm')">✓ Approve</button>
                <button class="btn-reject" onclick="changeDashboardBooking(${booking.id}, 'reject')">Reject</button>
            </div>
        </div>
    </div>`).join("") : '<p class="text-secondary">No pending actions.</p>';
}

function renderCharts() {
    const statuses = ["Confirmed", "Pending", "Cancelled", "Completed", "Rejected"];
    const counts = statuses.map(status => dashboardBookings.filter(item => item.status === status).length);
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date;
    });
    const dailyCounts = days.map(day => dashboardBookings.filter(item => {
        const date = new Date(item.createdAt);
        return date.toDateString() === day.toDateString();
    }).length);

    bookingChart?.destroy();
    statusChart?.destroy();
    bookingChart = new Chart(document.getElementById("bookingChart"), {
        type: "line",
        data: { labels: days.map(day => day.toLocaleDateString(undefined, { weekday: "short" })), datasets: [{ data: dailyCounts, borderColor: "#40554d", backgroundColor: "rgba(64,85,77,.08)", fill: true, tension: .4 }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
    statusChart = new Chart(document.getElementById("statusChart"), {
        type: "doughnut",
        data: { labels: statuses, datasets: [{ data: counts, backgroundColor: ["#40554d", "#e6a44b", "#c5625a", "#6e7873", "#8b5c85"], borderWidth: 0 }] },
        options: { plugins: { legend: { position: "bottom" } } }
    });
}

async function changeDashboardBooking(id, action) {
    if (!confirm(`${action === "confirm" ? "Confirm" : "Reject"} booking #${id}?`)) return;
    try {
        const response = await fetch(`${dashboardApiUrl}/admin/bookings/${id}/${action}`, { method: "PATCH", headers: dashboardHeaders });
        if (!response.ok) throw new Error(await window.hotelApi.errorMessage(response, "The booking could not be updated."));
        showToast(`Booking #${id} updated successfully.`, "success");
        await loadDashboard();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function escapeDashboardHtml(value) {
    const element = document.createElement("div");
    element.textContent = String(value);
    return element.innerHTML;
}
