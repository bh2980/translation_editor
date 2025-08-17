import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// Minimal dev API endpoint compatible with the existing Next.js route.
// This only runs in dev via Vite's middleware. For production,
// consider extracting to a tiny Node server using the same handler.
function translateApiDevPlugin() {
  return {
    name: 'dev-translate-api',
    configureServer(server: any) {
      server.middlewares.use('/api/translate', async (req: any, res: any) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        try {
          const body = await new Promise<string>((resolve, reject) => {
            let data = ''
            req.on('data', (chunk: Buffer) => (data += chunk.toString()))
            req.on('end', () => resolve(data))
            req.on('error', reject)
          })

          const {
            provider,
            apiKey,
            apiEndpoint,
            model,
            promptTemplate,
            text,
            sourceLang,
            targetLang,
            glossary,
            projectId,
          } = JSON.parse(body || '{}')

          if (!model) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing model' }))
            return
          }
          if (provider !== 'local' && !apiKey) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing API key' }))
            return
          }
          if (provider === 'local' && !apiEndpoint) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Missing API endpoint for local LLM' }))
            return
          }

          // Lazy load only in dev Node context
          const { generateText } = await import('ai')
          const { openai } = await import('@ai-sdk/openai')
          const { xai } = await import('@ai-sdk/xai')
          const { anthropic } = await import('@ai-sdk/anthropic')
          const { google } = await import('@ai-sdk/google')

          const glossaryLines = (glossary ?? [])
            .filter((g: any) => g.source && g.target)
            .map((g: any) => `- ${g.source} -> ${g.target}${g.notes ? ` (${g.notes})` : ''}`)
            .join('\n')

          const prompt = (promptTemplate || '')
            .replaceAll('{{sourceLang}}', sourceLang)
            .replaceAll('{{targetLang}}', targetLang)
            .replaceAll('{{glossary}}', glossaryLines || 'None')

          let modelInstance: any
          switch (provider) {
            case 'openai':
              modelInstance = openai(model, { apiKey })
              break
            case 'xai':
              modelInstance = xai(model, { apiKey })
              break
            case 'claude':
              modelInstance = anthropic(model, { apiKey })
              break
            case 'gemini':
              modelInstance = google(model, { apiKey })
              break
            case 'local':
              modelInstance = openai(model, { baseURL: apiEndpoint, apiKey: 'local' })
              break
            default:
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Unsupported provider' }))
              return
          }

          const { text: output } = await generateText({
            model: modelInstance,
            prompt: `${prompt}\n\nText:\n${text}`,
          })

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ text: output }))
        } catch (e: any) {
          console.error('Translation error:', e)
          res.statusCode = 500
          res.end(JSON.stringify({ error: e?.message || 'AI translation failed' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), translateApiDevPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
