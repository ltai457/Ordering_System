# Digital Menu Ordering System

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

A modern, full-stack digital ordering platform designed for restaurants to streamline dine-in operations. This system enables customers to browse menus, customize orders, and submit directly to the kitchen via QR code-enabled tables, while providing staff with comprehensive tools for menu management, order tracking, and kitchen operations.

## Overview

The Digital Menu Ordering System consists of three integrated applications:

### **DigitalMenuSystem.API**
Enterprise-grade .NET 8 Web API providing:
- RESTful endpoints for menu management, ordering, and authentication
- PostgreSQL database with Entity Framework Core ORM
- JWT-based authentication and role-based authorization
- AWS S3 integration for scalable image storage
- OpenAPI/Swagger documentation

### **Staff Dashboard**
React-based administrative interface featuring:
- Comprehensive menu and add-on management
- Real-time kitchen display system (KDS) with order workflow
- Table and QR code generation
- User and role management
- Drag-and-drop reordering capabilities

### **Customer App**
Mobile-optimized customer ordering interface offering:
- Intuitive menu browsing with category navigation
- Advanced item customization (spice levels, sides, paid add-ons)
- Shopping cart with real-time pricing
- QR code table detection for seamless ordering
- Order confirmation and tracking

**Architecture:** The three applications share a unified domain model, ensuring consistency across all touchpoints. Orders placed through the customer app instantly appear in the kitchen display, with status updates propagating in real-time through API polling (WebSocket upgrade supported).

---

## Repository Structure

```
Ordering_System/
├── DigitalMenuSystem.API/      # ASP.NET Core backend (PostgreSQL, JWT, S3)
├── staff-dashboard/            # Staff-facing React dashboard (Vite)
├── customer-app/               # Guest-facing React app (Vite)
└── Ordering_System.sln         # Solution file for the API project
```

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| .NET | 8.0 | API runtime and framework |
| ASP.NET Core | 8.0 | Web API implementation |
| Entity Framework Core | Latest | ORM and database migrations |
| PostgreSQL | 14+ | Primary data store |
| Npgsql | Latest | PostgreSQL provider for EF Core |
| JWT | - | Authentication tokens |
| AWS SDK (S3) | Latest | Image storage and retrieval |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | Latest | Build tool and dev server |
| Tailwind CSS | Latest | Utility-first styling |
| React Router | v7 | Client-side routing |
| @hello-pangea/dnd | Latest | Drag-and-drop (staff dashboard) |
| qrcode.react | Latest | QR code generation |

### Development Tools
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS transformations
- **npm** - Package management
- **Docker** - Optional containerized PostgreSQL
- **Swagger/OpenAPI** - API documentation

---

## Prerequisites

Ensure the following tools are installed before proceeding with setup:

| Tool | Minimum Version | Installation | Required For |
|------|----------------|--------------|--------------|
| [.NET SDK](https://dotnet.microsoft.com/download) | 8.0 | [Download](https://dotnet.microsoft.com/download) | Backend API and migrations |
| [Node.js](https://nodejs.org/) | 20.x LTS | [Download](https://nodejs.org/) | Frontend applications |
| npm | Bundled with Node.js | Included with Node.js | Package management |
| [PostgreSQL](https://www.postgresql.org/) | 14+ | [Download](https://www.postgresql.org/download/) or [Docker Hub](https://hub.docker.com/_/postgres) | Database |
| [dotnet-ef CLI](https://docs.microsoft.com/ef/core/cli/dotnet) | Latest | `dotnet tool install --global dotnet-ef` | Database migrations |
| AWS S3 Bucket | - | [AWS Console](https://console.aws.amazon.com/s3/) | Image uploads (optional for dev) |

**Note:** While pnpm and yarn are compatible, this documentation uses npm for consistency.

---

## Getting Started

### 1. Backend Setup (`DigitalMenuSystem.API`)

#### 1.1 Install Dependencies
```bash
cd DigitalMenuSystem.API
dotnet restore
```

#### 1.2 Configure Environment Variables
Create a `.env` file in the API root directory with the following configuration:

> **Security Warning:** Never commit `.env` files containing secrets to version control. Add `.env` to `.gitignore`.

```ini
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=digitalmenu
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Configuration (SECRET must be ≥32 characters)
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters_required
JWT_ISSUER=DigitalMenuSystem
JWT_AUDIENCE=DigitalMenuSystem

# AWS S3 Configuration (optional for local development)
AWS_REGION=us-east-1
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name

# Frontend Configuration
CUSTOMER_APP_URL=http://localhost:5173

# API Configuration (optional, defaults to 5100)
DMS_API_PORT=5100
```

#### 1.3 Initialize Database
Ensure PostgreSQL is running, then apply migrations:

```bash
# Install EF Core CLI tools (first time only)
dotnet tool install --global dotnet-ef

# Apply migrations to create database schema
dotnet ef database update --project DigitalMenuSystem.API
```

#### 1.4 Run the API
Start the development server with hot reload:

```bash
dotnet watch run --project DigitalMenuSystem.API
```

The API will be available at:
- **Base URL:** `http://localhost:5100`
- **Swagger UI:** `http://localhost:5100/swagger` (Development mode only)
- **Health Check:** `http://localhost:5100/health`

---

#### 2.1 Install Dependencies
```bash
cd staff-dashboard
npm install
```

#### 2.2 Configure API Endpoint
Create a `.env` file in the `staff-dashboard` directory:

```ini
VITE_API_BASE_URL=http://localhost:5100
```

#### 2.3 Run Development Server
```bash
npm run dev
```

The staff dashboard will be available at `http://localhost:5173` (or the next available port).

**Available Commands:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code quality checks

---

### 3. Customer App Setup (`customer-app`)

#### 3.1 Install Dependencies
```bash
cd customer-app
npm install
```

#### 3.2 Configure API Endpoint
The customer app connects to the API via `src/services/apiClient.js`. For local development, either:

**Option A:** Create a `.env` file:
```ini
VITE_API_BASE_URL=http://localhost:5100/api
```

**Option B:** Edit [`src/services/apiClient.js`](customer-app/src/services/apiClient.js) directly:
```javascript
const BASE_URL = 'http://localhost:5100/api';
```

> **Note:** The default configuration points to `http://192.168.88.6:5100/api` for network testing.

#### 3.3 Run Development Server
```bash
npm run dev
```

The customer app will typically run on `http://localhost:5174`.

**Available Commands:**
- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks

---

## Development Workflow

### Quick Start with Docker

The fastest way to get started is using Docker for PostgreSQL:

```bash
# Start PostgreSQL container
docker run --name digitalmenu-postgres \
  -e POSTGRES_DB=digitalmenu \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:16

# Verify container is running
docker ps | grep digitalmenu-postgres
```

### Starting All Services

In separate terminal windows:

```bash
# Terminal 1: Backend API
cd DigitalMenuSystem.API
dotnet watch run

# Terminal 2: Staff Dashboard
cd staff-dashboard
npm run dev

# Terminal 3: Customer App
cd customer-app
npm run dev
```

### Accessing Applications

| Application | URL | Purpose |
|-------------|-----|---------|
| **API** | `http://localhost:5100` | Backend services |
| **Swagger Docs** | `http://localhost:5100/swagger` | API documentation and testing |
| **Staff Dashboard** | `http://localhost:5173` | Admin and kitchen management |
| **Kitchen Display** | `http://localhost:5173/kitchen` | Real-time order tracking |
| **Customer App** | `http://localhost:5174` | Customer ordering interface |

> **Note:** Vite may assign different ports if the defaults are occupied. Check terminal output for actual URLs.

---

## Features

### 🎛️ Staff Dashboard Capabilities

#### Menu Management
- **Category Organization** - Create, edit, and reorder menu categories with drag-and-drop
- **Item Administration** - Manage menu items with rich descriptions, pricing, and dietary information
- **Image Management** - Upload and manage item images via AWS S3 integration
- **Availability Control** - Toggle item availability in real-time
- **Add-On Library** - Centralized management of reusable paid extras and modifications

#### Order Management
- **Real-Time Order Feed** - Auto-refreshing order list with status filtering
- **Order Status Workflow** - Track orders through Received → Preparing → Ready → Served lifecycle
- **Order Details** - View complete order information including customizations and special instructions

#### Table Management
- **Table Configuration** - Create and manage dining tables with capacity and location info
- **QR Code Generation** - Auto-generate unique QR codes for each table
- **Table Status Tracking** - Monitor active tables and order assignments

#### User Administration
- **Staff Accounts** - Create and manage staff user accounts
- **Role-Based Access** - Kitchen staff vs. full admin permissions
- **Activity Tracking** - Monitor last login and user activity

---

### 📱 Customer App Experience

#### Menu Discovery
- **Category Navigation** - Sticky category tabs for quick browsing
- **Search Functionality** - Full-text search across items and descriptions
- **Rich Item Details** - High-quality images, descriptions, pricing, and dietary information
- **Visual Design** - Mobile-optimized responsive interface

#### Order Customization
- **Spice Level Selection** - None, Mild, Medium, Hot, Extra Hot options
- **Free Side Dishes** - Choose from Rice, Noodles, Salad, Soup, Spring Rolls, Vegetables
- **Paid Add-Ons** - Select extras with quantity control and automatic price calculation
- **Special Instructions** - Custom notes for kitchen (allergies, preferences, etc.)

#### Ordering Flow
- **QR Code Detection** - Automatic table identification via QR scan
- **Manual Table Entry** - Fallback option for manual table number input
- **Shopping Cart** - Review, modify quantities, and remove items before checkout
- **Real-Time Pricing** - Dynamic total calculation including add-ons and 10% tax
- **Order Confirmation** - Instant confirmation with unique order ID

---

### 👨‍🍳 Kitchen Display System (KDS)

#### Visual Order Management
- **Kanban-Style Layout** - Three columns: New Orders | Cooking | Ready to Serve
- **Order Cards** - Clear display of table number, items, quantities, and customizations
- **Add-On Highlighting** - Visual emphasis on paid extras
- **Special Instructions** - Prominent display of kitchen notes and dietary requirements

#### Workflow Optimization
- **Quick Actions** - One-click status advancement buttons
- **New Order Alerts** - Visual highlighting for newly arrived orders
- **Auto-Refresh** - Updates every 5 seconds (configurable)
- **Status Filters** - View all orders or active orders only


---

## API Reference

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Authenticate staff user | No |
| POST | `/api/auth/register` | Register new staff account | Yes |
| GET | `/api/auth/me` | Get current user info | Yes |
| GET | `/api/auth/check-username/{username}` | Check username availability | No |

### Menu Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/menucategory` | List all categories | No |
| POST | `/api/menucategory` | Create category | Yes |
| PUT | `/api/menucategory/{id}` | Update category | Yes |
| DELETE | `/api/menucategory/{id}` | Delete category | Yes |
| GET | `/api/menuitem` | List all items | No |
| GET | `/api/menuitem/category/{categoryId}` | Items in category | No |
| POST | `/api/menuitem` | Create menu item | Yes |
| PUT | `/api/menuitem/{id}` | Update menu item | Yes |

### Order Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/order` | Create new order | No |
| GET | `/api/order/{id}` | Get order details | No |
| GET | `/api/order/restaurant/{restaurantId}` | All restaurant orders | Yes |
| GET | `/api/order/restaurant/{restaurantId}/active` | Active orders only | Yes |
| PATCH | `/api/order/{id}/status` | Update order status | Yes |

### Table Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/table` | List all tables | No |
| GET | `/api/table/{code}` | Get table by QR code | No |
| GET | `/api/table/number/{tableNumber}` | Get table by number | No |
| POST | `/api/table` | Create table | Yes |
| PUT | `/api/table/{id}` | Update table | Yes |
| DELETE | `/api/table/{id}` | Delete table | Yes |

### Image Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/image/upload` | Upload image to S3 | Yes |

For detailed request/response schemas, visit the Swagger documentation at `http://localhost:5100/swagger`.

---

## Database Schema

### Core Entities

```
Restaurant
├── Users (staff accounts)
├── Roles (access control)
├── Tables (dining tables with QR codes)
├── MenuCategories
│   └── MenuItems
│       └── MenuItemAddOns
├── AddOnLibrary (reusable add-ons)
└── Orders
    └── OrderItems (line items with customizations)
```

### Key Relationships
- **Multi-tenancy:** All entities linked to `RestaurantId`
- **Order Status Flow:** Received → Preparing → Ready → Served → Cancelled
- **Item Customizations:** Spice level, sides, add-ons, and special instructions stored per `OrderItem`
- **Add-Ons:** Centralized library linked to items via `MenuItemAddOn` junction table

---

## Testing & Quality Assurance

### Backend Testing
```bash
# Unit tests (to be implemented)
dotnet test

# Code coverage (to be implemented)
dotnet test /p:CollectCoverage=true
```

**Recommended test frameworks:**
- xUnit for unit tests
- Integration tests for API endpoints
- Entity Framework Core in-memory database for data layer tests

### Frontend Testing

#### Linting
```bash
# Staff Dashboard
cd staff-dashboard
npm run lint

# Customer App
cd customer-app
npm run lint
```

#### End-to-End Testing (Recommended)
- **Playwright** - Automated browser testing for ordering flows
- **Cypress** - Component and integration testing
- **React Testing Library** - Unit tests for components

**Priority test scenarios:**
1. Complete customer ordering flow (browse → customize → cart → checkout)
2. Kitchen display order status transitions
3. Menu management CRUD operations
4. Table QR code scanning and order association

---

## Deployment

### Backend (DigitalMenuSystem.API)

#### Recommended Hosting Platforms
- **Azure App Service** - Native .NET support with automatic scaling
- **AWS Elastic Beanstalk** - Managed .NET deployment
- **Railway / Render** - Simple deployment with PostgreSQL add-ons
- **Docker** - Containerized deployment to any platform

#### Environment Configuration
All environment variables must be configured in your hosting platform:

```bash
# Required
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_SECRET (minimum 32 characters)
JWT_ISSUER, JWT_AUDIENCE
CUSTOMER_APP_URL

# Required for image uploads
AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET_NAME
```

#### Database Migration
```bash
# Generate migration SQL script
dotnet ef migrations script --output migration.sql --project DigitalMenuSystem.API

# Apply to production database
psql -h <host> -U <user> -d <database> -f migration.sql
```

#### Security Checklist
- [ ] Use managed PostgreSQL service (AWS RDS, Azure Database, etc.)
- [ ] Create dedicated IAM user for S3 with minimum required permissions
- [ ] Enable HTTPS/TLS for API endpoints
- [ ] Rotate JWT secret keys periodically
- [ ] Never commit `.env` files to version control
- [ ] Use environment-specific configuration files

---

### Frontend (Staff Dashboard & Customer App)

#### Build for Production
```bash
# Staff Dashboard
cd staff-dashboard
npm run build
# Output: dist/

# Customer App
cd customer-app
npm run build
# Output: dist/
```

#### Recommended Hosting Platforms
- **Vercel** - Zero-config React deployment with CDN
- **Netlify** - Continuous deployment from Git
- **AWS S3 + CloudFront** - Static hosting with global CDN
- **Azure Static Web Apps** - Integrated with GitHub Actions
- **Cloudflare Pages** - Fast global deployment

#### Configuration
Update `VITE_API_BASE_URL` in `.env` for production:

```ini
# Staff Dashboard
VITE_API_BASE_URL=https://api.yourrestaurant.com

# Customer App
VITE_API_BASE_URL=https://api.yourrestaurant.com/api
```

#### Deployment Steps
1. Build production bundles with `npm run build`
2. Upload `dist/` contents to static hosting
3. Configure custom domain (optional)
4. Enable HTTPS via hosting platform
5. Configure CORS on backend to allow frontend domains

---

### CI/CD Pipeline Example

#### GitHub Actions
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0'
      - run: dotnet build DigitalMenuSystem.API
      - run: dotnet test
      - run: dotnet publish -c Release
      # Add deployment steps for your platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd staff-dashboard && npm ci && npm run build
      - run: cd customer-app && npm ci && npm run build
      # Add deployment steps for your platform
```

---

### Multi-Tenancy Deployment

This system supports multiple restaurants through the `Restaurant` entity. To deploy for multiple clients:

1. **Shared Infrastructure** - Single API instance serving multiple restaurants
2. **Subdomain Routing** - `restaurant1.yourdomain.com`, `restaurant2.yourdomain.com`
3. **Database Isolation** - All queries filtered by `RestaurantId`
4. **Custom Branding** - Per-restaurant logos and styling via Restaurant configuration

---

## Troubleshooting

### Common Issues

#### API Won't Start
**Symptoms:** Application crashes on startup with configuration errors

**Solutions:**
- Verify all required environment variables are set in `.env`
- Ensure `JWT_SECRET` is at least 32 characters
- Confirm database connection string is correct
- Check that PostgreSQL is running and accessible
- Run `dotnet restore` to ensure all packages are installed

```bash
# Test database connection
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Verify environment variables
dotnet run --project DigitalMenuSystem.API --configuration Debug
```

---

#### Frontend Can't Reach API
**Symptoms:** Network errors, CORS errors in browser console

**Solutions:**
- Verify `VITE_API_BASE_URL` matches the running API URL
- Confirm API CORS policy allows frontend origin
- Check that API is running and accessible at the specified URL
- For customer app, verify hardcoded URL in `src/services/apiClient.js`
- Test API directly with `curl http://localhost:5100/api/menucategory`

```bash
# Test API connectivity
curl http://localhost:5100/api/menucategory

# Check CORS headers
curl -H "Origin: http://localhost:5173" -v http://localhost:5100/api/menucategory
```

---

#### Database Migration Failures
**Symptoms:** `dotnet ef database update` fails

**Solutions:**
- Verify PostgreSQL is running: `docker ps` or `pg_isready`
- Check connection credentials in `.env`
- Ensure database exists: `createdb digitalmenu`
- Verify EF Core tools are installed: `dotnet tool list -g`
- Check for migration conflicts or breaking changes

```bash
# Recreate database (WARNING: deletes all data)
dropdb digitalmenu
createdb digitalmenu
dotnet ef database update --project DigitalMenuSystem.API

# List applied migrations
dotnet ef migrations list --project DigitalMenuSystem.API
```

---

#### Add-Ons Not Visible in Customer App
**Symptoms:** Paid extras don't appear in customization modal

**Solutions:**
- Verify add-ons are marked as **Available** in staff dashboard
- Ensure add-ons are linked to the specific menu item
- Use the **Customize** button (not quick add to cart)
- Clear browser cache and sessionStorage
- Check browser console for API errors

```javascript
// Debug in browser console
sessionStorage.clear()
localStorage.clear()
location.reload()
```

---

#### Orders Not Appearing in Kitchen Display
**Symptoms:** Submitted orders don't show up in KDS

**Solutions:**
- Verify order was created successfully (check confirmation page for order ID)
- Confirm kitchen display is polling: check network tab for `/api/order` requests
- Ensure correct `restaurantId` is being used in API calls
- Check order status filter (view "All Orders" not just "Active")
- Verify auto-refresh is enabled (should refresh every 5 seconds)

---

#### Images Not Uploading
**Symptoms:** Image upload fails in staff dashboard

**Solutions:**
- Verify AWS credentials are set in `.env`
- Check S3 bucket exists and IAM user has write permissions
- Ensure bucket CORS policy allows uploads from dashboard domain
- Check file size (large files may timeout)
- Verify image format is supported (JPEG, PNG, WebP)

```bash
# Test AWS credentials
aws s3 ls s3://$AWS_BUCKET_NAME --profile your-profile

# Check IAM permissions
aws iam get-user
```

---

#### Port Already in Use
**Symptoms:** `EADDRINUSE` error when starting services

**Solutions:**
```bash
# Find process using port 5100 (API)
lsof -i :5100
kill -9 <PID>

# Find process using port 5173 (Vite)
lsof -i :5173
kill -9 <PID>

# Or use alternative port
DMS_API_PORT=5200 dotnet run
```

---

### Getting Help

If you encounter issues not covered here:

1. **Check Logs**
   - Backend: Console output from `dotnet run`
   - Frontend: Browser developer console (F12)
   - Database: PostgreSQL logs

2. **Enable Verbose Logging**
   ```json
   // appsettings.Development.json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Debug",
         "Microsoft.EntityFrameworkCore": "Information"
       }
     }
   }
   ```

3. **Review Documentation**
   - [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core)
   - [Entity Framework Core](https://docs.microsoft.com/ef/core)
   - [Vite Documentation](https://vitejs.dev)
   - [React Documentation](https://react.dev)

---

## Contributing

We welcome contributions to improve the Digital Menu Ordering System! Please follow these guidelines:

### Development Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/Ordering_System.git
   cd Ordering_System
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

3. **Make Your Changes**
   - Follow existing code style and conventions
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all linting checks pass

4. **Test Your Changes**
   ```bash
   # Backend
   dotnet build DigitalMenuSystem.API
   dotnet test

   # Frontend
   cd staff-dashboard && npm run lint
   cd customer-app && npm run lint
   ```

5. **Format Code**
   ```bash
   # .NET (requires dotnet format tool)
   dotnet format DigitalMenuSystem.API

   # JavaScript/React (uses ESLint)
   npm run lint --fix
   ```

6. **Commit Changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format: `type(scope): description`
   - Examples: `feat(menu): add dietary filters`, `fix(orders): resolve status update bug`

7. **Submit Pull Request**
   - Provide a clear description of changes
   - Reference related issues
   - List any database migrations required
   - Include screenshots for UI changes

### Code Standards

#### Backend (.NET)
- Follow [Microsoft C# Coding Conventions](https://docs.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions)
- Use async/await for asynchronous operations
- Implement proper error handling and logging
- Add XML documentation comments for public APIs

#### Frontend (React)
- Use functional components with hooks
- Follow React best practices and patterns
- Use TypeScript where applicable
- Ensure components are accessible (ARIA labels, semantic HTML)

#### Database
- Always create migrations for schema changes
- Test migrations on a separate database first
- Include rollback scripts for production migrations
- Document breaking changes

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated (README, API docs, comments)
- [ ] Database migrations created (if applicable)
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers (for frontend changes)
- [ ] Environment variables documented (if new ones added)

### Reporting Issues

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, browser, .NET/Node versions)
- Screenshots or error logs (if applicable)

---

## Roadmap

### Planned Features
- [ ] Payment integration (Stripe/Square)
- [ ] Customer accounts and loyalty program
- [ ] Email/SMS notifications
- [ ] Inventory management system
- [ ] Analytics and reporting dashboard
- [ ] WebSocket real-time updates
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Kitchen printer integration

See [GitHub Issues](https://github.com/yourusername/Ordering_System/issues) for detailed feature requests and bug tracking.

---

## License

**Copyright © 2025. All rights reserved.**

This project is proprietary software developed for restaurant ordering operations. Unauthorized copying, modification, distribution, or use of this software, via any medium, is strictly prohibited without explicit written permission from the copyright holder.

For licensing inquiries, please contact: [your-email@example.com]

---

## Acknowledgments

Built with:
- [ASP.NET Core](https://dotnet.microsoft.com/apps/aspnet) - Backend framework
- [React](https://react.dev/) - Frontend library
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Vite](https://vitejs.dev/) - Build tool

Special thanks to all contributors who have helped improve this project.

---

## Contact & Support

- **Documentation:** See this README and [API documentation](http://localhost:5100/swagger)
- **Issues:** [GitHub Issues](https://github.com/yourusername/Ordering_System/issues)
- **Email:** support@yourrestaurant.com
- **Website:** https://yourrestaurant.com

---

<div align="center">

**[⬆ Back to Top](#digital-menu-ordering-system)**

Made with ❤️ for restaurants worldwide

</div>
