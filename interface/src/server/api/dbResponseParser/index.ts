import { AGTypeParse } from "./age-driver/dist"
import { type Node } from "../interfaces"

export function OGTypeParser(rowRaw: string) {
  const rowParserRaw = AGTypeParse(rowRaw) as Map<
    string,
    Map<string, string | boolean> | string | number
  >[];
  const propertiesParserRaw = rowParserRaw[0]?.get("properties") as Map<
    string,
    string | boolean
  >;
  const row: Node = {
    id: rowParserRaw[0]?.get("id") as number,
    label: rowParserRaw[0]?.get("label") as string,
    properties: {
      url: propertiesParserRaw.get("url") as string,
      title: propertiesParserRaw.get("title") as string,
      redirect: propertiesParserRaw.get("redirect") as boolean,
    },
  };
  return row;
}
