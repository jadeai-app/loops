# Contributing to Loops

First off, thank you for considering contributing to Loops! It's people like you that make Loops such a great tool. We welcome contributions from the community to help us build the future of personal safety.

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open-source project. In return, they should reciprocate that respect in addressing your issue or assessing pull requests and features.

## Getting Started

Before you begin, please review the `README.md` for instructions on how to get the project set up on your local machine. This includes cloning the repository, installing dependencies, and running the development server with the Firebase emulators.

## Development Workflow

We follow a standard GitHub flow for development. All work is done on feature branches and then submitted as a Pull Request to the `main` branch.

### Branching Strategy

*   `main`: This branch is always considered production-ready. All pull requests are merged into this branch.
*   **Feature Branches:** All new features should be developed on a feature branch. Name your branch `feat/feature-name` (e.g., `feat/user-profile-page`).
*   **Bug Fix Branches:** For bug fixes, use the naming convention `fix/bug-name` (e.g., `fix/login-button-bug`).

### Making Changes

1.  Create a new branch from the `main` branch with the appropriate naming convention.
2.  Make your code changes. Ensure you follow the project's code style and conventions.
3.  Add or update tests as necessary to cover your changes.
4.  Ensure all existing and new tests pass.
5.  Commit your changes with a clear and descriptive commit message.

## Submitting a Pull Request

When you are ready to submit your work, please open a Pull Request against the `main` branch.

### Pull Request Checklist

Before you submit your PR, please ensure you have completed the following:

*   [ ] Your code builds cleanly without any errors or warnings.
*   [ ] You have added or updated unit/integration tests that cover your changes.
*   [ ] All existing and new tests pass successfully (`npm run test:unit`, `npm run test:integration`).
*   [ ] You have run the linter and type-checker and fixed any issues (`npm run lint`, `npm run type-check`).
*   [ ] Your PR has a clear and descriptive title.
*   [ ] The PR description links to the relevant GitHub issue (if one exists).

A project maintainer will review your PR. You may be asked to make changes before it is approved and merged.

## Code Style

While we are still formalizing a strict style guide, please adhere to the following principles:

*   Follow the existing code style in the file you are editing.
*   Write clean, readable, and self-documenting code.
*   Use TypeScript for all new code.
*   Keep components small and focused on a single responsibility.

## Questions?

If you have any questions, feel free to open an issue on GitHub. We are happy to help!