import ForceGraph2D from "react-force-graph-2d";
export default function Viz({
  data,
}: Readonly<{
  data?: {
    nodes: { id: number, url: string, title: string | undefined, redirect: boolean | undefined }[];
    edges: { source: number, target: number, id: number, start_id: number, end_id: number }[];
  };
}>) {
  if (data !== undefined) {
    return (
      <ForceGraph2D
        graphData={{ nodes: data.nodes, links: data.edges }}
        nodeRelSize={0}
      />
    );
  } else {
    return <div>Loading...</div>;
  }
}
