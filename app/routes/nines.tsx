import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import Table from "~/components/Table";
import type { Props as TableProps } from "~/components/Table";
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
  const max = 20;
  const data = await db.$queryRaw<LoaderData[]>`SELECT * FROM "NinesLeague" LIMIT ${max}`;

  return json(data);
};

const Page: FunctionComponent = () => {
  const players = useLoaderData<LoaderData>();

  const cols: TableProps["cols"] = [
    { id: "pos", name: "Pos", align: "center" },
    { id: "player", name: "Player" },
    { id: "team", name: "Team" },
    { id: "played", name: "Played", align: "center" },
    { id: "nines", name: "Nines", align: "center" },
    { id: "spares", name: "Spares", align: "center" },
    { id: "total", name: "Total", align: "center" },
  ];
  
  const data = players.map((x, index) => ({ pos: index + 1, ...x }));

  return (
    <Wrapper heading="Nines League">
      <Table cols={cols} data={data} />
    </Wrapper>
  )
};

export default Page;