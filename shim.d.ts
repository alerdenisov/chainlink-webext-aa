import { ProtocolWithReturn } from 'webext-bridge'

declare module 'webext-bridge' {
  export interface ProtocolMap {
    // define message protocol types
    // see https://github.com/antfu/webext-bridge#type-safe-protocols
    'runFork': Promise<unknown>
  }
}

declare module '@metamask/post-message-stream' {
  interface WindowPostMessageStream<P = any, D = any> {
    on: (type: 'data' | 'error', cb: (data: D) => void) => void
    write: (data: P) => boolean
  }
}

declare global {
  interface Window {
    fisand: any
  }
}
