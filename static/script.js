// ============================================================================
// FULLSCREEN FUNCTIONALITY
// ============================================================================

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen for the entire document
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Listen for fullscreen change events to update icon
document.addEventListener('fullscreenchange', updateFullscreenIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
document.addEventListener('mozfullscreenchange', updateFullscreenIcon);
document.addEventListener('MSFullscreenChange', updateFullscreenIcon);

function updateFullscreenIcon() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    
    if (isFullscreen) {
        // Hide the button when in fullscreen
        fullscreenBtn.style.display = 'none';
    } else {
        // Show the button when not in fullscreen
        fullscreenBtn.style.display = 'flex';
    }
}

// ============================================================================
// SEARCH FORM HANDLING
// ============================================================================

// Search form submission handler
document.getElementById('searchForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent actual form submission
    openModal('login'); // Open the login modal
});

// ============================================================================
// SCANNER/CAMERA FUNCTIONALITY
// ============================================================================

// --- Element References ---
const scannerContainer = document.getElementById('scannerContainer');
const dropZone = document.getElementById('dropZone');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const openCameraBtn = document.getElementById('openCameraBtn');
const video = document.getElementById('cameraFeed');
const captureBtn = document.getElementById('captureBtn');
const topSearch = document.getElementById('topSearch');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const saveBtn = document.getElementById('saveBtn');
const preview = document.getElementById('preview');
const dragDrop = document.getElementById('dragDrop');
const errorMsg = document.getElementById('errorMsg');
const previewBtns = document.getElementById('previewBtns');

// --- State Object ---
const state = {
    stream: null,
    scanning: false,
    capturedImage: null,
    selectionType: null,
    selectionData: null,
    focusableEls: [],
    lastFocusedEl: null,
    scanCanvas: document.createElement('canvas')
};

// --- Accessibility: Focus Trap ---
function trapFocus(e) {
    if (!scannerContainer.classList.contains('active')) return;
    const focusable = state.focusableEls;
    if (!focusable.length) return;
    if (e.key === 'Tab') {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                last.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        }
    }
    if (e.key === 'Escape') {
        stopAll();
    }
}

// --- Error Handling ---
function showError(msg) {
    errorMsg.textContent = msg;
}

function clearError() {
    errorMsg.textContent = '';
}

function stopAll() {
    stopCamera();
    scannerContainer.classList.remove('active');
    clearError();
    if (state.lastFocusedEl) state.lastFocusedEl.focus();
    document.removeEventListener('keydown', trapFocus);
    resetUI();
}

function updateFocusableEls() {
    state.focusableEls = scannerContainer.querySelectorAll('button, [tabindex]:not([tabindex="-1"]), input, video, img');
}

// --- Drag & Drop ---
dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

// --- File Upload ---
uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
    if (fileInput.files.length) {
        handleFile(fileInput.files[0]);
    }
};

function handleFile(file) {
    clearError();
    if (!file.type.startsWith('image/')) {
        showError('Please upload a valid image file.');
        return;
    }
    resetUI();
    const reader = new FileReader();
    reader.onload = event => {
        state.selectionType = 'upload';
        state.selectionData = event.target.result;
        preview.src = event.target.result;
        preview.style.display = 'block';
        clearSelectionBtn.style.display = 'inline-block';
        saveBtn.style.display = 'inline-block';
        toggledragDrop();
    };
    reader.readAsDataURL(file);
}

// --- Camera ---
openCameraBtn.onclick = startCamera;

function startCamera() {
    resetUI();
    video.style.display = 'block';
    captureBtn.style.display = 'inline-block';
    toggledragDrop();
    clearError();
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(mediaStream => {
            state.stream = mediaStream;
            video.srcObject = state.stream;
            return video.play();
        })
        .catch(err => {
            showError('Error accessing camera: ' + err.message);
            resetModal();
        });
}

captureBtn.onclick = () => {
    if (!video.videoWidth || !video.videoHeight) return;
    state.scanCanvas.width = video.videoWidth;
    state.scanCanvas.height = video.videoHeight;
    const ctx = state.scanCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    state.capturedImage = state.scanCanvas.toDataURL('image/png');
    video.srcObject = null;
    video.style.display = 'none';
    preview.src = state.capturedImage;
    preview.style.display = 'block';
    stopCamera();
    captureBtn.style.display = 'none';
    state.selectionType = 'camera';
    state.selectionData = state.capturedImage;
    clearSelectionBtn.style.display = 'inline-block';
    saveBtn.style.display = 'inline-block';
    toggledragDrop();
};

function stopCamera() {
    if (state.stream) {
        state.stream.getTracks().forEach(track => track.stop());
        state.stream = null;
    }
}

// --- Restore Previous Selection ---
function restorePreviousSelection() {
    resetUI();
    if (!state.selectionType || !state.selectionData) {
        resetModal();
        return;
    }
    preview.src = state.selectionData;
    preview.style.display = 'block';
    clearSelectionBtn.style.display = 'inline-block';
    saveBtn.style.display = 'inline-block';
    toggledragDrop();
}

// --- Clear/Reset ---
clearSelectionBtn.onclick = () => {
    state.selectionData = null;
    state.selectionType = null;
    resetModal();
};

function resetModal() {
    resetUI();
    dropZone.style.display = 'flex';
}

function resetUI() {
    stopCamera();
    video.style.display = 'none';
    captureBtn.style.display = 'none';
    preview.style.display = 'none';
    clearSelectionBtn.style.display = 'none';
    saveBtn.style.display = 'none';
    toggledragDrop();
    clearError();
    previewBtns.innerHTML = '';
}

function toggledragDrop() {
    dragDrop.style.display = (video.style.display === 'block' || preview.style.display === 'block') ? 'none' : 'block';
}

// ============================================================================
// TAB TOGGLE FUNCTIONALITY
// ============================================================================

function searchTabsToggle(id, button) {
    const target = document.getElementById(id);
    const allTabs = document.querySelectorAll('.tab');
    const allButtons = document.querySelectorAll('.pop-up');

    const isOpen = target.classList.contains('open');
    const isSameButtonActive = button.classList.contains('active');

    // First, collapse all open panels
    allTabs.forEach(el => {
        if (el.classList.contains('open')) {
            el.style.height = el.scrollHeight + 'px'; // set to current height
            el.offsetHeight; // force reflow
            el.style.height = '0px';
            el.classList.remove('open');
        }
    });

    // Remove active class from all buttons
    allButtons.forEach(btn => btn.classList.remove('active'));

    // If this panel wasn't already open, open it now
    if (!isOpen || !isSameButtonActive) {
        target.style.height = target.scrollHeight + 'px';
        target.classList.add('open');
        button.classList.add('active');

        // Reset to auto after transition for flexibility
        target.addEventListener('transitionend', function handler() {
            if (target.classList.contains('open')) {
                target.style.height = 'auto';
            }
            target.removeEventListener('transitionend', handler);
        });
    }
}

// ============================================================================
// PLACEHOLDER CYCLER FUNCTIONALITY
// ============================================================================

function startPlaceholderCycler({
    inputID,
    primaryWait = 10000,
    secondaryWait = 5000,
    typingSpeed = 100,
    deletingSpeed = 50,
    phrases = []
}) {
    const input = document.getElementById(inputID);
    if (!input) {
        console.error(`No input found with ID: ${inputID}`);
        return;
    }

    // Recheck default placeholder every time the function starts
    let defaultPhrase = input.placeholder;

    const allPhrases = [...new Set([...phrases, defaultPhrase])]; // Add default phrase uniquely
    let cycleId = 0;
    let interactionActive = false;
    let lastPhrases = [];

    const wait = ms => new Promise(res => setTimeout(res, ms));

    async function typeText(text, localId) {
        for (let char of text) {
            if (localId !== cycleId) return;
            input.placeholder += char;
            await wait(typingSpeed);
        }
    }

    async function deleteText(localId) {
        while (input.placeholder.length > 0) {
            if (localId !== cycleId) return;
            input.placeholder = input.placeholder.slice(0, -1);
            await wait(deletingSpeed);
        }
    }

    function getUniquePhrase() {
        const available = allPhrases.filter(p => !lastPhrases.includes(p));
        const pool = available.length > 0 ? available : allPhrases;
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        lastPhrases.push(chosen);
        if (lastPhrases.length > 2) lastPhrases.shift();
        return chosen;
    }

    async function cyclePlaceholders(firstWait = true) {
        const localId = ++cycleId;
        const delay = firstWait ? primaryWait : secondaryWait;
        await wait(delay);
        while (localId === cycleId) {
            const newPhrase = getUniquePhrase();
            await deleteText(localId);
            await typeText(newPhrase, localId);
            await wait(secondaryWait);
        }
    }

    function startCycle(firstWait = true) {
        defaultPhrase = input.placeholder; // Recheck default placeholder when starting
        input.placeholder = defaultPhrase; // Reset placeholder to the current default
        cyclePlaceholders(firstWait);
    }

    function stopCycle() {
        cycleId++;
        input.placeholder = defaultPhrase; // Revert placeholder to default when stopped
    }

    function handleInteractionStart() {
        if (!interactionActive) {
            interactionActive = true;
            stopCycle();
        }
    }

    function handleInteractionEnd() {
        if (interactionActive) {
            interactionActive = false;
            startCycle(true); // Restart from beginning
        }
    }

    // Attach hover/focus events
    input.addEventListener("focus", handleInteractionStart);
    input.addEventListener("mouseenter", handleInteractionStart);
    input.addEventListener("blur", handleInteractionEnd);
    input.addEventListener("mouseleave", handleInteractionEnd);

    // Public API
    input.placeholderCyclerStop = stopCycle;
    input.placeholderCyclerStart = () => startCycle(true);
    input.placeholderCyclerRestart = () => {
        stopCycle();
        startCycle(true);
    };

    // Start initial cycle
    startCycle(true);
}

// Initialize placeholder cycler
startPlaceholderCycler({
    inputID: "topSearch",
    primaryWait: 30000,     // 30 seconds
    secondaryWait: 10000,    // 10 seconds
    typingSpeed: 25,
    deletingSpeed: 0,
    phrases: [
        "On-Prem Compute",
        "Independent Internet",
        "Decentralized Internet",
        "Private Internet",
        "100% Private, No Tracking Ever",
        "Local Processing",
        "A P 0 1 1 0",
        "Search your AP0110 servers",
        "Private Cloud",
    ]
});

// ============================================================================
// LAUNCHPAD FUNCTIONALITY
// ============================================================================

// Launchpad functionality
function toggleLaunchpad() {
    const launchpad = document.getElementById('launchpad');
    if (!launchpad.classList.contains('active')) {
        launchpad.classList.add('active');
        // Add click event listener to close launchpad when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeLaunchpadOnOutsideClick);
        }, 0);
        // Initialize app sorting and search
        initializeAppSearch();
    } else {
        closeLaunchpad();
    }
}

function closeLaunchpad() {
    const launchpad = document.getElementById('launchpad');
    launchpad.classList.remove('active');
    // Remove the click event listener
    document.removeEventListener('click', closeLaunchpadOnOutsideClick);
    
    // Reset pagination state but keep apps data
    currentPage = 0;
}

function closeLaunchpadOnOutsideClick(event) {
    const launchpad = document.getElementById('launchpad');
    const appSearch = document.getElementById('appSearch');
    const paginationControls = document.getElementById('paginationControls');
    const clickedElement = event.target;
    
    // Check if the clicked element is inside the launchpad
    if (launchpad.contains(clickedElement)) {
        // Check if the clicked element is the appSearch, an app, pagination controls, or a page bubble
        if (appSearch.contains(clickedElement) || 
            clickedElement.closest('.app') || 
            (paginationControls && paginationControls.contains(clickedElement)) ||
            clickedElement.classList.contains('page-bubble')) {
            // Don't close if clicking on appSearch, an app, pagination controls, or page bubbles
            return;
        }
    }
    
    // Close the launchpad if clicking outside or on other elements within launchpad
    closeLaunchpad();
}

// ============================================================================
// APP SEARCH AND PAGINATION FUNCTIONALITY
// ============================================================================

// App search and sorting functionality
let currentPage = 0;
const appsPerPage = 24;
let allApps = [];
let filteredApps = [];
const appGrid = document.getElementById('appGrid');

function initializeAppSearch() {
    const searchInput = document.querySelector('#appSearch input[type="search"]');
    
    // If we don't have apps stored yet, get them from the DOM
    if (allApps.length === 0) {
        allApps = Array.from(appGrid.querySelectorAll('.app'));
    }
    
    // Reset filtered apps to all apps (maintain original order)
    filteredApps = [...allApps];
    
    // Display apps in original order initially
    displayCurrentPage();
    
    // Add search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterAndSortApps(searchTerm);
    });
    
    // Setup pagination controls
    setupPaginationControls();
    
    // Ensure pagination controls are visible initially
    const paginationContainer = document.getElementById('paginationControls');
    if (paginationContainer) {
        paginationContainer.style.display = 'flex';
    }
}

function sortAppsByName() {
    filteredApps.sort((a, b) => {
        const nameA = a.querySelector('.appName').textContent.toLowerCase();
        const nameB = b.querySelector('.appName').textContent.toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    currentPage = 0; // Reset to first page when sorting
    displayCurrentPage();
}

function filterAndSortApps(searchTerm) {
    
    if (searchTerm === '') {
        // No search term - restore original order
        filteredApps = [...allApps];
    } else {
        // Filter apps based on search term
        filteredApps = allApps.filter(app => {
            const appName = app.querySelector('.appName').textContent.toLowerCase();
            return appName.includes(searchTerm);
        });
        
        // Sort filtered apps alphabetically only when searching
        filteredApps.sort((a, b) => {
            const nameA = a.querySelector('.appName').textContent.toLowerCase();
            const nameB = b.querySelector('.appName').textContent.toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }
    
    currentPage = 0; // Reset to first page when filtering
    displayCurrentPage();
    updatePaginationControls();
}

function displayCurrentPage() {
    const totalPages = Math.ceil(filteredApps.length / appsPerPage);
    appGrid.innerHTML = '';
    for (let page = 0; page < totalPages; page++) {
        const startIndex = page * appsPerPage;
        const endIndex = startIndex + appsPerPage;
        const appsToShow = filteredApps.slice(startIndex, endIndex);
        const pageDiv = document.createElement('div');
        pageDiv.className = 'appGridPage';
        pageDiv.dataset.page = page;
        appsToShow.forEach(app => pageDiv.appendChild(app));
        appGrid.appendChild(pageDiv);
    }
    updatePaginationControls();
    // Optionally, scroll to the current page
    scrollToCurrentPage();
}

function scrollToCurrentPage() {
    const pageDiv = appGrid.querySelector(`.appGridPage[data-page='${currentPage}']`);
    if (pageDiv) {
        pageDiv.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'start'});
    }
}

function setupPaginationControls() {
    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(filteredApps.length / appsPerPage);
    const pageBubbles = document.getElementById('pageBubbles');
    const visiblePage = getCurrentVisiblePage();
    
    // Create bubble indicators
    if (pageBubbles) {
        pageBubbles.innerHTML = '';
        
        for (let i = 0; i < totalPages; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'page-bubble';
            bubble.style.cssText = `
                width: 40px;
                height: 40px;
                cursor: pointer;
                transition: all 0.2s ease;
                backgroundColor: transparent;
                margin: 0 2px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            `;
            
            // Create inner bubble
            const innerBubble = document.createElement('div');
            innerBubble.className = 'inner-bubble';
            innerBubble.style.cssText = `
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: rgba(255,255,255,0.6);
                transition: all 0.2s ease;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            `;
            
            // Set active/inactive styles
            if (i === visiblePage) {
                innerBubble.style.backgroundColor = 'rgba(255,255,255,0.9)';
            } else {
                innerBubble.style.backgroundColor = 'rgba(255,255,255,0.4)';
            }
            
            // Add click event with better feedback
            bubble.onclick = (event) => {
                // Prevent event from bubbling up to document
                event.stopPropagation();
                
                currentPage = i;
                scrollToCurrentPage();
                
                // Add click feedback
                bubble.style.transform = 'scale(0.95)';
                innerBubble.style.transform = 'translate(-50%, -50%) scale(0.8)';
                setTimeout(() => {
                    bubble.style.transform = 'scale(1)';
                    innerBubble.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 100);
            };
            
            bubble.appendChild(innerBubble);
            pageBubbles.appendChild(bubble);
        }
    }
    
    // Always show pagination controls when launchpad is open
    const paginationContainer = document.getElementById('paginationControls');
    if (paginationContainer) {
        paginationContainer.style.display = 'flex';
    }
} 

function getCurrentVisiblePage() {
    const pages = appGrid.querySelectorAll('.appGridPage');
    let visiblePage = 0;
    let minOffset = Infinity;
    pages.forEach((page, idx) => {
        // Get the distance from the left of the container
        const rect = page.getBoundingClientRect();
        const gridRect = appGrid.getBoundingClientRect();
        const offset = Math.abs(rect.left - gridRect.left);
        if (offset < minOffset) {
            minOffset = offset;
            visiblePage = idx;
        }
    });
    return visiblePage;
}

// Add scroll event listener to appGrid to update bubbles on scroll
if (appGrid) {
    appGrid.addEventListener('scroll', () => {
        updatePaginationControls();
    });
}

// Enable horizontal scrolling on #appGrid with mouse wheel
if (appGrid) {
    let isScrolling = false;

    appGrid.addEventListener('wheel', function(event) {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
    
            if (!isScrolling) {
                isScrolling = true;
    
                const direction = Math.sign(event.deltaY);
                const scrollAmount = appGrid.clientWidth; // Scroll by 1 full snap area
    
                appGrid.scrollBy({
                    left: direction * scrollAmount,
                    behavior: 'smooth'
                });
    
                // Prevent rapid firing — throttle
                setTimeout(() => {
                    isScrolling = false;
                }, 500); // adjust as needed
            }
        }
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', () => {
    function syncGetAP0110Height() {
        const get = document.getElementById('get');
        const getAP0110 = document.getElementById('getAP0110');
        if (get && getAP0110) {
            getAP0110.style.height = get.offsetHeight + 'px';
        }
    }
    syncGetAP0110Height();
    window.addEventListener('resize', syncGetAP0110Height);

    // Also update if #get's content changes
    const get = document.getElementById('get');
    if (get) {
        const observer = new MutationObserver(syncGetAP0110Height);
        observer.observe(get, { childList: true, subtree: true, attributes: true, characterData: true });
    }

}); 