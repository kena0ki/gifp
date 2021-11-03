<template>
  <h4 class="head">
   {{ "Click the load button below.\nYou can play and stop animated GIF files hosted on the Web." }}
  </h4>
  <div class="input-url-container">
    <InputText class="input-url" :value="url" @change="onChangeUrl"/>
  </div>
  <div class="load-button">
    <button ref="load" class="square_btn" @click="onClickLoad" :disabled="!url">Load</button>
  </div>
  <div class="message" v-if="msgObj" :message-type="msgObj.type">
    {{ msgObj.message }}
    <div class="load-error" v-if="msgObj.id === 'E001'">
      Are you sure this <a :href="url" target="_brank">URL</a> is truly a GIF.
    </div>
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
    <div class="gif-placeholder" v-if="!loadDone && !loading">GIF files are renderd here!</div>
    <img v-if="loading" src="../assets/waiting-icon-gif-20.jpg" />
    <canvas v-show="loadDone && !loading" ref="cvs"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { ParsedFrame } from 'gifuct-js'
import u from '../util';
import InputText from './InputText.vue';
import c from '../config';

const MESSAGES = {
  E001: { id: 'E001', type: 'error', message: 'Faild to load a GIF file.'},
  E002: { id: 'E002', type: 'error', message: 'This is not a file.'},
  E003: { id: 'E003', type: 'error', message: 'No file was found.'},
  W001: { id: 'W001', type: 'warning', message: 'More than one file was selected.'},
};
const msgObj = ref<{ id: string, type: string, message: string}|undefined>();
const DEFAULT_BAR_MAX = 100;
const cvs = ref<HTMLCanvasElement>();
const ctx = ref<CanvasRenderingContext2D>();
const tempCanvas = document.createElement('canvas');
const frames = ref<ParsedFrame[]>([]);
const frameIdx = ref(0);
const isPlaying = ref(false);
const cacheImages = ref<ImageData[]>([]);
const barMax = computed(() => frames.value.length<1?DEFAULT_BAR_MAX:frames.value.length-1)
const loadDone = computed(() => frames.value.length>0);
const url = ref<string>('https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif');
// https://upload.wikimedia.org/wikipedia/commons/d/dc/BITDemo.gif
// https://onlineimagetools.com/images/examples-onlineimagetools/owl-flying-animated.gif
// https://github.com/vmarcosp/findr/blob/master/assets/find.gif?raw=true
const loading = ref(false);

onMounted(() =>{
  ctx.value = cvs.value!.getContext('2d')!;
  if (location.pathname?.length > 1) {
    url.value = 'https:/' + location.pathname;
    onClickLoad();
  }
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
    u.log(delay);
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
    u.log(cacheImages.value);
    ctx.value!.clearRect(0,0,cvs.value!.width, cvs.value!.height);
    ctx.value!.putImageData(cacheImages.value[idx],0,0);
  });
}

function onClickLoad() {
  msgObj.value = undefined;
  loading.value = true;
  const targetUrl = c.PROXY_ORIGIN + '/' + url.value.replace(/https?:\/\//,'');
  history.pushState({}, document.title, '/' + url.value.replace(/https?:\/\//,''));
  fetch(targetUrl)
    .then(resp => resp.arrayBuffer())
    .then(buf => {
      const [frms, imgs] = u.loadGif(buf, cvs.value!, tempCanvas);
      frames.value = frms;
      cacheImages.value = imgs;
      loading.value = false;
      frameIdx.value = 0;
    }).catch(e => {
      console.error(MESSAGES.E001, url.value, e)
      msgObj.value = MESSAGES.E001;
      loading.value = false;
    });
};

const cvs2 = ref<HTMLCanvasElement>();
// const gifCanvas = document.createElement('canvas');
// const gifCtx = gifCanvas.getContext('2d')!;
function onDropGifArea(ev: DragEvent) {
  msgObj.value = undefined;
  u.log('File(s) dropped');
  ev.preventDefault();
  const num = ev.dataTransfer?.items?.length;
  if (num && num > 1) {
    console.warn(MESSAGES.W001.message);
    msgObj.value = MESSAGES.W001;
  }
  const item = ev.dataTransfer?.items[0];
  if (item?.kind !== 'file') {
    console.error(MESSAGES.E002.message);
    msgObj.value = MESSAGES.E002;
    return;
  }
  const file = ev.dataTransfer?.items[0].getAsFile();
  if (!file) {
    console.error(MESSAGES.E003.message);
    msgObj.value = MESSAGES.E003;
    return;
  }

  file.arrayBuffer().then(buf => {
    loading.value = true;
    const [frms, imgs] = u.loadGif(buf, cvs.value!, tempCanvas);
    frames.value = frms;
    cacheImages.value = imgs;
    frameIdx.value = 0;
    loading.value = false;
  }).catch(e => {
    console.error(MESSAGES.E001, e);
    msgObj.value = { ...MESSAGES.E001, id: '' };
  });
};

function onDragoverGifArea(ev: DragEvent) {
  u.log('File(s) in drop zone');
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
.head {
  white-space: pre-wrap;
}
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
  margin-bottom: 1rem;
}

.gif-placeholder {
  width: 300px;
  height: 300px;
  background-color: #fff1f1;
  justify-content: center;
}

.input-url-container {
  flex-direction: row;
  align-self: stretch;
  margin-bottom: .5rem;
  justify-content: center;
}
.input-url {
  width: 600px;
  max-width: 90%;
}
.load-button {
  margin: .5rem 0;
}
.slider-area {
  flex-direction: row;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: .5rem;
}
.message {
    margin: 0.5em 0px;
    padding: 0.6em;
    border-radius: .3em;
    white-space: pre-wrap;
    width: 80%;
    max-width: 500px;
}
.message[message-type=info] {
    color: #00529B;
    background-color: #BDE5F8;
    box-shadow: 0 0 3px #00529B;
}
.message[message-type=success] {
    color: #4F8A10;
    background-color: #DFF2BF;
    box-shadow: 0 0 3px #00529B;
}
.message[message-type=warning] {
    color: #9F6000;
    background-color: #FEEFB3;
    box-shadow: 0 0 3px #9F6000;
}
.message[message-type=error] {
    color: #D8000C;
    background-color: #FFD2D2;
    box-shadow: 0 0 3px #D8000C;
}
.load-error {
  display: block;
}
</style>
