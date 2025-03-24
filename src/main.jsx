import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import ErrorPage from "./error-page";
import LoginForm from "./components/auth/LoginForm.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx"
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
import ProvidersPage from "./components/MoneyManager/proveedores/ProvidersPage.jsx";
import { AuthProvider } from './components/Context/AuthProvider';
import { SocketProvider } from './components/Context/SocketContext';
import EmailManagement from './components/communication/EmailManagement';
import Estadisticas from "./components/MoneyManager/estadisticas/Estadisticas";
import Calendario from "./components/MoneyManager/calendar/Calendar";
import RenderPaymentsList from "./components/MoneyManager/transactions/components/RenderPaymentsList.jsx"
import Indexconfig from "./components/confgapp/indexconfig";
import Clientes from "./components/clientes/clientes"
import SearchResults from "./components/search/SearchResults";
import Network from "./components/Network/Network.jsx";
import Configuracion from "./components/MoneyManager/configuracion/Configuracion.jsx";
import Terceros from "./components/MoneyManager/Terceros/Terceros.jsx";
import AddIncome from "./components/MoneyManager/transactions/Add/Income/AddIncome.jsx";
import AddExpense from "./components/MoneyManager/transactions/Add/expense/AddExpense.jsx";
import CashiersPage from "./components/MoneyManager/Cajeros/Cajeros.jsx";
import PaginaProveedores from "./components/MoneyManager/proveedores/ProvidersPage.jsx";

import IncomeView from "./components/MoneyManager/transactions/Add/Income/ViewIncome.jsx";
import Administracion from "./components/Administracion/Administracion.jsx";
import InicioTerceros from "./components/Terceros/InicioTerceros.jsx";
import 'antd/dist/reset.css';


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
    path: "/reset-password",
    element: <ResetPassword />,
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
        path: "terceros",
        children: [
          {
            path: "cajeros",
            element: <InicioTerceros />,
          },
          
          {
          
            path: "proveedores",
            element: <InicioTerceros />,
          },

        ],
      },
      {
        path: "moneymanager",
        element: (
          <PrivateRoute allowedRoles={['superadmin', 'cajero']}>
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
            path: "transactions/nuevoingreso",
            element: <AddIncome />,
          },
          {
            path: "ingresos/view/:id",
            element: <IncomeView />,
          },
          {
            path: "ingresos/edit/:id",
            element: <AddIncome />,
          },
          {
            path: "transactions/nuevoegreso",
            element: <AddExpense />,
          },
          {
            path: "egresos/view/:id",
            element: <AddIncome />,
          },
          {
            path: "egresos/edit/:id",
            element: <AddExpense />,
          },
          {
            path: "categorias",
            element: <Categories />,
          },
          {
            path: "proveedores",
            element: <PaginaProveedores />,
          },
          {
            path: "calendario",
            element: <Calendario />,
          },
          {
            path: "terceros",
            element: <Terceros />,
          },
          {
            path: "Pagos-Pendientes",
            element: <RenderPaymentsList />,
          },
          {
            path: "estadisticas",
            element: <Estadisticas />,
          },
          {
            path: "config",
            element: <Configuracion />,
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
      },

      {
        path: "config",
        element: <Indexconfig />,
      },
      {
        path: "network",
        element: <Network />,
      },
      {
        path: "search",
        element: <SearchResults />,
      },
      {
        path: "administracion",
        element: <Administracion />,
      },
    ],
  },
]); ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SocketProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </SocketProvider>
  </React.StrictMode>
);
