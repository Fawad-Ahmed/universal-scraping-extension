// Storage utilities for Universal Scraping Extension
// Provides consistent interface for Chrome storage APIs

export class StorageManager {
    constructor() {
        this.local = new LocalStorage();
        this.sync = new SyncStorage();
    }
}

class LocalStorage {
    /**
     * Save data to local storage
     * @param {Object} data - Key-value pairs to save
     * @returns {Promise<void>}
     */
    async set(data) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(data, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Get data from local storage
     * @param {string|string[]|null} keys - Keys to retrieve
     * @returns {Promise<Object>}
     */
    async get(keys = null) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Remove data from local storage
     * @param {string|string[]} keys - Keys to remove
     * @returns {Promise<void>}
     */
    async remove(keys) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.remove(keys, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Clear all local storage
     * @returns {Promise<void>}
     */
    async clear() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.clear(() => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Get storage usage info
     * @returns {Promise<Object>}
     */
    async getBytesInUse(keys = null) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.getBytesInUse(keys, (bytesInUse) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve({ bytesInUse, maxBytes: chrome.storage.local.QUOTA_BYTES });
                }
            });
        });
    }
}

class SyncStorage {
    /**
     * Save data to sync storage
     * @param {Object} data - Key-value pairs to save
     * @returns {Promise<void>}
     */
    async set(data) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(data, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Get data from sync storage
     * @param {string|string[]|null} keys - Keys to retrieve
     * @returns {Promise<Object>}
     */
    async get(keys = null) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Remove data from sync storage
     * @param {string|string[]} keys - Keys to remove
     * @returns {Promise<void>}
     */
    async remove(keys) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.remove(keys, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Clear all sync storage
     * @returns {Promise<void>}
     */
    async clear() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.clear(() => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    }
}

// Predefined storage keys
export const STORAGE_KEYS = {
    SCRAPED_DATA: 'scrapedData',
    USER_SETTINGS: 'userSettings',
    RECIPES: 'recipes',
    LAST_SCRAPE: 'lastScrape',
    TARGET_TAB: 'targetTabId',
    SCRAPING_DELAY: 'scrapingDelay',
    EXPORT_FORMAT: 'exportFormat',
    VISUAL_SELECTOR_STATE: 'visualSelectorState'
};

// Settings management
export class SettingsManager {
    constructor() {
        this.storage = new SyncStorage();
        this.defaults = {
            scrapingDelay: 2000,
            exportFormat: 'csv',
            maxPages: 100,
            autoScroll: true,
            showNotifications: true,
            theme: 'auto'
        };
    }

    /**
     * Get user settings with defaults
     * @returns {Promise<Object>}
     */
    async getSettings() {
        const stored = await this.storage.get(STORAGE_KEYS.USER_SETTINGS);
        return { ...this.defaults, ...(stored[STORAGE_KEYS.USER_SETTINGS] || {}) };
    }

    /**
     * Update user settings
     * @param {Object} settings - Settings to update
     * @returns {Promise<void>}
     */
    async updateSettings(settings) {
        const current = await this.getSettings();
        const updated = { ...current, ...settings };
        await this.storage.set({ [STORAGE_KEYS.USER_SETTINGS]: updated });
    }

    /**
     * Reset settings to defaults
     * @returns {Promise<void>}
     */
    async resetSettings() {
        await this.storage.set({ [STORAGE_KEYS.USER_SETTINGS]: this.defaults });
    }

    /**
     * Get a specific setting
     * @param {string} key - Setting key
     * @returns {Promise<any>}
     */
    async getSetting(key) {
        const settings = await this.getSettings();
        return settings[key];
    }

    /**
     * Set a specific setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     * @returns {Promise<void>}
     */
    async setSetting(key, value) {
        await this.updateSettings({ [key]: value });
    }
}

// Data persistence utilities
export class DataManager {
    constructor() {
        this.storage = new LocalStorage();
    }

    /**
     * Save scraped data
     * @param {Array} data - Scraped data array
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<void>}
     */
    async saveScrapedData(data, metadata = {}) {
        const dataWithMetadata = {
            data,
            metadata: {
                timestamp: Date.now(),
                count: data.length,
                ...metadata
            }
        };
        
        await this.storage.set({ [STORAGE_KEYS.SCRAPED_DATA]: dataWithMetadata });
    }

    /**
     * Get scraped data
     * @returns {Promise<Object>}
     */
    async getScrapedData() {
        const stored = await this.storage.get(STORAGE_KEYS.SCRAPED_DATA);
        return stored[STORAGE_KEYS.SCRAPED_DATA] || { data: [], metadata: {} };
    }

    /**
     * Clear scraped data
     * @returns {Promise<void>}
     */
    async clearScrapedData() {
        await this.storage.remove(STORAGE_KEYS.SCRAPED_DATA);
    }

    /**
     * Get storage usage statistics
     * @returns {Promise<Object>}
     */
    async getStorageStats() {
        const usage = await this.storage.getBytesInUse();
        const scrapedData = await this.getScrapedData();
        
        return {
            totalBytes: usage.bytesInUse,
            maxBytes: usage.maxBytes,
            usagePercent: Math.round((usage.bytesInUse / usage.maxBytes) * 100),
            itemCount: scrapedData.data.length,
            lastUpdate: scrapedData.metadata.timestamp
        };
    }
}

// Export the main storage manager instance
export const storage = new StorageManager();
export const settings = new SettingsManager();
export const dataManager = new DataManager();