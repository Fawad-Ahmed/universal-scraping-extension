# Contributing to Universal Scraping Extension

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🤝 Ways to Contribute

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
- Chrome or Chromium browser
- Git

### Development Setup
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
4. **Start development mode**:
   ```bash
   npm run dev
   ```
5. **Load the extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist/` folder

## 💻 Development Guidelines

### Code Style
- Follow the ESLint and Prettier configurations provided
- Use descriptive variable and function names
- Write JSDoc comments for public functions
- Prefer `const` over `let`, avoid `var`
- Use modern ES6+ features

### Commit Messages
Follow the Conventional Commits specification:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

Examples:
```bash
git commit -m "feat(scraper): add support for shadow DOM elements"
git commit -m "fix(popup): resolve export button not working on Safari"
git commit -m "docs(api): update recipe format documentation"
```

### Testing
- **Write tests** for new features and bug fixes
- **Run existing tests** before submitting: `npm test`
- **Test manually** on various websites
- **Include browser compatibility** testing when possible

### Documentation
- Update relevant documentation for new features
- Add examples for complex functionality
- Keep README.md current
- Document any breaking changes

## 🔧 Technical Guidelines

### Architecture
The extension follows a modular architecture:
```
src/
├── background/     # Service worker and background tasks
├── content/        # Content scripts injected into pages
├── popup/          # Extension popup interface
├── utils/          # Shared utilities
└── shared/         # Shared constants and types
```

### Key Concepts
- **Content Scripts**: Handle DOM interaction and data extraction
- **Background Script**: Manages extension lifecycle and messaging
- **Visual Selector**: Allows users to click elements for selection
- **Recipes**: Saved scraping configurations
- **Message Passing**: Communication between extension components

### Adding New Features
1. **Plan the feature**: Consider user experience and technical implementation
2. **Create an issue**: Discuss the feature before starting development
3. **Follow the architecture**: Use existing patterns and utilities
4. **Test thoroughly**: Ensure the feature works across different sites
5. **Document**: Add JSDoc comments and update relevant docs

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Extension loads without errors
- [ ] Visual selector works on different websites
- [ ] Data extraction produces correct results
- [ ] Export functionality works for all formats
- [ ] Multi-page scraping handles pagination correctly
- [ ] Error messages are clear and helpful

### Automated Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run linting
npm run lint
```

## 📊 Submitting Changes

### Pull Request Process
1. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Test your changes**:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

4. **Commit your changes** with descriptive messages

5. **Push to your fork** and create a pull request

6. **Fill out the PR template** completely

7. **Respond to feedback** and update your PR as needed

### Review Process
- All pull requests require review from maintainers
- We aim to review PRs within 48 hours
- Be responsive to feedback and questions
- Squash commits before merging if requested

## 🐛 Bug Reports

When reporting bugs, please include:
- **Browser and version** (e.g., Chrome 120.0.0.0)
- **Extension version** (e.g., 2.0.0)
- **Website URL** where the issue occurs
- **Steps to reproduce** the bug
- **Expected vs actual behavior**
- **Console errors** (if any)
- **Screenshots** (if helpful)

Use our [bug report template](https://github.com/Fawad-Ahmed/universal-scraping-extension/issues/new?template=bug_report.md).

## 💡 Feature Requests

For new features, please:
- **Search existing issues** to avoid duplicates
- **Describe the problem** you're trying to solve
- **Propose a solution** with examples
- **Consider the scope** - is this useful for many users?
- **Include mockups** if applicable

Use our [feature request template](https://github.com/Fawad-Ahmed/universal-scraping-extension/issues/new?template=feature_request.md).

## 📊 Recipe Contributions

Help build our community recipe library:

### Recipe Guidelines
- Must work reliably on target website
- Include proper error handling
- Add descriptive metadata
- Respect robots.txt and terms of service
- Test thoroughly before submitting

### Recipe Format
```json
{
  "name": "Website Name Scraper",
  "version": "1.0",
  "description": "Extract data from Website Name",
  "target": {
    "domain": "example.com",
    "pathPattern": "/path/*"
  },
  "selectors": {
    "container": ".item",
    "fields": {
      "title": ".title",
      "price": ".price",
      "url": "a"
    }
  },
  "pagination": {
    "type": "button",
    "selector": ".next-page"
  }
}
```

### Submission Process
1. Create and test your recipe locally
2. Add it to the `recipes/` folder
3. Include example output in your PR
4. Follow the naming convention: `recipes/domain-com.json`

## 🌍 Community Guidelines

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
- Don't submit recipes for scraping sensitive data
- Respect website terms of service
- Report security vulnerabilities privately
- Follow legal and ethical guidelines

## 🏆 Recognition

Contributors will be:
- Listed in our Contributors section
- Credited in release notes for significant contributions
- Invited to our private Discord channel
- Considered for maintainer roles

## 📞 Questions?

- 💬 **Discord**: [Join our community](https://discord.gg/universalscraping)
- 📧 **Email**: contribute@universalscraping.com
- 📖 **Docs**: [Full documentation](https://docs.universalscraping.com)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

**Thank you for helping make Universal Scraping Extension better for everyone!** 🙏