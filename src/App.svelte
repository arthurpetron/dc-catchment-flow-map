<script>
  import MapCanvas from './components/MapCanvas.svelte';
  import FlowLines from './components/FlowLines.svelte';

  let hour = 8;
  let dayType = 'weekday';

  function handleHourChange(event) {
    hour = +event.target.value;
  }

  function handleDayTypeChange(event) {
    dayType = event.target.value;
  }

  let width = window.innerWidth;
  let height = window.innerHeight;

  function updateSize() {
    width = window.innerWidth;
    height = window.innerHeight;
  }

  window.addEventListener('resize', updateSize);
</script>

<style>
  main {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    position: relative;
  }

  .controls {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0,0,0,0.75);
    color: white;
    padding: 12px;
    border-radius: 8px;
    font-family: sans-serif;
    z-index: 10;
  }

  .controls label {
    display: block;
    margin-bottom: 6px;
  }

  .controls input,
  .controls select {
    width: 100%;
    margin-bottom: 10px;
  }
</style>

<main>
  <div class="controls">
    <label for="hour">Hour: {hour}:00</label>
    <input type="range" min="0" max="23" bind:value={hour} id="hour" on:input={handleHourChange} />
    
    <label for="dayType">Day Type:</label>
    <select id="dayType" bind:value={dayType} on:change={handleDayTypeChange}>
      <option value="weekday">Weekday</option>
      <option value="weekend">Weekend</option>
    </select>
  </div>

  <MapCanvas />
  <FlowLines {width} {height} {hour} {dayType} />
</main>
