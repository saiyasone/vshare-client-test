import PageLayout from "components/PageLayout";
import IsLoggedClientAuthGuard from "components/guard/IsLoggedClientAuthGuard";
import { AuthProvider } from "contexts/AuthProvider";
import ClientAuthGuard from "contexts/ClientAuthProvider";
import { EventUploadTriggerProvider } from "contexts/EventUploadTriggerProvider";
import FolderProvider from "contexts/FolderProvider";
import PackageCheckerProvider from "contexts/PackageCheckerProvider";
import { Outlet, RouteObject } from "react-router-dom";
import ClientDashboard from "./pages/client-dashboard/ClientDashboard";
import SignIn from "./pages/sign-in/SignIn";
import SignUp from "./pages/sign-up/SignUp";

const routes: RouteObject[] = [
  {
    path: "auth",
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <PageLayout />,
        children: [
          {
            path: "sign-in",
            element: (
              <IsLoggedClientAuthGuard>
                <SignIn />
              </IsLoggedClientAuthGuard>
            ),
          },
          {
            path: "sign-up",
            element: <SignUp />,
          },
        ],
      },
    ],
  },
  {
    path: "",
    element: (
      <FolderProvider>
        <EventUploadTriggerProvider>
          <AuthProvider>
            <ClientAuthGuard>
              <PackageCheckerProvider>
                <Outlet />
              </PackageCheckerProvider>
            </ClientAuthGuard>
          </AuthProvider>
        </EventUploadTriggerProvider>
      </FolderProvider>
    ),
    children: [
      {
        path: "dashboard",
        element: <ClientDashboard />,
      },
    ],
  },
];

export default routes;
