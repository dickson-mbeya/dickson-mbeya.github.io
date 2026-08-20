/*!
* Start Bootstrap - Personal v1.0.1
* Dynamic map gallery with JSON, search, "New!" badges, and award badges.
*/

// ============================================================
// 1. GLOBAL VARIABLES
// ============================================================
let mapsData = [];
let currentFilter = 'all';
let currentSearch = '';

// ============================================================
// 2. HELPER: Format Date
// ============================================================
function formatDate(dateString) {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ============================================================
// 3. HELPER: Check if date is within last 14 days
// ============================================================
function isNew(dateString) {
    if (!dateString) return false;
    const mapDate = new Date(dateString);
    const today = new Date();
    const diffTime = today - mapDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 14;
}

// ============================================================
// 4. RENDER ENGINE (with filter, search, sort, "New!" & Award)
// ============================================================
function renderMaps() {
    const grid = document.getElementById('mapGrid');
    if (!grid) return;

    // 1. Filter by category
    let filteredData = currentFilter === 'all'
        ? [...mapsData]
        : mapsData.filter(map => map.category === currentFilter);

    // 2. Filter by search term (case-insensitive)
    if (currentSearch.trim() !== '') {
        const term = currentSearch.trim().toLowerCase();
        filteredData = filteredData.filter(map => 
            map.title.toLowerCase().includes(term) ||
            map.desc.toLowerCase().includes(term)
        );
    }

    // 3. Sort by date (newest first)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Clear grid
    grid.innerHTML = '';

    // 4. Show "No results" message
    if (filteredData.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center text-muted py-5">No maps match your search or category.</div>`;
        return;
    }

    // 5. Build cards
    filteredData.forEach(map => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 map-item';
        col.dataset.category = map.category;

        const shortDesc = map.desc.length > 80 ? map.desc.substring(0, 80) + '...' : map.desc;
        const formattedDate = formatDate(map.date);
        const newBadge = isNew(map.date) ? `<span class="badge-new">✨ New!</span>` : '';

        // --- Award Badge (clickable link) ---
        let awardHTML = '';
        if (map.award && map.award_link) {
            awardHTML = `
                <div class="mt-2">
                    <a href="${map.award_link}" target="_blank" class="award-badge-link" title="View on Esri Map Gallery">
                        <span class="badge-award">${map.award}</span>
                    </a>
                </div>
            `;
        }

        col.innerHTML = `
            <div class="card h-100 shadow rounded-4 border-0 overflow-hidden"
                 data-img="${map.img}"
                 data-title="${map.title}"
                 data-desc="${map.desc}"
                 data-date="${map.date}">
                <img src="${map.img}" class="card-img-top" alt="${map.title}" loading="lazy">
                <div class="card-body p-4">
                    <h5 class="fw-bolder">${map.title} ${newBadge}</h5>
                    <p class="text-muted small">${shortDesc}</p>
                    ${awardHTML}
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <span class="badge bg-primary bg-opacity-10 text-primary fw-normal">${map.category.charAt(0).toUpperCase() + map.category.slice(1)}</span>
                        <small class="text-muted"><i class="bi bi-calendar3 me-1"></i>${formattedDate}</small>
                    </div>
                </div>
            </div>
        `;

        grid.appendChild(col);
    });
}

// ============================================================
// 5. FETCH DATA FROM JSON
// ============================================================
async function loadMaps() {
    try {
        const response = await fetch('maps.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        mapsData = await response.json();
        renderMaps();
    } catch (error) {
        console.error('Failed to load map data:', error);
        const grid = document.getElementById('mapGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger fw-bold">⚠️ Could not load map data.</p>
                    <p class="text-muted small">Please check that <code>maps.json</code> exists in the root folder and refresh.</p>
                </div>
            `;
        }
    }
}

// ============================================================
// 6. INITIALIZE
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');

    // --- Category filter buttons ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderMaps();
        });
    });

    // --- Search input (live filtering) ---
    searchInput.addEventListener('input', function() {
        currentSearch = this.value;
        renderMaps();
    });

    // --- Modal handling (single instance) ---
    const mapModal = document.getElementById('mapModal');
    const modalImage = document.getElementById('modalMapImage');
    const modalTitle = document.querySelector('#mapModalLabel');
    const modalDesc = document.getElementById('modalMapDesc');
    const modalInstance = new bootstrap.Modal(mapModal, { backdrop: true, keyboard: true });

    // Clean up leftover backdrop
    mapModal.addEventListener('hidden.bs.modal', function() {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
        document.body.classList.remove('modal-open');
    });

    // Event delegation for modal – works on dynamically created cards
    document.getElementById('mapGrid').addEventListener('click', function(e) {
        const card = e.target.closest('.card[data-img]');
        if (!card) return;

        e.preventDefault();
        modalImage.src = card.dataset.img;
        modalTitle.textContent = card.dataset.title;
        modalDesc.textContent = card.dataset.desc;
        modalInstance.show();
    });

    // --- Load data ---
    loadMaps();
});