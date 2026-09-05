const API_BASE = window.hotelApi.baseUrl;
const adminHeaders = window.hotelApi.headers();
const query = new URLSearchParams(window.location.search);
const hotelId = Number(query.get('hotelId')) || 1;
let roomTypes = [];
let roomIdToDelete = null;
let messageTimer = null;

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('hotelIdLabel').textContent = hotelId;
  document.getElementById('roomForm').addEventListener('submit', saveRoomType);
  document.getElementById('cancelEditButton').addEventListener('click', resetRoomForm);
  document.getElementById('inventoryForm').addEventListener('submit', saveInventory);
  document.getElementById('confirmDeleteButton').addEventListener('click', confirmDeleteRoom);
  loadRoomTypes();
});

async function loadRoomTypes() {
  document.getElementById('roomTableBody').innerHTML = `
    <tr><td colspan="6" class="text-center text-secondary py-4">
      <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Loading rooms...
    </td></tr>`;

  try {
    const response = await fetch(`${API_BASE}/hotels/${hotelId}/room-types`);
    if (!response.ok) {
      throw new Error(await readError(response));
    }

    roomTypes = await response.json();
  } catch (error) {
    roomTypes = [];
    showMessage(error.message || 'Room types could not be loaded.', 'danger', false);
  }

  renderRoomTypes();
  fillInventoryRoomTypes();
}

function renderRoomTypes() {
  const tableBody = document.getElementById('roomTableBody');

  if (roomTypes.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-4">No room types found.</td></tr>';
    return;
  }

  tableBody.innerHTML = roomTypes.map(room => `
    <tr>
      <td>${room.id}</td>
      <td>${escapeHtml(room.name)}</td>
      <td>${escapeHtml(room.bedType)}</td>
      <td>${room.capacity}</td>
      <td>${new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(room.basePrice)}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" type="button" onclick="startEdit(${room.id})">Edit</button>
        <button class="btn btn-sm btn-outline-danger" type="button" onclick="deleteRoomType(${room.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function fillInventoryRoomTypes() {
  const select = document.getElementById('inventoryRoomType');
  select.innerHTML = '<option value="">Select a room type</option>' + roomTypes.map(room =>
    `<option value="${room.id}">${escapeHtml(room.name)}</option>`
  ).join('');
}

async function saveRoomType(event) {
  event.preventDefault();

  const form = event.currentTarget;
  if (!validateRoomForm(form)) {
    return;
  }

  const id = Number(document.getElementById('roomTypeId').value);
  const dto = {
    name: document.getElementById('roomName').value.trim(),
    bedType: document.getElementById('bedType').value.trim(),
    capacity: Number(document.getElementById('capacity').value),
    basePrice: Number(document.getElementById('basePrice').value),
    description: document.getElementById('description').value.trim() || null
  };

  const isEditing = id > 0;
  const saveButton = document.getElementById('saveRoomButton');
  const originalButtonText = saveButton.innerHTML;
  const url = isEditing
    ? `${API_BASE}/admin/room-types/${id}`
    : `${API_BASE}/admin/hotels/${hotelId}/room-types`;

  try {
    setButtonLoading(saveButton, isEditing ? 'Updating...' : 'Saving...');
    const response = await fetch(url, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { ...adminHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    showMessage(
      isEditing ? '✓ Room updated successfully.' : '✓ Room added successfully.',
      'success'
    );
    resetRoomForm();
    await loadRoomTypes();
  } catch (error) {
    showMessage(error.message || 'The room could not be saved.', 'danger');
  } finally {
    restoreButton(saveButton, originalButtonText);
  }
}

function startEdit(id) {
  const room = roomTypes.find(item => item.id === id);
  if (!room) return;

  document.getElementById('roomTypeId').value = room.id;
  document.getElementById('roomName').value = room.name;
  document.getElementById('bedType').value = room.bedType;
  document.getElementById('capacity').value = room.capacity;
  document.getElementById('basePrice').value = room.basePrice;
  document.getElementById('description').value = room.description || '';
  document.getElementById('roomFormTitle').textContent = 'Edit Room Type';
  document.getElementById('saveRoomButton').textContent = 'Update Room';
  document.getElementById('cancelEditButton').classList.remove('d-none');
  document.getElementById('roomForm').scrollIntoView({ behavior: 'smooth' });
}

function resetRoomForm() {
  const form = document.getElementById('roomForm');
  form.reset();
  form.classList.remove('was-validated');
  form.querySelectorAll('.is-invalid').forEach(field => field.classList.remove('is-invalid'));
  document.getElementById('roomTypeId').value = '';
  document.getElementById('roomFormTitle').textContent = 'Add Room Type';
  document.getElementById('saveRoomButton').textContent = 'Add Room';
  document.getElementById('cancelEditButton').classList.add('d-none');
}

function deleteRoomType(id) {
  const room = roomTypes.find(item => item.id === id);
  if (!room) return;

  roomIdToDelete = id;
  document.getElementById('deleteRoomName').textContent = room.name;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteRoomModal')).show();
}

async function confirmDeleteRoom() {
  const id = roomIdToDelete;
  if (!id) return;

  const deleteButton = document.getElementById('confirmDeleteButton');
  const originalButtonText = deleteButton.innerHTML;
  setButtonLoading(deleteButton, 'Deleting...');

  try {
    const response = await fetch(`${API_BASE}/admin/room-types/${id}`, {
      method: 'DELETE',
      headers: adminHeaders
    });
    if (!response.ok) {
      if (response.status === 409) {
        throw new Error('delete-conflict');
      }
      throw new Error('delete-failed');
    }

    closeDeleteModal();
    showMessage('✓ Room deleted successfully.', 'success');
    await loadRoomTypes();
  } catch (error) {
    closeDeleteModal();
    if (error.message === 'delete-conflict') {
      showMessage(
        'This room cannot be deleted because it already has related inventory or booking records.',
        'danger'
      );
    } else {
      showMessage('Room could not be deleted. Please try again.', 'danger');
    }
  } finally {
    restoreButton(deleteButton, originalButtonText);
    roomIdToDelete = null;
  }
}

async function saveInventory(event) {
  event.preventDefault();

  const form = event.currentTarget;
  if (!validateInventoryForm(form)) {
    return;
  }

  const dto = {
    roomTypeId: Number(document.getElementById('inventoryRoomType').value),
    date: document.getElementById('inventoryDate').value,
    totalRooms: Number(document.getElementById('totalRooms').value),
    soldRooms: Number(document.getElementById('soldRooms').value)
  };

  if (dto.soldRooms > dto.totalRooms) {
    document.getElementById('soldRooms').classList.add('is-invalid');
    showInventoryResult('Sold rooms cannot be greater than total rooms.', 'error');
    return;
  }

  const saveButton = document.getElementById('saveInventoryButton');
  const originalButtonText = saveButton.innerHTML;

  try {
    setButtonLoading(saveButton, 'Saving...');
    const response = await fetch(`${API_BASE}/admin/room-inventory`, {
      method: 'PUT',
      headers: { ...adminHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(dto)
    });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const result = await response.json();
    const roomWord = result.availableRooms === 1 ? 'room' : 'rooms';
    showMessage('✓ Inventory updated successfully.', 'success');
    showInventoryResult(`${result.availableRooms} ${roomWord} available after saving.`, 'success');
  } catch (error) {
    showInventoryResult(error.message || 'Inventory could not be saved.', 'error');
  } finally {
    restoreButton(saveButton, originalButtonText);
  }
}

function showMessage(text, type, autoHide = true) {
  const message = document.getElementById('adminMessage');
  window.clearTimeout(messageTimer);
  message.textContent = text;
  message.className = `alert alert-${type}`;

  if (autoHide) {
    messageTimer = window.setTimeout(() => {
      message.classList.add('d-none');
    }, 3500);
  }
}

function showInventoryResult(text, type) {
  const result = document.getElementById('inventoryResult');
  result.textContent = text;
  result.className = `inventory-result mt-3 ${type}`;
}

async function readError(response) {
  const text = await response.text();
  if (!text) return `Request failed with status ${response.status}.`;

  try {
    const problem = JSON.parse(text);
    return problem.title || problem.detail || text;
  } catch {
    return text;
  }
}

function validateRoomForm(form) {
  form.classList.add('was-validated');
  return form.checkValidity();
}

function validateInventoryForm(form) {
  document.getElementById('soldRooms').classList.remove('is-invalid');
  form.classList.add('was-validated');
  return form.checkValidity();
}

function setButtonLoading(button, text) {
  button.disabled = true;
  button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${text}`;
}

function restoreButton(button, html) {
  button.disabled = false;
  button.innerHTML = html;
}

function closeDeleteModal() {
  const modalElement = document.getElementById('deleteRoomModal');
  bootstrap.Modal.getOrCreateInstance(modalElement).hide();
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value);
  return element.innerHTML;
}
