import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { build } from 'esbuild';

const argv = yargs(hideBin(process.argv)).parseSync();


build({
  entryPoints: [argv.entryPoints as string || 'src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2019'],
  outdir: argv.outdir as string || 'dist',
  format: 'esm',
}).catch(() => process.exit(1));

