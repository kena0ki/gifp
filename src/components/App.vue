<template>
  <div class="spacer-1rem"></div>
  <div>
    <input ref="url" value="https://raw.githubusercontent.com/k0kubun/sqldef/master/demo.gif" />
    <button ref="load" @click="onClickLoad">Load</button>
  </div>
  <div>
    <input ref="progress-bar" type="range" @change="onChangeProgressBar" :value="frameIdx" :max="barMax" />
    <button ref="play" v-if="!isPlaying" @click="onClickPlay" :disabled="frames.length<1">Play</button>
    <button ref="stop" v-else @click="onClickStop">Stop</button>
  </div>
  <div class="spacer-1rem"></div>
  <div id="gif-area" @drop="onDropGifArea" @dragover="onDragoverGifArea">
    <img ref="gif" crossorigin alt="gif">
    <canvas ref="cvs"></canvas>
  </div>
  <div class="spacer-1rem"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { parseGIF, decompressFrames, ParsedFrame } from 'gifuct-js'
import u from '../util';

const DEFAULT_BAR_MAX = 100;
const cvs = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();
const tempCanvas = document.createElement('canvas');
const frames = ref<ParsedFrame[]>([]);
const frameIdx = ref(0);
const isPlaying = ref(false);
const images = ref<HTMLImageElement[]>([]);
const barMax = computed(() => frames.value.length<1?DEFAULT_BAR_MAX:frames.value.length-1)

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

const url = ref<HTMLInputElement>();
function onClickLoad() {
  const headers = { 'x-target': url.value!.value };
  console.log(headers);
  const proxyUrl = location.protocol + '//'+location.hostname + ':5001'
  fetch(proxyUrl, { headers, mode: 'cors' })
    .then(resp => resp.arrayBuffer())
    .then(buf => {
      const [frms, imgs] = u.loadGif(buf, cvs.value!, tempCanvas);
      frames.value = frms;
      images.value = imgs;
    }).catch(e => {
      console.error('Faild to get gif data:' + e)
    });
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
    const [frms, imgs] = u.loadGif(buf, cvs.value!, tempCanvas);
    frames.value = frms;
    images.value = imgs;
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
