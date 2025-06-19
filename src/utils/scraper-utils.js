// scraper-utils.js - Universal scraping algorithms and utilities
console.log('🤖 Scraper Utils Loading...');

/**
 * Universal Scraping Utilities
 * Advanced algorithms for data extraction, pattern recognition, and content analysis
 */
window.ScraperUtils = {

    /**
     * Auto-detect and extract tabular data
     */
    detectTables(context = document) {
        const tables = [];
        
        // Strategy 1: Standard HTML tables
        const htmlTables = context.querySelectorAll('table');
        htmlTables.forEach(table => {
            const data = this.extractTableData(table);
            if (data.length > 0) {
                tables.push({
                    type: 'html-table',
                    element: table,
                    data: data,
                    confidence: 0.9,
                    rowCount: data.length,
                    columnCount: data[0] ? Object.keys(data[0]).length : 0
                });
            }
        });
        
        // Strategy 2: CSS Grid tables
        const gridContainers = context.querySelectorAll('[style*="grid"], .grid, [class*="grid"]');
        gridContainers.forEach(container => {
            const data = this.extractGridData(container);
            if (data.length > 2) {
                tables.push({
                    type: 'css-grid',
                    element: container,
                    data: data,
                    confidence: 0.7,
                    rowCount: data.length,
                    columnCount: data[0] ? Object.keys(data[0]).length : 0
                });
            }
        });
        
        // Strategy 3: Flexbox tables
        const flexContainers = context.querySelectorAll('[style*="flex"], .flex, [class*="flex"]');
        flexContainers.forEach(container => {
            const data = this.extractFlexData(container);
            if (data.length > 2) {
                tables.push({
                    type: 'flexbox',
                    element: container,
                    data: data,
                    confidence: 0.6,
                    rowCount: data.length,
                    columnCount: data[0] ? Object.keys(data[0]).length : 0
                });
            }
        });
        
        // Sort by confidence and return best matches
        return tables.sort((a, b) => b.confidence - a.confidence);
    },

    /**
     * Extract data from HTML table
     */
    extractTableData(table) {
        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length === 0) return [];
        
        // Get headers
        let headers = [];
        const headerRow = table.querySelector('thead tr') || rows[0];
        const headerCells = headerRow.querySelectorAll('th, td');
        
        headerCells.forEach((cell, index) => {
            const text = DOMUtils.extractText(cell) || `Column_${index + 1}`;
            headers.push(this.cleanFieldName(text));
        });
        
        // Get data rows
        const dataRows = table.querySelector('thead') ? rows.slice(0) : rows.slice(1);
        
        return dataRows.map(row => {
            const cells = row.querySelectorAll('td, th');
            const rowData = {};
            
            cells.forEach((cell, index) => {
                const header = headers[index] || `Column_${index + 1}`;
                rowData[header] = this.extractCellData(cell);
            });
            
            return rowData;
        }).filter(row => Object.values(row).some(value => value && value.toString().trim()));
    },

    /**
     * Extract data from CSS Grid layout
     */
    extractGridData(container) {
        const children = Array.from(container.children);
        if (children.length < 4) return [];
        
        // Try to detect grid structure
        const style = DOMUtils.getComputedStyle(container);
        const gridTemplateColumns = style.getPropertyValue('grid-template-columns');
        
        if (!gridTemplateColumns || gridTemplateColumns === 'none') return [];
        
        const columnCount = gridTemplateColumns.split(' ').length;
        const data = [];
        
        // Group children into rows
        for (let i = 0; i < children.length; i += columnCount) {
            const rowChildren = children.slice(i, i + columnCount);
            if (rowChildren.length === columnCount) {
                const rowData = {};
                rowChildren.forEach((child, index) => {
                    const header = `Column_${index + 1}`;
                    rowData[header] = this.extractCellData(child);
                });
                data.push(rowData);
            }
        }
        
        return data;
    },

    /**
     * Extract data from flexbox layout
     */
    extractFlexData(container) {
        const children = Array.from(container.children);
        if (children.length < 3) return [];
        
        // Look for repeating patterns
        const patterns = this.findRepeatingPatterns(children);
        if (patterns.length === 0) return [];
        
        const pattern = patterns[0];
        const data = [];
        
        for (let i = 0; i < children.length; i += pattern.length) {
            const rowChildren = children.slice(i, i + pattern.length);
            if (rowChildren.length === pattern.length) {
                const rowData = {};
                rowChildren.forEach((child, index) => {
                    const header = `Column_${index + 1}`;
                    rowData[header] = this.extractCellData(child);
                });
                data.push(rowData);
            }
        }
        
        return data;
    },

    /**
     * Auto-detect lists and repeating content
     */
    detectLists(context = document) {
        const lists = [];
        
        // Strategy 1: Standard HTML lists
        const htmlLists = context.querySelectorAll('ul, ol');
        htmlLists.forEach(list => {
            const items = this.extractListItems(list);
            if (items.length > 2) {
                lists.push({
                    type: 'html-list',
                    element: list,
                    data: items,
                    confidence: 0.9,
                    itemCount: items.length
                });
            }
        });
        
        // Strategy 2: Common list patterns
        const listSelectors = [
            '[class*="list"] > *',
            '[class*="item"]',
            '[class*="card"]',
            '[class*="product"]',
            '[class*="result"]',
            '[class*="entry"]',
            '[class*="post"]',
            '.row',
            '[data-testid*="item"]'
        ];
        
        listSelectors.forEach(selector => {
            try {
                const elements = Array.from(context.querySelectorAll(selector));
                if (elements.length > 2) {
                    // Check if elements are similar
                    const similarity = this.calculateSimilarity(elements);
                    if (similarity > 0.6) {
                        const items = elements.map(el => this.extractElementData(el));
                        lists.push({
                            type: 'pattern-list',
                            selector: selector,
                            elements: elements,
                            data: items,
                            confidence: similarity,
                            itemCount: items.length
                        });
                    }
                }
            } catch (error) {
                console.warn('🤖 List detection error:', error);
            }
        });
        
        // Strategy 3: Structural pattern detection
        const patterns = this.detectStructuralPatterns(context);
        patterns.forEach(pattern => {
            if (pattern.elements.length > 2) {
                const items = pattern.elements.map(el => this.extractElementData(el));
                lists.push({
                    type: 'structural-pattern',
                    pattern: pattern,
                    data: items,
                    confidence: pattern.confidence,
                    itemCount: items.length
                });
            }
        });
        
        return lists.sort((a, b) => b.confidence - a.confidence);
    },

    /**
     * Extract data from list items
     */
    extractListItems(list) {
        const items = list.querySelectorAll('li');
        return Array.from(items).map((item, index) => ({
            index: index + 1,
            text: DOMUtils.extractText(item),
            links: DOMUtils.extractLinks(item),
            images: DOMUtils.extractImages(item),
            html: item.innerHTML
        }));
    },

    /**
     * Extract comprehensive data from element
     */
    extractElementData(element) {
        const data = {
            text: DOMUtils.extractText(element),
            html: element.innerHTML,
            attributes: DOMUtils.getAttributes(element)
        };
        
        // Extract specific data types
        const links = DOMUtils.extractLinks(element);
        if (links.length > 0) {
            data.links = links;
            data.primaryLink = links[0];
        }
        
        const images = DOMUtils.extractImages(element);
        if (images.length > 0) {
            data.images = images;
            data.primaryImage = images[0];
        }
        
        // Extract structured data
        const structured = this.extractStructuredData(element);
        if (Object.keys(structured).length > 0) {
            Object.assign(data, structured);
        }
        
        // Extract prices
        const price = this.extractPrice(element);
        if (price) {
            data.price = price;
        }
        
        // Extract dates
        const date = this.extractDate(element);
        if (date) {
            data.date = date;
        }
        
        return data;
    },

    /**
     * Extract cell data with type detection
     */
    extractCellData(cell) {
        const text = DOMUtils.extractText(cell);
        if (!text) return '';
        
        // Try to detect data type
        const link = cell.querySelector('a');
        if (link) {
            return {
                text: text,
                url: link.href,
                type: 'link'
            };
        }
        
        const img = cell.querySelector('img');
        if (img) {
            return {
                text: text,
                src: img.src,
                alt: img.alt,
                type: 'image'
            };
        }
        
        // Check for price
        const price = this.extractPrice(cell);
        if (price) {
            return {
                text: text,
                value: price.value,
                currency: price.currency,
                type: 'price'
            };
        }
        
        // Check for date
        const date = this.extractDate(cell);
        if (date) {
            return {
                text: text,
                date: date,
                type: 'date'
            };
        }
        
        // Check for number
        const number = this.extractNumber(text);
        if (number !== null) {
            return {
                text: text,
                value: number,
                type: 'number'
            };
        }
        
        return text;
    },

    /**
     * Extract price information
     */
    extractPrice(element) {
        const text = DOMUtils.extractText(element);
        
        // Price patterns
        const pricePatterns = [
            /\$\s*([0-9,]+\.?[0-9]*)/,
            /([0-9,]+\.?[0-9]*)\s*\$/,
            /€\s*([0-9,]+\.?[0-9]*)/,
            /([0-9,]+\.?[0-9]*)\s*€/,
            /£\s*([0-9,]+\.?[0-9]*)/,
            /([0-9,]+\.?[0-9]*)\s*£/,
            /¥\s*([0-9,]+\.?[0-9]*)/,
            /([0-9,]+\.?[0-9]*)\s*¥/
        ];
        
        for (const pattern of pricePatterns) {
            const match = text.match(pattern);
            if (match) {
                const value = parseFloat(match[1].replace(/,/g, ''));
                const currency = text.match(/[\$€£¥]/)?.[0] || '$';
                return { value, currency, original: match[0] };
            }
        }
        
        return null;
    },

    /**
     * Extract date information
     */
    extractDate(element) {
        const text = DOMUtils.extractText(element);
        
        // Try to parse as date
        const dateFormats = [
            /\d{4}-\d{2}-\d{2}/,
            /\d{2}\/\d{2}\/\d{4}/,
            /\d{2}-\d{2}-\d{4}/,
            /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i
        ];
        
        for (const format of dateFormats) {
            const match = text.match(format);
            if (match) {
                const date = new Date(match[0]);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }
        }
        
        return null;
    },

    /**
     * Extract numeric value
     */
    extractNumber(text) {
        const cleaned = text.replace(/[^0-9.-]/g, '');
        const number = parseFloat(cleaned);
        return isNaN(number) ? null : number;
    },

    /**
     * Extract structured data (JSON-LD, microdata, etc.)
     */
    extractStructuredData(element) {
        const data = {};
        
        // JSON-LD
        const jsonLd = element.querySelector('script[type="application/ld+json"]');
        if (jsonLd) {
            try {
                const parsed = JSON.parse(jsonLd.textContent);
                Object.assign(data, parsed);
            } catch (error) {
                console.warn('🤖 JSON-LD parse error:', error);
            }
        }
        
        // Microdata
        const microdataElements = element.querySelectorAll('[itemprop]');
        microdataElements.forEach(el => {
            const prop = el.getAttribute('itemprop');
            const value = DOMUtils.extractText(el);
            if (prop && value) {
                data[prop] = value;
            }
        });
        
        // Data attributes
        const attrs = DOMUtils.getAttributes(element);
        Object.keys(attrs).forEach(key => {
            if (key.startsWith('data-')) {
                const cleanKey = key.replace('data-', '').replace(/-/g, '_');
                data[cleanKey] = attrs[key];
            }
        });
        
        return data;
    },

    /**
     * Calculate similarity between elements
     */
    calculateSimilarity(elements) {
        if (elements.length < 2) return 0;
        
        let totalSimilarity = 0;
        let comparisons = 0;
        
        for (let i = 0; i < Math.min(elements.length, 5); i++) {
            for (let j = i + 1; j < Math.min(elements.length, 5); j++) {
                const sim = this.compareElements(elements[i], elements[j]);
                totalSimilarity += sim;
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalSimilarity / comparisons : 0;
    },

    /**
     * Compare two elements for similarity
     */
    compareElements(el1, el2) {
        let score = 0;
        let factors = 0;
        
        // Tag name
        if (el1.tagName === el2.tagName) {
            score += 0.3;
        }
        factors++;
        
        // Class similarity
        const classes1 = new Set(el1.className.split(' ').filter(c => c.trim()));
        const classes2 = new Set(el2.className.split(' ').filter(c => c.trim()));
        const classIntersection = new Set([...classes1].filter(c => classes2.has(c)));
        const classUnion = new Set([...classes1, ...classes2]);
        
        if (classUnion.size > 0) {
            score += (classIntersection.size / classUnion.size) * 0.4;
        }
        factors++;
        
        // Structure similarity
        const children1 = el1.children.length;
        const children2 = el2.children.length;
        if (children1 > 0 && children2 > 0) {
            const childrenSim = 1 - Math.abs(children1 - children2) / Math.max(children1, children2);
            score += childrenSim * 0.3;
        }
        factors++;
        
        return score / factors;
    },

    /**
     * Find repeating patterns in elements
     */
    findRepeatingPatterns(elements) {
        const patterns = [];
        
        for (let patternLength = 2; patternLength <= Math.min(5, elements.length / 2); patternLength++) {
            const pattern = elements.slice(0, patternLength);
            let matches = 1;
            
            for (let i = patternLength; i + patternLength <= elements.length; i += patternLength) {
                const candidate = elements.slice(i, i + patternLength);
                let patternMatch = true;
                
                for (let j = 0; j < patternLength; j++) {
                    if (this.compareElements(pattern[j], candidate[j]) < 0.7) {
                        patternMatch = false;
                        break;
                    }
                }
                
                if (patternMatch) {
                    matches++;
                } else {
                    break;
                }
            }
            
            if (matches >= 3) {
                patterns.push({
                    length: patternLength,
                    matches: matches,
                    elements: pattern,
                    confidence: matches / (elements.length / patternLength)
                });
            }
        }
        
        return patterns.sort((a, b) => b.confidence - a.confidence);
    },

    /**
     * Detect structural patterns in the document
     */
    detectStructuralPatterns(context = document) {
        const patterns = [];
        
        // Find groups of similar elements
        const allElements = Array.from(context.querySelectorAll('*'))
            .filter(el => el.children.length <= 10 && DOMUtils.extractText(el).length > 10);
        
        const groups = new Map();
        
        allElements.forEach(el => {
            const signature = this.getElementSignature(el);
            if (!groups.has(signature)) {
                groups.set(signature, []);
            }
            groups.get(signature).push(el);
        });
        
        groups.forEach((elements, signature) => {
            if (elements.length > 2) {
                const similarity = this.calculateSimilarity(elements);
                if (similarity > 0.6) {
                    patterns.push({
                        signature: signature,
                        elements: elements,
                        confidence: similarity,
                        count: elements.length
                    });
                }
            }
        });
        
        return patterns.sort((a, b) => b.confidence - a.confidence);
    },

    /**
     * Generate element signature for pattern matching
     */
    getElementSignature(element) {
        const tagName = element.tagName.toLowerCase();
        const classes = Array.from(element.classList).sort().join(' ');
        const childTags = Array.from(element.children).map(child => child.tagName.toLowerCase()).sort().join(' ');
        
        return `${tagName}|${classes}|${childTags}`;
    },

    /**
     * Clean field names for data extraction
     */
    cleanFieldName(text) {
        return text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '_')
            .trim() || 'field';
    },

    /**
     * Advanced data cleaning and normalization
     */
    cleanData(data) {
        if (Array.isArray(data)) {
            return data.map(item => this.cleanData(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const cleaned = {};
            Object.entries(data).forEach(([key, value]) => {
                const cleanKey = this.cleanFieldName(key);
                cleaned[cleanKey] = this.cleanData(value);
            });
            return cleaned;
        }
        
        if (typeof data === 'string') {
            return data.trim().replace(/\s+/g, ' ');
        }
        
        return data;
    },

    /**
     * Export data in various formats
     */
    exportData(data, format = 'json') {
        switch (format.toLowerCase()) {
            case 'csv':
                return this.toCSV(data);
            case 'json':
                return JSON.stringify(data, null, 2);
            case 'tsv':
                return this.toTSV(data);
            default:
                return JSON.stringify(data, null, 2);
        }
    },

    /**
     * Convert data to CSV format
     */
    toCSV(data) {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                let value = row[header] || '';
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                // Escape quotes and wrap in quotes if necessary
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    value = `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    },

    /**
     * Convert data to TSV format
     */
    toTSV(data) {
        if (!Array.isArray(data) || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const tsvRows = [headers.join('\t')];
        
        data.forEach(row => {
            const values = headers.map(header => {
                let value = row[header] || '';
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                // Clean tabs and newlines
                return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
            });
            tsvRows.push(values.join('\t'));
        });
        
        return tsvRows.join('\n');
    }
};

console.log('✅ Scraper Utils Ready');
