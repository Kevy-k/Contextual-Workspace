// === Sidebar Toggle Logic ===
const sidebarToggle = document.getElementById('sidebar-toggle');
const toggleButton = document.getElementById('toggle-button');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const bottomBar = document.getElementById('bottom-bar');

// Function to toggle sidebar
function toggleSidebar() {
    const isHidden = sidebar.classList.contains('hidden');
    
    if (isHidden) {
        // Show sidebar
        sidebar.classList.remove('hidden');
        mainContent.classList.remove('sidebar-hidden');
        bottomBar.classList.remove('sidebar-hidden');
        toggleButton.classList.add('hidden');
    } else {
        // Hide sidebar
        sidebar.classList.add('hidden');
        mainContent.classList.add('sidebar-hidden');
        bottomBar.classList.add('sidebar-hidden');
        toggleButton.classList.remove('hidden');
    }
}

// Add event listeners to both buttons
if (sidebarToggle) sidebarToggle.addEventListener('click', toggleSidebar);
if (toggleButton) toggleButton.addEventListener('click', toggleSidebar);

// === Dock Auto-scroll and Proportional Scrolling Logic ===
const dockContainer = document.getElementById('dock-container');
let scrollInterval = null;
let isAutoScrolling = false;

// Auto-scroll function
function autoScroll(direction) {
    if (scrollInterval) return; // Prevent multiple intervals
    
    const scrollSpeed = 2; // Pixels per frame
    scrollInterval = setInterval(() => {
        if (direction === 'left') {
            dockContainer.scrollLeft -= scrollSpeed * 0.8;
        } else if (direction === 'right') {
            dockContainer.scrollLeft += scrollSpeed * 0.8;
        }
        
        // Stop if we've reached the edges
        if (dockContainer.scrollLeft <= 0 || 
            dockContainer.scrollLeft >= dockContainer.scrollWidth - dockContainer.clientWidth) {
            stopAutoScroll();
        }
    }, 16); // ~60fps
}

// Stop auto-scroll function
function stopAutoScroll() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
        isAutoScrolling = false;
    }
}

// Listen for mouse movement over the dock container
if (dockContainer) dockContainer.addEventListener('mousemove', (e) => {
    const rect = dockContainer.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const edgeThreshold = 40; // Pixels from edge to trigger auto-scroll
    
    // Check if we're near the left or right edge
    if (cursorX <= edgeThreshold && dockContainer.scrollLeft > 0) {
        if (!isAutoScrolling) {
            isAutoScrolling = true;
            autoScroll('left');
        }
    } else if (cursorX >= rect.width - edgeThreshold && 
               dockContainer.scrollLeft < dockContainer.scrollWidth - dockContainer.clientWidth) {
        if (!isAutoScrolling) {
            isAutoScrolling = true;
            autoScroll('right');
        }
    } else {
        // We're not near edges, stop auto-scrolling
        if (isAutoScrolling) {
            stopAutoScroll();
        }
        
        // Proportional scrolling logic 
        const ratio = cursorX / rect.width;
        const maxScroll = dockContainer.scrollWidth - dockContainer.clientWidth;
        
        // Target scroll is now half of the proportional distance (0.5 factor added here)
        const targetScroll = ratio * maxScroll * 0.8; 
        
        dockContainer.scrollLeft = targetScroll;
    }
});

// Stop auto-scroll when mouse leaves the dock container
if (dockContainer) dockContainer.addEventListener('mouseleave', () => {
    stopAutoScroll();
});

// === Time and Greeting Update Logic ===
function updateTimeAndGreeting() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' : ''}${minutes} ${hours >= 12 ? 'PM' : 'AM'}`;
    
    let greetingText;
    if (hours < 12) {
        greetingText = 'Good morning.';
    } else if (hours < 16) {
        greetingText = 'Good afternoon.';
    } else {
        greetingText = 'Good evening.';
    }

    const timeElement = document.getElementById('time');
    const greetingElement = document.getElementById('greeting');
    
    if (timeElement) timeElement.textContent = formattedTime;
    if (greetingElement) greetingElement.textContent = greetingText;
}

// Update once immediately and then every minute
window.onload = function() {
    updateTimeAndGreeting();
    setInterval(updateTimeAndGreeting, 60000); 
}