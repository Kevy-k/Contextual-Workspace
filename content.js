
(function() {
    if (document.getElementById('my-extension-container')) {
        return;
    }

    // --- PART 1: SEND PAGE DATA FOR CLASSIFICATION ---
    const pageTitle = document.title;
    const h1Element = document.querySelector('h1');
    const mainHeading = h1Element ? h1Element.innerText.trim() : '';
    const apiText = `${pageTitle} | ${mainHeading}`;

    chrome.runtime.sendMessage({
        action: 'sendTitle',
        title: apiText
    });

    // --- PART 2: CREATE THE UI SKELETON ---
    const container = document.createElement('div');
    container.id = 'my-extension-container';

    const uiHTML = `
        <div id="quick-action-icon">
            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>
        </div>
        <div class="workspace-panel">
            <h3>My Workspace</h3>
            <ul id="workspace-list-ul">
                <!-- Workspace items will be dynamically inserted here -->
            </ul>
        </div>
    `;
    container.innerHTML = uiHTML;
    document.documentElement.appendChild(container);

    // --- PART 3: DYNAMICALLY POPULATE AND UPDATE THE UI ---
    const workspaceListUL = document.getElementById('workspace-list-ul');

    function updatePanelUI(stats) {
        if (!stats || !stats.workspaces) return;
        container.style.setProperty('--accent-color', stats.activeColor || 'grey');
        workspaceListUL.innerHTML = ''; // Clear the list before redrawing

        const activeWorkspace = stats.activeWorkspace;

        for (const workspaceName in stats.workspaces) {
            const workspaceData = stats.workspaces[workspaceName];

            const li = document.createElement('li');
            li.className = 'workspace-item';
            if (workspaceName === activeWorkspace) {
                li.classList.add('active');
            }

            // Create the content of the list item
            li.innerHTML = `
                <svg class="folder-icon" viewBox="0 0 24 24"><path d="M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V9C20 7.89543 19.1046 7 18 7H12L10 5H6C4.89543 5 4 5.89543 4 7Z"/></svg>
                <span>${workspaceName}</span>
            `;

            // Add a tab count badge if there are tabs
            if (workspaceData.count > 0) {
                const countBadge = document.createElement('span');
                countBadge.className = 'tab-count';
                countBadge.textContent = workspaceData.count;
                li.appendChild(countBadge);
            }

            // Add a click listener to switch workspaces
            li.addEventListener('click', () => {
                chrome.runtime.sendMessage({ action: 'switchToWorkspace', name: workspaceName });
            });

            workspaceListUL.appendChild(li);
        }
    }

    function refreshPanel() {
        chrome.runtime.sendMessage({ action: 'getWorkspaceStats' }, (response) => {
            if (response) {
                updatePanelUI(response);
            }
        });
    }

    // --- PART 4: ADD INTERACTIVITY TO THE PANEL ITSELF ---
    const quickActionButton = container.querySelector('#quick-action-icon');
    const workspacePanel = container.querySelector('.workspace-panel');

    quickActionButton.addEventListener('click', (event) => {
        event.stopPropagation();
        workspacePanel.classList.toggle('panel-visible');
        // Refresh the data every time the panel is opened
        if (workspacePanel.classList.contains('panel-visible')) {
            refreshPanel();
        }
    });

    document.addEventListener('click', (event) => {
        if (!container.contains(event.target)) {
            workspacePanel.classList.remove('panel-visible');
        }
    });
    
    // Initial refresh when the script is first injected
    refreshPanel();
    function checkFullscreenVideo() {
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    
    if (isFullscreen) {
      quickActionButton.style.display = 'none';
    } else {
      quickActionButton.style.display = 'flex';
    }
  }

  // Listen for fullscreen changes
  document.addEventListener('fullscreenchange', checkFullscreenVideo);
  document.addEventListener('webkitfullscreenchange', checkFullscreenVideo);
  document.addEventListener('mozfullscreenchange', checkFullscreenVideo);
  document.addEventListener('msfullscreenchange', checkFullscreenVideo);

  // --- THE FIX: Append to documentElement instead of body ---
  document.documentElement.appendChild(container);

})();


