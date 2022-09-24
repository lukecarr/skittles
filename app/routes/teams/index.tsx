import type { Team } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { ActionFunction, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import type { FunctionComponent } from "react";
import { TbAlertCircle } from "react-icons/tb";
import TeamList from "~/components/TeamList";
import Wrapper from "~/components/Wrapper";
import { db } from "~/utils/db.server";

type LoaderData = {
  teams: (Team & { _count: { players: number; homeMatches: number; awayMatches: number; }})[];
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
  };
  fields?: {
    name: string;
  };
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    teams: await db.team.findMany({
      include: { 
        _count: {
          select: { players: true, homeMatches: true, awayMatches: true },
        },
      },
      orderBy: { name: "asc" },
    }),
  };

  return json(data);
};

export const action: ActionFunction = async({ request }) => {
  const form = await request.formData();
  const name = form.get("name");

  if (typeof name !== "string" || name.length < 1) {
    return json({
      formError: "Please provide a name for the new team!",
    }, 400);
  }

  try {
    const team = await db.team.create({ data: { name }, select: { id: true } });

    return redirect(`/teams/${team.id}`);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return json({
        fieldErrors: { name: "A team already exists with the provided name!" },
        fields: { name },
      }, 400);
    }
    throw err;
  }
}

const Page: FunctionComponent = () => {
  const data = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <Form method="post">
      <Wrapper heading="Teams" className="space-y-8">      
        <div className="bg-white shadow sm:rounded-md space-y-8 divide-y divide-gray-200 p-6">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div className="space-y-6 sm:space-y-5">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add a team</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Use this form to create a new team within the skittles league.
                </p>
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Name
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  defaultValue={actionData?.fields?.name}
                  name="name"
                  aria-invalid={Boolean(actionData?.fieldErrors?.name) || undefined}
                  aria-errormessage={actionData?.fieldErrors?.name ? "name-error" : undefined}
                  placeholder="e.g. Friday Gang"
                  required
                  className={clsx(
                    "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                    actionData?.fieldErrors?.name && "text-red-500 border-red-500 ring-red-500 focus:border-red-700 focus:ring-red-700",
                  )}
                />
                <p className="mt-2 text-sm text-gray-500">This name must be unique within the league!</p>
              </div>
            </div>
          </div>
          
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Save
              </button>
            </div>
          </div>

          {actionData?.formError && <div className="pt-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TbAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{actionData.formError}</h3>
                </div>
              </div>
            </div>
          </div>}

          {actionData?.fieldErrors?.name && <div className="pt-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TbAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{actionData.fieldErrors.name}</h3>
                </div>
              </div>
            </div>
          </div>}
        </div>

        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <TeamList teams={data.teams} />
        </div>
      </Wrapper>
    </Form>
  );
};

export default Page;
