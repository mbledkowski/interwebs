import Head from "next/head";
import dynamic from "next/dynamic";

import { api } from "~/utils/api";
import { useEffect, useRef } from "react";

const Viz = dynamic(
  () => {
    return import("./components/graph");
  },
  { ssr: false },
);

export default function Home() {
  const nodes = api.graph.nodes.useQuery();
  const edges = api.graph.edges.useQuery();

  const linksRef = useRef(
    edges.data?.map((d) => ({
      ...d,
      source: d.start_id,
      target: d.end_id,
    })),
  );
  const nodesRef = useRef(nodes.data?.map((d) => ({ ...d })));
  useEffect(() => {
    Viz;
  }, [nodesRef, linksRef]);
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <Viz data={{ nodes: nodesRef, links: linksRef }} />
      </main>
    </>
  );
}
