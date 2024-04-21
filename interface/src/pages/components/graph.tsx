import ForceGraph2D from "react-force-graph-2d";
export default function Viz({
  data,
}: Readonly<{
  data: {
    nodes?: { id: number, url: string, title: string | undefined, redirect: boolean | undefined }[];
    links?: { source: number, target: number, id: number, start_id: number, end_id: number }[];
  };
}>) {
  if (data.nodes !== undefined && data.links !== undefined) {
    return (
      <ForceGraph2D
        graphData={{ nodes: data.nodes, links: data.links }}
      />
    );
  } else {
    return <div>Loading...</div>;
  }
}
