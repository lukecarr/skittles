import clsx from "clsx";
import type { FunctionComponent, ReactElement } from "react"

type Props = {
  heading: string;
  children: ReactElement | ReactElement[];
  className?: string;
  fullWidth?: boolean;
};

const Wrapper: FunctionComponent<Props> = ({ heading, children, fullWidth, className }) => {
  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold leading-6 text-gray-900">{heading}</h1>
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
