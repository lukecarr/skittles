import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import Wrapper from "~/components/Wrapper";
import { db } from "~/utils/db.server";

type LoaderData = {
  player: string;
  team: string;
  played: number;
  nines: number;
  spares: number;
  total: number;
}[];

export const loader: LoaderFunction = async () => {
  const data = await db.$queryRaw`
    SELECT
      "Player"."firstName" || ' ' || "Player"."lastName" AS Player,
      "Team"."name" AS Team,
      "Nines".Played,
      "Nines".Nines,
      "Nines".Spares,
      "Nines".Total
    FROM (
      SELECT "Player"."id" AS "Player ID",
        COUNT(DISTINCT "MatchPlayer"."matchId") AS Played,
        SUM(CASE "Score"."score" WHEN 9 THEN 1 ELSE 0 END) AS Nines,
        SUM(CASE WHEN "Score"."score" > 9 THEN 1 ELSE 0 END) AS Spares,
        SUM(CASE WHEN "Score"."score" >= 9 THEN 1 ELSE 0 END) AS Total
      FROM "Score"
      LEFT JOIN "MatchPlayer" ON "Score"."matchPlayerId" = "MatchPlayer"."id"
      LEFT JOIN "Player" ON "MatchPlayer"."playerId" = "Player"."id"
      GROUP BY "Player"."id"
      ORDER BY Total DESC, Spares DESC, Played
      LIMIT 20
    ) "Nines"
    JOIN "Player" ON "Nines"."Player ID" = "Player"."id"
    JOIN "Team" ON "Player"."teamId" = "Team"."id"
    ORDER BY Total DESC, Spares DESC, Played
  `;

  return json(data);
};

const Page: FunctionComponent = () => {
  const players = useLoaderData<LoaderData>();

  return (
    <Wrapper heading="Nines League">
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pos
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Played
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nines
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spares
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(({ player, team, played, nines, spares, total }, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {player}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {team}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {played}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {nines}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {spares}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  )
};

export default Page;