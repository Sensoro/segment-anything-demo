import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppContextProvider from "./hooks/context";
import Home from "./pages/home";
import Demo from "./pages/main-function";

const BASE_URL = import.meta.env.BASE_URL;

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
    basename: BASE_URL,
  }
);

export const App: React.FC = () => {
  return (
    <AppContextProvider>
      <RouterProvider router={router} />
    </AppContextProvider>
  )
}
