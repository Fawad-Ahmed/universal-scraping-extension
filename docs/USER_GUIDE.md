# Universal Scraping Extension - User Guide

Welcome to the most powerful, intuitive web scraping extension for Chrome! This guide will help you get started and master all the features.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Visual Selector](#visual-selector)
- [Data Scraping](#data-scraping)
- [Multi-Page Scraping](#multi-page-scraping)
- [Data Export](#data-export)
- [Recipe System](#recipe-system)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Installation
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) (Coming Soon)
2. Search for "Universal Scraping Extension"
3. Click "Add to Chrome"
4. Confirm the installation
5. The extension icon will appear in your toolbar

### First Scrape (2-Minute Tutorial)
1. **Navigate** to any website with data (e.g., a product listing, directory, news site)
2. **Click** the extension icon in your browser toolbar
3. **Choose your method**:
   - Click "Start Visual Selection" to select elements manually
   - Or click "Scrape Current Page" for automatic table detection
4. **Preview** your data in the extension popup
5. **Export** using the "Download Data" or "Copy for Google Sheets" button

🎉 **That's it!** You've successfully scraped your first website.

## 👆 Visual Selector

The visual selector lets you point and click to choose exactly what data you want to extract.

### How to Use Visual Selector

1. **Activate**: Click "Start Visual Selection" in the popup
2. **Select Elements**: 
   - Hover over elements on the page to see them highlighted in blue
   - Click any element to select it (turns green)
   - Click again to deselect
3. **Smart Selection**: After selecting one element, click "Select Similar" to automatically find all matching elements
4. **Preview**: See your selections in the real-time preview table
5. **Scrape**: Click "Scrape Current Page" to extract all selected data

### Visual Selector Tips

- **Start Small**: Select one example of each type of data you want
- **Use "Select Similar"**: Let the extension find all matching elements automatically
- **Check Preview**: Always verify your data looks correct before scraping
- **Multiple Fields**: Select different types of elements (titles, prices, images) for comprehensive data

### Element Types Supported
- **Text**: Any visible text content
- **Links**: URLs from anchor tags
- **Images**: Image sources and alt text
- **Attributes**: Custom HTML attributes
- **Nested Content**: Elements within containers

## 📊 Data Scraping

### Single Page Scraping

**For Simple Tables**:
1. Navigate to a page with a data table
2. Click "Scrape Current Page"
3. The extension automatically detects and extracts the table

**For Custom Elements**:
1. Use the Visual Selector to choose your data
2. Preview the results
3. Click "Scrape Current Page" to extract

### What Gets Extracted

The extension intelligently extracts:
- **Text Content**: Clean, trimmed text from elements
- **URLs**: Full URLs from links and images
- **Attributes**: HTML attributes like IDs, classes, data attributes
- **Structured Data**: Automatically organizes data into columns

### Data Cleaning

Automatic cleaning includes:
- Removing extra whitespace
- Trimming text content
- Extracting URLs from relative links
- Handling special characters properly

## 🔄 Multi-Page Scraping

Perfect for scraping large datasets across multiple pages.

### Automatic Pagination

1. **Set Up**: Configure your scraping on the first page
2. **Configure Delay**: Set delay between pages (default: 2000ms)
3. **Start**: Click "Scrape All Pages"
4. **Monitor**: Watch the progress in real-time
5. **Complete**: Get all data combined automatically

### Pagination Features

- **Smart Detection**: Automatically finds "Next" buttons
- **Shadow DOM Support**: Works with modern JavaScript-heavy sites
- **Progress Tracking**: See current page and items found
- **Safety Limits**: Prevents infinite loops
- **Error Handling**: Continues scraping even if some pages fail

### Settings for Multi-Page

- **Page Delay**: Time to wait between pages (1000-10000ms)
- **Max Pages**: Safety limit to prevent runaway scraping
- **Auto-scroll**: Handles infinite scroll pages
- **Button Detection**: Multiple strategies to find next buttons

## 💾 Data Export

Multiple options for getting your data out of the extension.

### Export Formats

**CSV (Comma-Separated Values)**
- Perfect for Excel, Google Sheets, databases
- Properly escaped text and quotes
- Standard format readable by most tools

**JSON (JavaScript Object Notation)**
- Ideal for developers and APIs
- Preserves data types and structure
- Easy to programmatically process

**Excel (.xls)**
- Native Excel format
- Formatted columns and data types
- Compatible with Microsoft Office

### Export Methods

**Download File**
1. Choose your format (CSV, JSON, Excel)
2. Click "Download Data"
3. Save the file to your computer

**Copy to Google Sheets**
1. Click "Copy for Google Sheets"
2. Open Google Sheets
3. Press Ctrl+V (or Cmd+V on Mac) to paste
4. Data appears formatted and ready to use

**Preview First**
- Always use "Preview Data" to check your results
- Shows first 5 rows of your dataset
- Verify column names and data quality

### Data Organization

Your exported data includes:
- **Auto-generated column names** from page content
- **Cleaned data values** with proper formatting
- **Preserved relationships** between related fields
- **Consistent structure** across all rows

## 📋 Recipe System

Save and share your scraping configurations for repeated use.

### Creating Recipes

1. **Set up your scraping** using Visual Selector or other methods
2. **Test** to make sure it works correctly
3. **Click "Save Recipe"** in the Advanced section
4. **Name your recipe** descriptively
5. **Add tags** for easy discovery

### Using Saved Recipes

1. **Click "Load Recipe"** in the popup
2. **Browse** your saved recipes
3. **Select** the recipe you want
4. **Apply** automatically configures the extension
5. **Run** the scraping with your saved settings

### Recipe Features (Coming Soon)

- **Community Library**: Share recipes with other users
- **Import/Export**: Transfer recipes between devices
- **Version Control**: Track changes to your recipes
- **Templates**: Pre-built recipes for popular sites

## ⚙️ Advanced Features

### Standalone Window Mode

For extended scraping sessions:
1. Click "Pop Out Window" 
2. Extension opens in its own window
3. Keep it open while browsing different pages
4. Better for multi-tab workflows

### Data Management

**Clear Data**: Remove all scraped data from storage
**Progress Tracking**: Real-time updates during multi-page scraping
**Error Recovery**: Continues scraping even if individual pages fail
**Storage**: Data persists between browser sessions

### Performance Tips

- **Use appropriate delays** between pages (2-3 seconds recommended)
- **Limit concurrent scraping** to one site at a time
- **Monitor memory usage** on very large datasets
- **Export regularly** to avoid data loss

## 🛠️ Troubleshooting

### Common Issues

**Extension Not Working on a Page**
- Refresh the page and try again
- Check if the site blocks extensions
- Ensure you're not on a restricted page (chrome://, etc.)
- Try a different scraping method

**No Data Extracted**
- Verify elements are visible on the page
- Check if data loads after page interactions
- Try adjusting the extraction delay
- Use Visual Selector to manually select elements

**Getting Blocked by Website**
- Increase delay between requests (3000ms+)
- Try scraping during off-peak hours
- Use smaller page limits
- Consider the website's rate limiting policies

**Export Issues**
- Check browser download settings
- Ensure sufficient storage space
- Try a different export format
- Disable popup blockers

**Visual Selector Not Working**
- Make sure "Start Visual Selection" is activated
- Check if elements are clickable (not behind overlays)
- Try refreshing the page
- Disable other extensions that might interfere

### Performance Issues

**Slow Scraping**
- Reduce page delay if safe to do so
- Limit the number of elements selected
- Use more specific selectors
- Clear browser cache and data

**Memory Usage**
- Export data regularly during large scrapes
- Restart browser for very large datasets
- Use "Clear Data" to free up memory
- Monitor Chrome's task manager

### Getting Help

**Self-Help Resources**
- Check this User Guide thoroughly
- Review [FAQ](https://github.com/Fawad-Ahmed/universal-scraping-extension/wiki/FAQ)
- Search [existing issues](https://github.com/Fawad-Ahmed/universal-scraping-extension/issues)

**Community Support**
- 💬 [GitHub Discussions](https://github.com/Fawad-Ahmed/universal-scraping-extension/discussions)
- 🐛 [Report Bugs](https://github.com/Fawad-Ahmed/universal-scraping-extension/issues/new?template=bug_report.md)
- 💡 [Request Features](https://github.com/Fawad-Ahmed/universal-scraping-extension/issues/new?template=feature_request.md)

**Direct Support**
- 📧 Email: fawad.ahmed@universalscraping.com
- Response time: Usually within 24-48 hours

## 🔒 Privacy & Legal

### Data Privacy
- **Local First**: Data stays in your browser by default
- **No Tracking**: We don't track your scraping activities
- **User Control**: You decide what to scrape and export

### Legal Considerations
- **Respect robots.txt** files when possible
- **Follow website terms of service**
- **Don't scrape personal/private information**
- **Use appropriate delays** to avoid overloading servers
- **Consider legal implications** in your jurisdiction

### Best Practices
- **Be respectful** of website resources
- **Use reasonable delays** between requests
- **Avoid scraping sensitive data**
- **Check terms of service** before scraping
- **Consider reaching out** to site owners for large-scale scraping

---

## 🎯 Quick Reference

### Keyboard Shortcuts (Coming Soon)
- `Ctrl+Shift+S`: Start/stop visual selector
- `Ctrl+Shift+E`: Export data
- `Ctrl+Shift+P`: Preview data

### Common Selectors
- `.class-name`: Elements with specific class
- `#element-id`: Element with specific ID
- `a`: All links on the page
- `img`: All images on the page
- `[data-attribute]`: Elements with data attributes

### Supported Websites
The extension works on virtually any website, including:
- ✅ E-commerce sites (Amazon, eBay, etc.)
- ✅ Social media platforms
- ✅ News and blog sites
- ✅ Directory and listing sites
- ✅ Single-page applications (SPAs)
- ✅ Sites with Shadow DOM
- ✅ JavaScript-heavy websites

---

**Happy Scraping!** 🎉

For more advanced usage, check out our [API Documentation](API.md) and [Developer Guide](DEVELOPMENT.md).