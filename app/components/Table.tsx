import clsx from "clsx";
import type { FunctionComponent } from "react";

export type Props = {
  cols: (string | {
    id: string;
    name: string;
    align?: "left" | "right" | "center";
  })[];
  data: any[];
};

const Table: FunctionComponent<Props> = ({ cols, data }) => {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg print:shadow-none print:border-none">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {cols.map((col) => <th
                    key={typeof col === "string" ? col : col.id}
                    scope="col"
                    className={clsx(
                      "px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                      typeof col !== "string" && col.align === "right" && "text-right",
                      typeof col !== "string" && col.align === "center" && "text-center",
                    )}
                  >
                    {typeof col === "string" ? col : col.name}
                  </th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {cols.map((col) => <td
                    key={typeof col === "string" ? col : col.id}
                    className={clsx(
                      "px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900",
                      typeof col !== "string" && col.align === "right" && "text-right",
                      typeof col !== "string" && col.align === "center" && "text-center",
                    )}
                  >
                    {row[typeof col === "string" ? col : col.id]}
                  </td>)}
                </tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table;
