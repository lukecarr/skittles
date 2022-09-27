import type { ErrorBoundaryComponent, LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import Nav from "./components/Nav";

import styles from "./styles/app.css";

export const links: LinksFunction = () => ([
  { rel: "stylesheet", href: styles },
]);

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Alphington Skittles",
  viewport: "width=device-width,initial-scale=1",
});

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

const App = () => {
  return (
    <html lang="en" className="h-full bg-gray-100 print:bg-transparent">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <div className="min-h-full">
          <Nav />
          <Outlet />
        </div>
        
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
};

export default App;
