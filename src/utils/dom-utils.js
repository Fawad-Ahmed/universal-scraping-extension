// dom-utils.js - Universal DOM manipulation utilities
console.log('🔧 DOM Utils Loading...');

/**
 * Universal DOM Utilities for Web Scraping
 * Provides cross-browser, robust DOM manipulation and querying functions
 */
window.DOMUtils = {
    
    /**
     * Enhanced text extraction with multiple fallback methods
     */
    extractText(element, options = {}) {
        if (!element) return '';
        
        const {
            includeHidden = false,
            preserveWhitespace = false,
            maxLength = null
        } = options;
        
        let text = '';
        
        // Method 1: Try textContent first
        text = element.textContent || '';
        
        // Method 2: Try innerText if textContent is empty or we want visible text only
        if (!text.trim() || !includeHidden) {
            text = element.innerText || text;
        }
        
        // Method 3: Manual text node extraction for edge cases
        if (!text.trim()) {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        // Skip script and style nodes
                        const parent = node.parentNode;
                        if (parent && ['SCRIPT', 'STYLE'].includes(parent.tagName)) {
                            return NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_ACCEPT;
                    }
                },
                false
            );
            
            const textParts = [];
            let node;
            while (node = walker.nextNode()) {
                const nodeText = node.textContent.trim();
                if (nodeText) {
                    textParts.push(nodeText);
                }
            }
            text = textParts.join(' ');
        }
        
        // Clean up whitespace unless preserved
        if (!preserveWhitespace) {
            text = text.replace(/\s+/g, ' ').trim();
        }
        
        // Truncate if max length specified
        if (maxLength && text.length > maxLength) {
            text = text.substring(0, maxLength - 3) + '...';
        }
        
        return text;
    },

    /**
     * Get all attributes from an element
     */
    getAttributes(element) {
        if (!element || !element.attributes) return {};
        
        const attrs = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attrs[attr.name] = attr.value;
        }
        return attrs;
    },

    /**
     * Enhanced element selection with multiple strategies
     */
    findElements(selector, context = document) {
        try {
            // Standard CSS selector
            const elements = context.querySelectorAll(selector);
            if (elements.length > 0) {
                return Array.from(elements);
            }
            
            // Try XPath if CSS selector fails
            if (selector.startsWith('//') || selector.startsWith('./')) {
                return this.findElementsByXPath(selector, context);
            }
            
            return [];
        } catch (error) {
            console.warn('🔧 Error finding elements:', error);
            return [];
        }
    },

    /**
     * XPath element selection
     */
    findElementsByXPath(xpath, context = document) {
        try {
            const result = document.evaluate(
                xpath,
                context,
                null,
                XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                null
            );
            
            const elements = [];
            for (let i = 0; i < result.snapshotLength; i++) {
                elements.push(result.snapshotItem(i));
            }
            return elements;
        } catch (error) {
            console.warn('🔧 XPath error:', error);
            return [];
        }
    },

    /**
     * Find elements by text content
     */
    findElementsByText(text, tag = '*', exact = false) {
        const xpath = exact 
            ? `//${tag}[normalize-space(text())="${text}"]`
            : `//${tag}[contains(normalize-space(text()), "${text}")]`;
        
        return this.findElementsByXPath(xpath);
    },

    /**
     * Get element's computed style
     */
    getComputedStyle(element, property = null) {
        if (!element) return null;
        
        const style = window.getComputedStyle(element);
        return property ? style.getPropertyValue(property) : style;
    },

    /**
     * Check if element is visible
     */
    isVisible(element) {
        if (!element) return false;
        
        const style = this.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetParent !== null;
    },

    /**
     * Get element position and dimensions
     */
    getElementBounds(element) {
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + window.scrollX,
            y: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            bottom: rect.bottom + window.scrollY,
            right: rect.right + window.scrollX
        };
    },

    /**
     * Scroll element into view with options
     */
    scrollIntoView(element, options = {}) {
        if (!element) return;
        
        const defaultOptions = {
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        };
        
        element.scrollIntoView({ ...defaultOptions, ...options });
    },

    /**
     * Wait for element to appear
     */
    waitForElement(selector, timeout = 10000, context = document) {
        return new Promise((resolve, reject) => {
            const element = context.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                const element = context.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(context, {
                childList: true,
                subtree: true
            });
            
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    },

    /**
     * Extract links from element
     */
    extractLinks(element) {
        if (!element) return [];
        
        const links = element.querySelectorAll('a[href]');
        return Array.from(links).map(link => ({
            url: link.href,
            text: this.extractText(link),
            title: link.title || '',
            target: link.target || ''
        }));
    },

    /**
     * Extract images from element
     */
    extractImages(element) {
        if (!element) return [];
        
        const images = element.querySelectorAll('img[src]');
        return Array.from(images).map(img => ({
            src: img.src,
            alt: img.alt || '',
            title: img.title || '',
            width: img.width || null,
            height: img.height || null
        }));
    },

    /**
     * Create element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        // Add children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Element) {
                element.appendChild(child);
            }
        });
        
        return element;
    },

    /**
     * Remove element safely
     */
    removeElement(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },

    /**
     * Clone element deeply
     */
    cloneElement(element, deep = true) {
        return element ? element.cloneNode(deep) : null;
    },

    /**
     * Check if element matches selector
     */
    matches(element, selector) {
        if (!element || !element.matches) return false;
        
        try {
            return element.matches(selector);
        } catch (error) {
            console.warn('🔧 Selector error:', error);
            return false;
        }
    },

    /**
     * Get closest ancestor matching selector
     */
    closest(element, selector) {
        if (!element || !element.closest) return null;
        
        try {
            return element.closest(selector);
        } catch (error) {
            console.warn('🔧 Closest selector error:', error);
            return null;
        }
    },

    /**
     * Debounce function calls
     */
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
    },

    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Generate unique selector for element
     */
    getUniqueSelector(element) {
        if (!element) return null;
        
        // Try ID first
        if (element.id) {
            return `#${element.id}`;
        }
        
        // Try unique class combinations
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                const classSelector = '.' + classes.join('.');
                if (document.querySelectorAll(classSelector).length === 1) {
                    return classSelector;
                }
            }
        }
        
        // Build path from root
        const path = [];
        let current = element;
        
        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            
            if (current.id) {
                path.unshift(`${selector}#${current.id}`);
                break;
            }
            
            if (current.className) {
                const classes = current.className.split(' ').filter(c => c.trim());
                if (classes.length > 0) {
                    selector += '.' + classes.join('.');
                }
            }
            
            // Add nth-child if needed
            const siblings = Array.from(current.parentNode?.children || [])
                .filter(sibling => sibling.tagName === current.tagName);
            
            if (siblings.length > 1) {
                const index = siblings.indexOf(current) + 1;
                selector += `:nth-child(${index})`;
            }
            
            path.unshift(selector);
            current = current.parentNode;
        }
        
        return path.join(' > ');
    }
};

console.log('✅ DOM Utils Ready');
