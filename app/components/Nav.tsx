import { Disclosure } from "@headlessui/react";
import { NavLink } from "@remix-run/react";
import clsx from "clsx";
import type { FunctionComponent } from "react";
import { TbMenu, TbX } from "react-icons/tb";

const navigation = [
  { name: "League Table", href: "/league" },
  { name: "Teams", href: "/teams" },
  { name: "Matches", href: "/matches" },
  { name: "New Match", href: "/matches/new" },
];

const Nav: FunctionComponent = () => {
  return (
    <Disclosure as="nav" className="bg-indigo-600">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="font-extrabold text-white text-lg">Alphington Skittles</span>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) => clsx(
                          isActive
                            ? 'bg-indigo-700 text-white'
                            : 'text-white hover:bg-indigo-500 hover:bg-opacity-75',
                          'px-3 py-2 rounded-md text-sm font-semibold'
                        )}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-200 hover:bg-indigo-500 hover:bg-opacity-75 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <TbX className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <TbMenu className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className="text-white hover:bg-indigo-500 hover:bg-opacity-75 block px-3 py-2 rounded-md text-base font-semibold"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Nav;