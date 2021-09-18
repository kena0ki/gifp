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
    <canvas ref="cvs2"></canvas>
  </div>
  <div class="spacer-1rem"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { parseGIF, decompressFrames, ParsedFrame } from 'gifuct-js'
import u from '../util';

const cvs = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();
const tempCanvas = document.createElement('canvas');
const tempCtx = tempCanvas.getContext('2d')!;
const frames = ref<ParsedFrame[]>([]);
const frameIdx = ref(0);
const maxFrameIdx = ref(100);
const isPlaying = ref(false);
const cacheImages = ref<HTMLCanvasElement[]>([]);
const images = ref<HTMLImageElement[]>([]);

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
    const start = new Date().getTime();
    frameIdx.value = frameIdx.value < frames.value!.length-1 ? frameIdx.value+1 : 0;
    const frame = frames.value![frameIdx.value];
    u.drawPatch(frame, cvs.value!, tempCanvas);
    const end = new Date().getTime();
    const delay = frame.delay - (end-start);
    console.log(delay);
    setTimeout(() => {
      requestAnimationFrame(loop);
    }, delay);
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
  setTimeout(() => {
    console.log(images.value);
    ctx.value!.drawImage(images.value[idx],0,0);
  });
}

function onClickLoad() {
  const img = ref<HTMLImageElement>();
  const url = document.getElementById('gif-url') as HTMLInputElement;
  img.value!.src = url.value;
};

const cvs2 = ref<HTMLCanvasElement>();
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
    u.drawPatch(frames.value[0], cvs.value!, tempCanvas);

    let i=0;
    cacheImages.value = [];
    images.value =[];
    const cacheCanvas = cvs2.value!;
    const cacheTempCanvas = document.createElement('canvas');
    cacheCanvas.width = frames.value[0].dims.width;
    cacheCanvas.height = frames.value[0].dims.height;
    cache();
    function cache() {
      if (i >= frames.value.length) return;
      u.drawPatch(frames.value[i], cacheCanvas, cacheTempCanvas);
      cacheCanvas.toBlob(makeCallback());
      function makeCallback(): BlobCallback {
        const cnt = i; // capture
        return blob => {
          const image = new Image;
          image.src = URL.createObjectURL(blob);
          console.log(cnt);
          images.value[cnt] = image;
        };
      };
      requestIdleCallback(cache);
      i++;
    }
  }).catch(e => {
    console.error(e);
  });
};

function onDragoverGifArea(ev: DragEvent) {
  console.log('File(s) in drop zone');
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
};
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
