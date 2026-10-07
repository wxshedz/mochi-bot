# Contributing to Mochi Bot

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Copy `config.example.json` to `config.json` and configure
5. Start development server: `npm run dev`

## Code Style

- Use ESLint and Prettier (configs included)
- Run `npm run lint` before committing
- Use ES6+ features and modules
- Keep functions focused and single-purpose

## Commit Messages

Follow conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `refactor:` code refactoring
- `chore:` maintenance tasks

## Pull Requests

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Run linter and fix issues
5. Submit PR with clear description

## Testing

- Test all commands in a test Discord server
- Verify database operations work correctly
- Check error handling and edge cases

## Questions?

Open an issue for discussion before starting major changes.
