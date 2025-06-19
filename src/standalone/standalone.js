// Standalone window functionality for Universal Scraping Extension
// Enhanced version with full feature set for extended scraping sessions
console.log('🚀 Universal Scraper Standalone Window Loading...');

class UniversalScraperStandalone {
    constructor() {
        this.scrapedData = [];
        this.isScrapingActive = false;
        this.targetTabId = null;
        this.selectedElements = 0;
        this.selectorActive = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupWindowControls();
        await this.loadStoredData();
        this.loadSettings();
        console.log('✅ Standalone window initialized');
    }

    setupEventListeners() {
        // Window controls
        document.getElementById('minimizeBtn').addEventListener('click', () => {
            chrome.windows.getCurrent(window => {
                chrome.windows.update(window.id, { state: 'minimized' });
            });
        });

        document.getElementById('closeBtn').addEventListener('click', () => {
            window.close();
        });

        // Visual selector controls
        document.getElementById('toggleSelector').addEventListener('click', () => {
            this.toggleVisualSelector();
        });

        document.getElementById('selectSimilar').addEventListener('click', () => {
            this.selectSimilarElements();
        });

        // Scraping controls
        document.getElementById('scrapeCurrentPage').addEventListener('click', () => {
            this.scrapeCurrentPage();
        });

        document.getElementById('scrapeAllPages').addEventListener('click', () => {
            this.scrapeAllPages();
        });

        document.getElementById('stopScraping').addEventListener('click', () => {
            this.stopScraping();
        });

        // Data management
        document.getElementById('downloadData').addEventListener('click', () => {
            this.downloadData();
        });

        document.getElementById('previewData').addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('copyToSheets').addEventListener('click', () => {
            this.copyToGoogleSheets();
        });

        document.getElementById('clearData').addEventListener('click', () => {
            this.clearData();
        });

        // Recipe system
        document.getElementById('saveRecipe').addEventListener('click', () => {
            this.saveRecipe();
        });

        document.getElementById('loadRecipe').addEventListener('click', () => {
            this.loadRecipe();
        });

        // Settings
        document.getElementById('delay').addEventListener('change', () => {
            this.saveSettings();
        });

        document.getElementById('format').addEventListener('change', () => {
            this.saveSettings();
        });

        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
        });

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    setupWindowControls() {
        // Enable window dragging from header
        const header = document.querySelector('.header');
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            dragOffset.x = e.clientX;
            dragOffset.y = e.clientY;
            header.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - dragOffset.x;
            const deltaY = e.clientY - dragOffset.y;
            
            chrome.windows.getCurrent((window) => {
                chrome.windows.update(window.id, {
                    left: window.left + deltaX,
                    top: window.top + deltaY
                });
            });
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            header.style.cursor = 'grab';
        });

        header.style.cursor = 'grab';
    }

    async toggleVisualSelector() {
        if (!this.targetTabId) {
            this.showStatus('❌ No target tab found. Please refresh and try again.', 'error');
            return;
        }

        try {
            const response = await chrome.tabs.sendMessage(this.targetTabId, {
                action: 'toggleSelector'
            });

            if (response?.success) {
                this.selectorActive = response.active;
                this.updateSelectorButton();
                this.showStatus(
                    response.active ? '👆 Visual selector activated - click elements to select' : '👆 Visual selector deactivated',
                    'info'
                );
            }
        } catch (error) {
            this.showStatus('❌ Error toggling selector: ' + error.message, 'error');
        }
    }

    updateSelectorButton() {
        const button = document.getElementById('toggleSelector');
        const selectSimilar = document.getElementById('selectSimilar');
        
        if (this.selectorActive) {
            button.innerHTML = '<span>🛑</span> Stop Selection';
            button.classList.remove('btn-primary');
            button.classList.add('btn-warning');
            selectSimilar.disabled = false;
        } else {
            button.innerHTML = '<span>👆</span> Start Visual Selection';
            button.classList.remove('btn-warning');
            button.classList.add('btn-primary');
            selectSimilar.disabled = this.selectedElements === 0;
        }
    }

    async selectSimilarElements() {
        if (!this.targetTabId) {
            this.showStatus('❌ No target tab found.', 'error');
            return;
        }

        try {
            const response = await chrome.tabs.sendMessage(this.targetTabId, {
                action: 'selectSimilar'
            });

            if (response?.success) {
                this.showStatus(`✅ Selected ${response.count} similar elements`, 'success');
                this.selectedElements = response.count;
                this.updateElementCounter();
            }
        } catch (error) {
            this.showStatus('❌ Error selecting similar elements: ' + error.message, 'error');
        }
    }

    async scrapeCurrentPage() {
        if (!this.targetTabId) {
            this.showStatus('❌ No target tab found. Please refresh and try again.', 'error');
            return;
        }

        try {
            this.showStatus('🔄 Scraping current page...', 'info');
            this.disableButtons(true);
            
            const response = await chrome.tabs.sendMessage(this.targetTabId, {
                action: 'scrapeCurrentPage'
            });

            if (response?.success) {
                this.scrapedData = response.data;
                this.showStatus(`✅ Successfully scraped ${response.data.length} items`, 'success');
                this.showDataActions();
                this.updateDataCounter();
                await this.saveData();
            } else {
                this.showStatus('❌ Error: ' + (response?.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            this.showStatus('❌ Connection error. Please refresh the target page and try again.', 'error');
        } finally {
            this.disableButtons(false);
        }
    }

    async scrapeAllPages() {
        if (!this.targetTabId) {
            this.showStatus('❌ No target tab found. Please refresh and try again.', 'error');
            return;
        }

        try {
            this.showStatus('🚀 Starting multi-page scraping...', 'info');
            
            const delay = parseInt(document.getElementById('delay')?.value) || 2000;
            
            const response = await chrome.tabs.sendMessage(this.targetTabId, {
                action: 'scrapeAllPages',
                delay: delay
            });

            if (response?.success) {
                this.isScrapingActive = true;
                this.showStatus('🔄 Multi-page scraping started', 'info');
                this.showProgress();
                this.updateButtons();
            } else {
                this.showStatus('❌ Error starting scraping', 'error');
            }
        } catch (error) {
            this.showStatus('❌ Connection error: ' + error.message, 'error');
        }
    }

    async stopScraping() {
        if (!this.targetTabId) return;

        try {
            await chrome.tabs.sendMessage(this.targetTabId, {
                action: 'stopScraping'
            });
            
            this.isScrapingActive = false;
            this.hideProgress();
            this.updateButtons();
            this.showStatus('⏹️ Scraping stopped', 'info');
        } catch (error) {
            this.isScrapingActive = false;
            this.hideProgress();
            this.updateButtons();
            this.showStatus('⏹️ Scraping stopped', 'info');
        }
    }

    downloadData() {
        if (!this.scrapedData.length) {
            this.showStatus('❌ No data to download', 'error');
            return;
        }

        const format = document.getElementById('format')?.value || 'csv';
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        
        let content, mimeType, extension;

        switch (format) {
            case 'csv':
                content = this.convertToCSV(this.scrapedData);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'json':
                content = JSON.stringify(this.scrapedData, null, 2);
                mimeType = 'application/json';
                extension = 'json';
                break;
            case 'excel':
                content = this.convertToCSV(this.scrapedData);
                mimeType = 'application/vnd.ms-excel';
                extension = 'xls';
                break;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const filename = `universal-scraper-${timestamp}.${extension}`;

        chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                this.showStatus('❌ Download error: ' + chrome.runtime.lastError.message, 'error');
            } else {
                this.showStatus(`📥 Downloaded: ${filename}`, 'success');
            }
            URL.revokeObjectURL(url);
        });
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let cell = row[header] || '';
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\\n'))) {
                        cell = `"${cell.replace(/"/g, '""')}"`;
                    }
                    return cell;
                }).join(',')
            )
        ].join('\\n');
        
        return csvContent;
    }

    async copyToGoogleSheets() {
        if (!this.scrapedData.length) {
            this.showStatus('❌ No data to copy', 'error');
            return;
        }

        try {
            // Convert to tab-separated values for Google Sheets
            const headers = Object.keys(this.scrapedData[0]);
            const tsvContent = [
                headers.join('\\t'),
                ...this.scrapedData.map(row => 
                    headers.map(header => {
                        let cell = row[header] || '';
                        cell = String(cell).replace(/\\t/g, ' ').replace(/\\n/g, ' ');
                        return cell;
                    }).join('\\t')
                )
            ].join('\\n');

            await navigator.clipboard.writeText(tsvContent);
            
            this.showStatus(`✅ ${this.scrapedData.length} items copied! Open Google Sheets and press Ctrl+V to paste.`, 'success');

        } catch (error) {
            this.showStatus('❌ Copy failed: ' + error.message, 'error');
        }
    }

    showPreview() {
        if (!this.scrapedData.length) {
            this.showStatus('❌ No data to preview', 'error');
            return;
        }

        const previewContainer = document.getElementById('previewContainer');
        const previewTable = document.getElementById('previewTable');
        const previewInfo = document.getElementById('previewInfo');

        // Show first 10 rows for standalone window
        const previewData = this.scrapedData.slice(0, 10);
        const headers = Object.keys(previewData[0]);

        let tableHTML = '<table class="preview-table"><thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header.replace(/_/g, ' ').toUpperCase()}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        previewData.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                let cellValue = row[header] || '';
                // Truncate long values for preview
                if (typeof cellValue === 'string' && cellValue.length > 100) {
                    cellValue = cellValue.substring(0, 97) + '...';
                }
                tableHTML += `<td>${cellValue}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        previewTable.innerHTML = tableHTML;
        
        previewInfo.textContent = `Showing first 10 of ${this.scrapedData.length} total items`;
        previewContainer.classList.remove('hidden');
        
        // Scroll to preview
        previewContainer.scrollIntoView({ behavior: 'smooth' });
    }

    clearData() {
        if (confirm('Are you sure you want to clear all scraped data?')) {
            this.scrapedData = [];
            this.hideDataActions();
            this.updateDataCounter();
            chrome.storage.local.remove('scrapedData');
            document.getElementById('previewContainer').classList.add('hidden');
            this.showStatus('🗑️ Data cleared', 'info');
        }
    }

    saveRecipe() {
        if (this.selectedElements === 0) {
            this.showStatus('❌ No elements selected to save as recipe', 'error');
            return;
        }

        const recipeName = prompt('Enter a name for this scraping recipe:');
        if (recipeName) {
            // Recipe saving logic would go here
            this.showStatus(`💾 Recipe "${recipeName}" saved (feature coming soon)`, 'info');
        }
    }

    loadRecipe() {
        // Recipe loading logic would go here
        this.showStatus('📂 Recipe loading (feature coming soon)', 'info');
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'elementSelected':
                this.selectedElements = message.count || this.selectedElements + 1;
                this.updateElementCounter();
                this.updateSelectorButton();
                break;

            case 'scrapingProgress':
                this.updateProgress(
                    message.current, 
                    message.total, 
                    `Page ${message.current} - ${message.companies} items found`
                );
                this.scrapedData = message.allData || this.scrapedData;
                this.updateDataCounter();
                break;

            case 'scrapingComplete':
                this.scrapedData = message.data;
                this.showStatus(`🎉 Scraping complete! ${message.data.length} items from ${message.pages} pages`, 'success');
                this.updateDataCounter();
                this.hideProgress();
                this.isScrapingActive = false;
                this.updateButtons();
                this.showDataActions();
                this.saveData();
                break;

            case 'scrapingError':
                this.showStatus(`❌ Error: ${message.error}`, 'error');
                this.hideProgress();
                this.isScrapingActive = false;
                this.updateButtons();
                break;
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        statusEl.innerHTML = message;
        statusEl.className = `status ${type}`;
        statusEl.classList.remove('hidden');
        
        // Auto-hide info messages after 10 seconds
        if (type === 'info') {
            setTimeout(() => {
                statusEl.classList.add('hidden');
            }, 10000);
        }
    }

    hideStatus() {
        document.getElementById('status').classList.add('hidden');
    }

    updateDataCounter() {
        const countEl = document.getElementById('dataCounter');
        const textEl = document.getElementById('countText');
        
        if (this.scrapedData.length > 0) {
            textEl.innerHTML = `📊 ${this.scrapedData.length} items scraped<br><small>Ready for export</small>`;
            countEl.classList.remove('hidden');
        } else {
            countEl.classList.add('hidden');
        }
    }

    updateElementCounter() {
        if (this.selectedElements > 0) {
            this.showStatus(`🎯 ${this.selectedElements} elements selected`, 'info');
            document.getElementById('saveRecipe').disabled = false;
        }
    }

    showDataActions() {
        document.getElementById('dataActions').classList.remove('hidden');
    }

    hideDataActions() {
        document.getElementById('dataActions').classList.add('hidden');
    }

    showProgress() {
        document.getElementById('progressContainer').classList.remove('hidden');
    }

    hideProgress() {
        document.getElementById('progressContainer').classList.add('hidden');
    }

    updateProgress(current, total, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        const percentage = total !== '?' && total > 0 ? Math.round((current / total) * 100) : 0;
        
        if (progressFill) {
            progressFill.style.width = percentage > 0 ? percentage + '%' : '100%';
        }
        
        if (progressText) {
            progressText.textContent = text || `Page ${current}`;
        }
    }

    updateButtons() {
        const scrapeAll = document.getElementById('scrapeAllPages');
        const scrapeCurrent = document.getElementById('scrapeCurrentPage');
        
        if (this.isScrapingActive) {
            scrapeAll.style.display = 'none';
            scrapeCurrent.style.display = 'none';
        } else {
            scrapeAll.style.display = 'block';
            scrapeCurrent.style.display = 'block';
        }
    }

    disableButtons(disabled) {
        const buttons = ['scrapeCurrentPage', 'scrapeAllPages', 'toggleSelector'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.disabled = disabled;
        });
    }

    handleResize() {
        // Handle window resize events if needed
        // Could be used to adjust layout or save window size preferences
    }

    async saveData() {
        await chrome.storage.local.set({ 
            scrapedData: this.scrapedData,
            timestamp: Date.now()
        });
    }

    async loadStoredData() {
        try {
            const stored = await chrome.storage.local.get(['targetTabId', 'scrapedData']);
            this.targetTabId = stored.targetTabId;
            
            if (stored.scrapedData?.length) {
                this.scrapedData = stored.scrapedData;
                this.showDataActions();
                this.updateDataCounter();
                this.showStatus(`📊 Loaded ${stored.scrapedData.length} items from previous session`, 'info');
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    saveSettings() {
        const delay = document.getElementById('delay')?.value;
        const format = document.getElementById('format')?.value;
        
        chrome.storage.sync.set({
            scrapingDelay: parseInt(delay),
            exportFormat: format
        });
    }

    loadSettings() {
        chrome.storage.sync.get(['scrapingDelay', 'exportFormat'], (result) => {
            if (result.scrapingDelay) {
                const delayEl = document.getElementById('delay');
                if (delayEl) delayEl.value = result.scrapingDelay;
            }
            if (result.exportFormat) {
                const formatEl = document.getElementById('format');
                if (formatEl) formatEl.value = result.exportFormat;
            }
        });
    }
}

// Initialize standalone window when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UniversalScraperStandalone();
});

console.log('✅ Universal Scraper Standalone Script Loaded');