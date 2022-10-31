# Contributing

## Issues

1. Follow the [Issue Template](./.github/ISSUE_TEMPLATE.md) provided when opening a new Issue.
2. Provide a minimal, reproducible test-case.
3. Do not ask for help or usage questions in Issues. Use [StackOverflow](http://stackoverflow.com) for those.

## Pull Requests

First, thank you so much for contributing to open source and this project!

Follow the instructions on the Pull Request Template (shown when you open a new PR) and make sure you've done the following:

- [ ] Add & update tests
- [ ] Ensure CI is passing (lint, tests)
- [ ] Update relevant documentation and/or examples

## Setup

This package uses [yarn](https://yarnpkg.com) for development dependency management. Ensure you have it installed before continuing.

```sh
yarn
```

## Running Tests

```sh
yarn test
```

## Running Flowtype Checks

```sh
yarn flow
```

## Lint

Standard code style is nice. ESLint is used to ensure we continue to write similar code. The following command will also fix simple issues, like spacing and alphabetized imports:

```sh
yarn lint
```

## Building

```sh
yarn build
```
