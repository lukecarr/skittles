import { Link } from "@remix-run/react";
import clsx from "clsx";
import type { FunctionComponent, ReactElement } from "react"

type Props = {
  heading: string;
  children: ReactElement | ReactElement[];
  className?: string;
  fullWidth?: boolean;
  action?: {
    text: string;
    href: string;
  };
};

const Wrapper: FunctionComponent<Props> = ({ heading, children, fullWidth, className, action }) => {
  return (
    <>
      <header className="bg-white shadow-sm print:shadow-none">
        <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center print:justify-center print:py-0">
          <h1 className="text-xl font-bold leading-6 text-gray-900 py-2 print:text-2xl print:uppercase">{heading}</h1>
          {typeof action !== "undefined" && (
            <Link
              to={action.href}
              className="print:hidden inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {action.text}
            </Link>
          )}
        </div>
      </header>
      <main>
        <div className={clsx("py-6 sm:px-6 lg:px-8", !fullWidth && "mx-auto max-w-7xl", className)}>
          {children}
        </div>
      </main>
    </>
  );
};

export default Wrapper;
