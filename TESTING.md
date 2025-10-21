# Testing Guide

This project uses a comprehensive testing strategy with multiple frameworks to ensure quality across all layers of the application.

## Table of Contents
- [Overview](#overview)
- [Unit Testing with Vitest](#unit-testing-with-vitest)
- [Backend Testing with xUnit](#backend-testing-with-xunit)
- [E2E Testing with Playwright](#e2e-testing-with-playwright)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Overview

Our testing stack includes:

| Layer | Framework | Purpose |
|-------|-----------|---------|
| **Frontend (React)** | Vitest + React Testing Library | Unit & component tests |
| **Backend (.NET)** | xUnit | API & business logic tests |
| **E2E** | Playwright | Full user flow tests |

## Unit Testing with Vitest

### Customer App

**Location:** `customer-app/src/**/*.test.jsx`

**Running tests:**
```bash
cd customer-app
npm test              # Run tests in watch mode
npm test -- --run     # Run tests once
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report
```

**Example test:**
```javascript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MenuItem from './MenuItem'

describe('MenuItem Component', () => {
  it('renders menu item with correct details', () => {
    const mockItem = {
      name: 'Test Burger',
      price: 9.99,
      isAvailable: true,
    }

    render(<MenuItem item={mockItem} onAddToCart={vi.fn()} />)

    expect(screen.getByText('Test Burger')).toBeInTheDocument()
    expect(screen.getByText('$9.99')).toBeInTheDocument()
  })
})
```

**What to test:**
- Component rendering
- User interactions (clicks, inputs)
- State changes
- Props validation
- Conditional rendering

### Staff Dashboard

**Location:** `staff-dashboard/src/**/*.test.js`

**Running tests:**
```bash
cd staff-dashboard
npm test              # Run tests in watch mode
npm test -- --run     # Run tests once
npm run test:ui       # Open Vitest UI
npm run test:coverage # Generate coverage report
```

**Example test:**
```javascript
import { describe, it, expect } from 'vitest'
import { validateLoginForm } from './loginFormModel'

describe('Login Form Validation', () => {
  it('returns no errors for valid form', () => {
    const validForm = {
      username: 'admin',
      password: 'password123',
    }

    const errors = validateLoginForm(validForm)

    expect(errors).toEqual({})
  })
})
```

**What to test:**
- Form validation logic
- View models
- Utility functions
- Component behavior
- State management

### Configuration

Both apps use the same Vitest configuration:

**vitest.config.js:**
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
})
```

## Backend Testing with xUnit

### .NET API

**Location:** `DigitalMenuSystem.Tests/`

**Running tests:**
```bash
# Run all tests
dotnet test

# Run tests with detailed output
dotnet test --verbosity detailed

# Run specific test file
dotnet test --filter "FullyQualifiedName~TableTests"

# Run tests with coverage (requires coverlet)
dotnet test --collect:"XPlat Code Coverage"
```

**Example test:**
```csharp
using DigitalMenuSystem.API.Models;
using Xunit;

namespace DigitalMenuSystem.Tests.Models
{
    public class TableTests
    {
        [Fact]
        public void Table_ShouldInitializeWithDefaultValues()
        {
            // Arrange & Act
            var table = new Table();

            // Assert
            Assert.Equal(0, table.Id);
            Assert.True(table.IsActive);
            Assert.NotNull(table.Orders);
        }

        [Theory]
        [InlineData("T1", 2, "Patio")]
        [InlineData("T5", 4, "Main Hall")]
        public void Table_ShouldAcceptVariousConfigurations(
            string tableNumber,
            int capacity,
            string location)
        {
            // Arrange
            var table = new Table
            {
                TableNumber = tableNumber,
                Capacity = capacity,
                Location = location
            };

            // Assert
            Assert.Equal(tableNumber, table.TableNumber);
            Assert.Equal(capacity, table.Capacity);
        }
    }
}
```

**What to test:**
- Model validation
- Service business logic
- Controller endpoints (with mocked dependencies)
- Database operations (with in-memory DB)
- Authentication & authorization

### xUnit Attributes

- `[Fact]` - Single test case
- `[Theory]` - Parameterized test with multiple cases
- `[InlineData]` - Provides data for theory tests

## E2E Testing with Playwright

### Running E2E Tests

**From project root:**
```bash
# Run all E2E tests (both customer and staff)
npm run test:e2e

# Run customer app tests only
npm run test:e2e:customer

# Run staff dashboard tests only
npm run test:e2e:staff

# Run tests in UI mode (recommended for development)
npm run test:e2e:ui

# Run tests with browser visible
npm run test:e2e:headed

# Run tests in specific browser
npm run test:e2e:chrome

# View test report
npm run test:e2e:report
```

### Example E2E Test

**Location:** `e2e-tests/*.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Customer App - Menu Browsing', () => {
  test('should add item to cart', async ({ page }) => {
    await page.goto('/');

    // Find first menu item
    const menuItem = page.locator('.menu-item').first();
    await expect(menuItem).toBeVisible();

    // Click add to cart
    await menuItem.locator('button:has-text("Add to Cart")').click();

    // Verify confirmation message
    await expect(page.locator('text=/Added.*to cart/i')).toBeVisible();
  });
});
```

### E2E Test Files

**customer-menu.spec.js** - Customer App Tests
- Basic loading and UI elements
- Menu display and categories
- Search functionality
- Cart navigation
- Responsive design (mobile/tablet)

**staff-dashboard.spec.js** - Staff Dashboard Tests
- Login page rendering
- Form validation
- Protected route access
- Responsive design
- UI elements and styling

### What to test:
- Critical user flows
- Multi-page workflows
- Integration between customer app and staff dashboard
- Mobile responsiveness
- Cross-browser compatibility
- Authentication and authorization
- Form validation and submission

### Playwright Configuration

**playwright.config.js** includes:
- Support for Chromium, Firefox, and WebKit
- Automatic dev server startup
- Screenshot on failure
- Trace on retry
- Parallel execution

## Running Tests

### Run All Tests

```bash
# Frontend tests
cd customer-app && npm test -- --run
cd staff-dashboard && npm test -- --run

# Backend tests
dotnet test

# E2E tests
npm run test:e2e
```

### Watch Mode (Development)

```bash
# Frontend (auto-rerun on file changes)
cd customer-app && npm test

# Backend (requires dotnet watch)
dotnet watch test --project DigitalMenuSystem.Tests

# E2E (UI mode)
npm run test:e2e:ui
```

## Best Practices

### General
1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Test Behavior, Not Implementation**: Focus on what, not how
3. **One Assertion Per Test**: Keep tests focused
4. **Descriptive Test Names**: Use clear, descriptive names
5. **Independent Tests**: Tests should not depend on each other

### Vitest (React)
- Use `vi.fn()` for mocking functions
- Use `@testing-library/react` queries (getByText, getByRole)
- Avoid testing implementation details
- Use `fireEvent` or `userEvent` for interactions
- Clean up after each test (done automatically in setup)

### xUnit (.NET)
- Use `[Fact]` for simple tests, `[Theory]` for parameterized
- Mock dependencies using interfaces
- Use in-memory database for integration tests
- Test both success and error cases
- Verify exception handling

### Playwright (E2E)
- Use `page.goto()` to navigate
- Wait for elements with `expect().toBeVisible()`
- Use data-testid attributes for stable selectors
- Test critical paths only (E2E tests are expensive)
- Run tests in parallel when possible

## Test Coverage

### Viewing Coverage

**Vitest (React):**
```bash
cd customer-app
npm run test:coverage
# Open coverage/index.html in browser
```

**xUnit (.NET):**
```bash
# Install coverlet
dotnet add package coverlet.collector

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Install reportgenerator
dotnet tool install -g dotnet-reportgenerator-globaltool

# Generate HTML report
reportgenerator -reports:"**/coverage.cobertura.xml" -targetdir:"coverage" -reporttypes:Html
```

### Coverage Goals
- **Unit Tests**: Aim for 80%+ coverage
- **Integration Tests**: Cover critical paths
- **E2E Tests**: Cover main user workflows

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Test Customer App
        run: |
          cd customer-app
          npm install
          npm test -- --run
      - name: Test Staff Dashboard
        run: |
          cd staff-dashboard
          npm install
          npm test -- --run

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - name: Test API
        run: dotnet test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install Playwright
        run: |
          npm install
          npx playwright install --with-deps
      - name: Run E2E Tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Debugging Tests

### Vitest
```bash
# Run specific test file
npm test -- MenuItem.test.jsx

# Run tests matching pattern
npm test -- --grep "quantity"

# Update snapshots
npm test -- -u
```

### xUnit
```bash
# Run specific test class
dotnet test --filter "FullyQualifiedName~TableTests"

# Run specific test method
dotnet test --filter "FullyQualifiedName~Table_ShouldInitializeWithDefaultValues"
```

### Playwright
```bash
# Debug mode (opens inspector)
npx playwright test --debug

# Run specific test
npx playwright test customer-menu.spec.js

# Generate test code (codegen)
npx playwright codegen http://localhost:5173
```

## Troubleshooting

### Common Issues

**Vitest:**
- **Issue**: "Cannot find module"
  - **Solution**: Check vitest.config.js aliases and imports

**xUnit:**
- **Issue**: "Could not load file or assembly"
  - **Solution**: Ensure test project references API project correctly

**Playwright:**
- **Issue**: "Browser not found"
  - **Solution**: Run `npx playwright install`
- **Issue**: "Timeout waiting for element"
  - **Solution**: Increase timeout or add `waitForLoadState('networkidle')`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [xUnit Documentation](https://xunit.net/)
- [Playwright Documentation](https://playwright.dev/)

## Summary

You now have a complete testing setup:

✅ **Vitest** for customer-app unit/component tests
✅ **Vitest** for staff-dashboard unit/component tests
✅ **xUnit** for .NET API backend tests
✅ **Playwright** for E2E cross-browser tests

Run all tests regularly during development and before commits!
