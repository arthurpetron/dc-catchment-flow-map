<script>
  import { onMount, onDestroy } from "svelte";
  import { simulateFlows } from "../utils/simulation.js";
  import * as d3 from "d3";

  export let width;
  export let height;
  export let hour = 8;
  export let dayType = "weekday";

  let svgContainer;
  let svg, group;

  function renderFlows(flows) {
    group.selectAll("line").remove();

    group.selectAll("line")
      .data(flows)
      .enter()
      .append("line")
      .attr("x1", d => projection(d.origin)[0])
      .attr("y1", d => projection(d.origin)[1])
      .attr("x2", d => projection(d.destination)[0])
      .attr("y2", d => projection(d.destination)[1])
      .attr("stroke", d => {
        return d.airportCode === "DCA" ? "#ff6b6b" :
               d.airportCode === "IAD" ? "#4ecdc4" :
               "#45b7d1";
      })
      .attr("stroke-width", d => Math.sqrt(d.passengers) / 5)
      .attr("stroke-opacity", 0.4)
      .attr("stroke-dasharray", "4 2");
  }

  let projection;

  function update() {
    const flows = simulateFlows(hour, dayType);
    renderFlows(flows);
  }

  onMount(() => {
    svg = d3.select(svgContainer)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    group = svg.append("g");

    projection = d3.geoMercator()
      .center([-77.1, 38.9])
      .scale(Math.min(width, height) * 100)
      .translate([width / 2, height / 2]);

    update();
  });

  $: if (svg && group) {
    update();
  }

  onDestroy(() => {
    if (svg) svg.remove();
  });
</script>

<style>
  div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>

<div bind:this={svgContainer}></div>
