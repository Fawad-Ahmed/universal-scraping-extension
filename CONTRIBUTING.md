# Contributing to Universal Scraping Extension

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Found a bug? Let us know!
- 💡 **Feature Requests**: Have an idea? We'd love to hear it!
- 📝 **Documentation**: Help improve our docs
- 🧪 **Testing**: Test the extension on different sites
- 💻 **Code**: Submit pull requests with improvements
- 🌍 **Translations**: Help us support more languages
- 📊 **Recipes**: Share scraping recipes with the community

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0 or higher
- Chrome/Chromium browser (version 88+)
- Git
- Basic knowledge of JavaScript and Chrome Extensions

### Setup
1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/universal-scraping-extension.git
   cd universal-scraping-extension
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow
1. **Start development mode**:
   ```bash
   npm run dev
   ```
2. **Load the extension** in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist/` folder
3. **Make your changes** in the `src/` directory
4. **Test thoroughly** on various websites
5. **Run tests and linting**:
   ```bash
   npm test
   npm run lint
   ```

## 📋 Development Guidelines

### Code Style
- **ESLint & Prettier**: Use the provided configurations
- **Naming**: Use descriptive variable and function names
- **Comments**: Add JSDoc comments for functions
- **Commits**: Write clear, descriptive commit messages

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(scraper): add support for shadow DOM elements
fix(popup): resolve export button not working on Mac
docs(api): update recipe format documentation
test(content): add unit tests for element selection
```

### Testing
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test feature workflows end-to-end
- **Browser Testing**: Test on different Chrome versions
- **Website Testing**: Test on various types of websites

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Code Review Checklist
- [ ] Code follows project style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed

## 🐛 Bug Reports

When reporting bugs, please include:

### Required Information
- **Browser and version** (Chrome 120.0.0.0)
- **Extension version** (found in `chrome://extensions/`)
- **Operating System** (Windows 11, macOS 14, Ubuntu 22.04)
- **Website URL** where the issue occurs
- **Steps to reproduce** the bug
- **Expected vs actual behavior**

### Optional but Helpful
- **Screenshots or videos** of the issue
- **Console errors** from Chrome DevTools
- **Extension logs** from the background page
- **Network activity** if relevant

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

## 💡 Feature Requests

For new features, please:

1. **Search existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** or approach
4. **Consider the scope** - is this a common use case?
5. **Provide examples** of how it would work

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

## 🔧 Technical Architecture

### Project Structure
```
src/
├── background/          # Service worker and background tasks
├── content/            # Content scripts injected into pages
├── popup/              # Extension popup interface
├── standalone/         # Standalone window interface
├── utils/              # Shared utilities and helpers
└── shared/             # Shared constants and types
```

### Key Components

**Background Script (`src/background/`)**
- Manages extension lifecycle
- Handles scheduled scraping jobs
- Coordinates between components

**Content Scripts (`src/content/`)**
- Injected into web pages
- Handles DOM interaction and data extraction
- Provides visual selection interface

**Popup Interface (`src/popup/`)**
- Main user interface
- Configuration and controls
- Data preview and export

### Message Passing
The extension uses Chrome's message passing API for communication:

```javascript
// Send message from popup to content script
chrome.tabs.sendMessage(tabId, {
    action: 'scrapeData',
    config: {...}
});

// Listen in content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapeData') {
        // Handle scraping
        sendResponse({ success: true, data: [] });
    }
});
```

## 📊 Recipe Contributions

Help build our community recipe library:

### Recipe Guidelines
1. **Test thoroughly** on the target website
2. **Document clearly** with description and examples
3. **Include error handling** for edge cases
4. **Respect robots.txt** and terms of service
5. **Add example output** in your PR

### Recipe Format
```javascript
{
    "name": "Example Site Scraper",
    "version": "1.0.0",
    "description": "Extract products from example.com",
    "target": {
        "domain": "example.com",
        "pathPattern": "/products*"
    },
    "selectors": {
        "container": ".product-item",
        "fields": {
            "title": ".product-title",
            "price": ".price",
            "image": ".product-image"
        }
    }
}
```

## 🔒 Security Guidelines

### When Contributing
- **Never include** API keys, passwords, or sensitive data
- **Validate all inputs** in your code
- **Sanitize data** before displaying or exporting
- **Report security issues** privately via email

### When Scraping
- **Respect rate limits** and delays
- **Don't scrape** personal or sensitive information
- **Follow legal guidelines** in your jurisdiction
- **Respect website terms of service**

## 🌍 Internationalization

We welcome translations! To add a new language:

1. Create a new file in `src/locales/[language-code].json`
2. Translate all strings from `src/locales/en.json`
3. Update the manifest to include the new locale
4. Test the UI with your translations

## 📞 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Be Collaborative
- Help newcomers get started
- Share knowledge and resources
- Provide constructive feedback
- Work together to solve problems

### Be Responsible
- Don't submit code for scraping sensitive data
- Respect website terms of service
- Report security vulnerabilities privately
- Follow legal and ethical guidelines

## 🏆 Recognition

Contributors will be:
- **Listed** in our Contributors section
- **Credited** in release notes for significant contributions
- **Invited** to our private contributor Discord channel
- **Considered** for maintainer roles for ongoing contributors

## 🆘 Getting Help

### Development Help
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Fawad-Ahmed/universal-scraping-extension/discussions)
- 📧 **Email**: fawad.ahmed@universalscraping.com
- 📖 **Docs**: Check the `/docs` folder for detailed guides

### Common Issues
- **Build failures**: Make sure you're using Node.js 18+
- **Extension not loading**: Check the `dist/` folder exists and contains files
- **Tests failing**: Run `npm ci` to ensure clean dependencies

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project. See [LICENSE](LICENSE) for details.

---

**Thank you for contributing to Universal Scraping Extension!** 🙏

Your contributions help make web scraping accessible to everyone.