// Enhanced background script for Universal Scraping Extension
console.log('🚀 Universal Scraping Background Script Loading...');

class UniversalScrapingBackground {
    constructor() {
        this.init();
    }

    init() {
        this.setupListeners();
        console.log('🚀 Universal Scraping Background Script Ready');
    }

    setupListeners() {
        // Installation listener
        chrome.runtime.onInstalled.addListener((details) => {
            console.log('Universal Scraping Extension installed:', details.reason);
            
            if (details.reason === 'install') {
                this.showWelcomePage();
            }
        });

        // Message handling
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open
        });

        // Tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.onTabComplete(tabId, tab);
            }
        });
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'scrapingProgress':
            case 'scrapingComplete':
            case 'scrapingError':
                // Forward progress messages to popup/standalone
                this.broadcastMessage(message);
                break;
                
            case 'getTabInfo':
                chrome.tabs.get(sender.tab.id, (tab) => {
                    sendResponse({ tab });
                });
                break;
                
            default:
                console.log('Unknown message action:', message.action);
        }
    }

    broadcastMessage(message) {
        // Send to all extension pages
        chrome.runtime.sendMessage(message).catch(() => {
            // Ignore errors (no listeners)
        });
    }

    onTabComplete(tabId, tab) {
        // Inject content script if needed
        if (this.shouldInjectScript(tab.url)) {
            chrome.scripting.executeScript({
                target: { tabId },
                files: ['content-script.js']
            }).catch(console.error);
        }
    }

    shouldInjectScript(url) {
        if (!url) return false;
        
        // Don't inject on chrome:// pages, extensions, etc.
        const restrictedPatterns = [
            'chrome://', 'chrome-extension://', 'moz-extension://',
            'about:', 'file://', 'data:'
        ];
        
        return !restrictedPatterns.some(pattern => url.startsWith(pattern));
    }

    showWelcomePage() {
        chrome.tabs.create({
            url: 'https://github.com/Fawad-Ahmed/universal-scraping-extension'
        });
    }
}

// Initialize background script
new UniversalScrapingBackground();