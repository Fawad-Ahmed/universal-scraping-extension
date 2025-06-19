// background.js - Universal Web Scraper Background Script
console.log('🌐 Universal Web Scraper background script loaded');

// Install handler
chrome.runtime.onInstalled.addListener(() => {
    console.log('🚀 Universal Web Scraper installed successfully');
    
    // Set default settings
    chrome.storage.sync.set({
        scrapingDelay: 2000,
        exportFormat: 'csv',
        maxPages: 100,
        enableAntiDetection: true
    });
});

// Handle messages between popup, content script, and standalone window
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📨 Background received message:', message.action);
    
    switch (message.action) {
        case 'scrapingProgress':
        case 'scrapingComplete':
        case 'scrapingError':
            // Forward progress messages to all listening windows
            broadcastToExtensionWindows(message);
            break;
            
        case 'openStandaloneWindow':
            openStandaloneWindow(sender.tab.id);
            break;
            
        case 'saveRecipe':
            saveRecipe(message.recipe);
            break;
            
        case 'loadRecipes':
            loadRecipes(sendResponse);
            return true; // Will respond asynchronously
            
        default:
            console.log('Unknown message action:', message.action);
    }
});

// Broadcast message to all extension windows
function broadcastToExtensionWindows(message) {
    // Send to all tabs with the extension
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, message).catch(() => {
                // Ignore errors for tabs without content script
            });
        });
    });
    
    // Send to popup if open
    chrome.runtime.sendMessage(message).catch(() => {
        // Ignore if popup is not open
    });
}

// Open standalone scraper window
async function openStandaloneWindow(targetTabId) {
    try {
        const popup = await chrome.windows.create({
            url: chrome.runtime.getURL('src/standalone/standalone.html'),
            type: 'popup',
            width: 450,
            height: 700,
            focused: true
        });
        
        // Store target tab ID for the standalone window
        await chrome.storage.local.set({ 
            [`standaloneTarget_${popup.id}`]: targetTabId 
        });
        
        console.log('✅ Standalone window opened:', popup.id);
    } catch (error) {
        console.error('❌ Error opening standalone window:', error);
    }
}

// Save scraping recipe
async function saveRecipe(recipe) {
    try {
        const { recipes = {} } = await chrome.storage.local.get('recipes');
        const recipeId = recipe.id || generateRecipeId();
        
        recipes[recipeId] = {
            ...recipe,
            id: recipeId,
            createdAt: recipe.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await chrome.storage.local.set({ recipes });
        console.log('💾 Recipe saved:', recipeId);
    } catch (error) {
        console.error('❌ Error saving recipe:', error);
    }
}

// Load all recipes
async function loadRecipes(sendResponse) {
    try {
        const { recipes = {} } = await chrome.storage.local.get('recipes');
        sendResponse({ success: true, recipes: Object.values(recipes) });
    } catch (error) {
        console.error('❌ Error loading recipes:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Generate unique recipe ID
function generateRecipeId() {
    return 'recipe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    console.log('🖱️ Extension icon clicked on tab:', tab.id);
});

// Context menu setup
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "scrapeElement",
        title: "Scrape this element",
        contexts: ["selection", "link", "image"]
    });
    
    chrome.contextMenus.create({
        id: "scrapePage",
        title: "Scrape entire page",
        contexts: ["page"]
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    chrome.tabs.sendMessage(tab.id, {
        action: 'contextMenuAction',
        menuId: info.menuItemId,
        selectionText: info.selectionText,
        linkUrl: info.linkUrl,
        srcUrl: info.srcUrl
    });
});

console.log('✅ Universal Web Scraper background script ready');
