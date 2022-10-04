import type { Match, Team, Score } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import Wrapper from "~/components/Wrapper";
import { db } from "~/utils/db.server";

type LoaderData = {
  teams: Team[];
  results: (Match & {
    homeTeam: Team;
    awayTeam: Team;
    result: {
      homeTeamPins: number;
      awayTeamPins: number;
      homeTeamPoints: number;
      awayTeamPoints: number;
    };
  })[];
};

export const loader: LoaderFunction = async () => {
  const teams = await db.team.findMany();

  const data = await db.match.findMany({
    include: {
      players: { include: { scores: true, player: { include: { team: true }} } },
      homeTeam: true,
      awayTeam: true,
    },
  });

  const res: LoaderData["results"] = [];

  for (const game of data) {
    const homePlayers = game.players.filter(player => player.teamId === game.homeTeamId);
    const awayPlayers = game.players.filter(player => player.teamId === game.awayTeamId);
    
    const result = {
      homeTeamPins: 0,
      awayTeamPins: 0,
      homeTeamPoints: 0,
      awayTeamPoints: 0,
    };

    for (let i = 1; i <= 6; i++) {
      const homeLeg = ([] as Score[]).concat(...homePlayers.map(player => player.scores)).filter(score => score.leg === i).map(({ score }) => score).reduce((a, b) => a + b, 0);
      const awayLeg = ([] as Score[]).concat(...awayPlayers.map(player => player.scores)).filter(score => score.leg === i).map(({ score }) => score).reduce((a, b) => a + b, 0);
      result.homeTeamPins += homeLeg;
      result.awayTeamPins += awayLeg;
      result.homeTeamPoints += homeLeg > awayLeg ? 1 : 0;
      result.awayTeamPoints += awayLeg > homeLeg ? 1 : 0;
    }

    if (result.homeTeamPins > result.awayTeamPins) {
      result.homeTeamPoints += 6;
    } else if (result.awayTeamPins > result.homeTeamPins) {
      result.awayTeamPoints += 6;
    } else {
      result.homeTeamPoints += 3;
      result.awayTeamPoints += 3;
    }

    res.push({ ...game, result });
  }

  return json({ results: res, teams });
};

const Page: FunctionComponent = () => {
  const { teams, results } = useLoaderData<LoaderData>();

  const played = (teamId: string) => results.filter(match => match.homeTeamId === teamId
    || match.awayTeamId === teamId).length;
  
  const wins = (teamId: string) => results.filter(match =>
    (match.homeTeamId === teamId && match.result.homeTeamPoints > match.result.awayTeamPoints) ||
    (match.awayTeamId === teamId && match.result.awayTeamPoints > match.result.homeTeamPoints)).length;
  
  const losses = (teamId: string) => results.filter(match =>
    (match.homeTeamId === teamId && match.result.homeTeamPoints < match.result.awayTeamPoints) ||
    (match.awayTeamId === teamId && match.result.awayTeamPoints < match.result.homeTeamPoints)).length;

  const pinsFor = (teamId: string) => {
    let pins = 0;
    for (const match of results) {
      if (match.homeTeamId === teamId) pins += match.result.homeTeamPins;
      else if (match.awayTeamId === teamId) pins += match.result.awayTeamPins;
    }
    return pins;
  };

  const pinsAgainst = (teamId: string) => {
    let pins = 0;
    for (const match of results) {
      if (match.homeTeamId === teamId) pins += match.result.awayTeamPins;
      else if (match.awayTeamId === teamId) pins += match.result.homeTeamPins;
    }
    return pins;
  };

  const points = (teamId: string) => results.filter(match => match.homeTeamId === teamId || match.awayTeamId === teamId)
    .map(match => match.homeTeamId === teamId ? match.result.homeTeamPoints : match.result.awayTeamPoints)
    .reduce((a, b) => a + b, 0);

  return (
    <Wrapper heading="League Table">
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
                      Team
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pld
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      W
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      D
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      L
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PF
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PA
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PD
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {teams.sort((a, b) => points(b.id) - points(a.id)).map((team, index) => (
                    <tr key={team.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {team.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {played(team.id)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {wins(team.id)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {played(team.id) - wins(team.id) - losses(team.id)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {losses(team.id)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pinsFor(team.id)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pinsAgainst(team.id)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pinsFor(team.id) - pinsAgainst(team.id)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {points(team.id)}
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