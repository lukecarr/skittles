import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import Wrapper from "~/components/Wrapper";
import { db } from "~/utils/db.server";

type LoaderData = {
  player: string;
  team: string;
  played: string;
  average: string;
}[];

export const loader: LoaderFunction = async () => {
  const data = await db.$queryRaw`
    SELECT
      "Player"."firstName" || ' ' || "Player"."lastName" AS Player,
      "Team"."name" AS Team,
      "Averages".Played,
      "Averages".Average
    FROM (
      SELECT "Player"."id" AS "Player ID",
        "Player"."gender" AS "Gender",
        COUNT(DISTINCT "MatchPlayer"."matchId") AS Played,
        SUM("Score"."score") / CAST(COUNT(DISTINCT "MatchPlayer"."matchId") AS DECIMAL) AS Average
      FROM "Score"
      LEFT JOIN "MatchPlayer" ON "Score"."matchPlayerId" = "MatchPlayer"."id"
      LEFT JOIN "Player" ON "MatchPlayer"."playerId" = "Player"."id"
      GROUP BY "Player"."id", "Player"."gender"
      ORDER BY Average DESC, Played DESC
    ) "Averages"
    JOIN "Player" ON "Averages"."Player ID" = "Player"."id"
    JOIN "Team" ON "Player"."teamId" = "Team"."id"
    WHERE "Averages"."Gender" = FALSE
    ORDER BY Average DESC, Played DESC
    LIMIT 20
  `;

  console.log(data);

  return json(data);
};

const Page: FunctionComponent = () => {
  const players = useLoaderData<LoaderData>();

  return (
    <Wrapper heading="Ladies' Averages" action={{ text: "Go to mens'", href: "/averages/men" }}>
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
                      Average
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map(({ player, team, played, average }, index) => (
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
                        {parseInt(played)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {parseFloat(average).toFixed(2)}
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