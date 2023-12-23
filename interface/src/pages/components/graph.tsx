import { type MutableRefObject } from "react";
import ForceGraph2D from "react-force-graph-2d";
export default function Viz({
  data,
}: {
  data: {
    nodes: MutableRefObject<
      | {
          id: number;
          url: string;
          title: string | undefined;
          redirect: boolean | undefined;
        }[]
      | undefined
    >;
    links: MutableRefObject<
      | {
          source: number;
          target: number;
          id: number;
          start_id: number;
          end_id: number;
        }[]
      | undefined
    >;
  };
}) {
  if (data.nodes.current !== undefined && data.links.current !== undefined) {
    return (
      <ForceGraph2D
        graphData={{ nodes: data.nodes.current, links: data.links.current }}
      />
    );
  } else {
    return <div>Loading...</div>;
  }
}
