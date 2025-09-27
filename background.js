// // --- START: API Configuration ---
// // IMPORTANT: Replace this with your actual Hugging Face token
// import { HUGGING_FACE_API_TOKEN } from './config.js';
// const API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
// // --- END: API Configuration ---

// /**
//  * 
//  * @param {string} text 
//  * @param {string[]} labels 
//  * @returns {Promise<Object>} 
//  */
// async function classifyText(text, labels) {
//   console.log(`Sending title to Hugging Face for classification: "${text}"`);



import { HUGGING_FACE_API_TOKEN } from './config.js';

const API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
const WORKSPACE_STORAGE_KEY = 'workspaces';
const ACTIVE_WORKSPACE_KEY = 'active_workspace';
const TAB_GROUPS_KEY = 'tab_groups';

// Workspace configuration
const WORKSPACES = {
    'Programming': { color: 'blue', emoji: '💻' },
    'Work': { color: 'cyan', emoji: '✍️' },
    'Social Media': { color: 'pink', emoji: '📱' },
    'News': { color: 'red', emoji: '📰' },
    'Shopping': { color: 'yellow', emoji: '🛒' },
    'Research': { color: 'green', emoji: '🔬' },
    'Finance': { color: 'purple', emoji: '💰' },
    'Entertainment': { color: 'orange', emoji: '🎬' },
    'Others': { color: 'grey', emoji: '📔' }
};

async function classifyText(text, labels) {
    if (!text || text.trim() === '') return null;
    console.log(`🤖 Classifying: "${text}"`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HUGGING_FACE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: text,
                parameters: { candidate_labels: labels }
            })
        });
        if (!response.ok) throw new Error(`API request failed: ${response.status}`);
        const result = await response.json();
        console.log(`✅ Classification result:`, result);
        return result;
    } catch (error) {
        console.error("❌ Error calling Hugging Face API:", error);
        return null;
    }
}

async function associateTabWithWorkspace(url, category, tabId) {
    const data = await chrome.storage.local.get([WORKSPACE_STORAGE_KEY]);
    const workspaces = data[WORKSPACE_STORAGE_KEY] || {};
    workspaces[url] = category;
    await chrome.storage.local.set({ [WORKSPACE_STORAGE_KEY]: workspaces });
    console.log(`🔗 Associated "${url}" with workspace "${category}"`);
    await organizeTabIntoGroup(tabId, category);
}

async function organizeTabIntoGroup(tabId, workspace) {
    try {
        const data = await chrome.storage.local.get([TAB_GROUPS_KEY]);
        const tabGroups = data[TAB_GROUPS_KEY] || {};
        let groupId = tabGroups[workspace];
        if (groupId) {
            try {
                await chrome.tabGroups.get(groupId);
                await chrome.tabs.group({ groupId, tabIds: [tabId] });
                console.log(`📂 Added tab ${tabId} to existing ${workspace} group`);
            } catch (error) {
                groupId = await createNewWorkspaceGroup([tabId], workspace);
                tabGroups[workspace] = groupId;
                await chrome.storage.local.set({ [TAB_GROUPS_KEY]: tabGroups });
            }
        } else {
            groupId = await createNewWorkspaceGroup([tabId], workspace);
            tabGroups[workspace] = groupId;
            await chrome.storage.local.set({ [TAB_GROUPS_KEY]: tabGroups });
        }
    } catch (error) {
        console.error(`❌ Failed to organize tab into group:`, error);
    }
}

async function createNewWorkspaceGroup(tabIds, workspace) {
    const config = WORKSPACES[workspace];
    const groupId = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(groupId, {
        title: `${config.emoji} ${workspace}`,
        color: config.color,
        collapsed: false
    });
    console.log(`✨ Created new ${workspace} group with ID ${groupId}`);
    const allGroups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });

    // 4. Loop through them and collapse any group that is NOT our new one.
    for (const group of allGroups) {
        if (group.id !== groupId) {
            await chrome.tabGroups.update(group.id, { collapsed: true });
        }
    }
    return groupId;
}

async function switchToWorkspace(workspaceName) {
    console.log(`🔄 Switching to workspace: ${workspaceName}`);
    try {
        const data = await chrome.storage.local.get([TAB_GROUPS_KEY]);
        const tabGroups = data[TAB_GROUPS_KEY] || {};
        await chrome.storage.local.set({ [ACTIVE_WORKSPACE_KEY]: workspaceName });
        for (const [workspace, groupId] of Object.entries(tabGroups)) {
            try {
                await chrome.tabGroups.get(groupId);
                const shouldBeCollapsed = workspace !== workspaceName;
                await chrome.tabGroups.update(groupId, { collapsed: shouldBeCollapsed });
                if (!shouldBeCollapsed) {
                    const tabs = await chrome.tabs.query({ groupId });
                    if (tabs.length > 0) {
                        await chrome.tabs.update(tabs[0].id, { active: true });
                    }
                }
            } catch (error) {
                console.log(`🗑️ Removing non-existent group for ${workspace}`);
                delete tabGroups[workspace];
            }
        }
        await chrome.storage.local.set({ [TAB_GROUPS_KEY]: tabGroups });
        console.log(`✅ Workspace switch complete: ${workspaceName}`);
    } catch (error) {
        console.error(`❌ Failed to switch workspace:`, error);
    }
}

// async function getWorkspaceStats() {
//     try {
//         const data = await chrome.storage.local.get([WORKSPACE_STORAGE_KEY, TAB_GROUPS_KEY, ACTIVE_WORKSPACE_KEY]);
//         const workspaces = data[WORKSPACE_STORAGE_KEY] || {};
//         const tabGroups = data[TAB_GROUPS_KEY] || {};
//         const activeWorkspace = data[ACTIVE_WORKSPACE_KEY] || 'Programming'; // Default active

//         const stats = { activeWorkspace, workspaces: {} };
        
//         Object.keys(WORKSPACES).forEach(workspace => {
//             stats.workspaces[workspace] = { count: 0, hasGroup: false };
//         });

//         const allTabs = await chrome.tabs.query({ currentWindow: true });
//         for (const tab of allTabs) {
//             const workspace = workspaces[tab.url];
//             if (workspace && stats.workspaces[workspace]) {
//                 stats.workspaces[workspace].count++;
//             }
//         }

//         for (const [workspace, groupId] of Object.entries(tabGroups)) {
//             try {
//                 await chrome.tabGroups.get(groupId);
//                 if (stats.workspaces[workspace]) {
//                     stats.workspaces[workspace].hasGroup = true;
//                 }
//             } catch (error) { /* Group doesn't exist */ }
//         }
//         return stats;
//     } catch (error) {
//         console.error(`❌ Failed to get workspace stats:`, error);
//         return {};
//     }
// }
async function getWorkspaceStats() {
    try {
        const data = await chrome.storage.local.get([WORKSPACE_STORAGE_KEY, TAB_GROUPS_KEY, ACTIVE_WORKSPACE_KEY]);
        const workspaces = data[WORKSPACE_STORAGE_KEY] || {};
        const tabGroups = data[TAB_GROUPS_KEY] || {};
        const activeWorkspace = data[ACTIVE_WORKSPACE_KEY] || Object.keys(WORKSPACES)[0];
        
        // Get the color for the active workspace
        const activeColor = WORKSPACES[activeWorkspace]?.color || 'grey';

        const stats = { activeWorkspace, activeColor, workspaces: {} };
        Object.keys(WORKSPACES).forEach(ws => {
            stats.workspaces[ws] = { count: 0, hasGroup: false };
        });

        const allTabs = await chrome.tabs.query({ currentWindow: true });
        for (const tab of allTabs) {
            const workspace = workspaces[tab.url];
            if (workspace && stats.workspaces[workspace]) {
                stats.workspaces[workspace].count++;
            }
        }

        for (const [workspace, groupId] of Object.entries(tabGroups)) {
            try {
                await chrome.tabGroups.get(groupId);
                if (stats.workspaces[workspace]) stats.workspaces[workspace].hasGroup = true;
            } catch (error) { /* Group doesn't exist */ }
        }
        return stats;
    } catch (error) {
        console.error(`❌ Failed to get workspace stats:`, error);
        return {};
    }
}

async function reorganizeAllTabs() {
    console.log(`🔄 Reorganizing all tabs into workspaces...`);
    const data = await chrome.storage.local.get([WORKSPACE_STORAGE_KEY]);
    const workspaces = data[WORKSPACE_STORAGE_KEY] || {};
    const allTabs = await chrome.tabs.query({ currentWindow: true });
    const workspaceTabsMap = {};
    for (const tab of allTabs) {
        if (tab.url.includes('D5_index.html') || tab.pinned) continue;
        const workspace = workspaces[tab.url];
        if (workspace && WORKSPACES[workspace]) {
            if (!workspaceTabsMap[workspace]) {
                workspaceTabsMap[workspace] = [];
            }
            workspaceTabsMap[workspace].push(tab.id);
        }
    }
    const tabGroups = {};
    for (const [workspace, tabIds] of Object.entries(workspaceTabsMap)) {
        if (tabIds.length > 0) {
            try {
                const groupId = await createNewWorkspaceGroup(tabIds, workspace);
                tabGroups[workspace] = groupId;
            } catch (error) {
                console.error(`❌ Failed to create group for ${workspace}:`, error);
            }
        }
    }
    await chrome.storage.local.set({ [TAB_GROUPS_KEY]: tabGroups });
    console.log(`✅ Reorganization complete.`);
}

// === EVENT LISTENERS ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sendTitle' && message.title) {
        const workspaceLabels = Object.keys(WORKSPACES);
        classifyText(message.title, workspaceLabels).then(result => {
            if (result && result.labels && result.labels.length > 0) {
                const topCategory = result.labels[0];
                const confidence = result.scores[0];
                if (confidence > 0.3) {
                    associateTabWithWorkspace(sender.tab.url, topCategory, sender.tab.id);
                }else{
                   associateTabWithWorkspace(sender.tab.url, 'Others', sender.tab.id);
                }
            }
        });
    } else if (message.action === 'switchToWorkspace') {
        switchToWorkspace(message.name);
    } else if (message.action === 'getWorkspaceStats') {
        getWorkspaceStats().then(stats => sendResponse(stats));
        return true;
    } else if (message.action === 'reorganizeAllTabs') {
        reorganizeAllTabs();
    }
    return true;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete' || !tab.url || !tab.url.startsWith('http')) return;
    const skipDomains = ['www.google.com', 'www.bing.com', 'duckduckgo.com'];
    try {
        const url = new URL(tab.url);
        if (skipDomains.includes(url.hostname) || tab.url.includes('D5_index.html')) return;
    } catch (error) { return; }
    
    chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['hover-panel.css']
    }).then(() => {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        });
    }).catch(err => console.log(`Could not inject script: ${err.message}`));
});

chrome.runtime.onStartup.addListener(() => {
    console.log(`🚀 AI Workspace Manager starting up...`);
    setTimeout(() => { reorganizeAllTabs(); }, 3000);
});

chrome.tabGroups.onRemoved.addListener(async (groupId) => {
    const data = await chrome.storage.local.get([TAB_GROUPS_KEY]);
    const tabGroups = data[TAB_GROUPS_KEY] || {};
    for (const [workspace, storedGroupId] of Object.entries(tabGroups)) {
        if (storedGroupId === groupId) {
            delete tabGroups[workspace];
            await chrome.storage.local.set({ [TAB_GROUPS_KEY]: tabGroups });
            console.log(`🗑️ Cleaned up removed group for ${workspace}`);
            break;
        }
    }
});