<template>
  <div class="spacer-1rem"></div>
  <div>
    <input id="gif-url" value="https://raw.githubusercontent.com/k0kubun/sqldef/master/demo.gif" />
    <button id="load" @click="onClickLoad">Load</button>
  </div>
  <div>
    <input id="progress-bar" type="range" @change="onChangeProgressBar" :value="frameIdx" :max="maxFrameIdx" />
    <button id="play" v-if="!isPlaying" @click="onClickPlay" :disabled="frames.length<1">Play</button>
    <button id="stop" v-else @click="onClickStop">Stop</button>
  </div>
  <div class="spacer-1rem"></div>
  <div id="gif-area" @drop="onDropGifArea" @dragover="onDragoverGifArea">
    <img ref="gif" crossorigin alt="gif">
    <canvas ref="cvs"></canvas>
  </div>
  <div class="spacer-1rem"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { parseGIF, decompressFrames, ParsedFrame } from 'gifuct-js'

const cvs = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d')!;
const frames = ref<ParsedFrame[]>([]);
const frameIdx = ref(0);
const maxFrameIdx = ref(100);
const isPlaying = ref(false);

onMounted(() =>{
  ctx.value = cvs.value!.getContext('2d')!;
});

function onClickPlay() {
  isPlaying.value=true;
  loop();
  function loop() {
    if (!isPlaying.value) {
      return;
    }
    frameIdx.value = frameIdx.value < frames.value!.length-1 ? frameIdx.value+1 : 0;
    const frame = frames.value![frameIdx.value];
    if (frame.disposalType === 2) {
      tempCtx.clearRect(0,0,cvs.value!.width, cvs.value!.height);
    }
    const start = new Date().getTime();
    _drawPatch(frame);
    const end = new Date().getTime();
    const diff = end-start;
    console.log(diff);
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, 50);
  } 
}

function onClickStop() {
  isPlaying.value=false;
}

function onChangeProgressBar(evt: Event) {
  isPlaying.value=false;
  const input = evt.currentTarget as HTMLInputElement;
  const idx = +input.value;
  frameIdx.value = idx;
  const frame = frames.value![idx];
  setTimeout(() => {
    console.log(tempCtx);
    // tempCtx!.clearRect(0,0,cvs.value!.width, cvs.value!.height);
    _drawPatch(frame);
  });
}

function onClickLoad() {
  const img = ref<HTMLImageElement>();
  const url = document.getElementById('gif-url') as HTMLInputElement;
  img.value!.src = url.value;
};

// const gifCanvas = document.createElement('canvas');
// const gifCtx = gifCanvas.getContext('2d')!;
let frameImageData: ImageData;
function onDropGifArea(ev: DragEvent) {
  console.log('File(s) dropped');
  ev.preventDefault();
  const num = ev.dataTransfer?.items?.length;
  if (num && num > 1) {
    console.warn('More than one file was selected.')
  }
  const item = ev.dataTransfer?.items[0];
  if (item?.kind !== 'file') {
    console.error('This is not a file');
    return;
  }
  const file = ev.dataTransfer?.items[0].getAsFile();
  if (!file) {
    console.error('No file was selected');
    return;
  }
  file.arrayBuffer().then(buf => {
    const gif = parseGIF(buf);
    frames.value = decompressFrames(gif, true);
    if (frames.value.length === 0) {
      throw new Error('This file doesn\'t seem to be a gif.');
    }
    maxFrameIdx.value=frames.value.length-1;
    cvs.value!.width = frames.value[0].dims.width;
    cvs.value!.height = frames.value[0].dims.height;

    _drawPatch(frames.value[0]);

  }).catch(e => {
    console.error(e);
  });
};

function onDragoverGifArea(ev: DragEvent) {
  console.log('File(s) in drop zone');
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
};

function _drawPatch(frame: ParsedFrame) {
  const dims = frame.dims

  if (
    !frameImageData ||
    dims.width != frameImageData.width ||
    dims.height != frameImageData.height
  ) {
    tempCanvas.width = dims.width
    tempCanvas.height = dims.height
    frameImageData = tempCtx.createImageData(dims.width, dims.height)
  }

  // set the patch data as an override
  frameImageData.data.set(frame.patch)

  // draw the patch back over the canvas
  tempCtx.putImageData(frameImageData, 0, 0)

  ctx.value!.drawImage(tempCanvas, dims.left, dims.top)
}

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
#gif-area {
  min-width: 300px;
  min-height: 300px;
  background-color: #FFD2D2;
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
