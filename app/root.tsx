import type { ErrorBoundaryComponent, LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import Nav from "./components/Nav";

import styles from "./styles/app.css";
import { ClerkApp, ClerkCatchBoundary } from "@clerk/remix";

export const links: LinksFunction = () => ([
  { rel: "stylesheet", href: styles },
]);

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Alphington Skittles",
  viewport: "width=device-width,initial-scale=1",
});

export const loader: LoaderFunction = (args) => rootAuthLoader(args, { loadUser: true });

export const ErrorBoundary: ErrorBoundaryComponent = ({ error }) => {
  console.error(error);
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <pre>{JSON.stringify(error, null, 2)}</pre>
        <Scripts />
      </body>
    </html>
  );
};

export const CatchBoundary = ClerkCatchBoundary();

const App = () => {
  return (
    <html lang="en" className="min-h-screen bg-gray-100 print:bg-transparent">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex">
        <div className="min-h-full flex-1 flex flex-col">
          <Nav />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default ClerkApp(App);
