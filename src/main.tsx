import { render } from 'preact'
import { App } from './app.tsx'
import { installAgentApi } from './lib/agent-api.ts'
import './styles/global.css'

installAgentApi()
render(<App />, document.getElementById('app')!)
