// Export utilities for Universal Scraping Extension
// Handles conversion to various data formats and download functionality

/**
 * Export manager for handling different data formats
 */
export class ExportManager {
    constructor() {
        this.supportedFormats = ['csv', 'json', 'excel', 'tsv'];
    }

    /**
     * Export data to specified format
     * @param {Array} data - Array of objects to export
     * @param {string} format - Export format (csv, json, excel, tsv)
     * @param {string} filename - Optional filename
     * @returns {Promise<Object>} Export result with download URL
     */
    async exportData(data, format = 'csv', filename = null) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error('No data provided for export');
        }

        if (!this.supportedFormats.includes(format.toLowerCase())) {
            throw new Error(`Unsupported format: ${format}`);
        }

        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const defaultFilename = `universal-scraper-${timestamp}`;
        const finalFilename = filename || defaultFilename;

        let content, mimeType, extension;

        switch (format.toLowerCase()) {
            case 'csv':
                content = this.convertToCSV(data);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            
            case 'json':
                content = this.convertToJSON(data);
                mimeType = 'application/json';
                extension = 'json';
                break;
            
            case 'excel':
                content = this.convertToExcel(data);
                mimeType = 'application/vnd.ms-excel';
                extension = 'xls';
                break;
            
            case 'tsv':
                content = this.convertToTSV(data);
                mimeType = 'text/tab-separated-values';
                extension = 'tsv';
                break;
        }

        return {
            content,
            mimeType,
            filename: `${finalFilename}.${extension}`,
            size: new Blob([content]).size
        };
    }

    /**
     * Download data directly
     * @param {Array} data - Data to download
     * @param {string} format - Export format
     * @param {string} filename - Optional filename
     * @returns {Promise<void>}
     */
    async downloadData(data, format = 'csv', filename = null) {
        const exportResult = await this.exportData(data, format, filename);
        
        const blob = new Blob([exportResult.content], { type: exportResult.mimeType });
        const url = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            chrome.downloads.download({
                url: url,
                filename: exportResult.filename,
                saveAs: true
            }, (downloadId) => {
                URL.revokeObjectURL(url);
                
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve({
                        downloadId,
                        filename: exportResult.filename,
                        size: exportResult.size
                    });
                }
            });
        });
    }

    /**
     * Convert data to CSV format
     * @param {Array} data - Array of objects
     * @returns {string} CSV content
     */
    convertToCSV(data) {
        if (!data.length) return '';

        const headers = this.extractHeaders(data);
        const rows = data.map(row => this.formatCSVRow(row, headers));
        
        return [
            headers.join(','),
            ...rows
        ].join('\n');
    }

    /**
     * Convert data to JSON format
     * @param {Array} data - Array of objects
     * @returns {string} JSON content
     */
    convertToJSON(data) {
        return JSON.stringify(data, null, 2);
    }

    /**
     * Convert data to Excel format (CSV with Excel-specific formatting)
     * @param {Array} data - Array of objects
     * @returns {string} Excel-compatible CSV content
     */
    convertToExcel(data) {
        if (!data.length) return '';

        // Add BOM for proper Excel encoding
        const bom = '\uFEFF';
        const csvContent = this.convertToCSV(data);
        
        return bom + csvContent;
    }

    /**
     * Convert data to TSV format (Tab-Separated Values)
     * @param {Array} data - Array of objects
     * @returns {string} TSV content
     */
    convertToTSV(data) {
        if (!data.length) return '';

        const headers = this.extractHeaders(data);
        const rows = data.map(row => this.formatTSVRow(row, headers));
        
        return [
            headers.join('\t'),
            ...rows
        ].join('\n');
    }

    /**
     * Copy data to clipboard for Google Sheets
     * @param {Array} data - Data to copy
     * @returns {Promise<void>}
     */
    async copyToClipboard(data) {
        if (!data.length) {
            throw new Error('No data to copy');
        }

        const tsvContent = this.convertToTSV(data);
        
        try {
            await navigator.clipboard.writeText(tsvContent);
            return {
                format: 'tsv',
                rowCount: data.length,
                columnCount: this.extractHeaders(data).length
            };
        } catch (error) {
            throw new Error(`Failed to copy to clipboard: ${error.message}`);
        }
    }

    /**
     * Extract unique headers from data array
     * @param {Array} data - Array of objects
     * @returns {Array} Array of header strings
     */
    extractHeaders(data) {
        const headerSet = new Set();
        
        data.forEach(row => {
            Object.keys(row).forEach(key => headerSet.add(key));
        });
        
        return Array.from(headerSet).sort();
    }

    /**
     * Format a single row for CSV
     * @param {Object} row - Data row
     * @param {Array} headers - Column headers
     * @returns {string} Formatted CSV row
     */
    formatCSVRow(row, headers) {
        return headers.map(header => {
            let value = row[header] || '';
            
            // Convert to string and handle special characters
            value = String(value);
            
            // Escape quotes and wrap in quotes if necessary
            if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            
            return value;
        }).join(',');
    }

    /**
     * Format a single row for TSV
     * @param {Object} row - Data row
     * @param {Array} headers - Column headers
     * @returns {string} Formatted TSV row
     */
    formatTSVRow(row, headers) {
        return headers.map(header => {
            let value = row[header] || '';
            
            // Convert to string and clean up
            value = String(value);
            
            // Replace tabs and newlines with spaces for TSV
            value = value.replace(/[\t\n\r]/g, ' ').trim();
            
            return value;
        }).join('\t');
    }

    /**
     * Get export statistics
     * @param {Array} data - Data to analyze
     * @returns {Object} Statistics about the data
     */
    getExportStats(data) {
        if (!data || !data.length) {
            return {
                rowCount: 0,
                columnCount: 0,
                headers: [],
                estimatedSizes: {}
            };
        }

        const headers = this.extractHeaders(data);
        const estimatedSizes = {};

        // Estimate file sizes for different formats
        const csvContent = this.convertToCSV(data);
        const jsonContent = this.convertToJSON(data);
        
        estimatedSizes.csv = this.formatFileSize(new Blob([csvContent]).size);
        estimatedSizes.json = this.formatFileSize(new Blob([jsonContent]).size);
        estimatedSizes.excel = estimatedSizes.csv; // Similar to CSV
        estimatedSizes.tsv = this.formatFileSize(new Blob([this.convertToTSV(data)]).size);

        return {
            rowCount: data.length,
            columnCount: headers.length,
            headers: headers,
            estimatedSizes: estimatedSizes,
            dataTypes: this.analyzeDataTypes(data, headers)
        };
    }

    /**
     * Analyze data types in the dataset
     * @param {Array} data - Data to analyze
     * @param {Array} headers - Column headers
     * @returns {Object} Data type analysis
     */
    analyzeDataTypes(data, headers) {
        const types = {};
        
        headers.forEach(header => {
            const values = data.map(row => row[header]).filter(val => val != null && val !== '');
            
            if (values.length === 0) {
                types[header] = 'empty';
                return;
            }

            const numericValues = values.filter(val => !isNaN(Number(val)) && val !== '');
            const urlValues = values.filter(val => this.isURL(String(val)));
            const emailValues = values.filter(val => this.isEmail(String(val)));

            if (numericValues.length === values.length) {
                types[header] = 'numeric';
            } else if (urlValues.length > values.length * 0.8) {
                types[header] = 'url';
            } else if (emailValues.length > values.length * 0.8) {
                types[header] = 'email';
            } else {
                types[header] = 'text';
            }
        });

        return types;
    }

    /**
     * Check if value is a URL
     * @param {string} value - Value to check
     * @returns {boolean} True if URL
     */
    isURL(value) {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if value is an email
     * @param {string} value - Value to check
     * @returns {boolean} True if email
     */
    isEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    /**
     * Format file size in human readable format
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size
     */
    formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    /**
     * Validate data before export
     * @param {Array} data - Data to validate
     * @returns {Object} Validation result
     */
    validateData(data) {
        const issues = [];
        const warnings = [];

        if (!data || !Array.isArray(data)) {
            issues.push('Data must be an array');
            return { valid: false, issues, warnings };
        }

        if (data.length === 0) {
            issues.push('Data array is empty');
            return { valid: false, issues, warnings };
        }

        // Check for consistent structure
        const firstRowKeys = Object.keys(data[0] || {});
        const inconsistentRows = data.filter(row => {
            const rowKeys = Object.keys(row);
            return rowKeys.length !== firstRowKeys.length || 
                   !firstRowKeys.every(key => rowKeys.includes(key));
        });

        if (inconsistentRows.length > 0) {
            warnings.push(`${inconsistentRows.length} rows have inconsistent structure`);
        }

        // Check for large dataset
        if (data.length > 10000) {
            warnings.push('Large dataset may take time to export');
        }

        // Check for complex data types
        const hasComplexData = data.some(row => 
            Object.values(row).some(value => 
                typeof value === 'object' && value !== null
            )
        );

        if (hasComplexData) {
            warnings.push('Complex data types will be converted to strings');
        }

        return {
            valid: issues.length === 0,
            issues,
            warnings
        };
    }
}

// Export singleton instance
export const exportManager = new ExportManager();