import { Outlet, Link, createRootRoute, HeadContent } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

import { CurrencyProvider } from "@/context/CurrencyContext";
import { UserCardsProvider } from "@/context/UserCardsContext";
import { I18nProvider } from "@/context/I18nContext";
import { LoadingProvider } from "@/context/LoadingContext";
import { GlobalLoadingBar } from "@/components/common/GlobalLoadingBar";

function RootComponent() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <I18nProvider>
          <CurrencyProvider>
            <UserCardsProvider>
              <GlobalLoadingBar />
              <HeadContent />
              <Outlet />
              <Toaster position="top-right" richColors />
            </UserCardsProvider>
          </CurrencyProvider>
        </I18nProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            Go Home
          </Link>
          <Link
            to="/stores"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Browse Stores
          </Link>
        </div>
      </div>
    </div>
  );
}

function RootErrorComponent({ error }: { error: unknown }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A new version of the website was recently updated or an unexpected error occurred.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            Refresh Page
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: RootErrorComponent,
});
