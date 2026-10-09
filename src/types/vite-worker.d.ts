/** Vite `?worker` imports (used by the Monaco web workers in lib/monaco.ts). */
declare module '*?worker' {
    const workerConstructor: new () => Worker
    export default workerConstructor
}
