import Head from "next/head";
import dynamic from "next/dynamic";

import { api } from "~/utils/api";

const Viz = dynamic(
  () => {
    return import("./components/graphNoNodesColourEdges");
  },
  { ssr: false },
);

export default function Home() {
  const nodesAndEdges = api.graph.nodesAndEdgesColour.useQuery();

  return (
    <>
      <Head>
        <title>NoNodes - interwebs</title>
        <meta name="description" content="Interwebs - internet visualization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <Viz
          data={nodesAndEdges.data}
        />
      </main>
    </>
  );
}
