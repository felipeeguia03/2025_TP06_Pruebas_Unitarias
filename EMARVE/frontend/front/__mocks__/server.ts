import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// Configurar MSW server para Node.js (testing)
export const server = setupServer(...handlers)
