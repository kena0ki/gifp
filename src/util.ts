import type { ParsedFrame } from 'gifuct-js'

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

  frameImageData.data.set(frm.patch)

  // draw the patch back over the canvas
  tmpCtx.putImageData(frameImageData, 0, 0)

  ctx!.drawImage(workCvs, dims.left, dims.top)
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
};