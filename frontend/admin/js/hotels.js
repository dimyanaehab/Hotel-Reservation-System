// ==================== Hotels Management JavaScript ====================

// Dummy Hotels Data
let hotelsData = [
    {
        id: 1,
        name: 'Grand Plaza Hotel',
        city: 'New York',
        address: '123 Broadway Avenue',
        description: 'Luxury hotel in the heart of Manhattan with stunning city views and world-class amenities.',
        stars: 5,
        thumbnail_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600',
        rooms: 250,
        status: 'active',
        created_at: new Date('2024-01-15')
    },
    {
        id: 2,
        name: 'Seaside Resort & Spa',
        city: 'Miami',
        address: '456 Ocean Drive',
        description: 'Beautiful beachfront resort with private beach access, spa facilities, and oceanview rooms.',
        stars: 5,
        thumbnail_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
        rooms: 180,
        status: 'active',
        created_at: new Date('2024-02-10')
    },
    {
        id: 3,
        name: 'Mountain View Lodge',
        city: 'Denver',
        address: '789 Alpine Way',
        description: 'Cozy mountain retreat with breathtaking views, perfect for nature lovers and adventure seekers.',
        stars: 4,
        thumbnail_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600',
        rooms: 120,
        status: 'active',
        created_at: new Date('2024-03-05')
    },
    {
        id: 4,
        name: 'City Center Hotel',
        city: 'Chicago',
        address: '321 Michigan Avenue',
        description: 'Modern downtown hotel perfect for business travelers with excellent conference facilities.',
        stars: 4,
        thumbnail_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
        rooms: 200,
        status: 'active',
        created_at: new Date('2024-04-20')
    },
    {
        id: 5,
        name: 'Beach Paradise Resort',
        city: 'Los Angeles',
        address: '555 Pacific Coast Highway',
        description: 'Tropical paradise with infinity pool, private cabanas, and world-class dining options.',
        stars: 5,
        thumbnail_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
        rooms: 300,
        status: 'active',
        created_at: new Date('2024-05-12')
    },
    {
        id: 6,
        name: 'Historic Downtown Inn',
        city: 'Boston',
        address: '888 Commonwealth Ave',
        description: 'Charming historic hotel with modern amenities and traditional New England hospitality.',
        stars: 4,
        thumbnail_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
        rooms: 90,
        status: 'active',
        created_at: new Date('2024-06-08')
    },
    {
        id: 7,
        name: 'Desert Oasis Resort',
        city: 'Phoenix',
        address: '999 Camelback Road',
        description: 'Luxury desert resort with golf course, multiple pools, and southwestern cuisine.',
        stars: 5,
        thumbnail_url: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600',
        rooms: 220,
        status: 'inactive',
        created_at: new Date('2024-07-15')
    },
    {
        id: 8,
        name: 'Lakefront Lodge',
        city: 'Seattle',
        address: '777 Waterfront Way',
        description: 'Peaceful lakeside retreat with water activities, fishing, and stunning sunset views.',
        stars: 4,
        thumbnail_url: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600',
        rooms: 150,
        status: 'active',
        created_at: new Date('2024-08-22')
    }
];

// Current view state
let currentView = 'grid'; // 'grid' or 'table'
let filteredHotels = [...hotelsData];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadHotels();
    initializeSearch();
    initializeForms();
    updateHotelCount();
});

// Load and display hotels
function loadHotels() {
    if (filteredHotels.length === 0) {
        showEmptyState();
        return;
    }

    hideEmptyState();

    if (currentView === 'grid') {
        loadGridView();
    } else {
        loadTableView();
    }
}

// Load Grid View
function loadGridView() {
    const grid = document.getElementById('hotelsGrid');
    const table = document.getElementById('hotelsTable');

    grid.style.display = 'grid';
    table.style.display = 'none';

    grid.innerHTML = filteredHotels.map(hotel => `
        <div class="hotel-card">
            <img src="${hotel.thumbnail_url}" alt="${hotel.name}" class="hotel-image">
            <div class="hotel-content">
                <div class="hotel-header">
                    <div>
                        <h3 class="hotel-name">${hotel.name}</h3>
                        <div class="hotel-location">📍 ${hotel.city}</div>
                    </div>
                    <div class="hotel-rating">
                        <div class="hotel-stars">${'★'.repeat(hotel.stars)}${'☆'.repeat(5-hotel.stars)}</div>
                    </div>
                </div>
                <p class="hotel-description">${truncateText(hotel.description, 100)}</p>
                <div class="hotel-footer">
                    <div class="hotel-rooms">${hotel.rooms} <span>rooms</span></div>
                    <span class="hotel-status ${hotel.status}">
                        ${hotel.status}
                    </span>
                </div>
                <div class="hotel-actions">
                    <button class="hotel-action-btn" onclick="editHotel(${hotel.id})">
                        ✎ Edit
                    </button>
                    <button class="hotel-action-btn delete" onclick="deleteHotel(${hotel.id})">
                        × Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load Table View
function loadTableView() {
    const grid = document.getElementById('hotelsGrid');
    const table = document.getElementById('hotelsTable');
    const tbody = document.getElementById('hotelsTableBody');

    grid.style.display = 'none';
    table.style.display = 'block';

    tbody.innerHTML = filteredHotels.map(hotel => `
        <tr>
            <td>
                <img src="${hotel.thumbnail_url}" alt="${hotel.name}" class="hotel-table-image">
            </td>
            <td>
                <div class="hotel-table-name">${hotel.name}</div>
                <div class="hotel-table-address">${hotel.address}</div>
            </td>
            <td>${hotel.city}</td>
            <td>${'★'.repeat(hotel.stars)}${'☆'.repeat(5-hotel.stars)}</td>
            <td>${hotel.rooms} rooms</td>
            <td>
                <span class="status-badge status-${hotel.status}">
                    ${hotel.status}
                </span>
            </td>
            <td>
                <div class="hotel-table-actions">
                    <button class="table-action-btn" onclick="editHotel(${hotel.id})" title="Edit">
                        ✎ Edit
                    </button>
                    <button class="table-action-btn delete" onclick="deleteHotel(${hotel.id})" title="Delete">
                        × Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Toggle between grid and table view
function toggleView() {
    currentView = currentView === 'grid' ? 'table' : 'grid';

    const icon = document.getElementById('viewIcon');
    const text = document.getElementById('viewText');

    if (currentView === 'table') {
        icon.textContent = '▦';
        text.textContent = 'Grid view';
    } else {
        icon.textContent = '☰';
        text.textContent = 'Table view';
    }

    loadHotels();
}

// Remove generateStars function as we're using Unicode stars directly

// Truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('hotelSearch');
    
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        
        filteredHotels = hotelsData.filter(hotel => 
            hotel.name.toLowerCase().includes(searchTerm) || 
            hotel.city.toLowerCase().includes(searchTerm)
        );
        
        loadHotels();
    });
}

// View hotel details
function viewHotel(hotelId) {
    const hotel = hotelsData.find(h => h.id === hotelId);
    if (hotel) {
        showToast(`Viewing details for ${hotel.name}`, 'info');
        // In a real app, redirect to hotel details page
    }
}

// Edit hotel
function editHotel(hotelId) {
    const hotel = hotelsData.find(h => h.id === hotelId);
    if (!hotel) return;

    // Populate form
    document.getElementById('editHotelId').value = hotel.id;
    document.getElementById('editHotelName').value = hotel.name;
    document.getElementById('editHotelCity').value = hotel.city;
    document.getElementById('editHotelAddress').value = hotel.address;
    document.getElementById('editHotelStars').value = hotel.stars;
    document.getElementById('editHotelDescription').value = hotel.description;
    document.getElementById('editHotelImage').value = hotel.thumbnail_url;
    document.getElementById('editHotelRooms').value = hotel.rooms;
    document.getElementById('editHotelStatus').value = hotel.status;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editHotelModal'));
    modal.show();
}

// Delete hotel
function deleteHotel(hotelId) {
    const hotel = hotelsData.find(h => h.id === hotelId);
    if (!hotel) return;

    // Set hotel name in confirmation modal
    document.getElementById('deleteHotelName').textContent = hotel.name;

    // Show delete modal
    const modal = new bootstrap.Modal(document.getElementById('deleteHotelModal'));
    modal.show();

    // Set up confirm button
    document.getElementById('confirmDeleteBtn').onclick = function() {
        // Remove hotel from array
        hotelsData = hotelsData.filter(h => h.id !== hotelId);
        filteredHotels = filteredHotels.filter(h => h.id !== hotelId);

        // Close modal
        modal.hide();

        // Reload view
        loadHotels();
        updateHotelCount();

        // Show success message
        showToast(`Hotel "${hotel.name}" has been deleted successfully`, 'success');
    };
}

// Initialize forms
function initializeForms() {
    // Add Hotel Form
    const addForm = document.getElementById('addHotelForm');
    addForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newHotel = {
            id: hotelsData.length > 0 ? Math.max(...hotelsData.map(h => h.id)) + 1 : 1,
            name: document.getElementById('addHotelName').value,
            city: document.getElementById('addHotelCity').value,
            address: document.getElementById('addHotelAddress').value,
            stars: parseInt(document.getElementById('addHotelStars').value),
            description: document.getElementById('addHotelDescription').value,
            thumbnail_url: document.getElementById('addHotelImage').value,
            rooms: parseInt(document.getElementById('addHotelRooms').value),
            status: document.getElementById('addHotelStatus').value,
            created_at: new Date()
        };

        // Add to array
        hotelsData.unshift(newHotel);
        filteredHotels = [...hotelsData];

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addHotelModal'));
        modal.hide();

        // Reset form
        addForm.reset();

        // Reload view
        loadHotels();
        updateHotelCount();

        // Show success message
        showToast(`Hotel "${newHotel.name}" has been added successfully`, 'success');
    });

    // Edit Hotel Form
    const editForm = document.getElementById('editHotelForm');
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const hotelId = parseInt(document.getElementById('editHotelId').value);
        const hotelIndex = hotelsData.findIndex(h => h.id === hotelId);

        if (hotelIndex !== -1) {
            hotelsData[hotelIndex] = {
                ...hotelsData[hotelIndex],
                name: document.getElementById('editHotelName').value,
                city: document.getElementById('editHotelCity').value,
                address: document.getElementById('editHotelAddress').value,
                stars: parseInt(document.getElementById('editHotelStars').value),
                description: document.getElementById('editHotelDescription').value,
                thumbnail_url: document.getElementById('editHotelImage').value,
                rooms: parseInt(document.getElementById('editHotelRooms').value),
                status: document.getElementById('editHotelStatus').value
            };

            filteredHotels = [...hotelsData];

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editHotelModal'));
            modal.hide();

            // Reload view
            loadHotels();

            // Show success message
            showToast(`Hotel "${hotelsData[hotelIndex].name}" has been updated successfully`, 'success');
        }
    });
}

// Update hotel count in sidebar
function updateHotelCount() {
    document.getElementById('hotelCount').textContent = hotelsData.length;
}

// Show empty state
function showEmptyState() {
    document.getElementById('hotelsGrid').style.display = 'none';
    document.getElementById('hotelsTable').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
}

// Hide empty state
function hideEmptyState() {
    document.getElementById('emptyState').style.display = 'none';
}

// Add CSS for hotel cards
const hotelStyles = document.createElement('style');
hotelStyles.textContent = `
    .hotel-card {
        background: white;
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        transition: all 0.3s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .hotel-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .hotel-image {
        position: relative;
        height: 200px;
        overflow: hidden;
    }

    .hotel-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
    }

    .hotel-card:hover .hotel-image img {
        transform: scale(1.05);
    }

    .hotel-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        padding: 0.4rem 0.8rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .badge-active {
        background: rgba(16, 185, 129, 0.9);
        color: white;
    }

    .badge-inactive {
        background: rgba(107, 114, 128, 0.9);
        color: white;
    }

    .hotel-card-body {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .hotel-header {
        margin-bottom: 0.8rem;
    }

    .hotel-name {
        font-family: 'Playfair Display', serif;
        font-size: 1.3rem;
        font-weight: 700;
        color: var(--navy-dark);
        margin-bottom: 0.5rem;
    }

    .hotel-rating {
        display: flex;
        gap: 3px;
    }

    .text-gold {
        color: var(--gold-primary);
    }

    .hotel-location {
        color: #6b7280;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }

    .hotel-location i {
        color: var(--gold-primary);
        margin-right: 5px;
    }

    .hotel-description {
        color: #4b5563;
        font-size: 0.9rem;
        line-height: 1.6;
        margin-bottom: 1rem;
        flex: 1;
    }

    .hotel-meta {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
    }

    .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #6b7280;
        font-size: 0.85rem;
    }

    .meta-item i {
        color: var(--gold-primary);
    }

    .hotel-actions {
        display: flex;
        gap: 0.5rem;
    }

    .hotel-actions .btn {
        flex: 1;
        font-size: 0.85rem;
    }

    .action-bar {
        background: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .search-bar {
        position: relative;
    }

    .search-bar i {
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
    }

    .search-bar .form-control {
        padding-left: 45px;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        height: 50px;
    }

    .search-bar .form-control:focus {
        border-color: var(--gold-primary);
        box-shadow: 0 0 0 0.2rem rgba(197, 165, 114, 0.15);
    }

    .action-buttons {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
    }

    .status-active {
        background: rgba(16, 185, 129, 0.1);
        color: #059669;
    }

    .status-inactive {
        background: rgba(107, 114, 128, 0.1);
        color: #4b5563;
    }

    .empty-state {
        text-align: center;
        padding: 5rem 2rem;
        background: white;
        border-radius: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .empty-icon {
        width: 120px;
        height: 120px;
        margin: 0 auto 2rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(197, 165, 114, 0.1);
        border-radius: 50%;
        color: var(--gold-primary);
        font-size: 4rem;
    }

    .empty-state h3 {
        font-family: 'Playfair Display', serif;
        font-size: 2rem;
        font-weight: 700;
        color: var(--navy-dark);
        margin-bottom: 1rem;
    }

    .empty-state p {
        color: #6b7280;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
        .action-buttons {
            flex-direction: column;
            width: 100%;
        }

        .action-buttons .btn {
            width: 100%;
        }

        .hotel-actions {
            flex-wrap: wrap;
        }
    }
`;
document.head.appendChild(hotelStyles);
