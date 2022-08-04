import path from 'path'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [path.join(__dirname, 'src/index.ts')],
  dts: true,
  clean: true,
})
