import {
  createRootRoute,
  Link,
  Outlet,
  useRouter,
  type NavigateOptions,
  type ToOptions,
} from "@tanstack/react-router";
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
        <div className="flex h-screen flex-col">
          <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="flex gap-2">
                <Link
                  to="/"
                  className="rounded-md px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 [&.active]:bg-gray-200 dark:[&.active]:bg-gray-700"
                >
                  Search
                </Link>
                <Link
                  to="/profile"
                  className="rounded-md px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 [&.active]:bg-gray-200 dark:[&.active]:bg-gray-700"
                >
                  Profile
                </Link>
                <Link
                  to="/about"
                  className="rounded-md px-4 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 [&.active]:bg-gray-200 dark:[&.active]:bg-gray-700"
                >
                  About
                </Link>
              </div>
            </div>
          </nav>
          <main className="flex min-h-0 flex-1 items-stretch justify-center p-5">
            <Outlet />
          </main>
        </div>
      </Providers>
    );
  },
});
