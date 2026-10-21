# DoNext

DoNext is a student planner designed to help students organize their academic tasks, manage spending, maintain wellness, and improve productivity in one place.

The application runs locally in the browser and does not require external APIs.

## Features

- **Tasks:** Create and manage daily tasks and assignments.
- **Calendar:** Organize tasks and important dates.
- **Budget:** Track spending and manage student expenses.
- **Wellness:** Keep track of personal wellness activities.
- **Focus Sessions:** Manage focused study sessions.
- **Insights:** Review productivity and application data.
- **Profile:** Manage account details and export the database.
- **Authentication:** Create a local account or sign in to an existing account.
- **Demo Access:** Explore the application using sample data without setting up a new account.
- **Database Export:** Download the SQLite database for inspection.

## Technology

- **Frontend:** Browser-based user interface
- **Database:** SQLite
- **Authentication:** bcrypt password hashing
- **Storage:** Local browser storage
- **Package Manager:** npm

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm

### Installation

1. Clone or download the project.
2. Open a terminal in the project directory.
3. Install the dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal in a browser.

**Note:** The exact commands may vary depending on the scripts defined in `package.json`.

## How to Use

### Demo Access

Open the application and select the demo access option to explore the available sample tasks and spending data.

### Create an Account

1. Open the sign-up page.
2. Enter the required account details.
3. Create your local account.
4. Sign in to access your planner.

Passwords are hashed using bcrypt rather than stored as plain text.

### Database Export

To inspect the application database:

1. Open DoNext.
2. Navigate to the **Profile** page.
3. Select the database export or download option.
4. Save the exported SQLite database file.
5. Open the downloaded file using a SQLite-compatible database viewer.

The exported database can be used to inspect the accounts and application data stored by the application.

## Data Storage and Privacy

DoNext is designed to run locally in the browser without external API integrations.

SQLite is used to store account information and application data in browser storage. The application supports local account creation, sign-in, sample demo data, and database export.

Data availability depends on the browser storage implementation and the current browser environment. Clearing browser storage may remove locally stored application data.

**Security note:** bcrypt password hashing helps protect stored passwords, but it does not encrypt the entire database. Avoid storing real passwords or sensitive personal information in a demo environment.

## Project Structure

The project includes separate application pages for:

- Tasks
- Calendar
- Budget
- Wellness
- Focus Sessions
- Insights
- Profile and database export

The exact source directory structure depends on the implementation in the project repository.

## Running Without Bun

DoNext can be installed and run using npm, provided its dependencies and scripts support npm.

```bash
npm install
npm run dev
```

Bun is not required if the project is configured to work with npm. Keep `package.json` and the appropriate lockfile consistent with the package manager you choose.

## Troubleshooting

- **Application does not start:** Check your Node.js version and run `npm install` again.
- **Demo data is missing:** Confirm that the demo initialization logic has run successfully.
- **Sign-in fails:** Verify the account details and check the browser console for errors.
- **Database export fails:** Check browser storage permissions and confirm that the export function is available on the Profile page.

## License

Add your preferred license here before distributing the project.

---

**DoNext**  
A simple, local-first student planner for tasks, budgeting, wellness, and productivity.
