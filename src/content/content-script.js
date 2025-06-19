// Enhanced Universal Scraper Content Script
// Built on the foundation of Greenspace scraper with universal capabilities
console.log('🚀 Universal Scraper Content Script Loading...');

// Global scraper object with enhanced functionality
window.universalScraper = {
    scrapedData: [],
    isScrapingActive: false,
    currentPage: 1,
    selectedElements: new Set(),
    recipe: null,
    isSelectionMode: false,
    
    // Initialize the scraper
    init() {
        this.setupEventListeners();
        this.setupVisualSelector();
        console.log('✅ Universal Scraper Ready!');
    },

    // Setup event listeners for visual selection
    setupEventListeners() {
        document.addEventListener('mouseover', this.handleMouseOver.bind(this));
        document.addEventListener('mouseout', this.handleMouseOut.bind(this));
        document.addEventListener('click', this.handleClick.bind(this), true);
    },

    // Setup visual selector UI
    setupVisualSelector() {
        // Inject CSS for highlighting
        if (!document.getElementById('universal-scraper-styles')) {
            const style = document.createElement('style');
            style.id = 'universal-scraper-styles';
            style.textContent = `
                .scraper-highlight {
                    outline: 3px solid #007bff !important;
                    outline-offset: 2px !important;
                    background-color: rgba(0, 123, 255, 0.1) !important;
                    cursor: pointer !important;
                }
                .scraper-selected {
                    outline: 3px solid #28a745 !important;
                    outline-offset: 2px !important;
                    background-color: rgba(40, 167, 69, 0.2) !important;
                }
                .scraper-no-select {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Visual element selection handlers
    handleMouseOver(event) {
        if (!this.isSelectionMode) return;
        
        const element = event.target;
        this.highlightElement(element);
    },

    handleMouseOut(event) {
        if (!this.isSelectionMode) return;
        
        const element = event.target;
        element.classList.remove('scraper-highlight');
    },

    handleClick(event) {
        if (!this.isSelectionMode) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const element = event.target;
        this.selectElement(element);
    },

    // Highlight element on hover
    highlightElement(element) {
        // Remove previous highlights
        document.querySelectorAll('.scraper-highlight').forEach(el => {
            el.classList.remove('scraper-highlight');
        });
        
        element.classList.add('scraper-highlight');
    },

    // Select element for scraping
    selectElement(element) {
        const selector = this.generateSelector(element);
        
        if (element.classList.contains('scraper-selected')) {
            // Deselect
            element.classList.remove('scraper-selected');
            this.selectedElements.delete(selector);
        } else {
            // Select
            element.classList.add('scraper-selected');
            this.selectedElements.add({
                selector: selector,
                element: element,
                text: this.extractText(element),
                type: this.getElementType(element)
            });
        }
        
        // Send message to popup
        chrome.runtime.sendMessage({
            action: 'elementSelected',
            selector: selector,
            text: this.extractText(element),
            count: this.selectedElements.size
        });
    },

    // Generate CSS selector for element
    generateSelector(element) {
        // Enhanced selector generation logic
        if (element.id) {
            return `#${element.id}`;
        }
        
        if (element.className && typeof element.className === 'string') {
            const classes = element.className.split(' ').filter(c => c && !c.startsWith('scraper-')).join('.');
            if (classes) {
                return `.${classes}`;
            }
        }
        
        // Generate path-based selector
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
                selector += `#${current.id}`;
                path.unshift(selector);
                break;
            }
            
            if (current.className && typeof current.className === 'string') {
                const classes = current.className.split(' ')
                    .filter(c => c && !c.startsWith('scraper-'))
                    .slice(0, 2);
                if (classes.length) {
                    selector += `.${classes.join('.')}`;
                }
            }
            
            // Add nth-child if needed
            const siblings = Array.from(current.parentNode?.children || [])
                .filter(child => child.tagName === current.tagName);
            
            if (siblings.length > 1) {
                const index = siblings.indexOf(current) + 1;
                selector += `:nth-child(${index})`;
            }
            
            path.unshift(selector);
            current = current.parentNode;
        }
        
        return path.join(' > ');
    },

    // Extract text from element (enhanced from your existing code)
    extractText(element) {
        if (!element) return '';
        return (element.textContent || element.innerText || '').trim();
    },

    // Get element type for better data extraction
    getElementType(element) {
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'a') return 'link';
        if (tagName === 'img') return 'image';
        if (tagName === 'input') return 'input';
        if (element.querySelector('a')) return 'container_with_link';
        if (element.querySelector('img')) return 'container_with_image';
        
        return 'text';
    },

    // Enhanced scraping with your existing logic
    async scrapeCurrentPage() {
        console.log('📊 Starting to scrape current page...');
        
        try {
            // First try selected elements
            if (this.selectedElements.size > 0) {
                return this.extractDataFromSelection();
            }
            
            // Fall back to table detection (from your existing code)
            const table = await this.findTable();
            if (table) {
                return this.extractDataFromTable(table);
            }
            
            throw new Error('No elements selected and no table found. Please select elements or navigate to a page with tabular data.');
        } catch (error) {
            console.error('❌ Error scraping page:', error);
            throw error;
        }
    },

    // Extract data from selected elements
    extractDataFromSelection() {
        const data = [];
        const elements = Array.from(this.selectedElements);
        
        if (elements.length === 0) return data;
        
        // If only one type of element selected, find all similar elements
        if (elements.length === 1) {
            const element = elements[0];
            const similarElements = document.querySelectorAll(element.selector);
            
            similarElements.forEach((el, index) => {
                const item = {};
                
                if (element.type === 'link') {
                    item.text = this.extractText(el);
                    item.url = el.href;
                } else if (element.type === 'image') {
                    item.alt = el.alt;
                    item.src = el.src;
                } else {
                    item.text = this.extractText(el);
                }
                
                item.index = index + 1;
                data.push(item);
            });
        } else {
            // Multiple different elements selected - create a combined data structure
            const firstElementType = elements[0];
            const containers = document.querySelectorAll(firstElementType.selector);
            
            containers.forEach((container, index) => {
                const item = { index: index + 1 };
                
                elements.forEach((elementInfo, fieldIndex) => {
                    const fieldName = `field_${fieldIndex + 1}`;
                    const element = container.querySelector(elementInfo.selector.replace(/^[^>]*> /, ''));
                    
                    if (element) {
                        if (elementInfo.type === 'link') {
                            item[fieldName] = this.extractText(element);
                            item[`${fieldName}_url`] = element.href;
                        } else if (elementInfo.type === 'image') {
                            item[fieldName] = element.alt;
                            item[`${fieldName}_src`] = element.src;
                        } else {
                            item[fieldName] = this.extractText(element);
                        }
                    }
                });
                
                data.push(item);
            });
        }
        
        console.log(`✅ Extracted ${data.length} items from selected elements`);
        return data;
    },

    // Find table (from your existing code)
    async findTable() {
        let table = document.querySelector('table');
        if (table) return table;
        
        // Wait for lazy-loaded content
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkForTable = () => {
                attempts++;
                table = document.querySelector('table');
                
                if (table) {
                    resolve(table);
                    return;
                }
                
                if (attempts >= maxAttempts) {
                    reject(new Error('No table found'));
                    return;
                }
                
                setTimeout(checkForTable, 1000);
            };
            
            checkForTable();
        });
    },

    // Extract data from table (adapted from your existing code)
    extractDataFromTable(table) {
        console.log('📊 Extracting data from table...');
        
        const headerRow = table.querySelector('thead tr, tr:first-child');
        const headers = [];
        
        if (headerRow) {
            const headerCells = headerRow.querySelectorAll('th, td');
            headerCells.forEach((cell, index) => {
                const text = this.extractText(cell);
                let fieldName = text.toLowerCase()
                    .replace(/[^a-zA-Z0-9\\s]/g, '')
                    .replace(/\\s+/g, '_')
                    .trim();
                
                if (!fieldName) fieldName = `column_${index}`;
                headers.push(fieldName);
            });
        }

        // Get data rows
        let dataRows = Array.from(table.querySelectorAll('tbody tr'));
        if (!dataRows.length) {
            const allRows = Array.from(table.querySelectorAll('tr'));
            if (allRows.length > 1) {
                dataRows = allRows.slice(1);
            }
        }

        const data = dataRows.map((row, rowIndex) => {
            const cells = row.querySelectorAll('td, th');
            const rowData = {};

            cells.forEach((cell, cellIndex) => {
                const headerName = headers[cellIndex] || `column_${cellIndex}`;
                
                if (cellIndex === 0) {
                    const link = cell.querySelector('a');
                    rowData['name'] = this.extractText(cell);
                    rowData['url'] = link ? link.href : '';
                } else {
                    const cellValue = this.extractText(cell);
                    if (cellValue) {
                        rowData[headerName] = cellValue;
                    }
                }
            });

            return rowData;
        }).filter(row => Object.keys(row).length > 0);

        console.log(`✅ Extracted ${data.length} items from table`);
        return data;
    },

    // Enhanced next button finding (from your existing code)
    async findNextButton() {
        console.log('🔍 Searching for next button...');
        
        // Check shadow DOM first
        const shadowButton = this.findInShadowDOM();
        if (shadowButton) return shadowButton;
        
        // Regular DOM search
        const selectors = [
            '.next-btn', '.next-button', '[class*="next-btn"]',
            '[data-test*="next"]', '[aria-label*="next"]'
        ];
        
        for (const selector of selectors) {
            const button = document.querySelector(selector);
            if (button && !button.disabled && button.offsetParent !== null) {
                return button;
            }
        }
        
        // Text-based search
        const allButtons = document.querySelectorAll('button, a, [role="button"]');
        for (const btn of allButtons) {
            const text = this.getDeepText(btn).toLowerCase();
            if (text.includes('next') && !btn.disabled && btn.offsetParent !== null) {
                return btn;
            }
        }
        
        return null;
    },

    // Shadow DOM search (from your existing code)
    findInShadowDOM() {
        const elementsWithShadow = this.getAllElementsWithShadowRoot();
        
        for (const element of elementsWithShadow) {
            if (element.shadowRoot) {
                const buttons = element.shadowRoot.querySelectorAll('button, [role="button"]');
                for (const button of buttons) {
                    const text = this.getDeepText(button).toLowerCase();
                    if (text.includes('next') && !button.disabled) {
                        return button;
                    }
                }
            }
        }
        
        return null;
    },

    // Get all elements with shadow roots
    getAllElementsWithShadowRoot() {
        const elementsWithShadow = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: function(node) {
                    return node.shadowRoot ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
                }
            }
        );

        let node;
        while (node = walker.nextNode()) {
            elementsWithShadow.push(node);
        }

        return elementsWithShadow;
    },

    // Enhanced text extraction that handles nested elements, slots, and shadow DOM
    getDeepText(element) {
        if (!element) return '';
        
        // Method 1: Try textContent first
        let text = element.textContent || '';
        
        // Method 2: Try innerText if textContent is empty
        if (!text.trim()) {
            text = element.innerText || '';
        }
        
        // Method 3: Check for common attributes that might contain text
        if (!text.trim()) {
            const attrs = ['aria-label', 'title', 'alt', 'placeholder'];
            for (const attr of attrs) {
                const attrValue = element.getAttribute(attr);
                if (attrValue && attrValue.trim()) {
                    text = attrValue;
                    break;
                }
            }
        }
        
        return text.trim();
    },

    // Click next button with extensive debugging (from your existing code)
    async clickNext() {
        console.log('🖱️ === ATTEMPTING TO CLICK NEXT ===');
        const nextBtn = await this.findNextButton();
        if (!nextBtn) {
            console.log('❌ No next button found, cannot proceed');
            return false;
        }

        try {
            // Save current state for comparison
            const beforeState = this.getPageState();
            console.log('📸 Page state before click:', beforeState);
            
            // Scroll to the button
            nextBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            await this.sleep(1000);
            
            // Try multiple click methods
            console.log('🖱️ Attempting clicks...');
            nextBtn.click();
            await this.sleep(1000);
            
            // Mouse event
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            nextBtn.dispatchEvent(clickEvent);
            
            // Wait for potential page change
            await this.sleep(3000);
            
            // Check if page changed
            const afterState = this.getPageState();
            const hasChanged = this.hasPageChanged(beforeState, afterState);
            
            if (hasChanged) {
                console.log('✅ === PAGE SUCCESSFULLY CHANGED ===');
                return true;
            } else {
                console.log('❌ === PAGE DID NOT CHANGE ===');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error during click process:', error);
            return false;
        }
    },

    // Get current page state for comparison
    getPageState() {
        return {
            url: window.location.href,
            title: document.title,
            timestamp: Date.now()
        };
    },

    // Check if page has changed
    hasPageChanged(before, after) {
        return before.url !== after.url || 
               before.title !== after.title ||
               (after.timestamp - before.timestamp) > 2000;
    },

    // Sleep utility
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Scrape all pages (enhanced version of your existing code)
    async scrapeAllPages(delay = 2000) {
        console.log('🚀 Starting to scrape all pages...');
        this.isScrapingActive = true;
        this.scrapedData = [];
        this.currentPage = 1;

        while (this.isScrapingActive) {
            try {
                console.log(`📄 Scraping page ${this.currentPage}...`);
                
                // Scrape current page
                const pageData = await this.scrapeCurrentPage();
                this.scrapedData.push(...pageData);

                // Send progress update
                chrome.runtime.sendMessage({
                    action: 'scrapingProgress',
                    current: this.currentPage,
                    total: '?',
                    companies: pageData.length,
                    allData: this.scrapedData
                });

                // Try to go to next page
                const hasNext = await this.clickNext();
                if (!hasNext) {
                    console.log('🏁 No more pages to scrape');
                    break;
                }

                this.currentPage++;
                await this.sleep(delay);

                // Safety check
                if (this.currentPage > 100) {
                    console.log('⚠️ Reached maximum page limit');
                    break;
                }

            } catch (error) {
                console.error('❌ Error on page', this.currentPage, ':', error);
                chrome.runtime.sendMessage({
                    action: 'scrapingError',
                    error: error.message
                });
                break;
            }
        }

        // Send completion message
        chrome.runtime.sendMessage({
            action: 'scrapingComplete',
            data: this.scrapedData,
            pages: this.currentPage
        });

        console.log(`🎉 Scraping complete! ${this.scrapedData.length} items from ${this.currentPage} pages`);
    },

    // Stop scraping
    stopScraping() {
        console.log('🛑 Stopping scraping...');
        this.isScrapingActive = false;
    },

    // Toggle visual selector mode
    toggleSelector() {
        this.isSelectionMode = !this.isSelectionMode;
        
        if (this.isSelectionMode) {
            document.body.classList.add('scraper-no-select');
            console.log('👆 Visual selector activated - click elements to select them');
        } else {
            document.body.classList.remove('scraper-no-select');
            console.log('👆 Visual selector deactivated');
        }
        
        return this.isSelectionMode;
    },

    // Message listener
    handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'scrapeCurrentPage':
                this.scrapeCurrentPage().then(data => {
                    sendResponse({ success: true, data });
                }).catch(error => {
                    sendResponse({ success: false, error: error.message });
                });
                break;
                
            case 'scrapeAllPages':
                this.scrapeAllPages(message.delay || 2000);
                sendResponse({ success: true });
                break;
                
            case 'toggleSelector':
                const active = this.toggleSelector();
                sendResponse({ success: true, active });
                break;
                
            case 'stopScraping':
                this.stopScraping();
                sendResponse({ success: true });
                break;
                
            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    }
};

// Initialize when script loads
window.universalScraper.init();

// Message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    window.universalScraper.handleMessage(message, sender, sendResponse);
    return true; // Keep message channel open for async responses
});