/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_USE_MOCK_DEVQR?: string   
  readonly VITE_DEV_SIGNING_KEY?: string 
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
