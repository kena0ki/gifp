<template>
  <div class="spacer-1rem"></div>
  <div>
    <input id="gif-url" value="https://raw.githubusercontent.com/k0kubun/sqldef/master/demo.gif" />
    <button id="load" >Load</button>
  </div>
  <div class="spacer-1rem"></div>
  <div class="gif-area">
    <img id="gif" crossorigin alt="gif">
  </div>
  <div class="spacer-1rem"></div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue';
export default defineComponent({
  name: 'App',
  setup() {
    onMounted(() => {
      const load = document.getElementById('load') as HTMLButtonElement;
      const img = document.getElementById('gif') as HTMLImageElement;
      load.addEventListener('click', () => {
        const url = document.getElementById('gif-url') as HTMLInputElement;
        img.src = url.value;
      });
    });
  },
  methods: {
  },
});
function getDataUrl(img: HTMLImageElement) {
   // Create canvas
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d')!;
   // Set width and height
   canvas.width = img.width;
   canvas.height = img.height;
   // Draw the image
   ctx.drawImage(img, 0, 0);
   return canvas.toDataURL('image/jpeg');
}
</script>

<style>
.gif-area {
  min-width: 300px;
  min-height: 300px;
}
.spacer-1rem {
  height: 1rem;
}
.spacer-2rem {
  height: 2rem;
}
.input-area {
  text-align: center;
}
.output-area {
  text-align: center;
}
.input-area-create-statement-container {
  width: 100%;
  height: 40vh;
}
.input-area-create-statement {
  width: 90%;
  height: 100%;
  margin: auto;
  text-align: left;
}
.input-area-button,
.output-area-button {
  margin: .3em;
  border-radius: 5px;
}
.options-header {
  text-align: center;
}
.options-form {
  padding: .5em;
}
.general-options-header {
  margin-top: 0;
}
.indent-05 {
  padding-left: .5em;
}
.options.select {
  font-size: revert;
  height: revert;
  margin: .5em;
}
.options.input {
  font-size: revert;
  margin: .5em;
}
.generated-data-container {
  width: 100%;
  height: 40vh;
  text-align: left;
}
.generated-data {
  height: 100%;
  width: 94%;
  margin: auto;
  overflow-x: auto;
  white-space: pre;
  box-shadow: inset 0px 0px 1px 1px #eee;
}
.column-options-add,
.column-options-del {
  margin-left: 1em;
  font-size: 60%;
}
.accordion-button {
  background-color: #fff;
  cursor: pointer;
  padding: 0;
  border: none;
  outline: none;
  transition: 0.4s;
}
.accordion-panel {
  max-height: 0px;
  display: none;
  transition: max-height 0.2s ease-out;
}
.accordion-container.active>.accordion-panel {
  max-height: none;
  display: block;
}
.options-callback-function {
  width: 100%;
  height: 80vh;
}

.isa_info, .isa_success, .isa_warning, .isa_error {
    margin: 0.5em 0px;
    padding: 0.6em;
    border-radius: .3em;
    white-space: pre-wrap;
}
.isa_info {
    color: #00529B;
    background-color: #BDE5F8;
    box-shadow: 0 0 3px #00529B;
}
.isa_success {
    color: #4F8A10;
    background-color: #DFF2BF;
    box-shadow: 0 0 3px #00529B;
}
.isa_warning {
    color: #9F6000;
    background-color: #FEEFB3;
    box-shadow: 0 0 3px #9F6000;
}
.isa_error {
    color: #D8000C;
    background-color: #FFD2D2;
    box-shadow: 0 0 3px #D8000C;
}
</style>
