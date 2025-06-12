import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { addMonths, startOfMonth, endOfMonth, subDays, startOfDay } from 'date-fns';

export type Category = 'Rental' | 'Groceries' | 'Entertainment' | 'Travel' | 'Others';
export type PaymentMode = 'UPI' | 'Credit Card' | 'Net Banking' | 'Cash';
export type DateFilter = 'This month' | 'Last 30 days' | 'Last 90 Days' | 'All time';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  notes: string;
  date: Date;
  paymentMode: PaymentMode;
}

interface MonthlyExpenseData {
  month: string;
  [key: string]: number | string;
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  getFilteredExpenses: (dateFilter: DateFilter, categories: Category[], paymentModes: PaymentMode[]) => Expense[];
  getMonthlyExpensesByCategory: () => MonthlyExpenseData[];
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider = ({ children }: ExpenseProviderProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load expenses from localStorage on initial render
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    if (savedExpenses) {
      try {
        // Parse the JSON and convert date strings back to Date objects
        const parsedExpenses = JSON.parse(savedExpenses).map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        }));
        setExpenses(parsedExpenses);
      } catch (error) {
        console.error('Failed to parse expenses from localStorage:', error);
      }
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
  };

  const getFilteredExpenses = (
    dateFilter: DateFilter,
    categories: Category[],
    paymentModes: PaymentMode[]
  ) => {
    let filteredExpenses = [...expenses];
    
    // Apply date filter
    const today = new Date();
    
    if (dateFilter === 'This month') {
      const firstDayOfMonth = startOfMonth(today);
      const lastDayOfMonth = endOfMonth(today);
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.date >= firstDayOfMonth && expense.date <= lastDayOfMonth
      );
    } else if (dateFilter === 'Last 30 days') {
      const thirtyDaysAgo = subDays(startOfDay(today), 30);
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.date >= thirtyDaysAgo
      );
    } else if (dateFilter === 'Last 90 Days') {
      const ninetyDaysAgo = subDays(startOfDay(today), 90);
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.date >= ninetyDaysAgo
      );
    }
    
    // Apply category filter if any categories are selected
    if (categories.length > 0) {
      filteredExpenses = filteredExpenses.filter((expense) =>
        categories.includes(expense.category)
      );
    }
    
    // Apply payment mode filter if any payment modes are selected
    if (paymentModes.length > 0) {
      filteredExpenses = filteredExpenses.filter((expense) =>
        paymentModes.includes(expense.paymentMode)
      );
    }
    
    return filteredExpenses;
  };

  const getMonthlyExpensesByCategory = (): MonthlyExpenseData[] => {
    if (expenses.length === 0) return [];

    // Get range of months from earliest expense to latest
    const dates = expenses.map(expense => expense.date);
    const earliestDate = new Date(Math.min(...dates.map(date => date.getTime())));
    const latestDate = new Date(Math.max(...dates.map(date => date.getTime())));
    
    // Start from the first day of the earliest month
    const startDate = startOfMonth(earliestDate);
    
    // End at the last day of the latest month
    const endDate = endOfMonth(latestDate);
    
    // Generate all months between start and end
    const months: MonthlyExpenseData[] = [];
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      const monthYear = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Create object with month and initialize all categories to 0
      const monthData: MonthlyExpenseData = {
        month: monthYear,
        Rental: 0,
        Groceries: 0,
        Entertainment: 0,
        Travel: 0,
        Others: 0,
      };
      
      // Calculate expenses for this month
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      expenses.forEach(expense => {
        if (expense.date >= monthStart && expense.date <= monthEnd) {
          // Add expense amount to corresponding category
          monthData[expense.category] = (monthData[expense.category] as number) + expense.amount;
        }
      });
      
      months.push(monthData);
      
      // Move to the next month
      currentDate = addMonths(currentDate, 1);
    }
    
    return months;
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        getFilteredExpenses,
        getMonthlyExpensesByCategory,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};