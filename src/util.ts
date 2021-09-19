import { parseGIF, decompressFrames, ParsedFrame } from 'gifuct-js';

function drawPatch(frm: ParsedFrame, cvs: HTMLCanvasElement, workCvs: HTMLCanvasElement) {
  const ctx = cvs.getContext('2d')!;
  const tmpCtx = workCvs.getContext('2d')!;
  const dims = frm.dims;

  if (frm.disposalType === 2) {
    tmpCtx.clearRect(0,0,cvs.width, cvs.height);
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
  : [ParsedFrame[], HTMLImageElement[]] {
  const gif = parseGIF(buf);
  const frames = decompressFrames(gif, true);
  if (frames.length === 0) {
    throw new Error('This file doesn\'t seem to be a gif.');
  }
  cvs!.width = frames[0].dims.width;
  cvs!.height = frames[0].dims.height;
  drawPatch(frames[0], cvs!, workCanvas);

  let i = 0;
  const images: HTMLImageElement[] = [];
  const cacheCanvas = document.createElement('canvas');
  const cacheTempCanvas = document.createElement('canvas');
  cacheCanvas.width = frames[0].dims.width;
  cacheCanvas.height = frames[0].dims.height;
  cache();
  function cache() {
    if (i >= frames.length) return;
    drawPatch(frames[i], cacheCanvas, cacheTempCanvas);
    cacheCanvas.toBlob(makeCallback());
    function makeCallback(): BlobCallback {
      const cnt = i; // capture
      return blob => {
        const image = new Image;
        image.src = URL.createObjectURL(blob);
        console.log(cnt);
        images[cnt] = image;
      };
    }
    requestIdleCallback(cache);
    i++;
  }
  return [frames, images];
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

export default {
  drawPatch,
  getDataUrl,
  loadGif,
};