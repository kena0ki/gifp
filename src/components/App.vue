<template>
  <div class="input-url">
    <InputText :value="url" @change="onChangeUrl"/>
  </div>
  <div class="load-button">
    <button ref="load" class="square_btn" @click="onClickLoad">Load</button>
  </div>
  <div class="slider-area">
    <div>
      <input type="range" @change="onChangeProgressBar" :value="frameIdx" :max="barMax" :disabled="!loadDone"/>
    </div>
    <div>
      <button ref="play" class="square_btn small" v-if="!isPlaying" @click="onClickPlay" :disabled="!loadDone">play</button>
      <button ref="stop" class="square_btn small" v-else @click="onClickStop">stop</button>
    </div>
  </div>
  <div class="gif-area" @drop="onDropGifArea" @dragover="onDragoverGifArea">
    <div class="gif-placeholder" v-if="!loadDone && !loading">Load a gif file from a URL.</div>
    <img v-if="loading" src="../assets/waiting-icon-gif-20.jpg" />
    <canvas v-show="loadDone && !loading" ref="cvs"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { ParsedFrame } from 'gifuct-js'
import u from '../util';
import InputText from './InputText.vue';

const DEFAULT_BAR_MAX = 100;
const cvs = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();
const tempCanvas = document.createElement('canvas');
const frames = ref<ParsedFrame[]>([]);
const frameIdx = ref(0);
const isPlaying = ref(false);
const images = ref<HTMLImageElement[]>([]);
const barMax = computed(() => frames.value.length<1?DEFAULT_BAR_MAX:frames.value.length-1)
const loadDone = computed(() => frames.value.length>0);
const url = ref<string>('https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif');
// https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif
// https://raw.githubusercontent.com/k0kubun/sqldef/master/demo.gif
// https://onlineimagetools.com/images/examples-onlineimagetools/owl-flying-animated.gif
const loading = ref(false);

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
  loading.value = true;
  const headers = { 'x-target': url.value };
  console.log(headers);
  const proxyUrl = location.protocol + '//'+location.hostname + ':5001'
  fetch(proxyUrl, { headers, mode: 'cors' })
    .then(resp => resp.arrayBuffer())
    .then(buf => {
      const [frms, imgs] = u.loadGif(buf, cvs.value!, tempCanvas);
      frames.value = frms;
      images.value = imgs;
      loading.value = false;
    }).catch(e => {
      console.error('Faild to get gif data:' + e)
      loading.value = false;
    });
};

const cvs2 = ref<HTMLCanvasElement>();
// const gifCanvas = document.createElement('canvas');
// const gifCtx = gifCanvas.getContext('2d')!;
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
}

function onChangeUrl(evt: Event) { 
  if (evt.target instanceof HTMLInputElement) {
    const input = evt.target;
    url.value = input.value;
  }
}
</script>

<style>
.square_btn {
    display: inline-block;
    padding: 0.3em 1em;
    text-decoration: none;
    color: #606060;
    border: solid 1px #606060;
    border-radius: 3px;
    background: #fff;
}
.square_btn[disabled] {
  opacity: .6;
}
.square_btn:hover {
  cursor: pointer;
}
.square_btn:hover:disabled {
  cursor: revert;
}
.square_btn:active {
    color: #fff;
    background-color: #606060;
}
.small {
  font-size: .7rem;
}

.gif-area {
  max-width: 96vw;
}

.gif-placeholder {
  width: 300px;
  height: 300px;
  background-color: #fff1f1;
  justify-content: center;
}

.input-url {
  flex-direction: row;
  align-self: stretch;
  margin-top: 2rem;
  margin-bottom: .5rem;
  justify-content: center;
}
.load-button {
  margin: .5rem 0 1rem;
}
.slider-area {
  flex-direction: row;
  align-items: center;
  margin-bottom: .5rem;
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
