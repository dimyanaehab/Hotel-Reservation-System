# Admin Dashboard - LuxeStay Hotel & Resort

## Overview
A modern, responsive admin dashboard for managing the hotel reservation system with a luxury gold/navy theme.

## Features

### 📊 Dashboard Overview
- **4 Summary Cards**: Total Hotels, Total Bookings, Pending Bookings, Total Users
- **Animated Statistics**: Numbers animate on page load
- **Interactive Charts**: 
  - Line chart for booking trends (7 days)
  - Doughnut chart for booking status distribution
- **Recent Bookings Table**: Latest reservations with action buttons
- **Recent Activity Feed**: Real-time activity updates
- **Pending Actions**: Tasks requiring admin attention

### 🎨 Design Features
- **Luxury Theme**: Gold (#c5a572) and Navy (#0a1128) color scheme
- **Responsive Sidebar**: Collapsible on mobile with smooth animations
- **Top Navigation Bar**: Search, notifications, and profile section
- **Clean Cards**: Modern card-based layout with hover effects
- **Status Badges**: Color-coded booking statuses
- **Toast Notifications**: Elegant success/error messages

### 📱 Responsive Design
- **Desktop**: Full sidebar with expanded content
- **Tablet**: Responsive grid adjustments
- **Mobile**: Collapsible sidebar, optimized layout

## File Structure

```
admin/
├── dashboard.html          # Main dashboard page
├── css/
│   └── admin.css          # Dashboard styles
├── js/
│   ├── admin.js           # Global admin functions
│   └── dashboard.js       # Dashboard-specific logic
└── README.md              # This file
```

## Technologies Used

- **HTML5**: Semantic markup
- **Bootstrap 5.3**: Responsive grid and components
- **Font Awesome 6.4**: Icons
- **Chart.js**: Data visualization
- **Google Fonts**: Playfair Display + Lato
- **Vanilla JavaScript**: No jQuery required

## Dummy Data

The dashboard uses temporary dummy data for demonstration:
- 12 Hotels
- 348 Total Bookings
- 8 Pending Bookings
- 1,248 Users
- 5 Recent bookings with various statuses
- Activity feed with timestamps
- Pending action items

## Key Components

### 1. Sidebar Navigation
```html
- Dashboard (active)
- Hotels (with count badge)
- Rooms (with count badge)
- Bookings (with warning badge)
- Users
- Reviews
- Settings
- View Website
- Logout
```

### 2. Stats Cards
- Animated number counters
- Trend indicators (increase/decrease)
- Icon-based visual indicators
- Hover effects

### 3. Recent Bookings Table
- Sortable columns
- Status badges (Pending, Confirmed, Cancelled, Completed)
- Action buttons (Confirm, Reject, View)
- Responsive table with horizontal scroll

### 4. Activity Feed
- Timeline-style layout
- Relative timestamps ("5 minutes ago")
- Icon-based activity types
- Scrollable list

### 5. Charts
- **Booking Statistics**: Line chart showing weekly trends
- **Status Distribution**: Doughnut chart with legend

## Functions

### Global Functions (admin.js)
- `checkAuth()` - Verify admin authentication
- `updateUserProfile()` - Update navbar profile info
- `formatCurrency()` - Format prices as USD
- `formatDate()` - Format dates consistently
- `formatRelativeTime()` - Show relative timestamps
- `getStatusBadge()` - Generate status HTML
- `showToast()` - Display notifications
- `animateNumber()` - Animate statistics

### Dashboard Functions (dashboard.js)
- `loadStatistics()` - Load and animate stats
- `loadRecentBookings()` - Populate bookings table
- `loadRecentActivity()` - Load activity feed
- `loadPendingActions()` - Load pending tasks
- `initCharts()` - Initialize Chart.js charts
- `confirmBooking()` - Approve a booking
- `rejectBooking()` - Reject a booking
- `viewBooking()` - Navigate to booking details

## Usage

1. **Access Dashboard**: Navigate to `/admin/dashboard.html`
2. **Authentication**: Requires admin login (checks localStorage/sessionStorage)
3. **Sidebar**: Click menu items to navigate (links are placeholders)
4. **Mobile**: Click hamburger icon to toggle sidebar
5. **Actions**: Click action buttons on bookings to confirm/reject

## Color Palette

```css
--gold-primary: #c5a572
--gold-dark: #a88c5a
--gold-light: #d4b890
--navy-dark: #0a1128
--navy-medium: #1c2541
--navy-light: #3a506b
--success: #10b981
--warning: #f59e0b
--danger: #ef4444
--info: #3b82f6
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Connect to backend API
- Real-time updates with WebSocket
- Advanced filtering and sorting
- Export data to CSV/PDF
- More detailed analytics
- User role management
- Email notification system

## Notes

- All data is currently dummy/static
- Backend integration ready (update API endpoints)
- Charts use Chart.js library
- Authentication check redirects to login page
- Fully responsive for all screen sizes
