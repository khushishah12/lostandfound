/**
 * app.js - Campus Lost-and-Found Portal Frontend Logic
 *
 * Technologies:
 * Vanilla JavaScript: https://developer.mozilla.org/en-US/docs/Web/JavaScript
 * DOM Manipulation: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
 * Bootstrap 5: https://getbootstrap.com/docs/5.3/getting-started/introduction/
 * Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * HTML5 Drag and Drop API: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
 * Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
 * FileReader API: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *
 * Zero external JavaScript frameworks.
 */

// =====================================================================
// APPLICATION STATE
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
// =====================================================================

const state = {
  items: [],
  categories: [],
  stats: {},
  currentView: 'catalog', // 'catalog', 'kanban', or 'admin'
  filters: {
    q: '',
    category: 'all',
    location: 'all',
    type: 'all'
  },
  deleteTargetId: null
};

// =====================================================================
// CAMPUS LANDMARK COORDINATES
// Geolocation API: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
// Latitude and longitude: https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates
// =====================================================================

const CAMPUS_LANDMARKS = [
  { name: 'Central Campus Library', lat: 19.076800, lng: 72.878100 },
  { name: 'Science Complex B', lat: 19.076090, lng: 72.877426 },
  { name: 'Engineering Hall', lat: 19.077200, lng: 72.879000 },
  { name: 'Student Union & Cafeteria', lat: 19.075400, lng: 72.876500 },
  { name: 'Indoor Sports Complex & Gym', lat: 19.078100, lng: 72.876900 },
  { name: 'Hostel Block C Lawn', lat: 19.074500, lng: 72.875200 },
  { name: 'Campus Transit Center - Bus Stop A', lat: 19.073900, lng: 72.874100 }
];

// =====================================================================
// INITIALIZE WHEN DOM IS LOADED
// DOMContentLoaded: https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
// addEventListener: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
// Date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
  initCategories();
  initStats();
  initItems();
  initDragAndDropListeners();
  initUploadDropZone();

  // Set default form date to today.
  // Date.toISOString(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
  const formDate = document.getElementById('formDate');

  if (formDate) {
    formDate.value = new Date().toISOString().split('T')[0];
  }

  // Handle the delete confirmation button.
  const btnConfirmDelete = document.getElementById('btnConfirmDelete');

  if (btnConfirmDelete) {
    btnConfirmDelete.addEventListener('click', executeDelete);
  }
});

// =====================================================================
// 1. DATA INITIALIZATION & API FETCH CALLS
// Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// Async functions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
// JSON: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
// =====================================================================

// Load categories from the backend.
async function initCategories() {
  try {
    const res = await fetch('/api/categories');
    const json = await res.json();

    if (json.success && json.data) {
      state.categories = json.data;
      populateCategoryDropdowns(json.data);
    }
  } catch (err) {
    // Console API: https://developer.mozilla.org/en-US/docs/Web/API/console
    console.error('Failed to load categories:', err);
  }
}

// Populate category dropdowns using DOM elements.
function populateCategoryDropdowns(categories) {
  const filterSelect = document.getElementById('categoryFilter');
  const modalSelect = document.getElementById('formCategory');

  // innerHTML: https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML
  // createElement: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
  // appendChild: https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild

  if (filterSelect) {
    filterSelect.innerHTML = '<option value="all">All Categories</option>';

    // Array.forEach(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;

      // textContent is safer than inserting untrusted text through innerHTML.
      // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
      opt.textContent = cat.name;

      filterSelect.appendChild(opt);
    });
  }

  if (modalSelect) {
    modalSelect.innerHTML =
      '<option value="" disabled selected>Choose category...</option>';

    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      modalSelect.appendChild(opt);
    });
  }
}

// Load dashboard statistics from the backend.
async function initStats() {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();

    if (json.success && json.data) {
      state.stats = json.data;
      updateStatsUI(json.data);
    }
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

// Update the statistics displayed on the page.
function updateStatsUI(stats) {
  const elTotal = document.getElementById('statTotal');
  const elLost = document.getElementById('statLost');
  const elFound = document.getElementById('statFound');
  const elResolved = document.getElementById('statResolved');

  if (elTotal) elTotal.textContent = stats.total || 0;
  if (elLost) elLost.textContent = stats.lost || 0;
  if (elFound) elFound.textContent = stats.found || 0;
  if (elResolved) elResolved.textContent = stats.resolved || 0;
}

// Load items and pass search filters to the API.
// URLSearchParams: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
async function initItems() {
  try {
    const params = new URLSearchParams();

    if (state.filters.q) params.append('q', state.filters.q);

    if (state.filters.category !== 'all') {
      params.append('category', state.filters.category);
    }

    if (state.filters.type !== 'all') {
      params.append('item_type', state.filters.type);
    }

    const res = await fetch(`/api/items?${params.toString()}`);
    const json = await res.json();

    if (json.success && json.data) {
      state.items = json.data;
      renderActiveView();
    }
  } catch (err) {
    console.error('Failed to load items:', err);
    showToast(
      'Failed to load items from server. Check your connection.',
      'danger'
    );
  }
}

// =====================================================================
// 2. VIEW SWITCHING & RENDERING LOGIC
// DOM selection: https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById
// Array.filter(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
// =====================================================================

// Switch between catalog, Kanban, and admin views.
function switchView(viewName) {
  state.currentView = viewName || 'catalog';
  renderActiveView();
}

// Render the currently selected view.
function renderActiveView() {
  const filtered = applyClientFilters(state.items);

  // Note: this function currently renders only the catalog.
  // For view switching, route to renderKanbanBoard() or renderAdminTable()
  // according to state.currentView.
  renderCatalogGrid(filtered);
}

// Apply filters that are handled on the client.
function applyClientFilters(items) {
  return items.filter(item => {
    // String.toLowerCase(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase
    // String.includes(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
    if (state.filters.location !== 'all') {
      if (
        !item.location_name.toLowerCase()
          .includes(state.filters.location.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });
}

// Read the current filter controls and reload the items.
function handleFilterChange() {
  const searchInput = document.getElementById('searchInput');
  const catSelect = document.getElementById('categoryFilter');
  const locSelect = document.getElementById('locationFilter');
  const typeRadio = document.querySelector(
    'input[name="typeRadio"]:checked'
  );

  state.filters.q = searchInput ? searchInput.value.trim() : '';
  state.filters.category = catSelect ? catSelect.value : 'all';
  state.filters.location = locSelect ? locSelect.value : 'all';
  state.filters.type = typeRadio ? typeRadio.value : 'all';

  initItems();
}

// Clear the search text.
function clearSearch() {
  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    searchInput.value = '';
    handleFilterChange();
  }
}

// Reset all filters to their defaults.
function resetFilters() {
  const searchInput = document.getElementById('searchInput');
  const catSelect = document.getElementById('categoryFilter');
  const locSelect = document.getElementById('locationFilter');
  const typeAll = document.getElementById('typeAll');

  if (searchInput) searchInput.value = '';
  if (catSelect) catSelect.value = 'all';
  if (locSelect) locSelect.value = 'all';
  if (typeAll) typeAll.checked = true;

  state.filters = {
    q: '',
    category: 'all',
    location: 'all',
    type: 'all'
  };

  initItems();
}

// ---------------------------------------------------------------------
// 2A. CATALOG GRID WITH DRAGGABLE CARDS
// CSS classList: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
// Template literals: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
// ---------------------------------------------------------------------

function renderCatalogGrid(items) {
  const grid = document.getElementById('catalogGrid');
  const emptyState = document.getElementById('catalogEmptyState');
  const countBadge = document.getElementById('catalogCountBadge');

  if (!grid) return;

  grid.innerHTML = '';

  if (countBadge) {
    countBadge.textContent =
      `${items.length} ${items.length === 1 ? 'Item' : 'Items'}`;
  }

  if (items.length === 0) {
    if (emptyState) emptyState.classList.remove('d-none');
    return;
  }

  if (emptyState) emptyState.classList.add('d-none');

  items.forEach(item => {
    const isLost = item.item_type === 'lost';
    const typeBadgeClass = isLost ? 'badge-lost' : 'badge-found';
    const typeLabel = isLost ? 'LOST' : 'FOUND';

    let statusBadgeClass = 'badge-pending';
    let statusLabel = 'Reported';

    if (item.status === 'pending_claim') {
      statusBadgeClass = 'badge-pending';
      statusLabel = 'Pending Claim';
    } else if (item.status === 'resolved') {
      statusBadgeClass = 'badge-resolved';
      statusLabel = 'Resolved';
    }

    const formattedDate = formatDate(item.date_occurred);
    const categoryIcon = getCategoryIcon(item.category);

    // Create HTML elements dynamically.
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement
    const card = document.createElement('div');
    card.className = 'col';

    // HTML Drag and Drop: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', item.id);
    card.style.cursor = 'grab';

    // escapeHTML() protects interpolated text from HTML markup injection.
    // Reference: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS
    card.innerHTML = `
      <div class="item-card h-100">
        <div class="item-card-img-wrapper">
          ${item.image_url
            ? `<img src="${escapeHTML(resolveImageUrl(item.image_url))}"
                alt="${escapeHTML(item.title)}"
                loading="lazy"
                onerror="this.onerror=null; this.parentElement.innerHTML='<i class=\\'bi bi-image item-card-placeholder-icon\\'></i>';">`
            : `<i class="bi bi-image item-card-placeholder-icon"></i>`
          }
          <span class="badge-overlay-type ${typeBadgeClass}">${typeLabel}</span>
          <span class="badge-overlay-status ${statusBadgeClass}">${statusLabel}</span>
        </div>

        <div class="card-body p-3 d-flex flex-column">
          <div class="text-muted small mb-1">
            <span>${escapeHTML(item.category)}</span>
          </div>

          <h6 class="card-title fw-bold text-dark text-truncate mb-2"
              title="${escapeHTML(item.title)}">
            ${escapeHTML(item.title)}
          </h6>

          <div class="pt-2 border-top mt-auto">
            <div class="small text-secondary text-truncate mb-2">
              <i class="bi bi-geo-alt-fill text-danger me-1"></i>
              ${escapeHTML(item.location_name)}
            </div>

            <div class="d-flex align-items-center justify-content-between pt-1">
              <span class="text-muted small" style="font-size: 0.72rem;">
                <i class="bi bi-calendar3 me-1"></i>${formattedDate}
              </span>

              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary btn-sm px-2 fw-semibold"
                        onclick="openItemDetails(${item.id})"
                        title="View Details">
                  Details
                </button>

                ${item.status !== 'resolved' ? `
                  <button class="btn btn-outline-success btn-sm px-2 fw-semibold"
                          onclick="quickResolveItem(${item.id})"
                          title="Mark as Resolved">
                    <i class="bi bi-check-lg"></i>
                  </button>
                ` : ''}

                <button class="btn btn-outline-danger btn-sm px-2 fw-semibold"
                        onclick="confirmDeleteItem(${item.id})"
                        title="Delete Item">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Native drag event references:
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dragstart_event
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dragend_event
    card.addEventListener('dragstart', function(e) {
      draggedCardElement = this;
      e.dataTransfer.setData('text/plain', item.id);
      e.dataTransfer.effectAllowed = 'move';
      this.classList.add('is-dragging');
    });

    card.addEventListener('dragend', function(e) {
      this.classList.remove('is-dragging');
      draggedCardElement = null;

      const dropZone = document.getElementById('dropResolutionZone');

      if (dropZone) dropZone.classList.remove('drag-active');
    });

    grid.appendChild(card);
  });
}

// ---------------------------------------------------------------------
// 2B. INTERACTIVE KANBAN STATUS BOARD
// Reference: https://getbootstrap.com/docs/5.3/components/card/
// Drag and Drop API: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
// ---------------------------------------------------------------------

function renderKanbanBoard(items) {
  const colReported = document.getElementById('kanbanColReported');
  const colPending = document.getElementById('kanbanColPending');
  const colResolved = document.getElementById('kanbanColResolved');

  const countReported = document.getElementById('countColReported');
  const countPending = document.getElementById('countColPending');
  const countResolved = document.getElementById('countColResolved');

  if (!colReported || !colPending || !colResolved) return;

  colReported.innerHTML = '';
  colPending.innerHTML = '';
  colResolved.innerHTML = '';

  const groups = {
    reported: [],
    pending_claim: [],
    resolved: []
  };

  items.forEach(item => {
    if (groups[item.status]) {
      groups[item.status].push(item);
    } else {
      groups.reported.push(item);
    }
  });

  if (countReported) countReported.textContent = groups.reported.length;
  if (countPending) countPending.textContent = groups.pending_claim.length;
  if (countResolved) countResolved.textContent = groups.resolved.length;

  renderKanbanCards(colReported, groups.reported);
  renderKanbanCards(colPending, groups.pending_claim);
  renderKanbanCards(colResolved, groups.resolved);
}

function renderKanbanCards(container, items) {
  if (items.length === 0) {
    container.innerHTML =
      `<div class="text-center text-muted small py-4 fst-italic">Drop items here</div>`;
    return;
  }

  items.forEach(item => {
    const isLost = item.item_type === 'lost';

    const typeBadge = isLost
      ? '<span class="badge badge-soft-lost text-uppercase">Lost</span>'
      : '<span class="badge badge-soft-found text-uppercase">Found</span>';

    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', item.id);
    card.setAttribute('id', `kanban-card-${item.id}`);

    card.innerHTML = `
      <div class="d-flex align-items-center justify-content-between mb-2">
        ${typeBadge}
        <span class="text-muted small">#${item.id}</span>
      </div>

      <div class="fw-bold text-dark text-truncate mb-1">
        ${escapeHTML(item.title)}
      </div>

      <div class="text-muted small text-truncate mb-2">
        <i class="bi bi-geo-alt text-danger me-1"></i>
        ${escapeHTML(item.location_name)}
      </div>

      <div class="d-flex align-items-center justify-content-between pt-2 border-top">
        <span class="text-muted small" style="font-size: 0.72rem;">
          ${formatDate(item.date_occurred)}
        </span>

        <button class="btn btn-link btn-sm p-0 text-decoration-none"
                onclick="openItemDetails(${item.id})">
          View <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    `;

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    container.appendChild(card);
  });
}

// ---------------------------------------------------------------------
// 2C. ADMINISTRATIVE MANAGEMENT TABLE
// Bootstrap tables: https://getbootstrap.com/docs/5.3/content/tables/
// mailto links: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a
// ---------------------------------------------------------------------

function renderAdminTable(items) {
  const tbody = document.getElementById('adminTableBody');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4 text-muted">
          No records match the current filters.
        </td>
      </tr>
    `;
    return;
  }

  items.forEach(item => {
    const isLost = item.item_type === 'lost';

    const typeBadge = isLost
      ? '<span class="badge badge-soft-lost">LOST</span>'
      : '<span class="badge badge-soft-found">FOUND</span>';

    let statusPill =
      '<span class="badge badge-soft-pending">Reported</span>';

    if (item.status === 'pending_claim') {
      statusPill =
        '<span class="badge badge-soft-pending">Pending Claim</span>';
    } else if (item.status === 'resolved') {
      statusPill =
        '<span class="badge badge-soft-resolved">Resolved</span>';
    }

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td class="ps-4">
        <div class="d-flex align-items-center gap-2">
          ${item.image_url
            ? `<img src="${escapeHTML(resolveImageUrl(item.image_url))}"
                class="rounded" width="40" height="40"
                style="object-fit: cover;"
                onerror="this.style.display='none'">`
            : `<div class="bg-light rounded p-2 text-muted">
                <i class="bi bi-box-seam"></i>
              </div>`
          }

          <div>
            <div class="fw-bold text-dark text-truncate"
                 style="max-width: 200px;">
              ${escapeHTML(item.title)}
            </div>
            <div class="text-muted small text-truncate"
                 style="max-width: 220px;">
              ${escapeHTML(item.description)}
            </div>
          </div>
        </div>
      </td>

      <td>${typeBadge}</td>
      <td><span class="small">${escapeHTML(item.category)}</span></td>

      <td>
        <div class="small fw-semibold text-truncate" style="max-width: 150px;">
          ${escapeHTML(item.location_name)}
        </div>
        <div class="text-muted small" style="font-size: 0.75rem;">
          ${formatDate(item.date_occurred)}
        </div>
      </td>

      <td>${statusPill}</td>

      <td>
        <div class="small fw-semibold">${escapeHTML(item.contact_name)}</div>
        <div class="text-muted small">
          <a href="mailto:${escapeHTML(item.contact_email)}"
             class="text-decoration-none">
            ${escapeHTML(item.contact_email)}
          </a>
        </div>
      </td>

      <td class="text-end pe-4">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary"
                  onclick="openItemDetails(${item.id})"
                  title="View Details">
            <i class="bi bi-eye"></i>
          </button>

          ${item.status !== 'resolved' ? `
            <button class="btn btn-outline-success"
                    onclick="quickResolveItem(${item.id})"
                    title="Mark as Resolved">
              <i class="bi bi-check-lg"></i>
            </button>
          ` : ''}

          <button class="btn btn-outline-danger"
                  onclick="confirmDeleteItem(${item.id})"
                  title="Delete Item">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// =====================================================================
// 3. NATIVE HTML5 DRAG-AND-DROP API
// Guide: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
// Google web.dev: https://web.dev/articles/drag-and-drop
// DataTransfer: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
// =====================================================================

let draggedCardElement = null;

function initDragAndDropListeners() {
  const dropZone = document.getElementById('dropResolutionZone');

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      // Prevent the default behavior to allow dropping.
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      dropZone.classList.add('drag-active');
    });

    dropZone.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-active');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-active');
    });

    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-active');

      const itemId = e.dataTransfer.getData('text/plain');

      if (itemId) {
        await quickResolveItem(parseInt(itemId, 10));
      }
    });
  }

  // querySelectorAll(): https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
  const containers = document.querySelectorAll('.kanban-card-container');

  containers.forEach(col => {
    col.addEventListener('dragover', handleDragOver);
    col.addEventListener('dragenter', handleDragEnter);
    col.addEventListener('dragleave', handleDragLeave);
    col.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(e) {
  draggedCardElement = this;

  const itemId = this.getAttribute('data-id');

  e.dataTransfer.setData('text/plain', itemId);
  e.dataTransfer.effectAllowed = 'move';

  // setTimeout(): https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
  setTimeout(() => {
    this.classList.add('is-dragging');
  }, 0);
}

function handleDragEnd(e) {
  this.classList.remove('is-dragging');
  draggedCardElement = null;

  document.querySelectorAll('.kanban-card-container')
    .forEach(c => c.classList.remove('drag-over'));
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

async function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');

  const itemId = e.dataTransfer.getData('text/plain');
  const targetStatus = this.getAttribute('data-status');

  if (!itemId || !targetStatus) return;

  const numericId = parseInt(itemId, 10);

  // Array.find(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  const item = state.items.find(i => i.id === numericId);

  if (item && item.status !== targetStatus) {
    // Save the old value so that the UI can roll back on API failure.
    const previousStatus = item.status;

    // Optimistic UI update.
    item.status = targetStatus;
    renderActiveView();

    try {
      const res = await fetch(`/api/items/${numericId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus })
      });

      const json = await res.json();

      if (json.success) {
        showToast(
          `Item #${numericId} transitioned to '${targetStatus}'.`,
          'success'
        );

        initStats();
      } else {
        throw new Error(json.error || 'Server error');
      }
    } catch (err) {
      console.error('Drag and drop status update failed:', err);

      // Roll back the optimistic change if the server request fails.
      item.status = previousStatus;
      renderActiveView();

      showToast(`Failed to update status: ${err.message}`, 'danger');
    }
  }
}

// =====================================================================
// 4. NATIVE GEOLOCATION API
// MDN: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
// getCurrentPosition(): https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
// GeolocationPosition: https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPosition
// =====================================================================

function detectCampusLocation() {
  const statusBox = document.getElementById('geoStatusBox');
  const statusText = document.getElementById('geoStatusText');
  const locationInput = document.getElementById('formLocation');
  const latInput = document.getElementById('formLat');
  const lngInput = document.getElementById('formLng');
  const btn = document.getElementById('btnDetectLocation');

  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'warning');
    return;
  }

  if (statusBox) statusBox.classList.remove('d-none');

  if (statusText) {
    statusText.innerHTML =
      '<span class="spinner-border spinner-border-sm me-1"></span> Requesting GPS location from browser...';
  }

  if (btn) btn.disabled = true;

  // Geolocation options:
  // https://developer.mozilla.org/en-US/docs/Web/API/PositionOptions
  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = Math.round(position.coords.accuracy);

      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;

      // Match the user's GPS coordinates to the nearest known landmark.
      const nearest = findNearestLandmark(lat, lng);

      if (locationInput) {
        locationInput.value =
          `${nearest.name} (Near GPS ±${accuracy}m)`;
      }

      if (statusText) {
        statusText.innerHTML = `
          <i class="bi bi-check-circle-fill text-success me-1"></i>
          Detected: <strong>${escapeHTML(nearest.name)}</strong>
          (${lat.toFixed(5)}, ${lng.toFixed(5)} ±${accuracy}m)
        `;
      }

      if (btn) btn.disabled = false;

      showToast(`Location tagged: ${nearest.name}`, 'info');
    },
    (error) => {
      if (btn) btn.disabled = false;

      let errorMsg = 'Unable to retrieve location.';

      // GeolocationPositionError:
      // https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg =
            'Location permission denied by user. Please enter campus building manually.';
          break;

        case error.POSITION_UNAVAILABLE:
          errorMsg =
            'Position unavailable. Please type your location manually.';
          break;

        case error.TIMEOUT:
          errorMsg =
            'Location request timed out. Please enter manually.';
          break;
      }

      if (statusText) {
        statusText.innerHTML =
          `<span class="text-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>${escapeHTML(errorMsg)}</span>`;
      }

      showToast(errorMsg, 'warning');
    },
    geoOptions
  );
}

// Find the closest landmark using an approximate coordinate distance.
function findNearestLandmark(lat, lng) {
  let closest = CAMPUS_LANDMARKS[0];
  let minDistance = Infinity;

  // Math.hypot(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/hypot
  CAMPUS_LANDMARKS.forEach(landmark => {
    const dist = Math.hypot(
      landmark.lat - lat,
      landmark.lng - lng
    );

    if (dist < minDistance) {
      minDistance = dist;
      closest = landmark;
    }
  });

  return closest;
}

function hideGeoBox() {
  const box = document.getElementById('geoStatusBox');

  if (box) box.classList.add('d-none');
}

// =====================================================================
// 5. HTML FILE API & FILEREADER IMAGE UPLOAD
// File API: https://developer.mozilla.org/en-US/docs/Web/API/File_API
// FileReader: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
// Data URLs: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
// =====================================================================

function initUploadDropZone() {
  const dropZone = document.getElementById('uploadDropZone');

  if (!dropZone) return;

  // Array.forEach(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('drag-active');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('drag-active');
    });
  });

  dropZone.addEventListener('drop', e => {
    // DataTransfer.files:
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/files
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      processSelectedImageFile(files[0]);
    }
  });
}

function handleImageFileSelect(e) {
  const file = e.target.files[0];

  if (file) {
    processSelectedImageFile(file);
  }
}

function handleImageUrlInput(e) {
  const url = e.target.value.trim();
  const previewWrapper = document.getElementById('uploadPreviewWrapper');
  const previewImg = document.getElementById('uploadPreviewImg');

  if (url) {
    // Clear file input when an image URL is provided.
    const fileInput = document.getElementById('formImageFile');

    if (fileInput) fileInput.value = '';

    document.getElementById('formImageBase64').value = '';

    if (previewImg && previewWrapper) {
      previewImg.src = resolveImageUrl(url);
      previewWrapper.classList.remove('d-none');
    }
  } else {
    const fileInput = document.getElementById('formImageFile');

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      if (previewWrapper) previewWrapper.classList.add('d-none');
    }
  }
}

function processSelectedImageFile(file) {
  // File.type: https://developer.mozilla.org/en-US/docs/Web/API/Blob/type
  // File.size: https://developer.mozilla.org/en-US/docs/Web/API/Blob/size
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file (PNG, JPG, WEBP).', 'danger');
    return;
  }

  // Enforce the 5 MB client-side limit.
  if (file.size > 5 * 1024 * 1024) {
    showToast(
      'Image size exceeds 5MB limit. Please choose a smaller photo.',
      'danger'
    );
    return;
  }

  const urlInput = document.getElementById('formImageUrl');

  if (urlInput) urlInput.value = '';

  // FileReader.onload:
  // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/load_event
  const reader = new FileReader();

  reader.onload = function(e) {
    const base64Data = e.target.result;

    document.getElementById('formImageBase64').value = base64Data;
    document.getElementById('uploadPreviewImg').src = base64Data;
    document.getElementById('uploadPreviewWrapper').classList.remove('d-none');
  };

  // readAsDataURL(): https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  reader.readAsDataURL(file);
}

function removeSelectedImage() {
  const fileInput = document.getElementById('formImageFile');

  if (fileInput) fileInput.value = '';

  const urlInput = document.getElementById('formImageUrl');

  if (urlInput) urlInput.value = '';

  document.getElementById('formImageBase64').value = '';

  const previewWrapper = document.getElementById('uploadPreviewWrapper');

  if (previewWrapper) previewWrapper.classList.add('d-none');
}

// =====================================================================
// 6. REPORT SUBMISSION (CREATE ITEM)
// HTML forms: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form
// Constraint validation: https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation
// JSON.stringify(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
// Bootstrap modal: https://getbootstrap.com/docs/5.3/components/modal/
// =====================================================================

function openReportModal(defaultType = 'lost') {
  const form = document.getElementById('reportForm');

  if (form) {
    form.reset();
    form.classList.remove('was-validated');
  }

  removeSelectedImage();
  hideGeoBox();

  const radioLost = document.getElementById('typeModalLost');
  const radioFound = document.getElementById('typeModalFound');
  const modalLabel = document.getElementById('reportModalLabel');
  const submitLabel = document.getElementById('btnSubmitLabel');

  if (defaultType === 'lost') {
    if (radioLost) radioLost.checked = true;

    if (modalLabel) {
      modalLabel.innerHTML =
        '<i class="bi bi-plus-circle me-2"></i>Report Lost Item';
    }

    if (submitLabel) submitLabel.textContent = 'Save Lost Report';
  } else {
    if (radioFound) radioFound.checked = true;

    if (modalLabel) {
      modalLabel.innerHTML =
        '<i class="bi bi-plus-circle me-2"></i>Report Found Item';
    }

    if (submitLabel) submitLabel.textContent = 'Save Found Report';
  }

  // Update the heading and button label when the selected radio changes.
  if (radioLost && radioFound) {
    radioLost.onchange = () => {
      if (modalLabel) {
        modalLabel.innerHTML =
          '<i class="bi bi-plus-circle me-2"></i>Report Lost Item';
      }

      if (submitLabel) submitLabel.textContent = 'Save Lost Report';
    };

    radioFound.onchange = () => {
      if (modalLabel) {
        modalLabel.innerHTML =
          '<i class="bi bi-plus-circle me-2"></i>Report Found Item';
      }

      if (submitLabel) submitLabel.textContent = 'Save Found Report';
    };
  }

  const dateInput = document.getElementById('formDate');

  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Bootstrap 5 Modal JavaScript API:
  // https://getbootstrap.com/docs/5.3/components/modal/#via-javascript
  const modalEl = document.getElementById('reportModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

  modal.show();
}

async function handleReportSubmit(e) {
  // preventDefault(): https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
  e.preventDefault();

  const form = document.getElementById('reportForm');

  if (!form.checkValidity()) {
    e.stopPropagation();
    form.classList.add('was-validated');
    return;
  }

  const btnSubmit = document.getElementById('btnSubmitReport');
  const spinner = document.getElementById('submitSpinner');

  btnSubmit.disabled = true;

  if (spinner) spinner.classList.remove('d-none');

  const typeRadio = document.querySelector(
    'input[name="modalItemType"]:checked'
  );

  const imageUrlInput = document.getElementById('formImageUrl');
  const imageBase64Input = document.getElementById('formImageBase64');

  let finalImageUrl = null;

  if (imageUrlInput && imageUrlInput.value.trim()) {
    finalImageUrl = imageUrlInput.value.trim();
  } else if (imageBase64Input && imageBase64Input.value) {
    finalImageUrl = imageBase64Input.value;
  }

  // Collect form values into a JavaScript object.
  // HTMLInputElement.value: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/value
  const payload = {
    title: document.getElementById('formTitle').value.trim(),
    category: document.getElementById('formCategory').value,
    item_type: typeRadio ? typeRadio.value : 'lost',
    status: 'reported',
    location_name: document.getElementById('formLocation').value.trim(),
    latitude: document.getElementById('formLat').value || null,
    longitude: document.getElementById('formLng').value || null,
    date_occurred: document.getElementById('formDate').value,
    description: document.getElementById('formDescription').value.trim(),
    image_url: finalImageUrl,
    contact_name: document.getElementById('formContactName').value.trim(),
    contact_email: document.getElementById('formContactEmail').value.trim(),
    contact_phone: document.getElementById('formContactPhone').value.trim()
  };

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (json.success) {
      showToast(
        `Report filed successfully for "${payload.title}"!`,
        'success'
      );

      const modalEl = document.getElementById('reportModal');
      const modal = bootstrap.Modal.getInstance(modalEl);

      if (modal) modal.hide();

      initStats();
      initItems();
    } else {
      showToast(
        `Error: ${json.error || 'Failed to submit report'}`,
        'danger'
      );
    }
  } catch (err) {
    console.error('Submission error:', err);
    showToast('Failed to connect to server. Please try again.', 'danger');
  } finally {
    btnSubmit.disabled = false;

    if (spinner) spinner.classList.add('d-none');
  }
}

// =====================================================================
// 7. ITEM DETAILS & STATUS PROGRESSION
// Bootstrap modal: https://getbootstrap.com/docs/5.3/components/modal/
// HTML mailto: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#linking_to_an_email_address
// HTML tel: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#linking_to_telephone_numbers
// =====================================================================

function openItemDetails(id) {
  const item = state.items.find(i => i.id === id);

  if (!item) return;

  const modalTitle = document.getElementById('detailModalTitle');
  const modalBody = document.getElementById('detailModalBody');
  const statusControls = document.getElementById('detailModalStatusControls');

  const isLost = item.item_type === 'lost';

  const typeBadge = isLost
    ? '<span class="badge badge-lost me-2">LOST ITEM</span>'
    : '<span class="badge badge-found me-2">FOUND ITEM</span>';

  let statusBadge = '<span class="badge badge-pending">Reported</span>';

  if (item.status === 'pending_claim') {
    statusBadge =
      '<span class="badge badge-pending">Pending Claim / Under Review</span>';
  } else if (item.status === 'resolved') {
    statusBadge =
      '<span class="badge badge-resolved">Resolved / Returned</span>';
  }

  modalTitle.innerHTML =
    `${typeBadge} ${escapeHTML(item.title)}`;

  modalBody.innerHTML = `
    <div class="row g-4">
      <div class="col-md-5 text-center">
        ${item.image_url
          ? `<img src="${escapeHTML(resolveImageUrl(item.image_url))}"
              class="img-fluid rounded border shadow-sm"
              style="max-height: 280px; width: 100%; object-fit: cover;">`
          : `<div class="bg-light rounded p-5 text-muted border">
              <i class="bi bi-image display-1"></i>
              <div class="mt-2 small">No Photo Attached</div>
            </div>`
        }

        <div class="mt-3">
          ${statusBadge}
        </div>
      </div>

      <div class="col-md-7">
        <h5 class="fw-bold text-dark mb-2">
          ${escapeHTML(item.title)}
        </h5>

        <div class="text-muted small mb-3">
          <span>${escapeHTML(item.category)}</span> •
          <i class="bi bi-calendar3 ms-2 me-1"></i>
          Reported on ${formatDate(item.date_occurred)}
        </div>

        <h6 class="fw-bold small text-uppercase text-muted">
          Item Description
        </h6>

        <p class="text-secondary small mb-3" style="line-height: 1.6;">
          ${escapeHTML(item.description)}
        </p>

        <h6 class="fw-bold small text-uppercase text-muted">
          Campus Location
        </h6>

        <p class="small text-dark mb-3">
          <i class="bi bi-geo-alt-fill text-danger me-1"></i>
          ${escapeHTML(item.location_name)}
          ${item.latitude
            ? `<br><span class="text-muted" style="font-size:0.75rem;">
                GPS Coordinates: ${item.latitude}, ${item.longitude}
              </span>`
            : ''
          }
        </p>

        <div class="p-3 bg-light rounded border">
          <h6 class="fw-bold small text-uppercase text-muted mb-2">
            Contact for Recovery
          </h6>

          <div class="small fw-semibold text-dark">
            ${escapeHTML(item.contact_name)}
          </div>

          <div class="small text-muted">
            <i class="bi bi-envelope me-1"></i>
            <a href="mailto:${escapeHTML(item.contact_email)}">
              ${escapeHTML(item.contact_email)}
            </a>
          </div>

          ${item.contact_phone
            ? `<div class="small text-muted">
                <i class="bi bi-telephone me-1"></i>
                <a href="tel:${escapeHTML(item.contact_phone)}">
                  ${escapeHTML(item.contact_phone)}
                </a>
              </div>`
            : ''
          }
        </div>
      </div>
    </div>
  `;

  // Render controls for changing item status.
  statusControls.innerHTML = `
    <span class="small fw-semibold text-muted">Status:</span>

    <select class="form-select form-select-sm"
            style="width: auto;"
            onchange="updateItemStatusDirectly(${item.id}, this.value)">
      <option value="reported"
        ${item.status === 'reported' ? 'selected' : ''}>
        Reported
      </option>

      <option value="pending_claim"
        ${item.status === 'pending_claim' ? 'selected' : ''}>
        Pending Claim
      </option>

      <option value="resolved"
        ${item.status === 'resolved' ? 'selected' : ''}>
        Resolved / Returned
      </option>
    </select>

    ${item.status !== 'resolved' ? `
      <button class="btn btn-sm btn-success"
              onclick="quickResolveItem(${item.id}); bootstrap.Modal.getInstance(document.getElementById('itemDetailsModal')).hide();">
        <i class="bi bi-check-lg me-1"></i> Mark Resolved
      </button>
    ` : ''}
  `;

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById('itemDetailsModal')
  );

  modal.show();
}

// Send a PUT request to update the status on the server.
async function updateItemStatusDirectly(id, newStatus) {
  try {
    const res = await fetch(`/api/items/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const json = await res.json();

    if (json.success) {
      showToast(
        `Item #${id} status changed to '${newStatus}'.`,
        'success'
      );

      initStats();
      initItems();
    }
  } catch (err) {
    showToast('Failed to update status.', 'danger');
  }
}

async function quickResolveItem(id) {
  await updateItemStatusDirectly(id, 'resolved');
}

// =====================================================================
// 8. DELETE ITEM WITH CONFIRMATION MODAL
// HTTP DELETE method: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE
// Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
// =====================================================================

function confirmDeleteItem(id) {
  state.deleteTargetId = id;

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById('deleteConfirmModal')
  );

  modal.show();
}

async function executeDelete() {
  if (!state.deleteTargetId) return;

  try {
    const res = await fetch(`/api/items/${state.deleteTargetId}`, {
      method: 'DELETE'
    });

    const json = await res.json();

    if (json.success) {
      showToast(
        `Item #${state.deleteTargetId} removed successfully.`,
        'info'
      );

      const modal = bootstrap.Modal.getInstance(
        document.getElementById('deleteConfirmModal')
      );

      if (modal) modal.hide();

      initStats();
      initItems();
    } else {
      showToast(`Error deleting item: ${json.error}`, 'danger');
    }
  } catch (err) {
    showToast('Failed to delete item.', 'danger');
  } finally {
    state.deleteTargetId = null;
  }
}

// =====================================================================
// 9. TOAST NOTIFICATIONS & UTILITY HELPERS
// Bootstrap toasts: https://getbootstrap.com/docs/5.3/components/toasts/
// String methods: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String
// Date formatting: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
// =====================================================================

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');

  if (!container) return;

  const toastId = `toast-${Date.now()}`;

  const iconMap = {
    success: 'bi-check-circle-fill text-success',
    danger: 'bi-exclamation-octagon-fill text-danger',
    warning: 'bi-exclamation-triangle-fill text-warning',
    info: 'bi-info-circle-fill text-primary'
  };

  const icon = iconMap[type] || iconMap.info;

  const toastHtml = `
    <div id="${toastId}"
         class="toast align-items-center border-0 shadow-lg mb-2"
         role="alert"
         aria-live="assertive"
         aria-atomic="true">

      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi ${icon} fs-5"></i>
          <span class="small fw-semibold text-dark">
            ${escapeHTML(message)}
          </span>
        </div>

        <button type="button"
                class="btn-close me-2 m-auto"
                data-bs-dismiss="toast"
                aria-label="Close">
        </button>
      </div>
    </div>
  `;

  // insertAdjacentHTML():
  // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
  container.insertAdjacentHTML('beforeend', toastHtml);

  const toastEl = document.getElementById(toastId);

  // Bootstrap Toast JavaScript API:
  // https://getbootstrap.com/docs/5.3/components/toasts/#via-javascript
  const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });

  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

// Format dates for display.
function formatDate(dateString) {
  if (!dateString) return '';

  const d = new Date(dateString);

  if (isNaN(d.getTime())) return dateString;

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Find the icon associated with a category.
function getCategoryIcon(categoryName) {
  const cat = state.categories.find(c => c.name === categoryName);

  return cat ? cat.icon : 'bi-tag';
}

// Escape special HTML characters to help prevent HTML injection.
// Security reference: https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS
// String.replace(): https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
function escapeHTML(str) {
  if (!str) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Resolve or replace a specific image URL.
function resolveImageUrl(url) {
  if (!url) return '';

  // String.includes():
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes
  if (
    url.includes('share.google/esyqjP4XFK7zn4CWM') ||
    url.includes('share.google')
  ) {
    return 'https://m.media-amazon.com/images/I/61FKxpFz01L._AC_UF1000,1000_QL80_.jpg';
  }

  return url;
}