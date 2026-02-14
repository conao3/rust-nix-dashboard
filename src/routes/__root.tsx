import {
  createRootRoute,
  Link,
  Outlet,
  useRouter,
  type NavigateOptions,
  type ToOptions,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Provider } from "@react-spectrum/s2";
import { ReactNode } from "react";
import "@react-spectrum/s2/page.css";

declare module "@react-spectrum/s2" {
  interface RouterConfig {
    href: ToOptions;
    routerOptions: Omit<NavigateOptions, keyof ToOptions>;
  }
}

type ProvidersProps = {
  children: ReactNode;
};

function Providers(props: ProvidersProps) {
  const router = useRouter();
  return (
    <Provider
      background="base"
      router={{
        navigate: (href: ToOptions, opts) => {
          if (typeof href === "string") return;
          return router.navigate({ ...href, ...opts });
        },
        useHref: (href) => {
          if (typeof href === "string") return href;
          return router.buildLocation(href).href;
        },
      }}
    >
      {props.children}
    </Provider>
  );
}

export const Route = createRootRoute({
  component: () => {
    return (
      <Providers>
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
      </Providers>
    );
  },
});
