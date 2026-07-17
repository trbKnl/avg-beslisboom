import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/index.jsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  minify: !watch,
  jsx: 'automatic',
});

if (watch) {
  await ctx.watch();
  console.log('Watching...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Built dist/bundle.js');
}
