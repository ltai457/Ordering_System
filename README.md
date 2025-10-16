# Digital Menu Ordering System

An end-to-end ordering platform for restaurants, combining:

- **DigitalMenuSystem.API** – a .NET 8 Web API that exposes menu, ordering, authentication, and storage endpoints backed by PostgreSQL and AWS S3.
- **staff-dashboard** – a Vite + React application for managers, waitstaff, and the kitchen to manage menu content, monitor orders, and handle fulfillment.
- **customer-app** – a Vite + React customer-facing experience that lets guests browse the menu, customize items with add-ons, and send orders to the kitchen.

The three applications share a common domain model so changes made in the staff dashboard propagate to the customer app and kitchen display in real time (via polling today, upgradeable to websockets).

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

## Tech Stack

- **Backend:** .NET 8, ASP.NET Core, Entity Framework Core (Npgsql), PostgreSQL, JWT authentication, AWS S3 for image storage.
- **Frontend (staff + customer):** React 19, Vite, Tailwind CSS, React Router.
- **Tooling:** ESLint, PostCSS, pnpm/npm (project uses npm lockfiles), Docker-ready Postgres (optional), AWS SDK.

---

## Prerequisites

| Tool | Version (minimum) | Notes |
| --- | --- | --- |
| [.NET SDK](https://dotnet.microsoft.com/en-us/download) | 8.0 | Needed for the API and migrations |
| [Node.js](https://nodejs.org/) | 20.x LTS | Both React apps use Vite + npm |
| npm | ships with Node | pnpm/yarn also work, but examples use npm |
| PostgreSQL | 14+ | Hosted or local instance |
| AWS S3 bucket | optional | Required if you want to upload images from the dashboard |

---

## Backend Setup (`DigitalMenuSystem.API`)

1. **Install dependencies**
   ```bash
   dotnet restore
   ```

2. **Create an environment file.**  
   Copy `.env` to `.env.local` (or edit `.env`) and set values for your environment. _Never commit real secrets._

   ```ini
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=digitalmenu
   DB_USER=postgres
   DB_PASSWORD=postgres

   # JWT (must be ≥32 characters)
   JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
   JWT_ISSUER=DigitalMenuSystem
   JWT_AUDIENCE=DigitalMenuSystem

   # AWS (optional for local dev)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY=...
   AWS_SECRET_KEY=...
   AWS_BUCKET_NAME=...

   # Frontend callback (used for QR codes)
   CUSTOMER_APP_URL=http://localhost:5173
   ```

3. **Apply database migrations.**  
   Install the EF CLI the first time:
   ```bash
   dotnet tool install --global dotnet-ef
   ```
   Then run:
   ```bash
   dotnet ef database update --project DigitalMenuSystem.API
   ```

4. **Run the API (default port 5100).**
   ```bash
   dotnet watch run --project DigitalMenuSystem.API
   ```

   The project reads `DMS_API_PORT` from the environment if you need to change the port.

5. **Swagger UI** is available at `http://localhost:5100/swagger` when running in Development.

---

## Staff Dashboard Setup (`staff-dashboard`)

1. **Install dependencies**
   ```bash
   cd staff-dashboard
   npm install
   ```

2. **Configure the API URL.**  
   Create `.env` (or edit the existing file) with the backend origin:
   ```ini
   VITE_API_BASE_URL=http://localhost:5100
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   Vite defaults to `http://localhost:5173`. Use `npm run build` for production bundles and `npm run lint` to run ESLint.

---

## Customer App Setup (`customer-app`)

1. **Install dependencies**
   ```bash
   cd customer-app
   npm install
   ```

2. **Configure API access** (optional).  
   By default the customer app points to `http://192.168.88.6:5100/api` in `src/services/apiClient.js`.  
   For local development, update that file or add a `.env` entry such as:
   ```ini
   VITE_API_BASE_URL=http://localhost:5100/api
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   The customer UI also exposes `npm run build`, `npm run preview`, and `npm run lint`.

---

## Typical Development Workflow

1. Start PostgreSQL (local Docker example):
   ```bash
   docker run --name digitalmenu-postgres \
     -e POSTGRES_DB=digitalmenu \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     -d postgres:16
   ```
2. Launch the API with `dotnet watch run`.
3. In separate terminals run `npm run dev` in both `staff-dashboard` and `customer-app`.
4. Access the apps:
   - Staff Dashboard: `http://localhost:5173` (or whatever port Vite chooses)
   - Customer App: `http://localhost:5174` (if Vite selects a different port)  
   - Kitchen Display (within staff dashboard routing): `/kitchen`

---

## Core Features

### Staff Dashboard
- Manage menu categories, items, pricing, availability, and image uploads.
- Create and maintain item add-ons (extras) with pricing, availability, and display order.
- Receive real-time order updates with workflows for kitchen prep and serving.
- Staff role-based navigation (kitchen-only vs. full admin controls).

### Customer App
- Browse categories and menu items with detailed descriptions and images.
- Customize dishes (spice level, sides, paid add-ons) before adding to cart.
- Capture table context via QR code, send orders directly to the kitchen, and view order confirmation.

### Kitchen Display
- Column-based view of incoming orders (New, Cooking, Ready to Serve).
- Highlights paid add-ons and key instructions extracted from order notes.
- Quick actions to advance status or mark items as served.


---

## Testing & Quality

- **API:** Add xUnit/integration tests under a `Tests` project (not yet implemented).
- **Frontends:** Run `npm run lint` in each app to ensure code quality.
- **End-to-end:** Recommended to add Playwright/Cypress coverage for ordering flows.

---

## Deployment Notes

- **API:** Configure environment variables via your hosting platform. Use managed Postgres and S3 credentials scoped to a dedicated IAM user.
- **Frontends:** Both apps produce static bundles via `npm run build` (served from CDN/hosting of your choice). Update `VITE_API_BASE_URL` with the deployed API origin.
- **CI/CD:** Add pipeline steps for `dotnet build`, `dotnet ef migrations script`, and `npm run build` for the frontends.

---

## Troubleshooting

- **API won’t start:** Ensure all required environment variables are set. Missing `JWT_SECRET` or DB values will throw on startup.
- **Frontends can’t reach the API:** Confirm CORS is enabled (the API registers an `AllowAll` policy) and that the `.env` values match the backend origin.
- **Migrations fail:** Check that the Postgres instance is reachable and that the connection credentials match your `.env`.
- **Add-ons not visible in UI:** Confirm they are marked available in the staff dashboard, and when testing customer flows use the **Customize** option (not quick add) so extras are attached to the order.

---

## Contributing

1. Fork and clone the repository.
2. Create a feature branch: `git checkout -b feature/my-change`.
3. Run formatting/linting (`npm run lint`, `dotnet format` as needed).
4. Submit a PR describing the change and any migrations required.

---

## License

This project is proprietary to the restaurant team. Update this section if you intend to release it publicly.
