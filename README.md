# MoneyMap

MoneyMap is a personal finance tracker built with React, Vite, Firebase, Ant Design, and Tailwind CSS. It allows users to sign up, log in, and manage their income and expenses with visual statistics and CSV import/export.

## Features

- **User Authentication:** Sign up and log in with email/password or Google.
- **Dashboard:** View current balance, total income, and total expenses.
- **Add Transactions:** Add income and expense entries with tags and dates.
- **Charts:** Visualize your financial data with line and pie charts.
- **CSV Import/Export:** Import transactions from CSV or export your data.
- **Responsive UI:** Modern, responsive design using Ant Design and Tailwind CSS.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/moneymap.git
   cd moneymap
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication (Email/Password and Google).
   - Enable Firestore Database.
   - Copy your Firebase config and add it to a `.env` file in the root directory (see `.envsample` for variable names).

4. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

5. **Open [http://localhost:5173](http://localhost:5173) in your browser.**

## Project Structure

```
src/
  App.jsx                # Main app component with routing
  firebase.js            # Firebase configuration and exports
  components/
    Cards/
    Header/
    Loader/
    Modals/
      AddExpense.jsx
      AddIncome.jsx
    SignupSignin/
  pages/
    Dashboard.jsx
    NoTransactions.jsx
    Signup.jsx
    TrasactionSearch.jsx
  assets/
    react.svg
    search.svg
    transactions.svg
    user.svg
  index.css
  main.jsx
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

## Environment Variables

Copy `.envsample` to `.env` and fill in your Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Technologies Used

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Firebase](https://firebase.google.com/)
- [Ant Design](https://ant.design/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PapaParse](https://www.papaparse.com/) (CSV import/export)
- [React Toastify](https://fkhadra.github.io/react-toastify/) (notifications)
- [Moment.js](https://momentjs.com/) (date formatting)

## License

[ISC](LICENSE)

---

> MoneyMap — Your Personal Finance Tracker
"# moneymap-advanced" 
