// --- START: API Configuration ---
// IMPORTANT: Replace this with your actual Hugging Face token
import { HUGGING_FACE_API_TOKEN } from './config.js';
const API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';
// --- END: API Configuration ---

/**
 * 
 * @param {string} text 
 * @param {string[]} labels 
 * @returns {Promise<Object>} 
 */
async function classifyText(text, labels) {
  console.log(`Sending title to Hugging Face for classification: "${text}"`);

  if (!text || text.trim() === '') {
    return null;
  }

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

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorBody}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Error calling Hugging Face API:", error);
    return null; 
  }
}

// LISTENER 1: This waits for a message from the content script with the page title
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendTitle' && message.title) {
    const workspaceLabels = ["Programming", "Social Media", "News", "Shopping", "Research", "Finance"];

    classifyText(message.title, workspaceLabels).then(result => {
      if (result) {
        const topCategory = result.labels[0];
        const topScore = result.scores[0];

        console.log(
          `%cAI Classification Complete: %c'${topCategory}' %c(${Math.round(topScore * 100)}% confidence)`,
          "font-weight: bold;",
          "color: #1a73e8; font-weight: bold;",
          "color: #555;"
        );
        // NEXT STEP: groupTab(sender.tab.id, topCategory);
      }
    });
  }
  return true;
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url || !tab.url.startsWith('http')) {
    return;
  }

  const domainBlacklist = ['www.google.com', 'www.bing.com', 'duckduckgo.com'];
  const url = new URL(tab.url);
  if (domainBlacklist.includes(url.hostname)) {
    console.log(`Ignoring blacklisted domain: ${url.hostname}`);
    return;
  }

  // Step 1: Inject the CSS for the hover panel
  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ['hover-panel.css']
  }).then(() => {
    // Step 2: After CSS is injected, inject the combined JavaScript
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  }).catch(err => console.log(err));
});

// This listener receives the title from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sendTitle' && message.title) {
    // Call your classifyText function here
    // classifyText(message.title, workspaceLabels).then(...)
    console.log(`Received text for classification: "${message.title}"`);
  }
  return true;
});

// This watches for tabs finishing loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
  //   chrome.scripting.executeScript({
  //     target: { tabId: tabId },
  //     files: ['content.js']
  //   });
  // }
  if (changeInfo.status !== 'complete') {
    return;
  }
  
  if (!tab.url || !tab.url.startsWith('http')) {
    return;
  }


  const domainBlacklist = [
    'www.google.com',
    'www.bing.com',
    'duckduckgo.com',
    'www.baidu.com',
    'www.yahoo.com'
  ];
  

  const url = new URL(tab.url);
  if (domainBlacklist.includes(url.hostname)) {

    console.log(`Ignoring blacklisted domain: ${url.hostname}`);
    return;
  }
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  }).catch(error => {
    console.log(`Could not inject script into tab ${tabId}: ${error.message}`);
  });
});