import { AGTypeParse } from "./age-driver/dist";
import { type Node, type Edge } from "../interfaces";

export function webpageParser(rowRaw: string) {
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

export function linkParser(rowRaw: string) {
  const rowParserRaw = AGTypeParse(rowRaw) as Map<string, number | string>;
  const row: Edge = {
    id: rowParserRaw?.get("id") as number,
    label: rowParserRaw?.get("label") as string,
    start_id: rowParserRaw?.get("start_id") as number,
    end_id: rowParserRaw?.get("end_id") as number,
  };
  return row;
}
