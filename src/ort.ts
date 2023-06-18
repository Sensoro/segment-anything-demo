import { env } from 'onnxruntime-web';

import wasm from 'onnxruntime-web/dist/ort-wasm.wasm?url'
import wasmThreaded from 'onnxruntime-web/dist/ort-wasm-threaded.wasm?url'
import wasmSimd from 'onnxruntime-web/dist/ort-wasm-simd.wasm?url'
import wasmSimdThreaded from 'onnxruntime-web/dist/ort-wasm-simd-threaded.wasm?url'

env.wasm.wasmPaths = {
  'ort-wasm-simd-threaded.wasm': wasmSimdThreaded,
  'ort-wasm-simd.wasm': wasmSimd,
  'ort-wasm-threaded.wasm': wasmThreaded,
  'ort-wasm.wasm': wasm,
};
