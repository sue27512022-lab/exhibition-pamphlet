import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import fs from 'fs';
import path from 'path';

function htmlIncludePlugin() {
  return {
    name: 'html-include',
    transformIndexHtml(html) {
      return html.replace(/<!--#include file="(.*?)"-->/g, (match, filePath) => {
        try {
          const absolutePath = path.resolve(__dirname, filePath);
          return fs.readFileSync(absolutePath, 'utf-8');
        } catch (e) {
          console.error(`Include error for file: ${filePath}`, e);
          return match;
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [
    htmlIncludePlugin(),
    ViteImageOptimizer({
      exclude: ['mp2z0vhh-Gemini_Generated_Image_up_2.png'],
      png: { quality: 80 },
      jpg: { quality: 80 },
      jpeg: { quality: 80 },
    }),
    viteSingleFile()
  ]
});
