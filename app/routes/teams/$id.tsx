import type { Player, Team } from "@prisma/client";
import type { ActionFunction, LoaderFunction} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import type { FunctionComponent } from "react";
import { TbAlertCircle } from "react-icons/tb";
import Wrapper from "~/components/Wrapper";
import { db } from "~/utils/db.server";

type LoaderData = {
  team: (Team & { players: Player[] });
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    team: string | undefined;
    firstName: string | undefined;
    lastName: string | undefined;
    gender: string | undefined;
  };
  fields?: {
    team: string;
    firstName: string;
    lastName: string;
    gender: string;
  };
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  const team = await db.team.findUnique({ where: { id }, include: { players: true } });
  return json({ team });
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const team = form.get("team");
  const firstName = form.get("firstName");
  const lastName = form.get("lastName");
  const gender = form.get("gender");

  if (typeof team !== "string" || team.length < 1) {
    return json({
      formError: "Please provide a team ID for the new player!",
    }, 400);
  }
  if (typeof firstName !== "string" || firstName.length < 1) {
    return json({
      formError: "Please provide a first name for the new player!",
    }, 400);
  }
  if (typeof lastName !== "string" || lastName.length < 1) {
    return json({
      formError: "Please provide a last name for the new player!",
    }, 400);
  }
  if (gender !== "male" && gender !== "female") {
    return json({
      formError: "Please provide a gender ('male' or 'female') for the new player!",
    }, 400);
  }

  await db.player.create({ data: { firstName, lastName, gender: gender === "male", teamId: team }});

  return redirect(`/teams/${team}`);
};

const Page: FunctionComponent = () => {
  const { team } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <Form method="post">
      <input type="hidden" name="team" value={team.id} required />
      <Wrapper heading={team.name} className="space-y-8">      
        <div className="bg-white shadow sm:rounded-md space-y-8 divide-y divide-gray-200 p-6">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div className="space-y-6 sm:space-y-5">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Add a player</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Use this form to add a new player to {team.name}.
                </p>
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                First Name
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  defaultValue={actionData?.fields?.firstName}
                  name="firstName"
                  aria-invalid={Boolean(actionData?.fieldErrors?.firstName) || undefined}
                  aria-errormessage={actionData?.fieldErrors?.firstName ? "first-name-error" : undefined}
                  placeholder="e.g. Luke"
                  required
                  className={clsx(
                    "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                    actionData?.fieldErrors?.firstName && "text-red-500 border-red-500 ring-red-500 focus:border-red-700 focus:ring-red-700",
                  )}
                />
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Last Name
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <input
                  type="text"
                  defaultValue={actionData?.fields?.lastName}
                  name="lastName"
                  aria-invalid={Boolean(actionData?.fieldErrors?.lastName) || undefined}
                  aria-errormessage={actionData?.fieldErrors?.lastName ? "last-name-error" : undefined}
                  placeholder="e.g. Carr"
                  required
                  className={clsx(
                    "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                    actionData?.fieldErrors?.lastName && "text-red-500 border-red-500 ring-red-500 focus:border-red-700 focus:ring-red-700",
                  )}
                />
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Gender
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <select
                  name="gender"
                  defaultValue={actionData?.fields?.gender}
                  aria-invalid={Boolean(actionData?.fieldErrors?.gender) || undefined}
                  aria-errormessage={actionData?.fieldErrors?.gender ? "gender-error" : undefined}
                  required
                  className={clsx(
                    "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                    actionData?.fieldErrors?.gender && "text-red-500 border-red-500 ring-red-500 focus:border-red-700 focus:ring-red-700",
                  )}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
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

          {actionData?.fieldErrors?.firstName && <div className="pt-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TbAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{actionData.fieldErrors.firstName}</h3>
                </div>
              </div>
            </div>
          </div>}

          {actionData?.fieldErrors?.lastName && <div className="pt-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TbAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{actionData.fieldErrors.lastName}</h3>
                </div>
              </div>
            </div>
          </div>}

          {actionData?.fieldErrors?.gender && <div className="pt-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <TbAlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{actionData.fieldErrors.gender}</h3>
                </div>
              </div>
            </div>
          </div>}
        </div>

        <div className="overflow-hidden bg-white shadow sm:rounded-md p-6">
          <pre>{JSON.stringify(team.players, null, 2)}</pre>
        </div>
      </Wrapper>
    </Form>
  );
};

export default Page;