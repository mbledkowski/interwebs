/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { type SimulationNodeDatum, type SimulationLinkDatum } from "d3";
import { type Node, type Edge } from "~/interfaces";

interface Data {
  nodes: Node[] | undefined;
  edges: Edge[] | undefined;
}

type NodeD3 = Node & SimulationNodeDatum;
type LinkD3 = Edge & SimulationLinkDatum<NodeD3>;

export default function GraphViz(data: Data, width = 640, height = 400) {
  if (!data.nodes || !data.edges) {
    return <svg></svg>;
  } else {
    // The force simulation mutates links and nodes, so create a copy
    // so that re-evaluating this cell produces the same result.
    const linksRef = useRef(
      data.edges.map(
        (d) =>
          ({
            ...d,
            source: d.start_id,
            target: d.end_id,
          }) as LinkD3,
      ),
    );
    const nodesRef = useRef(data.nodes.map((d) => ({ ...d }) as NodeD3));

    // Create the SVG container.
    const [svg, setSvg] = useState(
      d3
        .create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("style", "max-width: 100%; height: auto;"),
    );

    const svgRef = useRef(svg.node()!);

    useEffect(() => {
      console.log(nodesRef, linksRef);

      // Create a simulation with several forces.
      const simulation = d3
        .forceSimulation<NodeD3>(nodesRef.current)
        .force(
          "link",
          d3.forceLink<NodeD3, LinkD3>(linksRef.current).id((d) => d.id),
        )
        .force("charge", d3.forceManyBody())
        .force("x", d3.forceX())
        .force("y", d3.forceY());

      // Add a line for each link, and a circle for each node.
      const link = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(linksRef.current)
        .join("line")
        .attr("stroke-width", 1);

      const node = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodesRef.current)
        .join("circle")
        .attr("r", 5)
        .attr("fill", "#FFC0CB");

      node.append("title").text((d) => (d.title ? d.title : d.id));

      // Add a drag behavior.
      // node.call(
      //   d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended),
      // );

      // Set the position attributes of links and nodes each time the simulation ticks.
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => (d.source as NodeD3).x!)
          .attr("y1", (d) => (d.source as NodeD3).y!)
          .attr("x2", (d) => (d.target as NodeD3).x!)
          .attr("y2", (d) => (d.target as NodeD3).y!);

        node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
      });

      // Reheat the simulation when drag starts, and fix the subject position.
      // function dragstarted(event: {
      //   active: any;
      //   subject: { fx: any; x: any; fy: any; y: any };
      // }) {
      //   if (!event.active) simulation.alphaTarget(0.3).restart();
      //   event.subject.fx = event.subject.x;
      //   event.subject.fy = event.subject.y;
      // }

      // // Update the subject (dragged node) position during drag.
      // function dragged(event: { subject: { fx: any; fy: any }; x: any; y: any }) {
      //   event.subject.fx = event.x;
      //   event.subject.fy = event.y;
      // }

      // // Restore the target alpha so the simulation cools after dragging ends.
      // // Unfix the subject position now that it’s no longer being dragged.
      // function dragended(event: { active: any; subject: { fx: null; fy: null } }) {
      //   if (!event.active) simulation.alphaTarget(0);
      //   event.subject.fx = null;
      //   event.subject.fy = null;
      // }
    }, [{ width, height }]);

    return <svg width={width} height={height} ref={svgRef}></svg>;
  }
}
