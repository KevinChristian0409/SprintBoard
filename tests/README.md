# SprintBoard Playwright Test Suite

End-to-end and API automation for SprintBoard using **Playwright and TypeScript**.

The suite validates important user workflows through the browser and tests the REST API directly for backend behavior, authorization, and CRUD operations.

## Test Strategy

The suite separates responsibilities so each test stays focused:

- **UI tests** validate real user workflows through the browser.
- **API tests** validate backend contracts, status codes, authorization, and CRUD behavior.
- **Fixtures** create isolated projects/tasks and clean them up after tests.
- **Authentication setup** creates one reusable authenticated browser state for protected UI tests.
- **Page Objects** keep selectors and common interactions out of the test cases.

The goal is to keep the tests independent and maintainable while avoiding unnecessary repeated setup.

---

## Test Architecture

```text
tests/
│
├── e2e/
│   ├── api.spec.ts
│   ├── auth.spec.ts
│   ├── projects.spec.ts
│   ├── protected.spec.ts
│   ├── smoke.spec.ts
│   ├── tasks.spec.ts
│   └── unauthenticated.spec.ts
│
├── fixtures/
│   └── test.ts
│
├── pages/
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── ProjectsPage.ts
│   ├── ProjectBoardPage.ts
│   └── TaskDetailPage.ts
│
├── auth.setup.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## Page Object Model

Selectors and reusable page interactions are kept inside page objects instead of being repeated throughout the test files.

Current page objects include:

- `LoginPage`
- `RegisterPage`
- `ProjectsPage`
- `ProjectBoardPage`
- `TaskDetailPage`

This keeps test cases focused on the behavior being verified rather than the implementation details of the page.

---

## Fixtures

Reusable fixtures handle test data that is required by multiple tests.

For example, project and task fixtures can:

1. Create the required test data through the API.
2. Provide the created data to the test.
3. Allow the test to focus on the UI workflow.
4. Clean up the data after the test finishes.

This avoids repeating the same setup code across multiple tests and helps prevent tests from depending on data created by other tests.

---

## Authentication Setup

Protected UI tests use Playwright's `storageState` functionality.

Instead of logging in before every protected test, the `setup` project performs the login and saves the authenticated browser state.

The `chromium-auth` project depends on this setup and reuses the saved state.

```text
setup
  │
  │ login once
  ▼
playwright/.auth/user.json
  │
  ▼
chromium-auth
  │
  ├── protected route tests
  ├── project tests
  └── task tests
```

This keeps the login workflow covered by its own tests while avoiding repeated login steps in every protected test.

---

## Cross-Browser Coverage

The suite uses Playwright projects to validate critical workflows across Chromium, Firefox, and WebKit.

### `chromium`

Runs the primary public UI regression suite.

### `chromium-auth`

Runs the full authenticated UI regression suite using the saved authentication state.

### `firefox`

Runs public authentication, registration, smoke, and unauthenticated workflows to identify browser-specific issues.

### `firefox-auth`

Runs authenticated project, task, and protected-route workflows using the saved authentication state.

### `webkit`

Runs the same critical public workflows against the WebKit browser engine for Safari-engine coverage.

### `webkit-auth`

Runs authenticated project, task, and protected-route workflows against WebKit.

### Browser Coverage Matrix

| Test Area                     | Chromium | Firefox | WebKit |
| ----------------------------- | :------: | :-----: | :----: |
| Authentication & Registration |   Yes    |   Yes   |  Yes   |
| Smoke Testing                 |   Yes    |   Yes   |  Yes   |
| Unauthenticated Access        |   Yes    |   Yes   |  Yes   |
| Project Workflows             |   Yes    |   Yes   |  Yes   |
| Task Workflows                |   Yes    |   Yes   |  Yes   |
| Protected Routes              |   Yes    |   Yes   |  Yes   |

Chromium receives the full regression suite, while Firefox and WebKit provide targeted cross-browser coverage of the application's highest-value workflows.

### `api`

Runs REST API tests independently from browser automation.

## Test Projects

The Playwright configuration separates the suite into different projects:

### `setup`

Creates the reusable authenticated browser state.

### `chromium`

Runs public UI tests that do not require an authenticated session.

### `chromium-auth`

Runs protected UI tests using the saved authentication state.

### `firefox`

Runs critical public workflows for cross-browser coverage.

### `firefox-auth`

Runs critical authenticated workflows for cross-browser coverage.

### `webkit`

Runs critical public workflows against the WebKit browser engine.

### `webkit-auth`

Runs critical authenticated workflows against the WebKit browser engine.

### `api`

Runs REST API tests independently from browser automation.

---

## Coverage

### Authentication & Registration

- Valid login
- Invalid login
- Required-field validation
- Registration validation
- Password confirmation validation
- Password length validation
- Password visibility
- Existing-account validation
- Login and registration navigation

### Protected Routes

- Authenticated dashboard access
- Authenticated projects access
- Unauthenticated redirect to login
- Logout removes access to protected content

### Projects

- Create a project
- Open a project board
- Cancel project creation
- Project member interactions
- Member search behavior

### Tasks

- Create a task
- Create tasks with different values
- Open task details
- Edit a task
- Cancel task editing
- Delete a task
- Confirmation dialog handling
- Task status updates
- Task priority behavior

### API

- Authentication
- Authorization
- Project CRUD
- Task CRUD
- Task status updates
- User search
- Protected endpoint behavior
- HTTP status code validation
- Response body validation

---

## Running the Suite

Run these commands from the `tests` directory.

### Run everything

```bash
npm test
```

### Run Chromium

```bash
npx playwright test --project=chromium
```

### Run Firefox

```bash
npx playwright test --project=firefox
```

### Run WebKit

```bash
npx playwright test --project=webkit
```

### Run authenticated cross-browser tests

```bash
npx playwright test --project=chromium-auth --project=firefox-auth --project=webkit-auth
```

### Run UI tests

```bash
npm run test:ui
```

### Run API tests

```bash
npm run test:api
```

### Run the TypeScript check

```bash
npm run typecheck
```

### Run with one worker

Useful when debugging a failure:

```bash
npx playwright test --workers=1
```

### Run a specific test file

```bash
npx playwright test e2e/projects.spec.ts
```

### Run a specific test by name

```bash
npx playwright test -g "user can create a new project"
```

### Open the HTML report

```bash
npx playwright show-report
```

---

## Environment

Create a local `.env` file in the `tests` directory:

```env
PLAYWRIGHT_TEST_BASE_URL=https://sprint-board-seven-omega.vercel.app
PLAYWRIGHT_TEST_API_URL=https://sprintboard-api-4qps.onrender.com
TEST_USER_EMAIL=your-test-account-email
TEST_USER_PASSWORD=your-test-account-password
```

The actual credentials should remain local.

Never commit:

```text
.env
playwright/.auth/
test-results/
playwright-report/
```

A `.env.example` file can be used as a template without real credentials.

---

## Test Data & Cleanup

Tests that require projects or tasks use reusable fixtures and API requests to create the required state.

This avoids unnecessary UI setup and makes the tests less dependent on the order in which other tests run.

Created test data is cleaned up after the test whenever possible.

The goal is for each test to be able to run independently without relying on data created by another test.

---

## Locator Strategy

The tests prefer Playwright's user-facing locators:

```typescript
getByRole();
getByLabel();
getByText();
```

These locators are generally more resilient than relying on CSS classes or generated DOM structure.

When multiple elements have the same visible text, locators are scoped to the appropriate container or form.

For example, the project board contains more than one `Add Task` button, so the test scopes the action to the correct part of the page rather than relying on an arbitrary CSS selector.

---

## Assertions

Tests verify both the action and the resulting application state.

Examples include:

- URL changes
- Visible headings
- Created projects and tasks
- Updated task information
- Validation messages
- Confirmation dialogs
- HTTP status codes
- API response bodies

This helps ensure that tests verify actual application behavior rather than simply checking whether a click was successful.

---

## API Testing

API tests use Playwright's API request functionality to test the backend independently of the browser.

This allows the suite to verify:

- Authentication responses
- Unauthorized requests
- Project creation and retrieval
- Project updates and deletion
- Task creation and retrieval
- Task updates and deletion
- Task status changes
- User search behavior

API requests are also useful for preparing test data when a browser interaction is not part of the behavior being tested.

---

## Failure Artifacts

Playwright is configured to provide debugging information when tests fail.

Depending on the configuration, failures can include:

- Screenshots
- Video recordings
- Traces
- HTML reports

To open the latest HTML report:

```bash
npx playwright show-report
```

For a failed test with a trace, Playwright can also open the trace for step-by-step debugging.

---

## CI

The Playwright suite is configured to run through GitHub Actions.

The workflow:

1. Checks out the repository.
2. Installs dependencies.
3. Installs Playwright browsers.
4. Runs the automated test suite.
5. Reports failures through GitHub Actions.

Test credentials and environment-specific values are supplied through GitHub Actions secrets rather than being stored in the repository.

---

## Test Suite

The current suite contains **44 automated tests** covering both UI workflows and REST API behavior.

The focus is on meaningful coverage rather than simply increasing the test count. The suite covers core workflows, validation, authentication, authorization, CRUD operations, and backend behavior while keeping repeated setup in fixtures and page objects.

---

## What This Framework Demonstrates

- Playwright UI automation
- REST API testing
- TypeScript
- Page Object Model
- Reusable Playwright fixtures
- Authentication with `storageState`
- API-based test data setup
- Test cleanup and isolation
- Accessible locator strategies
- Positive and negative testing
- CRUD testing
- Authorization testing
- Confirmation-dialog testing
- Parallel test execution
- GitHub Actions integration
