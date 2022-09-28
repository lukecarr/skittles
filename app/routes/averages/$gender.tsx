import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import Wrapper from "~/components/Wrapper";
import { db } from "~/utils/db.server";

type LoaderData = {
  averages: {
    player: string;
    team: string;
    played: string;
    average: string;
  }[];
  scores: {
    Player: string;
    Team: string;
    Opponent: string;
    Timestamp: string;
    Score: number;
    "Highest Score": number;
    "Lowest Score": number;
    Spares: number;
    Nines: number;
  }[];
  gender?: "men" | "ladies";
};

export const loader: LoaderFunction = async ({ params }) => {
  const { gender } = params;
  if (gender !== "men" && gender !== "ladies") return json({ players: [] });

  const max = 20;
  const averages = gender === "men" ? await db.$queryRaw<LoaderData["averages"]>`SELECT * FROM "AveragesMens" LIMIT ${max}` : await db.$queryRaw<LoaderData[]>`SELECT * FROM "AveragesLadies" LIMIT ${max}`;
  const scores = await db.$queryRaw<LoaderData["scores"]>`SELECT * FROM "PlayerScores" WHERE "Gender" = ${gender === "men"}`;

  return json({ averages, scores, gender });
};

const Page: FunctionComponent = () => {
  const { averages, scores, gender } = useLoaderData<LoaderData>();
  const headings = {
    "men": "Mens' Averages",
    "ladies": "Ladies' Averages",
  };
  let highestSpare = [scores[0]];
  for (const score of scores) {
    if (score["Highest Score"] > highestSpare[0]["Highest Score"]) {
      highestSpare = [score];
    }
    else if (score["Highest Score"] === highestSpare[0]["Highest Score"]) {
      highestSpare.push(score);
    }
  }

  console.log(highestSpare);

  return (
    <Wrapper
      heading={typeof gender === "undefined" ? "Averages" : headings[gender] ?? "Averages"}
      action={{ text: `Go to ${gender === "men" ? "ladies" : "mens"}'`, href: `/averages/${gender === "men" ? "ladies" : "men"}` }}
    >
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg print:shadow-none print:border-none">
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
                  {averages.map(({ player, team, played, average }, index) => (
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
      <dl className="mt-5 grid grid-cols-2 gap-5">
        <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Highest Total
          </dt>
          <dd className="mt-3 text-3xl font-bold text-gray-900 print:text-2xl print:mt-1">
            {scores[0].Score}
          </dd>
          <dt className="mt-1 text-base text-gray-500 sm:truncate print:text-sm print:mt-0">
            <span className="font-semibold">{scores[0].Player}</span> for {scores[0].Team} vs {scores[0].Opponent} on {new Date(scores[0].Timestamp).toDateString()}
          </dt>
          <dt className="mt-3 flex space-x-4 print:mt-1 print:space-x-2">
            <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-sm print:text-xs font-medium text-blue-800 uppercase print:text-blue-500">
              {scores[0].Nines} Nines
            </span>
            <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-sm print:text-xs font-medium text-blue-800 uppercase print:text-blue-500">
              {scores[0].Spares} Spares
            </span>
            <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-sm print:text-xs font-medium text-blue-800 uppercase print:text-blue-500">
              Highest Score: {scores[0]["Highest Score"]}
            </span>
          </dt>
        </div>
        {typeof highestSpare[0] !== "undefined" && <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Highest Score
          </dt>
          <dd className="mt-3 text-3xl font-bold text-gray-900 print:text-2xl print:mt-1">
            {highestSpare[0]["Highest Score"]}
          </dd>
          <dt className="mt-1 text-base text-gray-500 sm:truncate print:text-sm">
            {highestSpare.length === 1 ? <>
              <span className="font-semibold">{highestSpare[0].Player}</span> for {highestSpare[0].Team} vs {highestSpare[0].Opponent} on {new Date(highestSpare[0].Timestamp).toDateString()}
            </> : <span className="font-semibold">
              {highestSpare.map((score) => `${score?.Player} (${score?.Team})`).sort().join(", ")}
            </span>}
          </dt>
        </div>}
      </dl>
    </Wrapper>
  )
};

export default Page;