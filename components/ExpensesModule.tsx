"use client";
import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { fetchExpenses, addExpenseToDb, bulkAddExpenses } from '../app/actions';
import { Plus, TrendingDown, TrendingUp, Building2, Upload, List, PieChart, CreditCard, Wallet } from 'lucide-react';

const INITIAL_BALANCES: Record<string, number> = { BOB: 22073.00, SBI: 45623.00, HDFC: 41797.06, CASH: 0.00 };

export default function ExpensesModule({ searchQuery = "" }: { searchQuery?: string }) {
  const [activeSubTab, setActiveSubTab] = useState('Bank');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => { loadData(); }, []);
  const loadData = async () => { const data = await fetchExpenses(); setExpenses(data || []); };

  const matchesSearch = (exp: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return ((exp.title || '').toLowerCase().includes(query) || (exp.vendor || '').toLowerCase().includes(query) || (exp.category || '').toLowerCase().includes(query) || (exp.payment_source || '').toLowerCase().includes(query) || String(exp.amount).includes(query));
  };

  const isIncome = (type: string, cat: string) => type?.toLowerCase() === 'income' || ['Income', 'Salary', 'Interest'].includes(cat);
  const isHdfcCreditCard = (exp: any) => {
    const source = (exp.payment_source || '').trim().toLowerCase();
    const pType = (exp.payment_type || '').trim().toLowerCase();
    return (source === 'hdfc credit card' || source.includes('credit card') || source === 'hdfc cc' || pType === 'credit card' || pType === 'hdfc credit card');
  };

  const getAccountStats = (accountKey: string) => {
    const initial = INITIAL_BALANCES[accountKey.toUpperCase()] || 0;
    const accountTx = expenses.filter(e => {
      if (isHdfcCreditCard(e)) return false;
      return (e.payment_source || '').trim().toUpperCase() === accountKey.toUpperCase();
    });
    const income = accountTx.filter(e => isIncome(e.transaction_type, e.category)).reduce((sum, e) => sum + Number(e.amount), 0);
    const expense = accountTx.filter(e => !isIncome(e.transaction_type, e.category)).reduce((sum, e) => sum + Number(e.amount), 0);
    return { initial, income, expense, activeBalance: initial + income - expense, transactions: accountTx };
  };

  const bobStats = getAccountStats('BOB');
  const sbiStats = getAccountStats('SBI');
  const hdfcStats = getAccountStats('HDFC');
  const cashStats = getAccountStats('CASH');

  const totalLiquidActive = bobStats.activeBalance + sbiStats.activeBalance + hdfcStats.activeBalance + cashStats.activeBalance;
  
  const creditCardExpenses = expenses.filter(e => isHdfcCreditCard(e));
  const creditCardTotal = creditCardExpenses.filter(e => !isIncome(e.transaction_type, e.category)).reduce((sum, e) => sum + Number(e.amount), 0);

  const displayedAllTransactions = expenses.filter(matchesSearch);
  const totalIncome = expenses.filter(e => isIncome(e.transaction_type, e.category)).reduce((sum, e) => sum + Number(e.amount), 0);
  const totalExpense = expenses.filter(e => !isIncome(e.transaction_type, e.category)).reduce((sum, e) => sum + Number(e.amount), 0);

  const categoryTotals = expenses.reduce((acc: any, exp: any) => {
    if (!isIncome(exp.transaction_type, exp.category)) {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    }
    return acc;
  }, {});
  const sortedCategories = Object.entries(categoryTotals).sort((a: any, b: any) => b[1] - a[1]);
  const maxCategoryAmount = sortedCategories.length > 0 ? (sortedCategories[0][1] as number) : 1;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-2 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveSubTab('Bank')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSubTab === 'Bank' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}><Wallet size={16} /> Bank Accounts</button>
        <button onClick={() => setActiveSubTab('HDFC_CC')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSubTab === 'HDFC_CC' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}><CreditCard size={16} /> HDFC Credit Card</button>
        <button onClick={() => setActiveSubTab('Transactions')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSubTab === 'Transactions' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}><List size={16} /> All Transactions</button>
        <button onClick={() => setActiveSubTab('Analytics')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeSubTab === 'Analytics' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'}`}><PieChart size={16} /> Category Analysis</button>
      </div>

      {activeSubTab === 'Bank' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#1e3c72] to-[#2a5298] p-6 rounded-2xl border border-white/10 shadow-lg shadow-blue-900/20 relative overflow-hidden">
            <h2 className="text-blue-200 text-sm font-medium mb-1 relative z-10">Total Bank Balance</h2>
            <p className="text-3xl font-bold text-white relative z-10">₹{totalLiquidActive.toLocaleString('en-IN')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-[#131315] p-5 rounded-2xl border border-white/5">
                <span className="text-sm font-medium text-neutral-400">BOB</span>
                <span className="block text-xl font-semibold text-neutral-200">₹{bobStats.activeBalance.toLocaleString('en-IN')}</span>
             </div>
             <div className="bg-[#131315] p-5 rounded-2xl border border-white/5">
                <span className="text-sm font-medium text-neutral-400">SBI</span>
                <span className="block text-xl font-semibold text-neutral-200">₹{sbiStats.activeBalance.toLocaleString('en-IN')}</span>
             </div>
             <div className="bg-[#131315] p-5 rounded-2xl border border-white/5">
                <span className="text-sm font-medium text-neutral-400">HDFC</span>
                <span className="block text-xl font-semibold text-neutral-200">₹{hdfcStats.activeBalance.toLocaleString('en-IN')}</span>
             </div>
          </div>
        </div>
      )}

      {activeSubTab === 'HDFC_CC' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#004b8e] to-[#002b54] p-6 rounded-2xl border border-white/10 shadow-lg shadow-blue-900/20">
            <h2 className="text-blue-200 text-sm font-medium mb-1 relative z-10">HDFC Credit Card</h2>
            <p className="text-3xl font-bold text-white relative z-10">₹{creditCardTotal.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-[#131315] rounded-2xl border border-white/5 divide-y divide-white/5">
            {creditCardExpenses.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                <div>
                  <p className="text-sm font-medium text-neutral-200">{exp.vendor || exp.title}</p>
                  <span className="text-[11px] text-neutral-500">{exp.date} • {exp.category}</span>
                </div>
                <span className="text-sm font-medium text-red-400">-₹{Number(exp.amount).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'Transactions' && (
        <div className="bg-[#131315] rounded-2xl border border-white/5 divide-y divide-white/5">
            {displayedAllTransactions.map((exp: any) => (
              <div key={exp.id} className="flex flex-col p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-200">{exp.vendor || exp.title}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${isIncome(exp.transaction_type, exp.category) ? 'text-emerald-400' : 'text-neutral-200'}`}>
                    {isIncome(exp.transaction_type, exp.category) ? '+' : '-'}₹{Number(exp.amount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeSubTab === 'Analytics' && (
        <div className="bg-[#131315] rounded-2xl border border-white/5 p-6">
            <h2 className="text-base font-semibold text-neutral-200 mb-6">Category Analysis</h2>
            <div className="space-y-5">
              {sortedCategories.map(([cat, val]: any) => {
                const percentage = Math.round((val / maxCategoryAmount) * 100);
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm text-neutral-300">{cat}</span>
                      <span className="text-sm font-medium text-neutral-200">₹{val.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
        </div>
      )}
    </div>
  );
}
