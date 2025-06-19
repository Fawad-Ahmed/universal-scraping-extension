// content.js - Universal Web Scraper Content Script
console.log('🚀 Universal Web Scraper Content Script Loading...');

// Main scraper object
window.universalScraper = {
    scrapedData: [],
    isScrapingActive: false,
    currentPage: 1,
    isVisible: false,
    selectedElements: [],
    
    // Initialize the scraper
    init() {
        this.injectStyles();
        this.setupEventListeners();
        this.createUI();
        console.log('✅ Universal Scraper initialized');
    },

    // Inject scraper styles
    injectStyles() {
        if (document.getElementById('universal-scraper-styles')) return;
        
        const styles = `
            .us-highlight {
                outline: 2px solid #007bff !important;
                background-color: rgba(0, 123, 255, 0.1) !important;
                cursor: pointer !important;
            }
            .us-selected {
                outline: 3px solid #28a745 !important;
                background-color: rgba(40, 167, 69, 0.2) !important;
            }
            .us-ui-overlay {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 999999;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                max-width: 300px;
                display: none;
            }
            .us-button {
                background: #007bff;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin: 2px;
                font-size: 12px;
            }
            .us-button:hover { background: #0056b3; }
            .us-button.success { background: #28a745; }
            .us-button.danger { background: #dc3545; }
            .us-preview {
                max-height: 200px;
                overflow: auto;
                border: 1px solid #ddd;
                margin: 10px 0;
                font-size: 11px;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'universal-scraper-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    },

    // Create floating UI
    createUI() {
        const ui = document.createElement('div');
        ui.id = 'universal-scraper-ui';
        ui.className = 'us-ui-overlay';
        ui.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong>🌐 Universal Scraper</strong>
                <button class="us-button" onclick="window.universalScraper.toggleUI()">✕</button>
            </div>
            <div id="us-mode-selector">
                <button class="us-button" onclick="window.universalScraper.setMode('select')">📍 Select Elements</button>
                <button class="us-button" onclick="window.universalScraper.setMode('table')">📊 Auto-detect Table</button>
                <button class="us-button" onclick="window.universalScraper.setMode('list')">📋 Auto-detect List</button>
            </div>
            <div id="us-controls" style="margin-top: 10px; display: none;">
                <div id="us-preview" class="us-preview"></div>
                <button class="us-button success" onclick="window.universalScraper.scrapeSelected()">🚀 Scrape</button>
                <button class="us-button" onclick="window.universalScraper.clearSelection()">🗑️ Clear</button>
                <button class="us-button" onclick="window.universalScraper.exportData()">📥 Export</button>
            </div>
        `;
        document.body.appendChild(ui);
    },

    // Toggle UI visibility
    toggleUI() {
        const ui = document.getElementById('universal-scraper-ui');
        this.isVisible = !this.isVisible;
        ui.style.display = this.isVisible ? 'block' : 'none';
        
        if (!this.isVisible) {
            this.clearHighlights();
            this.clearSelection();
        }
    },

    // Set scraping mode
    setMode(mode) {
        this.clearSelection();
        this.mode = mode;
        
        switch (mode) {
            case 'select':
                this.enableElementSelection();
                break;
            case 'table':
                this.autoDetectTable();
                break;
            case 'list':
                this.autoDetectList();
                break;
        }
    },

    // Enable element selection mode
    enableElementSelection() {
        document.addEventListener('mouseover', this.highlightElement.bind(this));
        document.addEventListener('mouseout', this.removeHighlight.bind(this));
        document.addEventListener('click', this.selectElement.bind(this));
        console.log('🎯 Element selection mode enabled');
    },

    // Highlight element on hover
    highlightElement(e) {
        if (e.target.closest('#universal-scraper-ui')) return;
        e.target.classList.add('us-highlight');
    },

    // Remove highlight
    removeHighlight(e) {
        e.target.classList.remove('us-highlight');
    },

    // Select element on click
    selectElement(e) {
        if (e.target.closest('#universal-scraper-ui')) return;
        e.preventDefault();
        e.stopPropagation();
        
        const element = e.target;
        element.classList.add('us-selected');
        this.selectedElements.push(element);
        
        this.updatePreview();
        document.getElementById('us-controls').style.display = 'block';
        
        console.log('✅ Element selected:', element);
    },

    // Auto-detect table
    autoDetectTable() {
        const tables = document.querySelectorAll('table');
        if (tables.length === 0) {
            alert('No tables found on this page');
            return;
        }
        
        // Select the largest table
        let largestTable = tables[0];
        let maxRows = 0;
        
        tables.forEach(table => {
            const rowCount = table.querySelectorAll('tr').length;
            if (rowCount > maxRows) {
                maxRows = rowCount;
                largestTable = table;
            }
        });
        
        this.clearSelection();
        largestTable.classList.add('us-selected');
        this.selectedElements.push(largestTable);
        this.updatePreview();
        document.getElementById('us-controls').style.display = 'block';
        
        console.log('📊 Table auto-detected:', largestTable);
    },

    // Auto-detect list
    autoDetectList() {
        // Look for common list patterns
        const listSelectors = [
            'ul > li',
            'ol > li', 
            '[class*="list"] > div',
            '[class*="item"]',
            '[class*="card"]',
            '[class*="product"]',
            '[class*="result"]'
        ];
        
        let bestMatch = null;
        let maxCount = 0;
        
        listSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > maxCount && elements.length >= 3) {
                maxCount = elements.length;
                bestMatch = { selector, elements };
            }
        });
        
        if (!bestMatch) {
            alert('No lists detected on this page');
            return;
        }
        
        this.clearSelection();
        bestMatch.elements.forEach(el => {
            el.classList.add('us-selected');
            this.selectedElements.push(el);
        });
        
        this.updatePreview();
        document.getElementById('us-controls').style.display = 'block';
        
        console.log('📋 List auto-detected:', bestMatch.selector, bestMatch.elements.length);
    },

    // Update preview
    updatePreview() {
        const preview = document.getElementById('us-preview');
        if (this.selectedElements.length === 0) {
            preview.innerHTML = '<em>No elements selected</em>';
            return;
        }
        
        const data = this.extractDataFromElements();
        const table = this.createPreviewTable(data.slice(0, 5));
        preview.innerHTML = `
            <div><strong>${this.selectedElements.length} elements selected</strong></div>
            ${table}
        `;
    },

    // Extract data from selected elements
    extractDataFromElements() {
        if (this.selectedElements.length === 0) return [];
        
        // Check if we have a table
        const table = this.selectedElements.find(el => el.tagName === 'TABLE');
        if (table) {
            return this.extractTableData(table);
        }
        
        // Extract data from individual elements
        return this.selectedElements.map((el, index) => {
            const data = { index: index + 1 };
            
            // Extract text content
            data.text = this.extractText(el);
            
            // Extract links
            const links = el.querySelectorAll('a');
            if (links.length > 0) {
                data.link = links[0].href;
                data.linkText = links[0].textContent.trim();
            }
            
            // Extract images
            const images = el.querySelectorAll('img');
            if (images.length > 0) {
                data.image = images[0].src;
                data.imageAlt = images[0].alt;
            }
            
            // Extract other attributes
            if (el.id) data.id = el.id;
            if (el.className) data.className = el.className;
            
            return data;
        });
    },

    // Extract table data
    extractTableData(table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length === 0) return [];
        
        // Get headers
        const headerRow = rows[0];
        const headers = Array.from(headerRow.querySelectorAll('th, td')).map((cell, index) => {
            const text = this.extractText(cell);
            return text || `Column ${index + 1}`;
        });
        
        // Get data rows
        const dataRows = rows.slice(1);
        return dataRows.map(row => {
            const data = {};
            const cells = row.querySelectorAll('td, th');
            
            cells.forEach((cell, index) => {
                const header = headers[index] || `Column ${index + 1}`;
                data[header] = this.extractText(cell);
                
                // Extract links from cells
                const link = cell.querySelector('a');
                if (link) {
                    data[`${header}_link`] = link.href;
                }
                
                // Extract images from cells
                const img = cell.querySelector('img');
                if (img) {
                    data[`${header}_image`] = img.src;
                }
            });
            
            return data;
        });
    },

    // Extract text from element
    extractText(element) {
        if (!element) return '';
        return (element.textContent || element.innerText || '').trim();
    },

    // Create preview table
    createPreviewTable(data) {
        if (data.length === 0) return '<em>No data to preview</em>';
        
        const headers = Object.keys(data[0]);
        let html = '<table border="1" cellpadding="2"><thead><tr>';
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        data.forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                const value = row[header] || '';
                const truncated = value.length > 30 ? value.substring(0, 27) + '...' : value;
                html += `<td>${truncated}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        return html;
    },

    // Scrape selected elements
    scrapeSelected() {
        this.scrapedData = this.extractDataFromElements();
        
        if (this.scrapedData.length === 0) {
            alert('No data extracted');
            return;
        }
        
        console.log('✅ Data scraped:', this.scrapedData);
        alert(`Successfully scraped ${this.scrapedData.length} items!`);
        
        // Send to popup/background
        chrome.runtime.sendMessage({
            action: 'scrapingComplete',
            data: this.scrapedData
        });
    },

    // Export data
    exportData() {
        if (this.scrapedData.length === 0) {
            alert('No data to export. Please scrape data first.');
            return;
        }
        
        const format = prompt('Export format (csv/json):', 'csv');
        if (!format) return;
        
        let content, mimeType, filename;
        
        if (format.toLowerCase() === 'json') {
            content = JSON.stringify(this.scrapedData, null, 2);
            mimeType = 'application/json';
            filename = 'scraped-data.json';
        } else {
            content = this.convertToCSV(this.scrapedData);
            mimeType = 'text/csv';
            filename = 'scraped-data.csv';
        }
        
        this.downloadFile(content, filename, mimeType);
    },

    // Convert to CSV
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let cell = row[header] || '';
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                        cell = `"${cell.replace(/"/g, '""')}"`;
                    }
                    return cell;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    },

    // Download file
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // Clear selection
    clearSelection() {
        this.selectedElements.forEach(el => {
            el.classList.remove('us-selected');
        });
        this.selectedElements = [];
        this.updatePreview();
        document.getElementById('us-controls').style.display = 'none';
    },

    // Clear highlights
    clearHighlights() {
        document.querySelectorAll('.us-highlight').forEach(el => {
            el.classList.remove('us-highlight');
        });
    },

    // Setup event listeners
    setupEventListeners() {
        // Listen for messages from popup/background
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Will respond asynchronously
        });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.clearHighlights();
            this.clearSelection();
        });
    },

    // Handle messages
    handleMessage(message, sender, sendResponse) {
        console.log('📨 Content script received message:', message.action);
        
        switch (message.action) {
            case 'showScraper':
                this.isVisible = true;
                document.getElementById('universal-scraper-ui').style.display = 'block';
                sendResponse({ success: true });
                break;
                
            case 'hideScraper':
                this.isVisible = false;
                document.getElementById('universal-scraper-ui').style.display = 'none';
                this.clearHighlights();
                this.clearSelection();
                sendResponse({ success: true });
                break;
                
            case 'scrapeCurrentPage':
                try {
                    if (this.selectedElements.length === 0) {
                        // Auto-detect if nothing selected
                        this.autoDetectTable() || this.autoDetectList();
                    }
                    this.scrapeSelected();
                    sendResponse({ success: true, data: this.scrapedData });
                } catch (error) {
                    console.error('❌ Scraping error:', error);
                    sendResponse({ success: false, error: error.message });
                }
                break;
                
            case 'contextMenuAction':
                this.handleContextMenu(message);
                sendResponse({ success: true });
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    },

    // Handle context menu actions
    handleContextMenu(message) {
        switch (message.menuId) {
            case 'scrapeElement':
                // Implementation for scraping specific element
                break;
            case 'scrapePage':
                this.autoDetectTable() || this.autoDetectList();
                break;
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.universalScraper.init();
    });
} else {
    window.universalScraper.init();
}

// Show scraper when extension icon is clicked
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleScraper') {
        window.universalScraper.toggleUI();
    }
});

console.log('✅ Universal Web Scraper Content Script Ready!');
