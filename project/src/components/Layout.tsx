import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ExpenseList } from '@/components/ExpenseList';
import { ExpenseAnalytics } from '@/components/ExpenseAnalytics';
import { ModeToggle } from '@/components/ModeToggle';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('add');

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <header className="container mx-auto flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Expense Manager</h1>
        <ModeToggle />
      </header>

      <main className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="add">Add Expense</TabsTrigger>
            <TabsTrigger value="list">View Expenses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <ExpenseForm onSuccess={() => setActiveTab('list')} />
          </TabsContent>
          
          <TabsContent value="list">
            <ExpenseList />
          </TabsContent>
          
          <TabsContent value="analytics">
            <ExpenseAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Layout;