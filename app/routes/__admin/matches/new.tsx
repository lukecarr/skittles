import type { Player, Team } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import clsx from "clsx";
import { useImmer } from "use-immer";
import type { FunctionComponent} from "react";
import Wrapper from "~/components/Wrapper";
import { db } from "~/utils/db.server";

type LoaderData = {
  teams: (Team & { players: Player[] })[];
};

export const loader: LoaderFunction = async () => {
  const teams = await db.team.findMany({ orderBy: { name: "asc" }, include: { players: { orderBy: [{ lastName: "asc" }, { firstName: "asc" }]}}});
  return json({ teams });
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    homeTeam: string | undefined;
    awayTeam: string | undefined;
    timestamp: string | undefined;
    players: string | undefined;
  };
  fields?: {
    homeTeam: string;
    awayTeam: string;
    timestamp: string;
    players: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const homeTeam = form.get("homeTeam");
  const awayTeam = form.get("awayTeam");
  const timestamp = form.get("timestamp");
  const players = form.get("players");

  if (typeof homeTeam !== "string" || homeTeam.length < 1) {
    return json({
      formError: "Please provide a home team!",
    }, 400);
  }
  if (typeof awayTeam !== "string" || awayTeam.length < 1) {
    return json({
      formError: "Please provide an away team!",
    }, 400);
  }
  if (typeof timestamp !== "string" || timestamp.length < 1) {
    return json({
      formError: "Please provide a date and time!",
    }, 400);
  }
  if (typeof players !== "string") {
    return json({
      formError: "Please provide player data including scores!",
    }, 400);
  }

  await db.match.create({ data: {
    homeTeamId: homeTeam,
    awayTeamId: awayTeam,
    timestamp: new Date(timestamp),
    players: {
      create: JSON.parse(players).players,
    },
  }});

  await db.$queryRaw`CALL "RefreshTables"()`;

  return redirect(`/matches`);
};

const Page: FunctionComponent = () => {
  const { teams } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  const [homeTeam, setHomeTeam] = useImmer(teams[0]);
  const [awayTeam, setAwayTeam] = useImmer(teams[1]);
  const [homeTeamPlayers, setHomeTeamPlayers] = useImmer<(string | undefined)[]>([...Array(8).keys()].map(_x => undefined));
  const [awayTeamPlayers, setAwayTeamPlayers] = useImmer<(string | undefined)[]>([...Array(8).keys()].map(_x => undefined));
  const [homeTeamScores, setHomeTeamScores] = useImmer<(number | undefined)[][]>([...Array(8).keys()].map(_x => [...Array(6).keys()].map(_x => undefined)));
  const [awayTeamScores, setAwayTeamScores] = useImmer<(number | undefined)[][]>([...Array(8).keys()].map(_x => [...Array(6).keys()].map(_x => undefined)));

  return (
    <Form method="post">
      <input
        type="hidden"
        name="players"
        required
        value={JSON.stringify({
          players: [...homeTeamPlayers.map((player, x) => ({ playerId: player, position: x + 1, scores: { create: homeTeamScores[x].map((score, y) => ({ score, leg: y + 1, spare: score! > 9 })) }})),
          ...awayTeamPlayers.map((player, x) => ({ playerId: player, position: x + 1, scores: { create: awayTeamScores[x].map((score, y) => ({ score, leg: y + 1, spare: score! > 9 })) }}))],
        })}
      />
      <Wrapper heading="New Match" className="space-y-8" fullWidth>
        <div className="bg-white shadow sm:rounded-md space-y-8 divide-y divide-gray-200 p-6">
          <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
            <div className="space-y-6 sm:space-y-5">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Match details</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Use this form to record a new match result.
                </p>
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="homeTeam" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Home Team
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <select
                  name="homeTeam"
                  defaultValue={actionData?.fields?.homeTeam ?? homeTeam.id}
                  aria-invalid={Boolean(actionData?.fieldErrors?.homeTeam) || undefined}
                  aria-errormessage={actionData?.fieldErrors?.homeTeam ? "home-team-error" : undefined}
                  required
                  onChange={e => void setHomeTeam(teams.find((team) => team.id === e.target.value)!)}
                  className={clsx(
                    "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                    actionData?.fieldErrors?.homeTeam && "text-red-500 border-red-500 ring-red-500 focus:border-red-700 focus:ring-red-700",
                  )}
                >
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="awayTeam" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Away Team
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <select
                  name="awayTeam"
                  defaultValue={actionData?.fields?.awayTeam ?? awayTeam.id}
                  aria-invalid={Boolean(actionData?.fieldErrors?.awayTeam) || undefined}
                  aria-errormessage={actionData?.fieldErrors?.awayTeam ? "away-team-error" : undefined}
                  required
                  onChange={e => void setAwayTeam(teams.find((team) => team.id === e.target.value)!)}
                  className={clsx(
                    "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                    actionData?.fieldErrors?.awayTeam && "text-red-500 border-red-500 ring-red-500 focus:border-red-700 focus:ring-red-700",
                  )}
                >
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </div>
            </div>
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                Date and time
              </label>
              <div className="mt-1 sm:col-span-2 sm:mt-0">
                <input
                  type="datetime-local"
                  defaultValue={actionData?.fields?.timestamp}
                  name="timestamp"
                  aria-invalid={Boolean(actionData?.fieldErrors?.timestamp) || undefined}
                  aria-errormessage={actionData?.fieldErrors?.timestamp ? "date-error" : undefined}
                  required
                  className={clsx(
                    "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                    actionData?.fieldErrors?.timestamp && "text-red-500 border-red-500 ring-red-500 focus:border-red-700 focus:ring-red-700",
                  )}
                />
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
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-md p-6 grid grid-cols-2 divide-x divide-x-gray-200">
          <div className="pr-8">
            <h2 className="font-bold text-lg">{homeTeam.name}</h2>
            <div className="mt-4 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                        >
                          Player
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #1
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #2
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #3
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #4
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #5
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #6
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[...Array(8).keys()].map((x) => (
                        <tr key={x}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0" style={{minWidth: "200px"}}>
                            <select
                              required
                              className={clsx(
                                "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                                typeof homeTeamPlayers[x] === "undefined" ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-green-500 focus:border-green-500 focus:ring-green-500",
                              )}
                              onChange={(e) => void setHomeTeamPlayers((players) => {
                                players[x] = e.target.value != "" ? e.target.value : undefined;
                                return players;
                              })}
                            >
                              <option value="">Player {x+1}</option>
                              {homeTeam.players.filter((player) => !homeTeamPlayers.includes(player.id) || player.id === homeTeamPlayers[x]).map((player) => <option key={player.id} value={player.id}>{player.firstName} {player.lastName}</option>)}
                            </select>
                          </td>
                          {[...Array(6).keys()].map((y) => (
                            <td key={y} className="whitespace-nowrap text-xs text-gray-500 text-center">
                              <input
                                type="text"
                                required
                                className={clsx(
                                  "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                                  typeof homeTeamScores[x][y] === "undefined" ? "border-red-500 focus:border-red-500 focus:ring-red-500" : (
                                    homeTeamScores[x][y]! > 9 ? "border-green-500 focus:border-green-500 focus:ring-green-500" : "border-amber-500 focus:border-amber-500 focus:ring-amber-500"),
                                )}
                                style={{maxWidth: "48px"}}
                                onChange={(e) => void setHomeTeamScores((scores) => {
                                  scores[x][y] = e.target.value ? parseInt(e.target.value) : undefined;
                                  return scores;
                                })}
                              />
                            </td>
                          ))}
                          <td className="whitespace-nowrap py-4 px-3 text-center">{homeTeamScores[x].reduce((a, b) => (a ?? 0) + (b ?? 0), 0)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium text-gray-900 sm:pl-6 md:pl-0" style={{minWidth: "200px"}}>
                          Team Total
                        </td>
                        {[...Array(6).keys()].map((y) => (
                          <td key={y} className="whitespace-nowrap text-center">
                            {homeTeamScores.map((x) => x[y]).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)}
                          </td>
                        ))}
                        <td className="whitespace-nowrap text-center">
                          {homeTeamScores.map((x) => x.reduce((a, b) => (a ?? 0) + (b ?? 0))).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="pl-8">
            <h2 className="font-bold text-lg">{awayTeam.name}</h2>
            <div className="mt-4 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                        >
                          Player
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #1
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #2
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #3
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #4
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #5
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Leg #6
                        </th>
                        <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[...Array(8).keys()].map((x) => (
                        <tr key={x}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0" style={{minWidth: "200px"}}>
                            <select
                              required
                              className={clsx(
                                "block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:max-w-xs sm:text-sm",
                                typeof awayTeamPlayers[x] === "undefined" ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-green-500 focus:border-green-500 focus:ring-green-500",
                              )}
                              onChange={(e) => void setAwayTeamPlayers((players) => {
                                players[x] = e.target.value != "" ? e.target.value : undefined;
                                return players;
                              })}
                            >
                              <option value="">Player {x+1}</option>
                              {awayTeam.players.filter((player) => !awayTeamPlayers.includes(player.id) || player.id === awayTeamPlayers[x]).map((player) => <option key={player.id} value={player.id}>{player.firstName} {player.lastName}</option>)}
                            </select>
                          </td>
                          {[...Array(6).keys()].map((y) => (
                            <td key={y} className="whitespace-nowrap text-xs text-gray-500 text-center">
                              <input
                                type="text"
                                required
                                className={clsx(
                                  "w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                                  typeof awayTeamScores[x][y] === "undefined" ? "border-red-500 focus:border-red-500 focus:ring-red-500" : (
                                    awayTeamScores[x][y]! > 9 ? "border-green-500 focus:border-green-500 focus:ring-green-500" : "border-amber-500 focus:border-amber-500 focus:ring-amber-500"),
                                )}
                                style={{maxWidth: "48px"}}
                                onChange={(e) => {
                                  const score = e.target.value ? parseInt(e.target.value) : undefined;
                                  setAwayTeamScores((scores) => {
                                    scores[x][y] = score;
                                    return scores;
                                  });
                                }}
                              />
                            </td>
                          ))}
                          <td className="whitespace-nowrap py-4 px-3 text-center">{awayTeamScores[x].reduce((a, b) => (a ?? 0) + (b ?? 0), 0)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium text-gray-900 sm:pl-6 md:pl-0" style={{minWidth: "200px"}}>
                          Team Total
                        </td>
                        {[...Array(6).keys()].map((y) => (
                          <td key={y} className="whitespace-nowrap text-center">
                            {awayTeamScores.map((x) => x[y]).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)}
                          </td>
                        ))}
                        <td className="whitespace-nowrap text-center">
                          {awayTeamScores.map((x) => x.reduce((a, b) => (a ?? 0) + (b ?? 0))).reduce((a, b) => (a ?? 0) + (b ?? 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    </Form>
  );
};

export default Page;