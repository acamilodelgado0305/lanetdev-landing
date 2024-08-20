import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import ErrorPage from "./error-page";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import Landing from "./components/landing/landing";
import Index from "./components/";
import Root from "./components/root";
import PrivateRoute from "./components/PrivateRoute";
import IndexMoneyManager from "./components/MoneyManager";
import AccountContent from "./components/MoneyManager/accounts/accounts";
import TransactionsDashboard from "./components/MoneyManager/transactions/transactions";
import { AuthProvider } from './components/Context/AuthProvider';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/signup",
    element: <SignUpForm />,
  },
  {
    path: "/index",
    element: (
      <PrivateRoute>
        <Root />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "moneymanager",
        element: <IndexMoneyManager />,
        children: [
          {
            path: "accounts",
            element: <AccountContent />,
          },
          {
            path: "transactions",
            element: <TransactionsDashboard />,
          }
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
