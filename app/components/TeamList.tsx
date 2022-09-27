import type { FunctionComponent } from "react";
import { Link } from "@remix-run/react";
import { TbUsers, TbList, TbChevronRight } from "react-icons/tb";

type Props = {
  teams: ({
    id: string;
    name: string;
    _count: { players: number; homeMatches: number; awayMatches: number; }
  })[];
};

const TeamList: FunctionComponent<Props> = ({ teams }) => {
  return (
    <ul className="divide-y divide-gray-200">
      {teams.map((team) => (
        <li key={team.id}>
          <Link to={`/teams/${team.id}`} className="block hover:bg-gray-50">
            <div className="flex items-center px-4 py-4 sm:px-6">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="truncate">
                  <div className="flex text-sm">
                    <p className="truncate font-bold text-indigo-600">{team.name}</p>
                  </div>
                  <div className="mt-2 flex font-semibold">
                    <div className="flex items-center text-sm text-gray-500">
                      <TbUsers className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                      <p>
                        {team._count.players} Player{team._count.players == 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 ml-4">
                      <TbList className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                      <p>
                        {team._count.homeMatches + team._count.awayMatches} Match{team._count.homeMatches + team._count.awayMatches == 1 ? '' : 'es'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-5 flex-shrink-0">
                <TbChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default TeamList;
