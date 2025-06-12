import { ThemeProvider } from '@/components/theme-provider';
import { ExpenseProvider } from '@/context/ExpenseContext';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/toaster';

import './App.css';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="expense-tracker-theme">
      <ExpenseProvider>
        <Layout />
        <Toaster />
      </ExpenseProvider>
    </ThemeProvider>
  );
}

export default App;