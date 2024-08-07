import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import ErrorPage from "./error-page";

import Sigin from "./components/auth/register";
import Login from "./components/auth/login";

import Landing from "./components/landing/landing";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "sigin",
        element: <Sigin />,
      },
      {
        path: "sigin",
        element: <Login />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
