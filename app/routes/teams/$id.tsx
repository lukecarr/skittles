import type { Player, Team } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import Wrapper from "~/components/Wrapper";
import { db } from "~/utils/db.server";

type LoaderData = {
  team: (Team & { players: Player[] });
};

export const loader: LoaderFunction = async ({ params }) => {
  const { id } = params;

  const team = await db.team.findUnique({ where: { id }, include: { players: true } });
  return json({ team });
};

const Page: FunctionComponent = () => {
  const data = useLoaderData<LoaderData>();

  return (
    <Wrapper heading={data.team.name}>
      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </Wrapper>
  );
};

export default Page;