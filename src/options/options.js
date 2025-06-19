// options.js - Universal Web Scraper Options Page
console.log('⚙️ Options page loading...');

class UniversalScraperOptions {
    constructor() {
        this.defaultSettings = {
            // General Settings
            defaultExportFormat: 'csv',
            defaultScrapingMode: 'auto',
            scrapingDelay: 2000,
            maxPages: 10,
            enableAntiDetection: true,
            autoSaveRecipes: true,
            enableNotifications: true,
            
            // Advanced Settings
            maxRetries: 3,
            timeout: 30,
            userAgent: '',
            excludeSelectors: 'script, style, .ads, #popup',
            
            // Data Processing
            removeEmptyFields: true,
            trimWhitespace: true,
            deduplicateResults: false,
            extractUrls: true,
            extractImages: true,
            maxTextLength: 1000
        };
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        await this.loadStatistics();
        this.setupEventListeners();
        console.log('✅ Options page initialized');
    }

    async loadSettings() {
        try {
            const stored = await chrome.storage.sync.get(this.defaultSettings);
            
            // Populate form fields
            Object.entries(stored).forEach(([key, value]) => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else {
                        element.value = value;
                    }
                }
            });
            
            console.log('⚙️ Settings loaded:', stored);
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            this.showStatus('Error loading settings: ' + error.message, 'error');
        }
    }

    async loadStatistics() {
        try {
            const stats = await chrome.storage.local.get([
                'totalScrapes',
                'totalItems', 
                'savedRecipes',
                'successfulScrapes',
                'failedScrapes'
            ]);
            
            // Update stat displays
            document.getElementById('totalScrapes').textContent = stats.totalScrapes || 0;
            document.getElementById('totalItems').textContent = (stats.totalItems || 0).toLocaleString();
            
            // Count saved recipes
            const recipes = await chrome.storage.local.get('recipes');
            const recipeCount = recipes.recipes ? Object.keys(recipes.recipes).length : 0;
            document.getElementById('savedRecipes').textContent = recipeCount;
            
            // Calculate success rate
            const total = (stats.successfulScrapes || 0) + (stats.failedScrapes || 0);
            const successRate = total > 0 ? Math.round(((stats.successfulScrapes || 0) / total) * 100) : 0;
            document.getElementById('successRate').textContent = successRate + '%';
            
        } catch (error) {
            console.error('❌ Error loading statistics:', error);
        }
    }

    setupEventListeners() {
        // Save Settings
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Cancel Changes
        document.getElementById('cancelChanges').addEventListener('click', () => {
            this.loadSettings();
            this.showStatus('Changes cancelled', 'info');
        });

        // Test Scraper
        document.getElementById('testScraper').addEventListener('click', () => {
            this.testScraper();
        });

        // Reset Statistics
        document.getElementById('resetStats').addEventListener('click', () => {
            this.resetStatistics();
        });

        // Export Statistics
        document.getElementById('exportStats').addEventListener('click', () => {
            this.exportStatistics();
        });

        // Export Settings
        document.getElementById('exportSettings').addEventListener('click', () => {
            this.exportSettings();
        });

        // Import Settings
        document.getElementById('importSettings').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importSettings(e.target.files[0]);
        });

        // Reset Settings
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetToDefaults();
        });

        // Form validation
        this.setupFormValidation();

        // Auto-save on change
        this.setupAutoSave();
    }

    setupFormValidation() {
        // Validate numeric inputs
        const numericInputs = ['scrapingDelay', 'maxPages', 'maxRetries', 'timeout', 'maxTextLength'];
        numericInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.validateNumericInput(element);
                });
            }
        });

        // Validate selectors
        const excludeSelectors = document.getElementById('excludeSelectors');
        if (excludeSelectors) {
            excludeSelectors.addEventListener('blur', () => {
                this.validateSelectors(excludeSelectors);
            });
        }
    }

    setupAutoSave() {
        // Auto-save settings after changes (debounced)
        const inputs = document.querySelectorAll('input, select, textarea');
        const debouncedSave = this.debounce(() => {
            this.saveSettings(false); // Silent save
        }, 2000);

        inputs.forEach(input => {
            input.addEventListener('change', debouncedSave);
        });
    }

    validateNumericInput(element) {
        const value = parseInt(element.value);
        const min = parseInt(element.min);
        const max = parseInt(element.max);

        if (isNaN(value) || value < min || value > max) {
            element.classList.add('invalid');
            return false;
        } else {
            element.classList.remove('invalid');
            element.classList.add('valid');
            setTimeout(() => element.classList.remove('valid'), 2000);
            return true;
        }
    }

    validateSelectors(element) {
        const selectors = element.value.split(',').map(s => s.trim()).filter(s => s);
        let isValid = true;

        selectors.forEach(selector => {
            try {
                document.querySelector(selector);
            } catch (error) {
                isValid = false;
            }
        });

        if (isValid) {
            element.classList.remove('invalid');
            element.classList.add('valid');
            setTimeout(() => element.classList.remove('valid'), 2000);
        } else {
            element.classList.add('invalid');
        }

        return isValid;
    }

    async saveSettings(showMessage = true) {
        try {
            const settings = {};
            
            // Collect all form values
            Object.keys(this.defaultSettings).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        settings[key] = element.checked;
                    } else if (element.type === 'number') {
                        settings[key] = parseInt(element.value) || this.defaultSettings[key];
                    } else {
                        settings[key] = element.value || this.defaultSettings[key];
                    }
                }
            });

            // Validate before saving
            if (!this.validateAllInputs()) {
                this.showStatus('Please fix validation errors before saving', 'error');
                return;
            }

            await chrome.storage.sync.set(settings);
            
            if (showMessage) {
                this.showStatus('Settings saved successfully!', 'success');
            }
            
            console.log('⚙️ Settings saved:', settings);
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            this.showStatus('Error saving settings: ' + error.message, 'error');
        }
    }

    validateAllInputs() {
        const numericInputs = document.querySelectorAll('input[type="number"]');
        let isValid = true;

        numericInputs.forEach(input => {
            if (!this.validateNumericInput(input)) {
                isValid = false;
            }
        });

        const excludeSelectors = document.getElementById('excludeSelectors');
        if (excludeSelectors && !this.validateSelectors(excludeSelectors)) {
            isValid = false;
        }

        return isValid;
    }

    async testScraper() {
        try {
            this.showStatus('Testing scraper functionality...', 'info');
            
            // Get current active tab
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs.length === 0) {
                this.showStatus('No active tab found for testing', 'error');
                return;
            }

            const tab = tabs[0];
            
            // Test content script injection
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'testConnection'
            });

            if (response && response.success) {
                this.showStatus('✅ Scraper test successful! Extension is working properly.', 'success');
            } else {
                this.showStatus('⚠️ Content script not loaded. Try refreshing the page.', 'error');
            }
        } catch (error) {
            console.error('❌ Test error:', error);
            this.showStatus('Test failed: ' + error.message, 'error');
        }
    }

    async resetStatistics() {
        if (!confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
            return;
        }

        try {
            await chrome.storage.local.remove([
                'totalScrapes',
                'totalItems',
                'successfulScrapes', 
                'failedScrapes'
            ]);

            await this.loadStatistics();
            this.showStatus('Statistics reset successfully', 'success');
        } catch (error) {
            console.error('❌ Error resetting statistics:', error);
            this.showStatus('Error resetting statistics: ' + error.message, 'error');
        }
    }

    async exportStatistics() {
        try {
            const stats = await chrome.storage.local.get([
                'totalScrapes',
                'totalItems',
                'successfulScrapes',
                'failedScrapes',
                'recipes'
            ]);

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '2.0.0',
                statistics: stats,
                summary: {
                    totalScrapes: stats.totalScrapes || 0,
                    totalItems: stats.totalItems || 0,
                    successRate: this.calculateSuccessRate(stats),
                    recipesCount: stats.recipes ? Object.keys(stats.recipes).length : 0
                }
            };

            this.downloadFile(
                JSON.stringify(exportData, null, 2),
                `universal-scraper-stats-${new Date().toISOString().slice(0, 10)}.json`,
                'application/json'
            );

            this.showStatus('Statistics exported successfully', 'success');
        } catch (error) {
            console.error('❌ Export error:', error);
            this.showStatus('Export failed: ' + error.message, 'error');
        }
    }

    async exportSettings() {
        try {
            const settings = await chrome.storage.sync.get();
            const recipes = await chrome.storage.local.get('recipes');

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '2.0.0',
                settings: settings,
                recipes: recipes.recipes || {},
                metadata: {
                    platform: navigator.platform,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                }
            };

            this.downloadFile(
                JSON.stringify(exportData, null, 2),
                `universal-scraper-backup-${new Date().toISOString().slice(0, 10)}.json`,
                'application/json'
            );

            this.showStatus('Settings and recipes exported successfully', 'success');
        } catch (error) {
            console.error('❌ Export error:', error);
            this.showStatus('Export failed: ' + error.message, 'error');
        }
    }

    async importSettings(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.version || !data.settings) {
                throw new Error('Invalid backup file format');
            }

            // Import settings
            if (data.settings) {
                await chrome.storage.sync.set(data.settings);
            }

            // Import recipes
            if (data.recipes) {
                await chrome.storage.local.set({ recipes: data.recipes });
            }

            await this.loadSettings();
            await this.loadStatistics();

            this.showStatus('Settings imported successfully! Page will reload in 2 seconds.', 'success');
            
            setTimeout(() => {
                location.reload();
            }, 2000);

        } catch (error) {
            console.error('❌ Import error:', error);
            this.showStatus('Import failed: ' + error.message, 'error');
        }
    }

    async resetToDefaults() {
        if (!confirm('Are you sure you want to reset all settings to defaults? This will overwrite your current configuration.')) {
            return;
        }

        try {
            await chrome.storage.sync.clear();
            await chrome.storage.sync.set(this.defaultSettings);
            await this.loadSettings();
            
            this.showStatus('Settings reset to defaults successfully', 'success');
        } catch (error) {
            console.error('❌ Reset error:', error);
            this.showStatus('Reset failed: ' + error.message, 'error');
        }
    }

    calculateSuccessRate(stats) {
        const total = (stats.successfulScrapes || 0) + (stats.failedScrapes || 0);
        return total > 0 ? Math.round(((stats.successfulScrapes || 0) / total) * 100) : 0;
    }

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
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.style.display = 'block';

        // Auto-hide after 5 seconds unless it's an error
        if (type !== 'error') {
            setTimeout(() => {
                statusEl.style.display = 'none';
            }, 5000);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UniversalScraperOptions();
});

// Add some helpful interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add tooltips to form elements
    const tooltips = {
        'scrapingDelay': 'Higher values reduce server load but increase scraping time',
        'maxPages': 'Set a reasonable limit to prevent infinite loops',
        'enableAntiDetection': 'Uses rotating user agents and delays to avoid detection',
        'maxRetries': 'Number of times to retry failed requests',
        'timeout': 'Maximum time to wait for page responses',
        'excludeSelectors': 'CSS selectors for elements to ignore during scraping',
        'deduplicateResults': 'Remove duplicate entries based on text content',
        'maxTextLength': 'Truncate text fields longer than this limit'
    };

    Object.entries(tooltips).forEach(([id, tooltip]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = tooltip;
        }
    });

    // Add smooth scrolling to sections
    const sectionHeaders = document.querySelectorAll('.section h2');
    sectionHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', () => {
            header.parentElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    document.getElementById('saveSettings').click();
                    break;
                case 'r':
                    e.preventDefault();
                    document.getElementById('resetSettings').click();
                    break;
                case 'e':
                    e.preventDefault();
                    document.getElementById('exportSettings').click();
                    break;
            }
        }
    });
});

console.log('✅ Options page script loaded');
