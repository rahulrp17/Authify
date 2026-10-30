import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthProvider';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ScrollToTop } from './routes/ScrollToTop';
import { AppRoutes } from './routes/AppRoutes';

export const App = () => (
  <ErrorBoundary>
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#1a1a1a',
              border: '2px solid #3a3a3a',
              borderRadius: 0,
              color: '#ffffff',
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
