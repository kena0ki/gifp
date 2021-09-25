import { parseGIF, decompressFrames, ParsedFrame } from 'gifuct-js';

function drawPatch(frm: ParsedFrame, cvs: HTMLCanvasElement, workCvs: HTMLCanvasElement) {
  const ctx = cvs.getContext('2d')!;
  const tmpCtx = workCvs.getContext('2d')!;
  const dims = frm.dims;

  if (frm.disposalType === 2) {
    ctx.clearRect(0,0,cvs.width, cvs.height);
  }

  workCvs.width = dims.width;
  workCvs.height = dims.height;
  const frameImageData = tmpCtx.createImageData(dims.width, dims.height);

  frameImageData.data.set(frm.patch);

  // draw the patch back over the canvas
  tmpCtx.putImageData(frameImageData, 0, 0);

  ctx!.drawImage(workCvs, dims.left, dims.top);
}

function loadGif(buf: ArrayBuffer, cvs: HTMLCanvasElement, workCanvas: HTMLCanvasElement)
  : [ParsedFrame[], ImageData[]] {
  const gif = parseGIF(buf);
  const frames = decompressFrames(gif, true);
  if (frames.length === 0) {
    throw new Error('This file doesn\'t seem to be a gif.');
  }
  cvs!.width = frames[0].dims.width;
  cvs!.height = frames[0].dims.height;
  drawPatch(frames[0], cvs!, workCanvas);

  let i = 0;
  const cacheImages: ImageData[] = [];
  const cacheCanvas = document.createElement('canvas');
  const cacheCtx = cacheCanvas.getContext('2d')!;
  const cacheTempCanvas = document.createElement('canvas');
  cacheCanvas.width = frames[0].dims.width;
  cacheCanvas.height = frames[0].dims.height;
  const start = Date.now();
  cache();
  function cache() {
    if (i >= frames.length) {
      log('cache done!', `took ${Date.now() - start}ms.`);
      return;
    }
    drawPatch(frames[i], cacheCanvas, cacheTempCanvas);
    const imageData = cacheCtx.getImageData(0,0,cacheCanvas.width, cacheCanvas.height);
    cacheImages[i] = imageData;
    requestIdleCallback(cache);
    i++;
  }
  return [frames, cacheImages];
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

const log: typeof console.log = DEBUG ? console.log : () => {};

export default {
  drawPatch,
  getDataUrl,
  loadGif,
  log,
};