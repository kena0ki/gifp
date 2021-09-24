import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { build } from 'esbuild';
import { vue3Plugin } from 'esbuild-plugin-vue-iii';
import path from 'path';
import { promises as fs } from 'fs';

const argv = yargs(hideBin(process.argv)).parseSync();

(async function () {
  // static to public
  const src = path.resolve(__dirname, '..', 'static');
  const dest = path.resolve(__dirname,'..', 'public');
  try {
    await fs.access(dest);
    await fs.rmdir(dest, { recursive:true });
  } catch { /* noop */ }
  await fs.mkdir(dest);
  const files = await fs.readdir(src);
  for (const file of files) {
    await fs.copyFile(path.resolve(src, file), path.resolve(dest, file));
  }

  // build
  await build({
    entryPoints: [argv.entryPoints as string || 'src/main.ts'],
    bundle: true,
    minify: !process.env.DEBUG,
    sourcemap: true,
    target: ['es2019'],
    outdir: argv.outdir as string || 'public',
    format: 'esm',
    loader: { '.svg': 'file', '.jpg': 'file' },
    // publicPath: 'static',
    plugins: [ vue3Plugin() ],
    define: { DEBUG: process.env.DEBUG ? 'true' : 'false' },
  }).catch(() => process.exit(1));
})();

