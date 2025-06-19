// standalone.js - Universal Web Scraper Standalone Window
console.log('🚀 Universal Scraper Standalone Loading...');

class UniversalScraperStandalone {
    constructor() {
        this.scrapedData = [];
        this.targetTabId = null;
        this.isScrapingActive = false;
        this.isPaused = false;
        this.currentPage = 1;
        this.currentRecipe = null;
        
        this.init();
    }

    async init() {
        await this.loadStoredData();
        await this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        console.log('✅ Standalone window initialized');
    }

    async loadStoredData() {
        try {
            const stored = await chrome.storage.local.get(['targetTabId', 'scrapedData']);
            this.targetTabId = stored.targetTabId;
            
            if (stored.scrapedData && stored.scrapedData.length > 0) {
                this.scrapedData = stored.scrapedData;
                this.updateDataStats();
                this.showDataActions();
            }
            
            console.log('📊 Loaded data:', this.scrapedData.length, 'items');
        } catch (error) {
            console.error('❌ Error loading stored data:', error);
        }
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get([
                'scrapingMode',
                'exportFormat',
                'scrapingDelay',
                'maxPages'
            ]);

            document.getElementById('scrapingMode').value = settings.scrapingMode || 'auto';
            document.getElementById('exportFormat').value = settings.exportFormat || 'csv';
            document.getElementById('scrapingDelay').value = settings.scrapingDelay || 2000;
            document.getElementById('maxPages').value = settings.maxPages || 10;
        } catch (error) {
            console.error('❌ Error loading settings:', error);
        }
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

        // Scraping actions
        document.getElementById('scrapeCurrentPage').addEventListener('click', () => {
            this.scrapeCurrentPage();
        });

        document.getElementById('scrapeAllPages').addEventListener('click', () => {
            this.scrapeAllPages();
        });

        document.getElementById('pauseScraping').addEventListener('click', () => {
            this.pauseScraping();
        });

        document.getElementById('stopScraping').addEventListener('click', () => {
            this.stopScraping();
        });

        // Recipe actions
        document.getElementById('saveRecipe').addEventListener('click', () => {
            this.saveRecipe();
        });

        document.getElementById('loadRecipe').addEventListener('click', () => {
            this.loadRecipe();
        });

        document.getElementById('shareRecipe').addEventListener('click', () => {
            this.shareRecipe();
        });

        // Data actions
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
        ['scrapingMode', 'exportFormat', 'scrapingDelay', 'maxPages'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.saveSettings();
            });
        });

        // Listen for messages from content script and background
        chrome.runtime.onMessage.addListener((message) => {
            this.handleMessage(message);
        });

        // Handle window close
        window.addEventListener('beforeunload', () => {
            this.stopScraping();
        });
    }

    updateUI() {
        this.updateDataStats();
        
        if (this.scrapedData.length > 0) {
            this.showDataActions();
        } else {
            this.hideDataActions();
        }
        
        if (this.isScrapingActive) {
            this.showScrapingControls();
            this.showProgress();
        } else {
            this.hideScrapingControls();
            this.hideProgress();
        }
    }

    updateDataStats() {
        const countEl = document.getElementById('dataCount');
        const statsEl = document.getElementById('dataStats');
        
        if (this.scrapedData.length > 0) {
            countEl.textContent = this.scrapedData.length.toLocaleString();
            statsEl.classList.remove('hidden');
        } else {
            statsEl.classList.add('hidden');
        }
    }

    showDataActions() {
        document.getElementById('dataActions').classList.remove('hidden');
    }

    hideDataActions() {
        document.getElementById('dataActions').classList.add('hidden');
    }

    showScrapingControls() {
        document.getElementById('scrapingControls').classList.remove('hidden');
        document.getElementById('scrapeCurrentPage').disabled = true;
        document.getElementById('scrapeAllPages').disabled = true;
    }

    hideScrapingControls() {
        document.getElementById('scrapingControls').classList.add('hidden');
        document.getElementById('scrapeCurrentPage').disabled = false;
        document.getElementById('scrapeAllPages').disabled = false;
    }

    showProgress() {
        document.getElementById('progressSection').classList.remove('hidden');
    }

    hideProgress() {
        document.getElementById('progressSection').classList.add('hidden');
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('status');
        statusEl.innerHTML = message;
        statusEl.className = `status ${type}`;
        statusEl.classList.remove('hidden');

        // Auto hide after 10 seconds unless it's an error
        if (type !== 'error') {
            setTimeout(() => {
                statusEl.classList.add('hidden');
            }, 10000);
        }
    }

    async scrapeCurrentPage() {
        try {
            this.showStatus('🎯 Scraping current page...', 'info');
            
            if (!this.targetTabId) {
                this.showStatus('❌ No target tab found. Please refresh and try again.', 'error');
                return;
            }

            const mode = document.getElementById('scrapingMode').value;
            const response = await chrome.tabs.sendMessage(this.targetTabId, {
                action: 'scrapeCurrentPage',
                mode: mode
            });

            if (response && response.success) {
                this.scrapedData = response.data;
                await chrome.storage.local.set({ scrapedData: this.scrapedData });
                
                this.showStatus(`✅ Successfully scraped ${response.data.length} items from current page!`, 'success');
                this.updateUI();
            } else {
                this.showStatus(`❌ Error: ${response ? response.error : 'No response from content script'}`, 'error');
            }
        } catch (error) {
            console.error('❌ Scraping error:', error);
            this.showStatus('❌ Connection error. Make sure you\'re on the target page and try again.', 'error');
        }
    }

    async scrapeAllPages() {
        try {
            this.isScrapingActive = true;
            this.isPaused = false;
            this.currentPage = 1;
            this.scrapedData = [];
            
            this.showStatus('🚀 Starting multi-page scraping...', 'info');
            this.updateUI();
            
            const settings = {
                mode: document.getElementById('scrapingMode').value,
                delay: parseInt(document.getElementById('scrapingDelay').value),
                maxPages: parseInt(document.getElementById('maxPages').value)
            };

            if (!this.targetTabId) {
                this.showStatus('❌ No target tab found. Please refresh and try again.', 'error');
                this.isScrapingActive = false;
                this.updateUI();
                return;
            }

            const response = await chrome.tabs.sendMessage(this.targetTabId, {
                action: 'scrapeAllPages',
                settings: settings
            });

            if (response && response.success) {
                this.showStatus('⏳ Multi-page scraping started! This may take a while...', 'info');
            } else {
                this.showStatus(`❌ Error: ${response ? response.error : 'Failed to start scraping'}`, 'error');
                this.isScrapingActive = false;
                this.updateUI();
            }
        } catch (error) {
            console.error('❌ Scraping error:', error);
            this.showStatus('❌ Connection error. Make sure you\'re on the target page and try again.', 'error');
            this.isScrapingActive = false;
            this.updateUI();
        }
    }

    async pauseScraping() {
        try {
            this.isPaused = !this.isPaused;
            
            await chrome.tabs.sendMessage(this.targetTabId, {
                action: this.isPaused ? 'pauseScraping' : 'resumeScraping'
            });
            
            const pauseBtn = document.getElementById('pauseScraping');
            pauseBtn.innerHTML = this.isPaused ? 
                '<span class="icon">▶️</span> Resume' : 
                '<span class="icon">⏸️</span> Pause';
                
            this.showStatus(this.isPaused ? '⏸️ Scraping paused' : '▶️ Scraping resumed', 'warning');
        } catch (error) {
            console.error('❌ Error pausing scraping:', error);
        }
    }

    async stopScraping() {
        try {
            this.isScrapingActive = false;
            this.isPaused = false;
            
            await chrome.tabs.sendMessage(this.targetTabId, { action: 'stopScraping' });
            
            this.showStatus('⏹️ Scraping stopped', 'warning');
            this.updateUI();
        } catch (error) {
            console.error('❌ Error stopping scraping:', error);
            this.isScrapingActive = false;
            this.updateUI();
        }
    }

    async saveRecipe() {
        try {
            const name = prompt('Enter a name for this recipe:');
            if (!name) return;
            
            const description = prompt('Enter a description (optional):') || '';
            
            const recipe = {
                id: `recipe_${Date.now()}`,
                name: name,
                description: description,
                url: await this.getCurrentTabUrl(),
                mode: document.getElementById('scrapingMode').value,
                settings: {
                    delay: parseInt(document.getElementById('scrapingDelay').value),
                    maxPages: parseInt(document.getElementById('maxPages').value),
                    exportFormat: document.getElementById('exportFormat').value
                },
                createdAt: new Date().toISOString()
            };

            await chrome.runtime.sendMessage({
                action: 'saveRecipe',
                recipe: recipe
            });

            this.currentRecipe = recipe;
            this.showStatus(`💾 Recipe "${name}" saved successfully!`, 'success');
        } catch (error) {
            console.error('❌ Error saving recipe:', error);
            this.showStatus('❌ Error saving recipe: ' + error.message, 'error');
        }
    }

    async loadRecipe() {
        try {
            const response = await chrome.runtime.sendMessage({ action: 'loadRecipes' });
            
            if (!response.success || response.recipes.length === 0) {
                this.showStatus('📂 No saved recipes found', 'warning');
                return;
            }

            // Create a simple selection interface
            const recipeList = response.recipes.map((recipe, index) => 
                `${index + 1}. ${recipe.name} - ${recipe.description || 'No description'}`
            ).join('\n');

            const selection = prompt(`Select a recipe:\n\n${recipeList}\n\nEnter the number:`);
            if (!selection) return;

            const recipeIndex = parseInt(selection) - 1;
            if (recipeIndex < 0 || recipeIndex >= response.recipes.length) {
                this.showStatus('❌ Invalid recipe selection', 'error');
                return;
            }

            const recipe = response.recipes[recipeIndex];
            this.applyRecipe(recipe);
            this.showStatus(`📂 Recipe "${recipe.name}" loaded successfully!`, 'success');
        } catch (error) {
            console.error('❌ Error loading recipe:', error);
            this.showStatus('❌ Error loading recipe: ' + error.message, 'error');
        }
    }

    applyRecipe(recipe) {
        this.currentRecipe = recipe;
        
        // Apply settings
        document.getElementById('scrapingMode').value = recipe.mode || 'auto';
        if (recipe.settings) {
            document.getElementById('scrapingDelay').value = recipe.settings.delay || 2000;
            document.getElementById('maxPages').value = recipe.settings.maxPages || 10;
            document.getElementById('exportFormat').value = recipe.settings.exportFormat || 'csv';
        }
        
        this.saveSettings();
    }

    async shareRecipe() {
        if (!this.currentRecipe) {
            this.showStatus('❌ No recipe to share. Please save a recipe first.', 'error');
            return;
        }

        try {
            const recipeJson = JSON.stringify(this.currentRecipe, null, 2);
            await navigator.clipboard.writeText(recipeJson);
            this.showStatus('🔗 Recipe copied to clipboard! Share it with others.', 'success');
        } catch (error) {
            console.error('❌ Error sharing recipe:', error);
            this.showStatus('❌ Error sharing recipe: ' + error.message, 'error');
        }
    }

    showPreview() {
        const previewSection = document.getElementById('previewSection');
        const previewTable = document.getElementById('previewTable');
        const previewInfo = document.getElementById('previewInfo');

        if (this.scrapedData.length === 0) {
            this.showStatus('👀 No data to preview', 'warning');
            return;
        }

        // Show first 10 rows
        const previewData = this.scrapedData.slice(0, 10);
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
                if (typeof value === 'string' && value.length > 50) {
                    value = value.substring(0, 47) + '...';
                }
                html += `<td title="${this.escapeHtml(row[header] || '')}">${this.escapeHtml(value)}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        previewTable.innerHTML = html;
        previewInfo.textContent = `Showing first 10 of ${this.scrapedData.length} total items`;
        previewSection.classList.remove('hidden');
        
        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth' });
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
            this.showStatus('📥 No data to download', 'warning');
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
                    filename = `universal-scraper-data-${timestamp}.csv`;
                    break;
                
                case 'excel':
                    content = this.convertToCSV(this.scrapedData);
                    mimeType = 'application/vnd.ms-excel';
                    filename = `universal-scraper-data-${timestamp}.xls`;
                    break;
                
                case 'json':
                    content = JSON.stringify(this.scrapedData, null, 2);
                    mimeType = 'application/json';
                    filename = `universal-scraper-data-${timestamp}.json`;
                    break;
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);

            await chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: true
            });

            this.showStatus(`📥 Download started: ${filename}`, 'success');
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('❌ Download error:', error);
            this.showStatus('❌ Download failed: ' + error.message, 'error');
        }
    }

    async copyToClipboard() {
        if (this.scrapedData.length === 0) {
            this.showStatus('📋 No data to copy', 'warning');
            return;
        }

        try {
            // Convert to tab-separated values for spreadsheet compatibility
            const headers = Object.keys(this.scrapedData[0]);
            const tsvContent = [
                headers.join('\t'),
                ...this.scrapedData.map(row => 
                    headers.map(header => {
                        let cell = row[header] || '';
                        // Clean for clipboard
                        cell = String(cell).replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
                        return cell;
                    }).join('\t')
                )
            ].join('\n');

            await navigator.clipboard.writeText(tsvContent);
            this.showStatus(`📋 ${this.scrapedData.length} items copied to clipboard! Paste into any spreadsheet application.`, 'success');
        } catch (error) {
            console.error('❌ Copy error:', error);
            this.showStatus('❌ Copy failed: ' + error.message, 'error');
        }
    }

    async clearData() {
        if (confirm('Are you sure you want to clear all scraped data?')) {
            this.scrapedData = [];
            await chrome.storage.local.remove('scrapedData');
            
            this.updateUI();
            document.getElementById('previewSection').classList.add('hidden');
            this.showStatus('🗑️ All data cleared', 'info');
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
                scrapingMode: document.getElementById('scrapingMode').value,
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

    async getCurrentTabUrl() {
        try {
            const tab = await chrome.tabs.get(this.targetTabId);
            return tab.url;
        } catch (error) {
            return '';
        }
    }

    updateProgress(current, total, text) {
        const bar = document.getElementById('progressBar');
        const textEl = document.getElementById('progressText');
        
        if (total && total !== '?') {
            const percentage = Math.round((current / total) * 100);
            bar.style.width = percentage + '%';
            bar.textContent = percentage + '%';
        } else {
            bar.style.width = '100%';
            bar.textContent = 'Processing...';
        }
        
        textEl.textContent = text || `Processing page ${current}...`;
    }

    handleMessage(message) {
        switch (message.action) {
            case 'scrapingProgress':
                this.updateProgress(
                    message.current,
                    message.total,
                    `Page ${message.current} of ${message.total || '?'} - ${message.companies || 0} items found`
                );
                
                if (message.allData) {
                    this.scrapedData = message.allData;
                    this.updateDataStats();
                    chrome.storage.local.set({ scrapedData: this.scrapedData });
                }
                break;

            case 'scrapingComplete':
                this.scrapedData = message.data;
                chrome.storage.local.set({ scrapedData: this.scrapedData });
                
                this.showStatus(`🎉 Scraping completed! ${message.data.length} items extracted from ${message.pages || 1} pages.`, 'success');
                this.isScrapingActive = false;
                this.updateUI();
                break;

            case 'scrapingError':
                this.showStatus(`❌ Scraping error: ${message.error}`, 'error');
                this.isScrapingActive = false;
                this.updateUI();
                break;

            case 'scrapingPaused':
                this.showStatus('⏸️ Scraping paused by content script', 'warning');
                break;

            case 'scrapingResumed':
                this.showStatus('▶️ Scraping resumed', 'info');
                break;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UniversalScraperStandalone();
});

console.log('✅ Universal Scraper Standalone Script Loaded');
