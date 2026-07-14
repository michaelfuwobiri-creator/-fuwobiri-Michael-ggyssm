import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Sparkles, 
  Calculator, 
  TrendingUp, 
  Receipt, 
  HelpCircle, 
  Percent, 
  Coins, 
  Briefcase, 
  Calendar,
  AlertCircle,
  FileText,
  Home,
  Globe,
  Search,
  CheckCircle,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { 
  calculateUKTax, 
  calculateUSTax, 
  calculateCustomTax, 
  calculateDynamicTax, 
  DynamicCountryConfig, 
  TaxCalculationResult 
} from "../utils/taxCalc";
import { TaxCountry, BusinessExpense, MonthlyFreelanceLog, ExpenseCategory } from "../types";

// Standard fallback rates relative to USD for offline robustness
const DEFAULT_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.36,
  AUD: 1.50,
  JPY: 155.0,
  INR: 83.5,
  NGN: 1500.0,
  BRL: 5.40,
  CHF: 0.90,
  CNY: 7.25,
  ZAR: 18.20
};

// Standard currency symbols for display mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "CA$",
  AUD: "AU$",
  JPY: "¥",
  INR: "₹",
  NGN: "₦",
  BRL: "R$",
  CHF: "CHF",
  CNY: "¥",
  ZAR: "R"
};

export default function TaxWorkspace() {
  // Calculator Form State
  const [grossIncome, setGrossIncome] = useState<number>(() => {
    const saved = localStorage.getItem("tax_gross_income");
    return saved !== null ? Number(saved) : 45000;
  });
  const [pensionRate, setPensionRate] = useState<number>(() => {
    const saved = localStorage.getItem("tax_pension_rate");
    return saved !== null ? Number(saved) : 5;
  });
  const [taxCountry, setTaxCountry] = useState<TaxCountry>(() => {
    const saved = localStorage.getItem("tax_country");
    return (saved as TaxCountry) || "UK";
  });
  const [isSelfEmployed, setIsSelfEmployed] = useState<boolean>(() => {
    const saved = localStorage.getItem("tax_is_self_employed");
    return saved === "true";
  });
  
  // Custom Country Settings
  const [customTaxRate, setCustomTaxRate] = useState<number>(() => {
    const saved = localStorage.getItem("tax_custom_tax_rate");
    return saved !== null ? Number(saved) : 20;
  });
  const [customSocialRate, setCustomSocialRate] = useState<number>(() => {
    const saved = localStorage.getItem("tax_custom_social_rate");
    return saved !== null ? Number(saved) : 5;
  });
  const [customAllowance, setCustomAllowance] = useState<number>(() => {
    const saved = localStorage.getItem("tax_custom_allowance");
    return saved !== null ? Number(saved) : 8000;
  });

  // Dynamic Country Search / Fetch state
  const [customCountrySearch, setCustomCountrySearch] = useState<string>("Canada");
  const [isCountryLoading, setIsCountryLoading] = useState<boolean>(false);
  const [countryError, setCountryError] = useState<string>("Click fetch to load the latest global tax brackets");
  const [customCountryConfig, setCustomCountryConfig] = useState<DynamicCountryConfig>(() => {
    const saved = localStorage.getItem("gysm_custom_country_config");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      countryName: "Canada",
      currencySymbol: "CA$",
      currencyCode: "CAD",
      standardDeduction: 15000,
      socialSecurityRate: 5.9,
      brackets: [
        { rate: 15, threshold: 0 },
        { rate: 20.5, threshold: 55867 },
        { rate: 26, threshold: 111733 },
        { rate: 29, threshold: 173205 },
        { rate: 33, threshold: 246752 }
      ],
      notes: "Estimated Canadian Federal Tax Brackets for single filers."
    };
  });

  // Mortgage & Property details
  const [hasMortgage, setHasMortgage] = useState<boolean>(() => {
    const saved = localStorage.getItem("tax_has_mortgage");
    return saved === "true";
  });
  const [propertyValue, setPropertyValue] = useState<number>(() => {
    const saved = localStorage.getItem("tax_property_value");
    return saved !== null ? Number(saved) : 350000;
  });
  const [downPayment, setDownPayment] = useState<number>(() => {
    const saved = localStorage.getItem("tax_down_payment");
    return saved !== null ? Number(saved) : 70000;
  });
  const [mortgageInterestRate, setMortgageInterestRate] = useState<number>(() => {
    const saved = localStorage.getItem("tax_mortgage_interest_rate");
    return saved !== null ? Number(saved) : 5.2;
  });
  const [mortgageTerm, setMortgageTerm] = useState<number>(() => {
    const saved = localStorage.getItem("tax_mortgage_term");
    return saved !== null ? Number(saved) : 30; // years
  });
  const [isInterestDeductible, setIsInterestDeductible] = useState<boolean>(() => {
    const saved = localStorage.getItem("tax_is_interest_deductible");
    return saved !== "false";
  });

  // Calculated Result
  const [calcResult, setCalcResult] = useState<TaxCalculationResult | null>(null);
  const [originalTaxNoMortgage, setOriginalTaxNoMortgage] = useState<number>(0);
  const [mortgageTaxSavings, setMortgageTaxSavings] = useState<number>(0);

  // Real-time Currency Conversion State
  const [targetCurrency, setTargetCurrency] = useState<string>(() => {
    return localStorage.getItem("gysm_target_currency") || "Native";
  });
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("gysm_exchange_rates");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_RATES;
  });
  const [ratesLastUpdated, setRatesLastUpdated] = useState<string>(() => {
    return localStorage.getItem("gysm_rates_last_updated") || "Default Offline Rates";
  });
  const [isRatesLoading, setIsRatesLoading] = useState<boolean>(false);
  const [ratesError, setRatesError] = useState<string>("");

  // Print Report Inclusions State
  const [printIncludeLedger, setPrintIncludeLedger] = useState<boolean>(true);
  const [printIncludeBrackets, setPrintIncludeBrackets] = useState<boolean>(true);

  // Fetch latest exchange rates relative to USD from a free open-access keyless API
  const fetchExchangeRates = async () => {
    setIsRatesLoading(true);
    setRatesError("");
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (!res.ok) throw new Error("Could not retrieve online rates");
      const data = await res.json();
      if (data && data.rates) {
        setExchangeRates(data.rates);
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
        const updateMsg = `${dateString} at ${timeString}`;
        setRatesLastUpdated(updateMsg);
        localStorage.setItem("gysm_exchange_rates", JSON.stringify(data.rates));
        localStorage.setItem("gysm_rates_last_updated", updateMsg);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      console.warn("Failed to fetch real-time rates, using fallback:", err);
      setRatesError("Offline: Using fallback exchange rates.");
    } finally {
      setIsRatesLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  // Selected target currency will be saved by the comprehensive autosave effect below

  // Monthly Freelance Ledger State
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-07");
  const [monthlyLogs, setMonthlyLogs] = useState<MonthlyFreelanceLog[]>(() => {
    const saved = localStorage.getItem("tax_workspace_monthly_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default mock initial logs
    return [
      {
        id: "log-1",
        month: "2026-07",
        grossIncome: 5200,
        expenses: [
          { id: "exp-1", date: "2026-07-01", description: "Vercel & AWS Hosting", category: "Software & SaaS", amount: 120 },
          { id: "exp-2", date: "2026-07-05", description: "Sleek Coffee Shop Coworking", category: "Office Rent & Coworking", amount: 45 },
          { id: "exp-3", date: "2026-07-10", description: "Figma Professional Plan", category: "Software & SaaS", amount: 15 },
        ]
      },
      {
        id: "log-2",
        month: "2026-06",
        grossIncome: 4800,
        expenses: [
          { id: "exp-4", date: "2026-06-02", description: "Mechanical Keyboard", category: "Hardware & Equipment", amount: 180 },
          { id: "exp-5", date: "2026-06-15", description: "Google Workspace Sub", category: "Software & SaaS", amount: 12 },
        ]
      }
    ];
  });

  // New Expense Entry State
  const [expenseDesc, setExpenseDesc] = useState<string>("");
  const [expenseAmount, setExpenseAmount] = useState<number | "">("");
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>("Software & SaaS");
  const [expenseDate, setExpenseDate] = useState<string>("2026-07-14");
  const [monthGrossIncomeInput, setMonthGrossIncomeInput] = useState<number>(5200);

  // Freelance Business Category for AI
  const [businessCategory, setBusinessCategory] = useState<string>(() => {
    return localStorage.getItem("tax_business_category") || "Software Developer & Freelance Consultant";
  });
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");

  // Autosave status states
  const [lastSaved, setLastSaved] = useState<string>(() => {
    return localStorage.getItem("tax_last_saved_time") || "";
  });
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "saved">("saved");

  // Persist Ledger
  useEffect(() => {
    localStorage.setItem("tax_workspace_monthly_logs", JSON.stringify(monthlyLogs));
  }, [monthlyLogs]);

  // Persist custom country config
  useEffect(() => {
    localStorage.setItem("gysm_custom_country_config", JSON.stringify(customCountryConfig));
  }, [customCountryConfig]);

  // Comprehensive debounced autosave effect for all primary Tax controls
  useEffect(() => {
    setSavingStatus("saving");
    const timer = setTimeout(() => {
      localStorage.setItem("tax_gross_income", String(grossIncome));
      localStorage.setItem("tax_pension_rate", String(pensionRate));
      localStorage.setItem("tax_country", taxCountry);
      localStorage.setItem("tax_is_self_employed", String(isSelfEmployed));
      localStorage.setItem("tax_custom_tax_rate", String(customTaxRate));
      localStorage.setItem("tax_custom_social_rate", String(customSocialRate));
      localStorage.setItem("tax_custom_allowance", String(customAllowance));
      localStorage.setItem("tax_has_mortgage", String(hasMortgage));
      localStorage.setItem("tax_property_value", String(propertyValue));
      localStorage.setItem("tax_down_payment", String(downPayment));
      localStorage.setItem("tax_mortgage_interest_rate", String(mortgageInterestRate));
      localStorage.setItem("tax_mortgage_term", String(mortgageTerm));
      localStorage.setItem("tax_is_interest_deductible", String(isInterestDeductible));
      localStorage.setItem("tax_business_category", businessCategory);
      localStorage.setItem("gysm_target_currency", targetCurrency);

      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSaved(timeStr);
      localStorage.setItem("tax_last_saved_time", timeStr);
      setSavingStatus("saved");
    }, 1500); // 1.5s debounce to keep typing butter smooth and performant

    return () => clearTimeout(timer);
  }, [
    grossIncome,
    pensionRate,
    taxCountry,
    isSelfEmployed,
    customTaxRate,
    customSocialRate,
    customAllowance,
    hasMortgage,
    propertyValue,
    downPayment,
    mortgageInterestRate,
    mortgageTerm,
    isInterestDeductible,
    businessCategory,
    targetCurrency
  ]);

  // Mortgage calculations
  const loanAmount = Math.max(0, propertyValue - downPayment);
  const mortgageMonthlyRate = (mortgageInterestRate / 100) / 12;
  const mortgageTotalPayments = mortgageTerm * 12;

  let monthlyMortgagePayment = 0;
  if (loanAmount > 0) {
    if (mortgageMonthlyRate === 0) {
      monthlyMortgagePayment = loanAmount / mortgageTotalPayments;
    } else {
      monthlyMortgagePayment = (loanAmount * mortgageMonthlyRate * Math.pow(1 + mortgageMonthlyRate, mortgageTotalPayments)) / (Math.pow(1 + mortgageMonthlyRate, mortgageTotalPayments) - 1);
    }
  }

  // Exact first year interest paid for tax deduction calculation
  let tempBalance = loanAmount;
  let firstYearInterestPaid = 0;
  if (loanAmount > 0 && mortgageMonthlyRate > 0) {
    for (let m = 0; m < 12; m++) {
      const interestForMonth = tempBalance * mortgageMonthlyRate;
      const principalForMonth = Math.min(tempBalance, monthlyMortgagePayment - interestForMonth);
      firstYearInterestPaid += interestForMonth;
      tempBalance -= principalForMonth;
    }
  }

  // Recalculate main tax estimate
  useEffect(() => {
    let result: TaxCalculationResult;
    if (taxCountry === "UK") {
      result = calculateUKTax(grossIncome, pensionRate, isSelfEmployed);
    } else if (taxCountry === "US") {
      result = calculateUSTax(grossIncome, pensionRate, isSelfEmployed);
    } else if (taxCountry === "Dynamic" && customCountryConfig) {
      result = calculateDynamicTax(grossIncome, pensionRate, isSelfEmployed, customCountryConfig);
    } else {
      result = calculateCustomTax(grossIncome, customTaxRate, customAllowance, customSocialRate);
    }

    // Keep track of the original tax before any mortgage interest deductions
    const originalTax = result.totalTax;
    setOriginalTaxNoMortgage(originalTax);

    // Apply Mortgage Interest Deduction if active
    if (hasMortgage && isInterestDeductible && firstYearInterestPaid > 0) {
      // The deduction decreases taxableIncome
      const adjustedTaxableIncome = Math.max(0, result.taxableIncome - firstYearInterestPaid);
      
      // Recalculate progressive tax on the new taxable income pool
      let remainingTaxable = adjustedTaxableIncome;
      let totalTax = 0;
      const adjustedBrackets = result.brackets.map(b => ({
        ...b,
        taxableAmount: 0,
        taxCharged: 0
      }));

      for (let i = 0; i < adjustedBrackets.length; i++) {
        const bracket = adjustedBrackets[i];
        const nextThreshold = i < adjustedBrackets.length - 1 ? adjustedBrackets[i + 1].threshold : Infinity;
        const bracketSize = nextThreshold - bracket.threshold;

        if (remainingTaxable > 0) {
          const taxableInBracket = Math.min(remainingTaxable, bracketSize);
          bracket.taxableAmount = taxableInBracket;
          bracket.taxCharged = (taxableInBracket * bracket.rate) / 100;
          totalTax += bracket.taxCharged;
          remainingTaxable -= taxableInBracket;
        }
      }

      const savings = Math.max(0, originalTax - totalTax);
      setMortgageTaxSavings(savings);

      // Mutate result with adjusted values
      result = {
        ...result,
        taxableIncome: adjustedTaxableIncome,
        totalTax,
        netIncome: result.netIncome + savings, // take-home pay increases by the tax savings!
        effectiveTaxRate: result.grossIncome > 0 ? ((totalTax + result.totalNiOrFica) / result.grossIncome) * 100 : 0,
        brackets: adjustedBrackets,
      };
    } else {
      setMortgageTaxSavings(0);
    }

    setCalcResult(result);
  }, [
    grossIncome, 
    pensionRate, 
    taxCountry, 
    isSelfEmployed, 
    customTaxRate, 
    customAllowance, 
    customSocialRate, 
    customCountryConfig,
    hasMortgage,
    isInterestDeductible,
    firstYearInterestPaid
  ]);

  // Handle selected month changes, sync the monthly gross income input
  useEffect(() => {
    const currentLog = monthlyLogs.find(l => l.month === selectedMonth);
    if (currentLog) {
      setMonthGrossIncomeInput(currentLog.grossIncome);
    } else {
      setMonthGrossIncomeInput(0);
    }
  }, [selectedMonth, monthlyLogs]);

  // Format currencies based on country
  const getCurrencySymbol = () => {
    if (taxCountry === "UK") return "£";
    if (taxCountry === "US") return "$";
    if (taxCountry === "Dynamic" && customCountryConfig) return customCountryConfig.currencySymbol;
    return "$";
  };

  // Currency conversion helpers
  const getNativeCurrencyCode = () => {
    if (taxCountry === "UK") return "GBP";
    if (taxCountry === "US") return "USD";
    if (taxCountry === "Dynamic" && customCountryConfig) return customCountryConfig.currencyCode;
    return "USD"; // Default for Custom
  };

  const getActiveDisplayCurrencyCode = () => {
    if (targetCurrency === "Native") {
      return getNativeCurrencyCode();
    }
    return targetCurrency;
  };

  const getDisplayCurrencySymbol = () => {
    const code = getActiveDisplayCurrencyCode();
    if (code === getNativeCurrencyCode()) {
      return getCurrencySymbol();
    }
    return CURRENCY_SYMBOLS[code] || code;
  };

  const convertAmount = (amount: number): number => {
    const nativeCode = getNativeCurrencyCode();
    const targetCode = getActiveDisplayCurrencyCode();
    if (nativeCode === targetCode) return amount;

    // Convert relative to USD base
    const nativeRate = exchangeRates[nativeCode] || DEFAULT_RATES[nativeCode] || 1.0;
    const targetRate = exchangeRates[targetCode] || DEFAULT_RATES[targetCode] || 1.0;

    const amountInUSD = amount / nativeRate;
    return amountInUSD * targetRate;
  };

  const fmt = (num: number, bypassConversion = false) => {
    const finalNum = bypassConversion ? num : convertAmount(num);
    const symbol = bypassConversion ? getCurrencySymbol() : getDisplayCurrencySymbol();
    return symbol + Math.round(finalNum).toLocaleString();
  };

  // Add / edit logged month details
  const handleUpdateMonthlyIncome = (val: number) => {
    setMonthGrossIncomeInput(val);
    setMonthlyLogs(prev => {
      const idx = prev.findIndex(l => l.month === selectedMonth);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], grossIncome: val };
        return updated;
      } else {
        return [...prev, { id: "log-" + Date.now(), month: selectedMonth, grossIncome: val, expenses: [] }];
      }
    });
  };

  // Add transaction
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDesc || !expenseAmount || expenseAmount <= 0) return;

    const newExpense: BusinessExpense = {
      id: "exp-" + Date.now(),
      date: expenseDate,
      description: expenseDesc,
      category: expenseCategory,
      amount: Number(expenseAmount)
    };

    setMonthlyLogs(prev => {
      const idx = prev.findIndex(l => l.month === selectedMonth);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          expenses: [newExpense, ...updated[idx].expenses]
        };
        return updated;
      } else {
        // Create new log for this month
        return [...prev, {
          id: "log-" + Date.now(),
          month: selectedMonth,
          grossIncome: monthGrossIncomeInput,
          expenses: [newExpense]
        }];
      }
    });

    setExpenseDesc("");
    setExpenseAmount("");
  };

  // Delete transaction
  const handleDeleteExpense = (expId: string) => {
    setMonthlyLogs(prev => {
      return prev.map(log => {
        if (log.month === selectedMonth) {
          return {
            ...log,
            expenses: log.expenses.filter(e => e.id !== expId)
          };
        }
        return log;
      });
    });
  };

  // Get active month log details
  const activeLog = monthlyLogs.find(l => l.month === selectedMonth) || {
    month: selectedMonth,
    grossIncome: 0,
    expenses: []
  };

  const totalMonthlyExpenses = activeLog.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netMonthlyIncome = activeLog.grossIncome - totalMonthlyExpenses;

  // Compute a smart estimated tax rate for the active month profit based on the annual results
  const estimatedTaxWithholding = Math.max(0, netMonthlyIncome * ((calcResult?.effectiveTaxRate || 15) / 100));

  // Call dynamic country tax rate estimator API
  const handleFetchCountryConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customCountrySearch.trim()) return;

    setIsCountryLoading(true);
    setCountryError("");
    try {
      const res = await fetch("/api/tax/country-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName: customCountrySearch })
      });
      const data = await res.json();
      if (res.ok) {
        setCustomCountryConfig(data);
        setTaxCountry("Dynamic");
        setCountryError("");
      } else {
        setCountryError(data.error || "Failed to estimate tax for " + customCountrySearch);
      }
    } catch (err: any) {
      setCountryError(err.message || "Network error. Please try again.");
    } finally {
      setIsCountryLoading(false);
    }
  };

  // Call server-side AI Advisor API
  const handleGetAiAdvice = async () => {
    setIsAiLoading(true);
    setAiError("");
    try {
      const response = await fetch("/api/tax/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: businessCategory,
          income: fmt(activeLog.grossIncome) + "/mo",
          expenses: fmt(totalMonthlyExpenses) + "/mo (net profit " + fmt(netMonthlyIncome) + "/mo)",
          taxCountry: taxCountry === "UK" ? "United Kingdom" : taxCountry === "US" ? "United States" : taxCountry === "Dynamic" ? customCountryConfig.countryName : "Custom Tax Bracket System"
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAiAdvice(data.advice);
      } else {
        setAiError(data.error || "Failed to load AI advice.");
      }
    } catch (err: any) {
      setAiError(err.message || "Network error. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Print-Only Professional Document Header */}
      <div className="hidden print:flex justify-between items-center border-b-2 border-forest pb-6 mb-8 text-left">
        <div>
          <h1 className="text-2xl font-display font-bold text-forest">gysm.io Tax Calculation & Ledger</h1>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase font-sans font-bold tracking-widest text-forest bg-lime/25 px-2.5 py-1 rounded-full">
            {taxCountry === "UK" ? "United Kingdom (2026/27)" : taxCountry === "US" ? "United States (2026)" : taxCountry === "Dynamic" ? (customCountryConfig?.countryName || "Dynamic") : "Custom Flat Rate"}
          </span>
          <p className="text-[10px] text-gray-400 font-mono mt-2">Display Currency: {getActiveDisplayCurrencyCode()}</p>
        </div>
      </div>

      {/* Export & Document Settings Toolbar (Web only) */}
      <div className="no-print bg-white border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-forest/5 flex items-center justify-center text-forest shrink-0">
            <FileText size={18} />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-forest">Professional Document Export</h4>
            <p className="text-[11px] text-gray-500">Download a perfectly formatted PDF tax report including your custom parameters, calculations, and active ledger sheets.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center space-x-2 text-xs text-gray-600 font-sans cursor-pointer select-none bg-sand px-3 py-1.5 rounded-xl border border-gray-150 hover:bg-gray-50">
            <input 
              type="checkbox" 
              checked={printIncludeBrackets} 
              onChange={(e) => setPrintIncludeBrackets(e.target.checked)}
              className="accent-forest cursor-pointer"
            />
            <span className="font-medium">Include Brackets</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-600 font-sans cursor-pointer select-none bg-sand px-3 py-1.5 rounded-xl border border-gray-150 hover:bg-gray-50">
            <input 
              type="checkbox" 
              checked={printIncludeLedger} 
              onChange={(e) => setPrintIncludeLedger(e.target.checked)}
              className="accent-forest cursor-pointer"
            />
            <span className="font-medium">Include Ledger</span>
          </label>
          
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-forest hover:bg-forest-light text-lime font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <FileText size={14} />
            <span>Download as PDF</span>
          </button>
        </div>
      </div>

      {/* 1. Header / Splash Section */}
      <div className="text-center max-w-2xl mx-auto py-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xs uppercase font-sans font-bold tracking-widest bg-lime/25 text-forest px-3 py-1 rounded-full">
            TAX, MINUS THE GUESSWORK
          </span>
          <span className="inline-flex items-center space-x-1.5 text-[10px] text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 font-mono shadow-sm no-print">
            <span className={`w-1.5 h-1.5 rounded-full ${savingStatus === "saving" ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
            <span>{savingStatus === "saving" ? "Saving..." : lastSaved ? `Autosaved ${lastSaved}` : "Draft Autosaved"}</span>
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-forest tracking-tight mt-4 leading-tight">
          Your paycheck, explained.
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-3 max-w-xl mx-auto font-sans">
          An instant, transparent illustration of income tax, social security, business write-offs, and take-home profits—without the complexity of a massive spreadsheet.
        </p>
      </div>

      {/* 2. Main Annual Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Inputs panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 border-b pb-3 border-gray-100">
            <Calculator className="text-forest" size={20} />
            <h2 className="font-display font-bold text-lg text-forest">Salary & Tax Options</h2>
          </div>

          {/* Gross Income Input */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <label htmlFor="gross-income-input" className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Annual Gross Income</span>
                {targetCurrency !== "Native" && (
                  <span className="text-[10px] font-mono font-bold text-forest bg-forest/10 px-1.5 py-0.5 rounded-md normal-case">
                    ≈ {fmt(grossIncome)}
                  </span>
                )}
              </label>
              <span className="text-xs font-mono font-medium text-gray-400">
                Gross profits or salary before deductions
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-lg">
                {getCurrencySymbol()}
              </span>
              <input
                id="gross-income-input"
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(Math.max(0, Number(e.target.value)))}
                className="w-full bg-sand-dark font-display font-medium border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-forest focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent text-lg print:bg-transparent print:border-none print:py-1 print:pl-8 print:shadow-none print:text-black print:font-bold"
              />
            </div>
          </div>

          {/* Pension / Retirement Contributions */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label htmlFor="pension-rate-input" className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {taxCountry === "US" ? "Traditional 401(k) / IRA" : "Pension Contribution"}
              </label>
              <span className="text-xs font-mono font-bold text-forest print:text-black">
                {pensionRate}%
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                id="pension-rate-input"
                type="range"
                min="0"
                max="50"
                value={pensionRate}
                onChange={(e) => setPensionRate(Number(e.target.value))}
                className="flex-1 accent-forest cursor-pointer h-1.5 bg-gray-100 rounded-lg no-print"
              />
              <span className="text-xs text-gray-500 font-mono font-medium min-w-[50px] text-right print:text-black print:font-bold">
                {fmt((grossIncome * pensionRate) / 100)}
              </span>
            </div>
          </div>

          {/* Tax Region Selector */}
          <div className="space-y-1">
            <label htmlFor="tax-country-select" className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Tax Jurisdiction
            </label>
            <select
              id="tax-country-select"
              value={taxCountry}
              onChange={(e) => setTaxCountry(e.target.value as TaxCountry)}
              className="w-full bg-sand-dark font-sans font-medium border border-gray-200 rounded-xl p-3 text-forest focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent cursor-pointer print:hidden"
            >
              <option value="UK">United Kingdom (2026/27 PAYE & NI)</option>
              <option value="US">United States (2026 Single Filer & FICA)</option>
              <option value="Dynamic">AI-Estimated Country (Worldwide)</option>
              <option value="Custom">Custom/Global Flat Rate Filer</option>
            </select>
            <div className="hidden print:block text-sm font-bold text-gray-800">
              {taxCountry === "UK" ? "United Kingdom (2026/27 PAYE & NI)" : taxCountry === "US" ? "United States (2026 Single Filer & FICA)" : taxCountry === "Dynamic" ? `AI-Estimated Country: ${customCountryConfig?.countryName || "Dynamic"}` : "Custom/Global Flat Rate Filer"}
            </div>
          </div>

          {/* Dynamic AI-Estimated Country Setup */}
          {taxCountry === "Dynamic" && (
            <div className="p-4 bg-sand border border-gray-200 rounded-xl space-y-4 animate-fade-in text-xs relative">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-forest font-bold">
                  <Globe size={15} />
                  <span className="uppercase tracking-wider">Global Tax Bracket Finder</span>
                </div>
                <span className="text-[8px] font-mono font-bold bg-forest/10 text-forest px-1.5 py-0.5 rounded uppercase no-print">
                  Powered by AI
                </span>
              </div>
              <p className="text-gray-500 leading-relaxed text-[11px] no-print">
                Enter any country in the world (e.g. Germany, Australia, Nigeria, Brazil). Gemini will estimate real tax brackets, standard deductions, and social contributions!
              </p>
              
              <div className="flex gap-2 no-print">
                <input
                  aria-label="Country search input"
                  type="text"
                  placeholder="Germany, Australia, etc..."
                  value={customCountrySearch}
                  onChange={(e) => setCustomCountrySearch(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 rounded-lg p-2 font-medium focus:outline-none focus:ring-1 focus:ring-forest text-xs"
                />
                <button
                  type="button"
                  onClick={(e) => handleFetchCountryConfig(e)}
                  disabled={isCountryLoading || !customCountrySearch.trim()}
                  className="bg-forest hover:bg-forest-light text-lime font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  {isCountryLoading ? "Searching..." : "Fetch"}
                </button>
              </div>

              {countryError && (
                <p className="text-[10px] text-red-500 italic no-print">
                  {countryError}
                </p>
              )}

              {customCountryConfig && (
                <div className="bg-white p-2.5 rounded-lg border border-gray-150 space-y-1 text-[11px] text-gray-700 font-sans shadow-sm print:shadow-none print:border-gray-200 relative">
                  <div className="flex justify-between font-bold text-forest">
                    <span>Selected: {customCountryConfig.countryName}</span>
                    <span>ISO: {customCountryConfig.currencyCode} ({customCountryConfig.currencySymbol})</span>
                  </div>
                  <div className="text-gray-500 flex justify-between">
                    <span>Allowance: {customCountryConfig.currencySymbol}{customCountryConfig.standardDeduction.toLocaleString()}</span>
                    <span>Social Rate: {customCountryConfig.socialSecurityRate}%</span>
                  </div>
                  {customCountryConfig.notes && (
                    <p className="text-[10px] text-gray-400 italic leading-snug border-t pt-1 mt-1 font-sans">
                      {customCountryConfig.notes}
                    </p>
                  )}
                  <div className="mt-1.5 pt-1.5 border-t border-gray-100 text-[9px] text-gray-400 italic leading-none font-sans no-print text-center">
                    ⚠️ AI estimation — values must be verified before official tax filing.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Employed vs. Self-Employed toggle */}
          {taxCountry !== "Custom" && (
            <div className="space-y-2 text-left">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Filing Category
              </span>
              <div className="grid grid-cols-2 gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setIsSelfEmployed(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold font-sans transition-all cursor-pointer ${
                    !isSelfEmployed 
                      ? "bg-forest text-lime border-forest shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Standard Employee
                </button>
                <button
                  type="button"
                  onClick={() => setIsSelfEmployed(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold font-sans transition-all cursor-pointer ${
                    isSelfEmployed 
                      ? "bg-forest text-lime border-forest shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  Freelancer / Contractor
                </button>
              </div>
              <div className="hidden print:block text-sm font-bold text-gray-800">
                {isSelfEmployed ? "Freelancer / Self-Employed Contractor" : "Standard Full-Time Employee (PAYE/W2)"}
              </div>
            </div>
          )}

          {/* Custom Jurisdiction Settings */}
          {taxCountry === "Custom" && (
            <div className="p-4 bg-sand border border-gray-200 rounded-xl space-y-4 animate-fade-in print:shadow-none print:border-gray-200">
              <div className="flex items-center space-x-2 text-forest-light">
                <AlertCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Custom Bracket Settings</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs no-print">
                <div className="space-y-1">
                  <label htmlFor="custom-tax-rate-input" className="font-bold text-gray-600 uppercase">Flat Income Tax %</label>
                  <input
                    id="custom-tax-rate-input"
                    type="number"
                    min="0"
                    max="100"
                    value={customTaxRate}
                    onChange={(e) => setCustomTaxRate(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 font-mono text-center focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-social-rate-input" className="font-bold text-gray-600 uppercase">Flat Social Security %</label>
                  <input
                    id="custom-social-rate-input"
                    type="number"
                    min="0"
                    max="100"
                    value={customSocialRate}
                    onChange={(e) => setCustomSocialRate(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 font-mono text-center focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1 no-print">
                <label htmlFor="custom-allowance-input" className="text-xs font-bold text-gray-600 uppercase">Tax-Free Allowance / Deduction</label>
                <input
                  id="custom-allowance-input"
                  type="number"
                  value={customAllowance}
                  onChange={(e) => setCustomAllowance(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 font-mono text-center text-xs focus:outline-none"
                />
              </div>

              {/* Print-only neat metadata list of flat rate parameters */}
              <div className="hidden print:block space-y-1 text-xs text-gray-700 font-sans text-left">
                <p>Flat Income Tax Rate: <span className="font-mono font-bold">{customTaxRate}%</span></p>
                <p>Flat Social Security Rate: <span className="font-mono font-bold">{customSocialRate}%</span></p>
                <p>Standard Tax-Free Allowance: <span className="font-mono font-bold">{fmt(customAllowance)}</span></p>
              </div>
            </div>
          )}

          {/* Real-Time Currency Conversion & Exchange Rate Panel */}
          <div className="bg-sand p-4 border border-gray-200 rounded-2xl space-y-3 no-print">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-forest">
                <Coins size={17} className="text-forest animate-pulse" />
                <span className="text-xs font-bold font-sans uppercase tracking-wide">Live Currency Conversion</span>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${ratesError ? 'bg-red-50 text-red-500' : 'bg-lime/25 text-forest font-bold'}`}>
                {isRatesLoading ? "Syncing..." : "Online Exchange"}
              </span>
            </div>

            <p className="text-[11px] text-gray-500 leading-snug">
              Compare take-home pay, standard deductions, and tax obligations dynamically across different major currencies.
            </p>

            <div className="space-y-3 pt-2 border-t border-gray-200/60 text-xs">
              <div className="space-y-1">
                <label htmlFor="display-currency-select" className="font-bold text-gray-600 block text-[9px] uppercase tracking-wide">Display Currency</label>
                <select
                  id="display-currency-select"
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs text-forest focus:outline-none focus:ring-1 focus:ring-forest cursor-pointer font-medium"
                >
                  <option value="Native">Native Currency ({getNativeCurrencyCode()})</option>
                  <option value="USD">United States Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound Sterling (GBP)</option>
                  <option value="CAD">Canadian Dollar (CAD)</option>
                  <option value="AUD">Australian Dollar (AUD)</option>
                  <option value="JPY">Japanese Yen (JPY)</option>
                  <option value="INR">Indian Rupee (INR)</option>
                  <option value="NGN">Nigerian Naira (NGN)</option>
                  <option value="BRL">Brazilian Real (BRL)</option>
                  <option value="CHF">Swiss Franc (CHF)</option>
                  <option value="CNY">Chinese Yuan (CNY)</option>
                  <option value="ZAR">South African Rand (ZAR)</option>
                </select>
              </div>

              {targetCurrency !== "Native" && (
                <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-150 text-[11px]">
                  <div className="space-y-0.5 text-left">
                    <span className="text-gray-400 block text-[9px] uppercase tracking-wide">Active Exchange Rate</span>
                    <span className="font-mono font-bold text-gray-700">
                      1 {getNativeCurrencyCode()} = {(convertAmount(1)).toFixed(4)} {getActiveDisplayCurrencyCode()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchExchangeRates}
                    disabled={isRatesLoading}
                    title="Refresh current exchange rates from API"
                    className="flex items-center space-x-1 bg-sand border border-gray-200 px-2.5 py-1 rounded-md text-[10px] font-bold text-forest hover:bg-gray-150 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={10} className={`${isRatesLoading ? 'animate-spin' : ''}`} />
                    <span>{isRatesLoading ? "Sync..." : "Sync Rates"}</span>
                  </button>
                </div>
              )}

              {ratesLastUpdated && (
                <div className="text-[9px] text-gray-400 font-sans flex justify-between items-center italic">
                  <span>Synced: {ratesLastUpdated}</span>
                  {ratesError && <span className="text-red-500 font-medium">{ratesError}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Mortgage Interest Tax Optimizer Gate */}
          <div className="bg-sand p-4 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-forest">
                <Home size={17} className="text-forest" />
                <span className="text-xs font-bold font-sans uppercase tracking-wide">Mortgage & Property</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer no-print">
                <input 
                  type="checkbox" 
                  checked={hasMortgage}
                  onChange={(e) => setHasMortgage(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
              </label>
            </div>
            <div className="hidden print:block text-xs font-bold text-gray-800 text-left">
              {hasMortgage ? "✓ Active Mortgage Deductions & P&I Payment Models Applied" : "✗ No property mortgage parameters applied"}
            </div>

            <p className="text-[11px] text-gray-500 leading-snug no-print">
              Factor in home ownership, calculate P&I payments, and unlock tax-deductible savings in compatible countries.
            </p>

            {hasMortgage && (
              <div className="space-y-4 pt-2 border-t border-gray-200/60 animate-fade-in text-xs">
                {/* Print-only clean mortgage metadata summary */}
                <div className="hidden print:block space-y-1 text-xs text-gray-700 font-sans border border-gray-200 p-3 rounded-xl bg-white text-left">
                  <p className="font-bold text-[10px] uppercase text-forest tracking-wider mb-2">Mortgage parameters</p>
                  <p className="flex justify-between"><span>Property Value:</span> <span className="font-mono font-bold">{fmt(propertyValue)}</span></p>
                  <p className="flex justify-between"><span>Down Payment:</span> <span className="font-mono font-bold">{fmt(downPayment)} ({propertyValue > 0 ? Math.round((downPayment / propertyValue) * 100) : 0}%)</span></p>
                  <p className="flex justify-between"><span>Loan Amount:</span> <span className="font-mono font-bold">{fmt(loanAmount)}</span></p>
                  <p className="flex justify-between"><span>Interest Rate:</span> <span className="font-mono font-bold">{mortgageInterestRate}% over {mortgageTerm} years</span></p>
                  <p className="flex justify-between"><span>Tax-Deductible:</span> <span className="font-bold text-forest">{isInterestDeductible ? "Yes" : "No"}</span></p>
                </div>

                <div className="space-y-4 no-print">
                  {/* Property Value slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-gray-600 uppercase">Property Value</span>
                      <span className="font-mono font-bold text-forest">
                        {fmt(propertyValue)}
                        {targetCurrency !== "Native" && (
                          <span className="text-[10px] text-gray-400 font-normal ml-1">
                            ({fmt(propertyValue, true)})
                          </span>
                        )}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50000"
                      max="1500000"
                      step="10000"
                      value={propertyValue}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPropertyValue(val);
                        if (downPayment > val) setDownPayment(val);
                      }}
                      className="w-full accent-forest cursor-pointer h-1.5 bg-gray-150 rounded"
                    />
                  </div>

                  {/* Down Payment slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-gray-600 uppercase">Down Payment</span>
                      <span className="font-mono font-bold text-gray-600">
                        {fmt(downPayment)}
                        {targetCurrency !== "Native" && (
                          <span className="text-[10px] text-gray-400 font-normal ml-1">
                            ({fmt(downPayment, true)})
                          </span>
                        )}
                        <span className="text-gray-400 font-normal text-[10px] ml-1.5">
                          ({propertyValue > 0 ? Math.round((downPayment / propertyValue) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={propertyValue}
                      step="5000"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full accent-forest cursor-pointer h-1.5 bg-gray-150 rounded"
                    />
                  </div>

                  {/* Mortgage Term and Interest Rate in 2 cols */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 uppercase block text-[9px] tracking-wide">Interest Rate (%)</label>
                      <input
                        type="number"
                        min="0.1"
                        max="15"
                        step="0.1"
                        value={mortgageInterestRate}
                        onChange={(e) => setMortgageInterestRate(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg p-1.5 font-mono text-center focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-gray-600 uppercase block text-[9px] tracking-wide">Term (Years)</label>
                      <select
                        value={mortgageTerm}
                        onChange={(e) => setMortgageTerm(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg p-1.5 text-center focus:outline-none"
                      >
                        <option value="15">15 Years</option>
                        <option value="20">20 Years</option>
                        <option value="25">25 Years</option>
                        <option value="30">30 Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Is Mortgage Interest Tax Deductible Toggle */}
                  <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-150">
                    <div className="space-y-0.5 text-left">
                      <span className="font-bold text-gray-700 block text-[11px]">Tax-Deductible Interest</span>
                      <span className="text-[9px] text-gray-400 block leading-tight">Deduct interest paid from income tax base</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isInterestDeductible}
                        onChange={(e) => setIsInterestDeductible(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-forest"></div>
                    </label>
                  </div>
                </div>

                {/* Calculated Mortgage Stats Box */}
                <div className="p-3 bg-forest text-lime rounded-xl space-y-1.5 shadow-sm border border-forest-dark text-[11px] text-left print-invert-colors print:border-gray-200 print:text-black">
                  <div className="flex justify-between">
                    <span className="text-gray-300 print:text-gray-500">Loan Amount:</span>
                    <span className="font-mono font-bold text-white print:text-black">{fmt(loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 print:text-gray-500">Monthly P&I Payment:</span>
                    <span className="font-mono font-bold text-white print:text-black">{fmt(monthlyMortgagePayment)}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 print:text-gray-500">Annual Interest (Yr 1):</span>
                    <span className="font-mono font-bold text-white print:text-black">{fmt(firstYearInterestPaid)}</span>
                  </div>
                  
                  {isInterestDeductible && mortgageTaxSavings > 0 && (
                    <div className="border-t border-forest-light/60 pt-1.5 mt-1.5 flex justify-between items-center text-lime font-bold print:border-gray-200 print:text-emerald-700">
                      <span className="flex items-center"><Sparkles size={11} className="mr-1 animate-pulse no-print"/> Annual Tax Saved:</span>
                      <span className="font-mono text-xs bg-forest-light px-1.5 py-0.5 rounded text-white print:bg-gray-100 print:text-emerald-700">{fmt(mortgageTaxSavings)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Estimation Green Card (mirroring landing page) */}
        <div className="lg:col-span-7 bg-forest text-white p-8 rounded-3xl relative overflow-hidden shadow-xl border border-forest-dark flex flex-col justify-between min-h-[460px]">
          {/* Subtle background circle decoration */}
          <div className="absolute right-[-10%] top-[-10%] w-[250px] h-[250px] rounded-full border border-forest-light/40 opacity-50 pointer-events-none" />
          
          <div className="space-y-6">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-lime bg-forest-light/60 px-3 py-1 rounded-full">
                YOUR ANNUAL ESTIMATE
              </span>
              <p className="text-gray-300 text-sm font-sans mt-3">Estimated take-home paycheck</p>
              <h3 className="text-5xl md:text-6xl font-display font-bold text-white tracking-tight mt-1 leading-none">
                {calcResult ? fmt(calcResult.netIncome) : "—"}
              </h3>
              <p className="text-xs text-lime font-mono font-medium mt-2">
                after estimated tax, {taxCountry === "US" ? "FICA Filer" : "NI contribution"}, and pension savings
              </p>
            </div>

            {/* Simulated progress visualization bar */}
            <div className="space-y-1">
              <div className="h-2.5 bg-forest-light rounded-full overflow-hidden flex">
                <div 
                  className="bg-lime" 
                  style={{ width: `${calcResult ? (calcResult.netIncome / calcResult.grossIncome) * 100 : 70}%` }}
                  title="Net Income"
                />
                <div 
                  className="bg-red-400" 
                  style={{ width: `${calcResult ? (calcResult.totalTax / calcResult.grossIncome) * 100 : 15}%` }}
                  title="Income Tax"
                />
                <div 
                  className="bg-yellow-300" 
                  style={{ width: `${calcResult ? (calcResult.totalNiOrFica / calcResult.grossIncome) * 100 : 10}%` }}
                  title="Social/Insurance"
                />
                <div 
                  className="bg-blue-300" 
                  style={{ width: `${calcResult ? (calcResult.pensionContribution / calcResult.grossIncome) * 100 : 5}%` }}
                  title="Retirement/Pension"
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-sans">
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-lime mr-1 inline-block"/> Net Take-Home ({calcResult ? Math.round((calcResult.netIncome / calcResult.grossIncome) * 100) : 0}%)</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-400 mr-1 inline-block"/> Taxes</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-300 mr-1 inline-block"/> Social/NI</span>
                <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-300 mr-1 inline-block"/> Pension</span>
              </div>
            </div>

            {/* Quick 3 columns highlights */}
            <div className="grid grid-cols-3 gap-4 border-t border-forest-light pt-5">
              <div className="bg-forest-light/30 p-3 rounded-xl border border-forest-light/20">
                <span className="text-[10px] uppercase font-bold text-gray-300 block">Income Tax</span>
                <span className="text-base md:text-lg font-display font-bold text-white block mt-0.5">
                  {calcResult ? fmt(calcResult.totalTax) : "—"}
                </span>
              </div>
              <div className="bg-forest-light/30 p-3 rounded-xl border border-forest-light/20">
                <span className="text-[10px] uppercase font-bold text-gray-300 block">
                  {taxCountry === "US" ? "FICA Tax" : "Nat. Insurance"}
                </span>
                <span className="text-base md:text-lg font-display font-bold text-white block mt-0.5">
                  {calcResult ? fmt(calcResult.totalNiOrFica) : "—"}
                </span>
              </div>
              <div className="bg-forest-light/30 p-3 rounded-xl border border-forest-light/20">
                <span className="text-[10px] uppercase font-bold text-gray-300 block">Monthly Net</span>
                <span className="text-base md:text-lg font-display font-bold text-lime block mt-0.5">
                  {calcResult ? fmt(calcResult.netIncome / 12) : "—"}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-forest-light pt-4 mt-6 text-[10px] text-gray-400 font-sans leading-relaxed flex items-start space-x-2 text-left">
            <span className="text-lime font-bold">ℹ</span>
            <span>
              <strong>Estimate only.</strong> Factoring in {taxCountry === "UK" ? "personal allowance taper limits, employee vs self-employed rates" : taxCountry === "US" ? "standard deduction thresholds and US self-employment FICA adjustments" : taxCountry === "Dynamic" ? `${customCountryConfig?.countryName || "dynamic country"} progressive brackets` : "flat custom rules"}. {hasMortgage && isInterestDeductible && `Factored in ${fmt(firstYearInterestPaid)} of mortgage interest tax deduction savings.`} Tax rules evolve; check with qualified CPAs for official filing metrics.
            </span>
          </div>
        </div>
      </div>

      {/* 3. Year-End Summary and Bracket Visualization */}
      <div className={`bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 ${!printIncludeBrackets ? "print:hidden" : ""}`}>
        <div className="flex items-center space-x-3 border-b pb-3 border-gray-100">
          <TrendingUp className="text-forest" size={22} />
          <h2 className="font-display font-bold text-xl text-forest">Year-End Summary & Brackets Breakdown</h2>
        </div>

        {/* Summary grid */}
        <div className={`grid grid-cols-1 ${hasMortgage ? "md:grid-cols-5" : "md:grid-cols-4"} gap-4`}>
          <div className="p-4 bg-sand border border-gray-150 rounded-xl text-left">
            <span className="text-xs text-gray-500 font-medium">Gross Annual Turnover</span>
            <p className="text-2xl font-display font-bold text-forest mt-1">{fmt(grossIncome)}</p>
          </div>
          <div className="p-4 bg-sand border border-gray-150 rounded-xl text-left">
            <span className="text-xs text-gray-500 font-medium">Standard Deduction</span>
            <p className="text-2xl font-display font-bold text-gray-800 mt-1">{calcResult ? fmt(calcResult.deductionAmount) : "—"}</p>
          </div>
          {hasMortgage && (
            <div className="p-4 bg-sand border border-gray-150 rounded-xl text-left">
              <span className="text-xs text-gray-500 font-medium">Mortgage Interest Ded.</span>
              <p className="text-2xl font-display font-bold text-forest mt-1">{fmt(firstYearInterestPaid)}</p>
            </div>
          )}
          <div className="p-4 bg-sand border border-gray-150 rounded-xl text-left">
            <span className="text-xs text-gray-500 font-medium">Taxable Income Pool</span>
            <p className="text-2xl font-display font-bold text-gray-800 mt-1">{calcResult ? fmt(calcResult.taxableIncome) : "—"}</p>
          </div>
          <div className="p-4 bg-sand border border-gray-150 rounded-xl text-left">
            <span className="text-xs text-gray-500 font-medium">Effective Tax Rate</span>
            <p className="text-2xl font-display font-bold text-red-500 mt-1">
              {calcResult ? `${calcResult.effectiveTaxRate.toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>

        {/* Bracket visual timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-widest">
            Detailed Bracket Allocation
          </h3>
          <div className="space-y-3">
            {calcResult?.brackets.map((br, idx) => (
              <div key={idx} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold font-sans rounded bg-forest text-lime">
                      {br.rate}%
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {taxCountry === "Custom" 
                        ? "Custom Flat Rate" 
                        : taxCountry === "UK"
                          ? br.rate === 20 ? "Basic Rate" : br.rate === 40 ? "Higher Rate" : "Additional Rate"
                          : `US Federal Bracket`
                      }
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 block font-sans">
                    Threshold: {fmt(br.threshold)} and above
                  </span>
                </div>

                <div className="flex space-x-6 text-right w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-gray-400 uppercase block">Taxable in Bracket</span>
                    <span className="text-sm font-mono font-medium text-gray-700">
                      {fmt(br.taxableAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase block text-red-400">Tax Charged</span>
                    <span className="text-sm font-mono font-bold text-red-500">
                      {fmt(br.taxCharged)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Monthly Freelance Ledger (For small business and freelancers) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${!printIncludeLedger ? "print:hidden" : ""}`}>
        {/* Ledger entry form & logs */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 border-gray-100 gap-3">
            <div className="flex items-center space-x-3">
              <Receipt className="text-forest" size={22} />
              <div className="text-left">
                <h2 className="font-display font-bold text-xl text-forest">Monthly Freelance Ledger</h2>
                <p className="text-xs text-gray-500">Track client payouts and deductible business expenses</p>
              </div>
            </div>

            {/* Month select input */}
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400 no-print" />
              <input 
                id="active-month-ledger"
                title="Active Month Ledger"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-sand-dark border border-gray-200 font-mono font-medium rounded-lg px-2.5 py-1 text-sm text-forest focus:outline-none print:hidden"
              />
              <div className="hidden print:block font-sans font-bold text-forest text-sm uppercase tracking-wider">
                Statement Period: {new Date(selectedMonth + "-02").toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>

          {/* Income Tracker */}
          <div className="bg-sand p-4 rounded-xl border border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                Monthly Gross Income
              </span>
              <p className="text-[11px] text-gray-400 no-print">Total client invoices and business revenue this month</p>
            </div>
            <div className="relative w-full sm:w-auto">
              <div className="print:hidden">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">
                  {getCurrencySymbol()}
                </span>
                <input
                  aria-label="Monthly Gross Income input"
                  type="number"
                  value={monthGrossIncomeInput}
                  onChange={(e) => handleUpdateMonthlyIncome(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full sm:w-48 bg-white font-display font-medium border border-gray-200 rounded-lg py-2 pl-8 pr-3 text-forest focus:outline-none"
                />
              </div>
              <div className="hidden print:block font-mono font-bold text-forest text-base">
                {fmt(activeLog.grossIncome)}
              </div>
            </div>
          </div>

          {/* Business Expenses Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest no-print">
              Log Business Expense / Write-Off
            </h3>

            {/* Expense input form */}
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end no-print">
              <div className="sm:col-span-5 space-y-1">
                <label htmlFor="expense-desc-input" className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                <input
                  id="expense-desc-input"
                  type="text"
                  placeholder="e.g. AWS Cloud Hosting, Office Chair"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full bg-sand-dark border border-gray-200 rounded-lg p-2 text-xs text-forest focus:outline-none focus:ring-1 focus:ring-forest"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label htmlFor="expense-category-select" className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                <select
                  id="expense-category-select"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-sand-dark border border-gray-200 rounded-lg p-2 text-xs text-forest focus:outline-none"
                >
                  <option value="Software & SaaS">Software & SaaS</option>
                  <option value="Office Rent & Coworking">Office / Coworking</option>
                  <option value="Hardware & Equipment">Hardware / Equipment</option>
                  <option value="Marketing & Advertising">Marketing / Ads</option>
                  <option value="Travel & Transport">Travel / Transport</option>
                  <option value="Meals & Entertainment">Meals & Events</option>
                  <option value="Legal & Professional">Legal / Consultants</option>
                  <option value="Other Expenses">Other Write-Offs</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label htmlFor="expense-amount-input" className="text-[10px] font-bold text-gray-500 uppercase">Amount ({getCurrencySymbol()})</label>
                <input
                  id="expense-amount-input"
                  type="number"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full bg-sand-dark border border-gray-200 rounded-lg p-2 text-xs text-forest focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="sm:col-span-2 bg-forest hover:bg-forest-light text-lime font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer h-[34px]"
              >
                <Plus size={14} />
                <span>Log</span>
              </button>
            </form>

            {/* List of logged transactions */}
            <div className="border border-gray-150 rounded-xl overflow-hidden mt-4 print:border-gray-200">
              <div className="bg-sand p-3 border-b border-gray-150 flex justify-between text-xs font-bold text-gray-600 print:bg-gray-50 print:border-gray-200">
                <span>Date & Description</span>
                <span>Category & Amount</span>
              </div>
              
              {activeLog.expenses.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No logged write-offs for this month. Use the builder above to log software, coworking, or hardware purchases.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto print:max-h-none print:overflow-visible print:divide-gray-200">
                  {activeLog.expenses.map((exp) => (
                    <div key={exp.id} className="p-3 flex justify-between items-center text-xs hover:bg-sand/30 transition-colors">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] text-gray-400 block">{exp.date}</span>
                        <span className="font-bold text-gray-800">{exp.description}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-100 text-gray-600 font-sans block w-fit ml-auto print:border print:border-gray-250 print:bg-white">
                            {exp.category}
                          </span>
                          <span className="font-mono font-bold text-red-500 block mt-0.5">
                            -{fmt(exp.amount)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors cursor-pointer no-print"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Month Summary card & Smart AI Advisor panel */}
        <div className="lg:col-span-4 space-y-6">
          {/* Monthly balances details */}
          <div className="bg-sand-dark p-6 rounded-2xl border border-gray-200/60 shadow-sm space-y-4">
            <div className="text-left">
              <h3 className="font-display font-bold text-base text-forest">Monthly Balance Sheets</h3>
              {targetCurrency !== "Native" && (
                <span className="text-[10px] text-gray-400 block font-sans mt-0.5 leading-none">
                  (Converted to {getActiveDisplayCurrencyCode()})
                </span>
              )}
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-gray-200/50">
                <span className="text-gray-500 font-medium">Monthly Gross:</span>
                <span className="font-mono font-bold text-gray-800">{fmt(activeLog.grossIncome)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200/50">
                <span className="text-gray-500 font-medium">Monthly Expenses:</span>
                <span className="font-mono font-bold text-red-500">-{fmt(totalMonthlyExpenses)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-gray-200/50">
                <span className="text-gray-600 font-bold">Net Monthly Profit:</span>
                <span className="font-mono font-bold text-forest">{fmt(netMonthlyIncome)}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-gray-500 font-medium">Est. Tax Withholding:</span>
                <span className="font-mono font-bold text-red-400 italic">~{fmt(estimatedTaxWithholding)}</span>
              </div>
              <p className="text-[10px] text-gray-400 text-right font-sans italic">
                (calculated at your {calcResult?.effectiveTaxRate.toFixed(1)}% annual rate)
              </p>
            </div>
          </div>

          {/* AI Tax Write-off Advisor (Gemini integration!) */}
          <div className={`bg-white p-6 rounded-2xl border border-lime-dark/10 bg-gradient-to-br from-white to-lime/5 shadow-sm space-y-4 relative print-invert-colors print:border-gray-200 print:bg-white print:text-black ${!aiAdvice ? "no-print" : ""}`}>
            <div className="flex items-center space-x-2 text-forest">
              <Sparkles className="text-forest animate-pulse no-print" size={18} />
              <h3 className="font-display font-bold text-base">AI Freelance Tax Advisor</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed font-sans no-print">
              Get personalized tax strategies, deduction tips, and write-off lists matching your freelance or small business profile!
            </p>

            {/* Category selection */}
            <div className="space-y-1 no-print">
              <label htmlFor="business-category-input" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                Freelance Industry / Category
              </label>
              <input
                id="business-category-input"
                type="text"
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                placeholder="e.g. Graphic Designer, Software Consultant"
                className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
              />
            </div>

            {/* Print-only analyzed profile label */}
            <div className="hidden print:block text-xs font-bold text-gray-800 text-left">
              Analyzed Industry Segment: <span className="font-mono text-forest">{businessCategory}</span>
            </div>

            {/* Fetch Advice Button */}
            <button
              type="button"
              onClick={handleGetAiAdvice}
              disabled={isAiLoading || !businessCategory}
              className={`w-full font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer no-print ${
                isAiLoading || !businessCategory
                  ? "bg-gray-100 text-gray-400"
                  : "bg-forest hover:bg-forest-light text-lime shadow-sm"
              }`}
            >
              <Sparkles size={14} />
              <span>{isAiLoading ? "Analyzing Business Profile..." : "Analyze & Suggest Write-offs"}</span>
            </button>

            {/* Error handling */}
            {aiError && (
              <p className="text-[11px] text-red-500 mt-2 p-2 bg-red-50 rounded-lg no-print">
                ⚠️ {aiError}
              </p>
            )}

            {/* Rendered markdown container for AI Advice */}
            {aiAdvice && (
              <div className="mt-4 p-4 bg-sand border border-gray-150 rounded-xl space-y-3 text-xs leading-relaxed max-h-[350px] overflow-y-auto shadow-inner text-gray-700 font-sans border-t-2 border-forest print:max-h-none print:overflow-visible print:border-gray-200 print:bg-white print:text-black">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1 border-b border-gray-200">
                  <div className="flex items-center space-x-1.5 text-forest font-bold">
                    <FileText size={14} />
                    <span>Your Customized AI Report</span>
                  </div>
                  <span className="text-[8px] font-mono font-bold bg-forest/10 text-forest px-1.5 py-0.5 rounded uppercase no-print">
                    AI-Generated Advice
                  </span>
                </div>
                
                {/* Simplified markdown formatter for plain browser elements */}
                <div className="space-y-2 whitespace-pre-line text-[11px]">
                  {aiAdvice}
                </div>

                <div className="pt-2 border-t border-gray-200/50 text-[9px] text-gray-400 italic leading-snug font-sans">
                  ⚠️ AI advice is generated for general informational/educational purposes only. Content may occasionally be inaccurate. Always verify critical metrics with a qualified CPA or licensed tax professional.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
