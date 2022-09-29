import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import Wrapper from "~/components/Wrapper";
import Table from "~/components/Table";
import type { Props as TableProps } from "~/components/Table";
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

const headings = {
  "men": "Mens' Averages",
  "ladies": "Ladies' Averages",
};

const getHighestScores = (scores: LoaderData["scores"]): LoaderData["scores"] => {
  let highest = [scores[0]];

  for (const score of scores) {
    if (score["Highest Score"] > highest[0]["Highest Score"]) {
      highest = [score];
    }
    else if (score["Highest Score"] === highest[0]["Highest Score"]) {
      highest.push(score);
    }
  }

  return highest;
};

const Page: FunctionComponent = () => {
  const { averages, scores, gender } = useLoaderData<LoaderData>();

  const highestScores = getHighestScores(scores);

  const cols: TableProps["cols"] = [
    { id: "pos", name: "Pos", align: "center" },
    { id: "player", name: "Player" },
    { id: "team", name: "Team" },
    { id: "played", name: "Played", align: "center" },
    { id: "average", name: "Average", align: "center" },
  ];

  const data = averages.map(({ player, team, played, average }, index) => ({
    pos: index + 1,
    player,
    team,
    played: parseInt(played),
    average: parseFloat(average).toFixed(2),
  }));
  
  return (
    <Wrapper
      heading={typeof gender === "undefined" ? "Averages" : headings[gender] ?? "Averages"}
      action={{ text: `Go to ${gender === "men" ? "ladies" : "mens"}'`, href: `/averages/${gender === "men" ? "ladies" : "men"}` }}
    >
      <Table cols={cols} data={data} />
      
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
        {typeof highestScores[0] !== "undefined" && <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Highest Score
          </dt>
          <dd className="mt-3 text-3xl font-bold text-gray-900 print:text-2xl print:mt-1">
            {highestScores[0]["Highest Score"]}
          </dd>
          <dt className="mt-1 text-base text-gray-500 sm:truncate print:text-sm">
            {highestScores.length === 1 ? <>
              <span className="font-semibold">{highestScores[0].Player}</span> for {highestScores[0].Team} vs {highestScores[0].Opponent} on {new Date(highestScores[0].Timestamp).toDateString()}
            </> : <span className="font-semibold">
              {highestScores.map((score) => `${score?.Player} (${score?.Team})`).sort().join(", ")}
            </span>}
          </dt>
        </div>}
      </dl>
    </Wrapper>
  )
};

export default Page;