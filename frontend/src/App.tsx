import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppContent } from './components/AppContent';
import { ScrollToTop } from './components/ScrollToTop';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <AppContent />
            <ScrollToTop />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}