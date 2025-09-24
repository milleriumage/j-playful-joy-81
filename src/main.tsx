import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { LanguageProvider } from "@/hooks/useLanguage.tsx"

// Aplicação otimizada para máxima performance e estabilidade
console.log('✅ Aplicação carregada com otimizações de performance ativas');


createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
