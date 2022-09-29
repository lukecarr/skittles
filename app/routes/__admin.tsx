import { getAuth } from "@clerk/remix/ssr.server";
import type { LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const { userId } = await getAuth(request);
  if (!userId) return redirect("/sign-in");
  else return null;
}

const Layout = () => <Outlet />;

export default Layout;
