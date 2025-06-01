<script>
  import { onMount } from "svelte";
  import { getDCProjection } from "../utils/projection.js";
  import * as d3 from "d3";

  let svgContainer;

  onMount(() => {
    const width = svgContainer.clientWidth;
    const height = svgContainer.clientHeight;

    const projection = getDCProjection(width, height);
    const path = d3.geoPath().projection(projection);

    const svg = d3.select(svgContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    svg.append("circle")
      .attr("cx", projection([-77.0377, 38.8521])[0])  // DCA
      .attr("cy", projection([-77.0377, 38.8521])[1])
      .attr("r", 5)
      .attr("fill", "#ff6b6b");

    svg.append("circle")
      .attr("cx", projection([-77.4558, 38.9445])[0])  // IAD
      .attr("cy", projection([-77.4558, 38.9445])[1])
      .attr("r", 5)
      .attr("fill", "#4ecdc4");

    svg.append("circle")
      .attr("cx", projection([-76.6684, 39.1754])[0])  // BWI
      .attr("cy", projection([-76.6684, 39.1754])[1])
      .attr("r", 5)
      .attr("fill", "#45b7d1");
  });
</script>

<style>
  div {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>

<div bind:this={svgContainer}></div>
