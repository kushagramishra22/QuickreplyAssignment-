import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Category, 
  DateFilter, 
  PaymentMode,
  useExpenses 
} from '@/context/ExpenseContext';

export function ExpenseList() {
  const { getFilteredExpenses } = useExpenses();
  
  // Filter states
  const [dateFilter, setDateFilter] = useState<DateFilter>('This month');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedPaymentModes, setSelectedPaymentModes] = useState<PaymentMode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort state
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Available filters
  const categories: Category[] = ['Rental', 'Groceries', 'Entertainment', 'Travel', 'Others'];
  const paymentModes: PaymentMode[] = ['UPI', 'Credit Card', 'Net Banking', 'Cash'];
  
  // Get filtered and sorted expenses
  const filteredExpenses = useMemo(() => {
    let expenses = getFilteredExpenses(dateFilter, selectedCategories, selectedPaymentModes);
    
    // Apply search filter if search term exists
    if (searchTerm.trim() !== '') {
      const lowerSearchTerm = searchTerm.toLowerCase();
      expenses = expenses.filter(expense => 
        expense.notes.toLowerCase().includes(lowerSearchTerm) ||
        expense.category.toLowerCase().includes(lowerSearchTerm) ||
        expense.amount.toString().includes(lowerSearchTerm) ||
        expense.paymentMode.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Sort the expenses
    return expenses.sort((a, b) => {
      if (sortField === 'date') {
        return sortDirection === 'asc' 
          ? a.date.getTime() - b.date.getTime()
          : b.date.getTime() - a.date.getTime();
      } else { // amount
        return sortDirection === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
    });
  }, [
    getFilteredExpenses, 
    dateFilter, 
    selectedCategories, 
    selectedPaymentModes,
    searchTerm,
    sortField,
    sortDirection
  ]);
  
  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);
  
  // Toggle category selection
  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Toggle payment mode selection
  const togglePaymentMode = (mode: PaymentMode) => {
    setSelectedPaymentModes(prev => 
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    );
  };
  
  // Toggle sort direction or change sort field
  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search and Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Filter Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-filter">Date Range</Label>
              <Select 
                value={dateFilter} 
                onValueChange={(value) => setDateFilter(value as DateFilter)}
              >
                <SelectTrigger id="date-filter">
                  <SelectValue placeholder="Select date filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="This month">This month</SelectItem>
                  <SelectItem value="Last 30 days">Last 30 days</SelectItem>
                  <SelectItem value="Last 90 Days">Last 90 days</SelectItem>
                  <SelectItem value="All time">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`category-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label htmlFor={`category-${category}`}>{category}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Modes</Label>
              <div className="flex flex-wrap gap-2">
                {paymentModes.map((mode) => (
                  <div key={mode} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`mode-${mode}`}
                      checked={selectedPaymentModes.includes(mode)}
                      onCheckedChange={() => togglePaymentMode(mode)}
                    />
                    <Label htmlFor={`mode-${mode}`}>{mode}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Expenses:</span>
              <span className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Number of Transactions:</span>
              <span className="text-xl">{filteredExpenses.length}</span>
            </div>
            
            <div className="space-y-2">
              <div className="text-muted-foreground">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{dateFilter}</Badge>
                {selectedCategories.map(category => (
                  <Badge key={category} variant="secondary">{category}</Badge>
                ))}
                {selectedPaymentModes.map(mode => (
                  <Badge key={mode} variant="secondary">{mode}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Expense Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {filteredExpenses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="text-right">Payment Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(expense.date, 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell>{expense.notes}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{expense.paymentMode}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No expenses found with the current filters.
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}