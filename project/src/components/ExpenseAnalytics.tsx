import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses, Category } from '@/context/ExpenseContext';

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const totalValue = payload.reduce((sum, entry) => sum + (entry.value as number), 0);
    
    return (
      <div className="bg-card border rounded-md shadow-sm p-4">
        <p className="font-medium">{label}</p>
        <p className="text-lg font-bold mb-2">Total: ₹{totalValue.toLocaleString()}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between items-center mb-1">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-medium">₹{(entry.value as number).toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Colors for different expense categories
const categoryColors: Record<Category, string> = {
  'Rental': 'hsl(var(--chart-1))',
  'Groceries': 'hsl(var(--chart-2))',
  'Entertainment': 'hsl(var(--chart-3))',
  'Travel': 'hsl(var(--chart-4))',
  'Others': 'hsl(var(--chart-5))',
};

export function ExpenseAnalytics() {
  const { getMonthlyExpensesByCategory } = useExpenses();
  
  // Get monthly expense data
  const monthlyExpenses = useMemo(() => {
    return getMonthlyExpensesByCategory();
  }, [getMonthlyExpensesByCategory]);
  
  // Calculate totals by category
  const categoryTotals = useMemo(() => {
    const totals: Record<Category, number> = {
      'Rental': 0,
      'Groceries': 0,
      'Entertainment': 0,
      'Travel': 0,
      'Others': 0,
    };
    
    monthlyExpenses.forEach(month => {
      (Object.keys(totals) as Category[]).forEach(category => {
        totals[category] += (month[category] as number) || 0;
      });
    });
    
    return Object.entries(totals).map(([category, amount]) => ({
      category,
      amount,
    }));
  }, [monthlyExpenses]);
  
  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return categoryTotals.reduce((sum, { amount }) => sum + amount, 0);
  }, [categoryTotals]);
  
  // Calculate percentage for each category
  const categoryPercentages = useMemo(() => {
    if (totalExpenses === 0) return categoryTotals.map(item => ({ ...item, percentage: 0 }));
    
    return categoryTotals.map(item => ({
      ...item,
      percentage: Math.round((item.amount / totalExpenses) * 100),
    }));
  }, [categoryTotals, totalExpenses]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Monthly Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyExpenses.length > 0 ? (
            <ResponsiveContainer width="100%\" height={400}>
              <BarChart
                data={monthlyExpenses}
                margin={{
                  top: 20,
                  right: 30,
                  left: 30,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {Object.keys(categoryColors).map((category) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    stackId="a"
                    fill={categoryColors[category as Category]}
                    name={category}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No expense data available to display.
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryPercentages.length > 0 && totalExpenses > 0 ? (
              <div className="space-y-4">
                {categoryPercentages.map(({ category, amount, percentage }) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{category}</span>
                      <span>₹{amount.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryColors[category as Category],
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No expense data available to display.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Summary Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Expenses</div>
                <div className="text-3xl font-bold">₹{totalExpenses.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Highest Spending Category</div>
                {categoryTotals.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold">
                      {categoryTotals.reduce((max, current) => 
                        current.amount > max.amount ? current : max
                      ).category}
                    </div>
                    <div className="text-muted-foreground">
                      ₹{categoryTotals.reduce((max, current) => 
                        current.amount > max.amount ? current : max
                      ).amount.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">No data available</div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Months with Data</div>
                <div className="text-2xl font-bold">{monthlyExpenses.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}