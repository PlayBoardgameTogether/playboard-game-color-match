import { copyFile, mkdir } from 'node:fs/promises';
import { URL } from 'node:url';

await copyFile(
  new URL('./src/client/style.css', import.meta.url),
  new URL('./dist/client/style.css', import.meta.url),
);
await copyFile(new URL('./src/client/first-hand.css', import.meta.url), new URL('./dist/client/first-hand.css', import.meta.url));

await mkdir(new URL('./dist/legacy/assets/', import.meta.url), { recursive: true });
await copyFile(new URL('./src/legacy/assets/manifest.json', import.meta.url), new URL('./dist/legacy/assets/manifest.json', import.meta.url));
