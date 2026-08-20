import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/savoirs/$cat")({
  component: () => <Outlet />,
});
