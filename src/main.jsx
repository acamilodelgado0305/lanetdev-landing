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
import Indexcomunicacion from "./components/communication/index";
import WhatsAppWeb from "./components/communication/WhatsAppWeb";
import AccountContent from "./components/MoneyManager/accounts/accounts";
import TransactionsDashboard from "./components/MoneyManager/transactions/transactions";
import Categories from "./components/MoneyManager/categories/Categories";
import { AuthProvider } from './components/Context/AuthProvider';
import { SocketProvider } from './components/Context/SocketContext';
import EmailManagement from './components/communication/EmailManagement';
import Estadisticas from "./components/MoneyManager/estadisticas/Estadisticas";
import Calendario from "./components/MoneyManager/calendar/Calendar";
import Indexconfig from "./components/confgapp/indexconfig";
import Clientes from "./components/clientes/clientes"


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
        element: (
          <PrivateRoute allowedRoles={['superadmin', 'admin']}>
            <IndexMoneyManager />
          </PrivateRoute>
        ),
        children: [
          {
            path: "accounts",
            element: <AccountContent />,
          },
          {
            path: "transactions",
            element: <TransactionsDashboard />,
          },
          {
            path: "categorias",
            element: <Categories />,
          },
          {
            path: "calendario",
            element: <Calendario />,
          },
          {
            path: "estadisticas",
            element: <Estadisticas />,
          }
        ],
      },
      {
        path: "communication",
        element: <Indexcomunicacion />,
        children: [
          {
            path: "emails",
            element: <EmailManagement />,
          },
          {
            path: "WhatsAppWeb",
            element: <WhatsAppWeb />,
          },
          {
            path: "categorias",
            element: <Categories />,
          },
        ],
      },
      {
        path: "clientes",
        element: (
          <PrivateRoute allowedRoles={['superadmin']}>
            <Clientes />
          </PrivateRoute>
        ),
        children: [
        ],
      },
      {
        path: "config",
        element: <Indexconfig />,
        children: [
        ],
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SocketProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </SocketProvider>
  </React.StrictMode>
);
