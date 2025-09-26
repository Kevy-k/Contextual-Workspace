// (function() {
//   // Checking if panel already exists
//   if (document.getElementById('my-extension-container')) {
//     return;
//   }

//   // sending page title and heading 
//   const pageTitle = document.title;
//   const h1Element = document.querySelector('h1');
//   const mainHeading = h1Element ? h1Element.innerText.trim() : '';
//   const apiText = `${pageTitle} | ${mainHeading}`;

//   chrome.runtime.sendMessage({
//     action: 'sendTitle',
//     title: apiText
//   });


//   // building panel dynamically
//     const container = document.createElement('div');
//   container.id = 'my-extension-container';

//   // The inner HTML now includes the floating icon AND the panel
//   const uiHTML = `
//     <!-- This is the new floating action icon -->
//     <div id="quick-action-icon">
//         <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>
//     </div>

//     <!-- This is your main panel (initially hidden) -->
//     <div class="workspace-panel">
//       <h3>Mission Hub</h3>
//       <ul>
//         <li class="active">
//           <svg class="folder-icon" viewBox="0 0 24 24"><path d="M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V9C20 7.89543 19.1046 7 18 7H12L10 5H6C4.89543 5 4 5.89543 4 7Z"/></svg>
//           Gemini
//         </li>
//         <li>
//           <svg class="folder-icon" viewBox="0 0 24 24"><path d="M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V9C20 7.89543 19.1046 7 18 7H12L10 5H6C4.89543 5 4 5.89543 4 7Z"/></svg>
//           Google
//         </li>
//       </ul>
//     </div>
//   `;

//   container.innerHTML = uiHTML;
  
//   // --- PART 3: ADD INTERACTIVITY ---
//   const quickActionButton = container.querySelector('#quick-action-icon');
//   const workspacePanel = container.querySelector('.workspace-panel');

//   quickActionButton.addEventListener('click', (event) => {
//     event.stopPropagation();
//     workspacePanel.classList.toggle('panel-visible');
//   });

//   document.addEventListener('click', (event) => {
//     if (!container.contains(event.target)) {
//       workspacePanel.classList.remove('panel-visible');
//     }
//   });

//   // --- THE FIX: Append to documentElement instead of body ---
//   document.documentElement.appendChild(container);

// })();

(function() {
  // Checking if panel already exists
  if (document.getElementById('my-extension-container')) {
    return;
  }

  // sending page title and heading 
  const pageTitle = document.title;
  const h1Element = document.querySelector('h1');
  const mainHeading = h1Element ? h1Element.innerText.trim() : '';
  const apiText = `${pageTitle} | ${mainHeading}`;

  chrome.runtime.sendMessage({
    action: 'sendTitle',
    title: apiText
  });


  // building panel dynamically
    const container = document.createElement('div');
  container.id = 'my-extension-container';

  // The inner HTML now includes the floating icon AND the panel
  const uiHTML = `
    <!-- This is the new floating action icon -->
    <div id="quick-action-icon">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" /></svg>
    </div>

    <!-- This is your main panel (initially hidden) -->
    <div class="workspace-panel">
      <h3>Mission Hub</h3>
      <ul>
        <li class="active">
          <svg class="folder-icon" viewBox="0 0 24 24"><path d="M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V9C20 7.89543 19.1046 7 18 7H12L10 5H6C4.89543 5 4 5.89543 4 7Z"/></svg>
          Gemini
        </li>
        <li>
          <svg class="folder-icon" viewBox="0 0 24 24"><path d="M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V9C20 7.89543 19.1046 7 18 7H12L10 5H6C4.89543 5 4 5.89543 4 7Z"/></svg>
          Google
        </li>
      </ul>
    </div>
  `;

  container.innerHTML = uiHTML;
  
  // --- PART 3: ADD INTERACTIVITY ---
  const quickActionButton = container.querySelector('#quick-action-icon');
  const workspacePanel = container.querySelector('.workspace-panel');

  quickActionButton.addEventListener('click', (event) => {
    event.stopPropagation();
    workspacePanel.classList.toggle('panel-visible');
  });

  document.addEventListener('click', (event) => {
    if (!container.contains(event.target)) {
      workspacePanel.classList.remove('panel-visible');
    }
  });

  // --- FULLSCREEN VIDEO DETECTION ---
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