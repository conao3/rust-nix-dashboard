import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-500 to-purple-600">
      <nav className="border-b border-white/20 bg-white/10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex gap-4">
            <Link
              to="/"
              className="rounded-md px-4 py-2 text-white transition-colors hover:bg-white/10 [&.active]:bg-white/20"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="rounded-md px-4 py-2 text-white transition-colors hover:bg-white/10 [&.active]:bg-white/20"
            >
              About
            </Link>
          </div>
        </div>
      </nav>
      <main className="flex flex-1 items-center justify-center p-5">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  ),
});
