import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { build } from 'esbuild';
import { vue3Plugin } from 'esbuild-plugin-vue-iii';

const argv = yargs(hideBin(process.argv)).parseSync();


build({
  entryPoints: [argv.entryPoints as string || 'src/main.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2019'],
  outdir: argv.outdir as string || 'static',
  format: 'esm',
  loader: { '.svg': 'file' },
  publicPath: 'static',
  plugins: [ vue3Plugin() ],
}).catch(() => process.exit(1));

