# Contributing to LetterLoop

Thank you for considering contributing to LetterLoop! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Provide information about your environment (browser, OS, etc.)

### Suggesting Features

- Check if the feature has already been suggested in the Issues section
- Use the feature request template when creating a new issue
- Clearly describe the feature and its benefits
- Consider how the feature fits into the existing application

### Code Contributions

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass
6. Submit a pull request

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/letterloop.git
   cd letterloop
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Fill in the required Supabase credentials

4. Start the development server
   ```bash
   npm run dev
   ```

## Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions, types, and API clients
- `/public` - Static assets
- `/scripts` - Utility scripts

## Coding Standards

- Use TypeScript for type safety
- Follow the existing code style
- Use meaningful variable and function names
- Write comments for complex logic
- Keep components small and focused

## Testing

- Write tests for new features
- Ensure existing tests pass before submitting a PR
- Run tests with `npm test`

## Documentation

- Update documentation when changing functionality
- Document new features
- Keep the README up to date

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md with details of changes
3. The PR will be merged once it has been reviewed and approved

## Questions?

If you have any questions about contributing, please open an issue or contact the project maintainers.

Thank you for contributing to LetterLoop!
