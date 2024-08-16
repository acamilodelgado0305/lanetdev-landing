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
import Transactions from "./components/MoneyManager/transactions/transactions";

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
        path: "moneymanager", // Se omite /index ya que estás en un children de /index
        element: <IndexMoneyManager />,
        children: [
          {
            path: "accounts", // Anidada dentro de moneymanager
            element: <AccountContent />,
          },
          {
            path: "transactions", // Anidada dentro de moneymanager
            element: <Transactions />,
          }
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
