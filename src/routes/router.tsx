import { createBrowserRouter } from "react-router-dom";

// Top-level pages
import HomePage from "@/pages/home/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

export default router;