/* eslint-disable no-console */
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import '@unocss/reset/tailwind.css'
import 'uno.css'

const CONTENT_SCRIPT = 'fisand-contentscript'
const INPAGE = 'fisand-inpage'

const setupPageStream = () => {
  const pageStream = new WindowPostMessageStream({
    name: CONTENT_SCRIPT,
    target: INPAGE,
  })

  pageStream.on('data', (data) => {
    console.log(data + ', world')
    setTimeout(() => {
      pageStream.write('callback')
    }, 1500)
  })
}

// init stream
export default (() => {
  setupPageStream()
})()

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
// eslint-disable-next-line import/newline-after-import
;(() => {
  console.info('[webext-template] Hello world from content script')

  {
    const container = document.head || document.documentElement
    const scriptEl = document.createElement('script')
    scriptEl.setAttribute('src', browser.runtime.getURL('dist/contentScripts/sdk.global.js'))
    container.insertBefore(scriptEl, container.children[0])
  }

  setTimeout(() => {
    // mount component to context window
    const container = document.createElement('div')
    const root = document.createElement('div')
    container.className = 'webext-template'
    const styleEl = document.createElement('link')
    const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container

    styleEl.setAttribute('rel', 'stylesheet')
    styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))

    shadowDOM.appendChild(styleEl)
    shadowDOM.appendChild(root)
    document.body.appendChild(container)
    // const $root = createRoot(root)
    // $root.render(<App />)
  }, 100)
})()
