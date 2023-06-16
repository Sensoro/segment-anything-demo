import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppContextProvider from "./hooks/context";
import Home from "./pages/home";
import Demo from "./pages/main-function";
import "./index.css";

const router = createBrowserRouter(
  [
    {
      path: "/",
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "main",
          element: <Demo />,
        },
      ],
    },
  ],
  {
    basename: '/segment-anything-demo/'
  }
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppContextProvider>
      <RouterProvider router={router} />
    </AppContextProvider>
  </React.StrictMode>
);
