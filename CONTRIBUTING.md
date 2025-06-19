# Contributing to Universal Scraping Extension

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Ways to Contribute

- 🐛 **Bug Reports**: Found a bug? Let us know!
- 💡 **Feature Requests**: Have an idea? We'd love to hear it!
- 📝 **Documentation**: Help improve our docs
- 🧪 **Testing**: Test the extension on different sites
- 💻 **Code**: Submit pull requests with improvements
- 🌍 **Translations**: Help us support more languages
- 📊 **Recipes**: Share scraping recipes with the community

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/universal-scraping-extension.git
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Guidelines

### Code Style
- Use ESLint and Prettier configurations provided
- Write descriptive commit messages
- Add JSDoc comments for functions
- Include tests for new features

### Testing
- Run tests before submitting: `npm test`
- Add tests for new functionality
- Test on multiple websites when possible
- Include browser compatibility testing

### Documentation
- Update relevant documentation
- Add examples for new features
- Keep README.md current
- Document breaking changes

## Submitting Changes

### Pull Request Process
1. **Update your branch** with latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** and ensure they pass:
   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **Commit your changes** with descriptive messages:
   ```bash
   git commit -m "feat: add visual selector for nested tables"
   ```

4. **Push to your fork** and create a pull request

5. **Fill out the PR template** completely

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(scraper): add support for shadow DOM elements
fix(popup): resolve export button not working
docs(api): update recipe format documentation
```

## Bug Reports

When reporting bugs, please include:

- **Browser and version** (Chrome 120.0.0.0)
- **Extension version** (2.0.0)
- **Website URL** where the issue occurs
- **Steps to reproduce** the bug
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Console errors** if any

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

## Feature Requests

For new features, please:

- **Search existing issues** to avoid duplicates
- **Describe the problem** you're trying to solve
- **Propose a solution** or approach
- **Consider the scope** - is this a common use case?
- **Provide examples** of how it would work

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

## Recipe Contributions

Help build our community recipe library:

1. **Create a working recipe** locally
2. **Test thoroughly** on the target website
3. **Document the recipe** with clear description
4. **Submit via pull request** to `recipes/` folder
5. **Include example output** in your PR

Recipe guidelines:
- Must work reliably on target site
- Include proper error handling
- Add descriptive metadata
- Respect robots.txt and terms of service

## Community Guidelines

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

## Development Setup

### Prerequisites
- Node.js 18.0 or higher
- Chrome or Chromium browser
- Git

### Local Development
```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Package extension
npm run package
```

### Loading in Chrome
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist/` folder

## Code Architecture

### Project Structure
```
src/
├── background/          # Service worker
├── content/            # Content scripts
├── popup/              # Extension popup
├── standalone/         # Standalone window
├── utils/              # Shared utilities
└── shared/             # Constants and types
```

### Key Components
- **Background Script**: Manages extension lifecycle
- **Content Script**: Handles page interaction and scraping
- **Popup**: Main user interface
- **Standalone**: Extended interface for complex tasks

## Recognition

Contributors will be:
- Listed in our Contributors section
- Credited in release notes for significant contributions
- Invited to our private Discord channel
- Considered for maintainer roles

## Questions?

- 💬 **Discord**: [Join our community](https://discord.gg/universalscraping)
- 📧 **Email**: contribute@universalscraping.com
- 📖 **Docs**: [Full documentation](https://docs.universalscraping.com)

## License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.