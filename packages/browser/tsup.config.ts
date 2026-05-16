import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    minify: false,
    sourcemap: true,
    treeshake: true,
    target: 'es2022',
  },
  {
    entry: { 'analytics.min': 'src/snippet/index.ts' },
    format: ['iife'],
    globalName: 'SignakitAnalytics',
    minify: true,
    sourcemap: false,
    target: 'es2017',
    outDir: 'dist',
  },
])
