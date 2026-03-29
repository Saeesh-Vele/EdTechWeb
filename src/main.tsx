import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/modules.css'
import App from './App.tsx'
import { CourseProvider } from './context/CourseContext'
import { AuthProvider } from './context/AuthContext'
import { ErrorBoundary } from './components/ErrorBoundary'

const rootElement = document.getElementById('root');
if (rootElement) {
  console.log("Root element found, rendering application...");
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <CourseProvider>
              <App />
            </CourseProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
} else {
  console.error("Failed to find the root element");
}

