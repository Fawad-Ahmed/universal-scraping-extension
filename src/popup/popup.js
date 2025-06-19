// popup.js - Universal Web Scraper Popup Script
console.log('🚀 Universal Scraper Popup Loading...');

class UniversalScraperPopup {
    constructor() {
        this.scrapedData = [];
        this.currentTab = null;
        this.init();
    }

    async init() {
        await this.loadCurrentTab();
        await this.loadSettings();
        await this.loadStoredData();
        this.setupEventListeners();
        this.updateUI();
        console.log('✅ Popup initialized');
    }

    async loadCurrentTab() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tabs[0];
        } catch (error) {
            console.error('❌ Error loading current tab:', error);
        }
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get([
                'exportFormat',
                'scrapingDelay', 
                'maxPages'
            ]);

            document.getElementById('exportFormat').value = settings.exportFormat || 'csv';
            document.getElementById('scrapingDelay').value = settings.scrapingDelay || 2000;
            document.getElementById('maxPages').value = settings.maxPages || 10;
        } catch (error) {
            console.error('❌ Error loading settings:', error);
        }
    }

    async loadStoredData() {
        try {
            const stored = await chrome.storage.local.get(['scrapedData']);
            if (stored.scrapedData && stored.scrapedData.length > 0) {
                this.scrapedData = stored.scrapedData;
                this.updateDataStats();
                this.showActionButtons();
            }
        } catch (error) {
            console.error('❌ Error loading stored data:', error);
        }
    }

    setupEventListeners() {
        // Main action buttons
        document.getElementById('showScraper').addEventListener('click', () => {
            this.showScraperOnPage();
        });

        document.getElementById('popOut').addEventListener('click', () => {
            this.openStandaloneWindow();
        });

        document.getElementById('scrapeCurrentPage').addEventListener('click', () => {
            this.quickScrape();
        });

        document.getElementById('openRecipes').addEventListener('click', () => {
            this.openRecipeManager();
        });

        // Data action buttons
        document.getElementById('previewData').addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('downloadData').addEventListener('click', () => {
            this.downloadData();
        });

        document.getElementById('copyToClipboard').addEventListener('click', () => {
            this.copyToClipboard();
        });

        document.getElementById('clearData').addEventListener('click', () => {
            this.clearData();
        });

        // Settings
        ['exportFormat', 'scrapingDelay', 'maxPages'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.saveSettings();
            });
        });

        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((message) => {
            this.handleMessage(message);
        });
    }

    updateUI() {
        this.updateDataStats();
        
        // Show different UI based on data availability
        if (this.scrapedData.length > 0) {
            this.showActionButtons();
        } else {
            this.hideActionButtons();
        }
    }

    updateDataStats() {
        const countEl = document.getElementById('dataCount');
        const statsEl = document.getElementById('dataStats');
        
        if (this.scrapedData.length > 0) {
            countEl.textContent = this.scrapedData.length;
            statsEl.classList.remove('hidden');
        } else {
            statsEl.classList.add('hidden');
        }
    }

    showActionButtons() {
        document.getElementById('actionButtons').classList.remove('hidden');
    }

    hideActionButtons() {
        document.getElementById('actionButtons').classList.add('hidden');
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        statusEl.textContent = message;
        statusEl.className = `status ${type}`;
        statusEl.classList.remove('hidden');

        // Auto hide after 5 seconds
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    }

    async showScraperOnPage() {
        try {
            this.showStatus('Activating scraper on page...', 'info');
            
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'showScraper'
            });

            if (response && response.success) {
                this.showStatus('Scraper activated! Look for the overlay on the page.', 'success');
                window.close();
            } else {
                this.showStatus('Could not activate scraper. Please refresh the page and try again.', 'error');
            }
        } catch (error) {
            console.error('❌ Error showing scraper:', error);
            this.showStatus('Error: ' + error.message, 'error');
        }
    }

    async openStandaloneWindow() {
        try {
            this.showStatus('Opening standalone window...', 'info');
            
            const popup = await chrome.windows.create({
                url: chrome.runtime.getURL('src/standalone/standalone.html'),
                type: 'popup',
                width: 450,
                height: 700,
                focused: true
            });

            await chrome.storage.local.set({ 
                targetTabId: this.currentTab.id,
                scrapedData: this.scrapedData 
            });

            window.close();
        } catch (error) {
            console.error('❌ Error opening standalone window:', error);
            this.showStatus('Error opening window: ' + error.message, 'error');
        }
    }

    async quickScrape() {
        try {
            this.showStatus('Quick scraping current page...', 'info');
            
            const response = await chrome.tabs.sendMessage(this.currentTab.id, {
                action: 'scrapeCurrentPage'
            });

            if (response && response.success) {
                this.scrapedData = response.data;
                await chrome.storage.local.set({ scrapedData: this.scrapedData });
                
                this.showStatus(`Successfully scraped ${response.data.length} items!`, 'success');
                this.updateUI();
            } else {
                this.showStatus('Error: ' + (response ? response.error : 'No response'), 'error');
            }
        } catch (error) {
            console.error('❌ Quick scrape error:', error);
            this.showStatus('Connection error. Please refresh the page and try again.', 'error');
        }
    }

    openRecipeManager() {
        // TODO: Implement recipe manager
        this.showStatus('Recipe manager coming soon!', 'warning');
    }

    showPreview() {
        const previewContainer = document.getElementById('previewContainer');
        const previewTable = document.getElementById('previewTable');
        const previewInfo = document.getElementById('previewInfo');

        if (this.scrapedData.length === 0) {
            this.showStatus('No data to preview', 'error');
            return;
        }

        // Show first 5 rows
        const previewData = this.scrapedData.slice(0, 5);
        const headers = Object.keys(previewData[0]);

        let html = '<table class="preview-table"><thead><tr>';
        headers.forEach(header => {
            html += `<th>${this.formatHeader(header)}</th>`;
        });
        html += '</tr></thead><tbody>';

        previewData.forEach(row => {
            html += '<tr>';
            headers.forEach(header => {
                let value = row[header] || '';
                if (typeof value === 'string' && value.length > 30) {
                    value = value.substring(0, 27) + '...';
                }
                html += `<td title="${this.escapeHtml(row[header] || '')}">${this.escapeHtml(value)}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        previewTable.innerHTML = html;
        previewInfo.textContent = `Showing first 5 of ${this.scrapedData.length} total items`;
        previewContainer.classList.remove('hidden');
    }

    formatHeader(header) {
        return header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async downloadData() {
        if (this.scrapedData.length === 0) {
            this.showStatus('No data to download', 'error');
            return;
        }

        try {
            const format = document.getElementById('exportFormat').value;
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            
            let content, mimeType, filename;

            switch (format) {
                case 'csv':
                    content = this.convertToCSV(this.scrapedData);
                    mimeType = 'text/csv';
                    filename = `scraped-data-${timestamp}.csv`;
                    break;
                
                case 'excel':
                    content = this.convertToCSV(this.scrapedData);
                    mimeType = 'application/vnd.ms-excel';
                    filename = `scraped-data-${timestamp}.xls`;
                    break;
                
                case 'json':
                    content = JSON.stringify(this.scrapedData, null, 2);
                    mimeType = 'application/json';
                    filename = `scraped-data-${timestamp}.json`;
                    break;
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);

            await chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: true
            });

            this.showStatus(`Download started: ${filename}`, 'success');
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('❌ Download error:', error);
            this.showStatus('Download failed: ' + error.message, 'error');
        }
    }

    async copyToClipboard() {
        if (this.scrapedData.length === 0) {
            this.showStatus('No data to copy', 'error');
            return;
        }

        try {
            // Convert to tab-separated values for easy pasting into spreadsheets
            const headers = Object.keys(this.scrapedData[0]);
            const tsvContent = [
                headers.join('\t'),
                ...this.scrapedData.map(row => 
                    headers.map(header => {
                        let cell = row[header] || '';
                        // Clean up for clipboard
                        cell = String(cell).replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
                        return cell;
                    }).join('\t')
                )
            ].join('\n');

            await navigator.clipboard.writeText(tsvContent);
            this.showStatus(`${this.scrapedData.length} items copied to clipboard! Paste into any spreadsheet.`, 'success');
        } catch (error) {
            console.error('❌ Copy error:', error);
            this.showStatus('Copy failed: ' + error.message, 'error');
        }
    }

    async clearData() {
        if (confirm('Are you sure you want to clear all scraped data?')) {
            this.scrapedData = [];
            await chrome.storage.local.remove('scrapedData');
            
            this.updateUI();
            document.getElementById('previewContainer').classList.add('hidden');
            this.showStatus('Data cleared', 'info');
        }
    }

    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let cell = row[header] || '';
                    // Escape quotes and wrap if necessary
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                        cell = `"${cell.replace(/"/g, '""')}"`;
                    }
                    return cell;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    }

    async saveSettings() {
        try {
            const settings = {
                exportFormat: document.getElementById('exportFormat').value,
                scrapingDelay: parseInt(document.getElementById('scrapingDelay').value),
                maxPages: parseInt(document.getElementById('maxPages').value)
            };

            await chrome.storage.sync.set(settings);
            console.log('⚙️ Settings saved:', settings);
        } catch (error) {
            console.error('❌ Error saving settings:', error);
        }
    }

    handleMessage(message) {
        switch (message.action) {
            case 'scrapingProgress':
                this.showProgress(message);
                break;
                
            case 'scrapingComplete':
                this.scrapedData = message.data;
                chrome.storage.local.set({ scrapedData: this.scrapedData });
                this.showStatus(`Scraping completed! ${message.data.length} items extracted.`, 'success');
                this.updateUI();
                this.hideProgress();
                break;
                
            case 'scrapingError':
                this.showStatus(`Scraping error: ${message.error}`, 'error');
                this.hideProgress();
                break;
        }
    }

    showProgress(message) {
        const container = document.getElementById('progressContainer');
        const bar = document.getElementById('progressBar');
        const text = document.getElementById('progressText');
        
        container.classList.remove('hidden');
        
        if (message.total && message.total !== '?') {
            const percentage = Math.round((message.current / message.total) * 100);
            bar.style.width = percentage + '%';
            bar.textContent = percentage + '%';
        } else {
            bar.style.width = '100%';
            bar.textContent = 'Processing...';
        }
        
        text.textContent = `Processing page ${message.current}... (${message.companies || 0} items found)`;
    }

    hideProgress() {
        document.getElementById('progressContainer').classList.add('hidden');
    }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UniversalScraperPopup();
});

console.log('✅ Universal Scraper Popup Script Loaded');
