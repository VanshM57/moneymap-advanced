import React, { useEffect, useRef, useState } from "react";
import { Line, Pie } from "@ant-design/charts";
import moment from "moment";
import dayjs from "dayjs";
import TransactionSearch from "./TrasactionSearch";
import Header from "../components/Header/Header";
import AddIncomeModal from "../components/Modals/AddIncome";
import AddExpenseModal from "../components/Modals/AddExpense";
import AddBudgetModal from "../components/Modals/AddBudget";
import EditTransactionModal from "../components/Modals/EditTransaction";
import CustomizeQuickEntry from "../components/Modals/CustomizeQuickEntry";
import AddIOUModal from "../components/Modals/AddIOU";
import IOU from "../components/IOU/IOU";
import Cards from "../components/Cards/Cards";
import NoTransactions from "./NoTransactions";
import Timeline from "../components/Timeline/Timeline";
import VoiceCommand from "../components/VoiceCommand/VoiceCommand";
import QuickEntry from "../components/QuickEntry/QuickEntry";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc } from "firebase/firestore";
import Loader from "../components/Loader/Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { unparse } from "papaparse";
import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [isBudgetModalVisible, setIsBudgetModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isQuickEntryCustomizeVisible, setIsQuickEntryCustomizeVisible] = useState(false);
  const [quickEntryTemplates, setQuickEntryTemplates] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [ious, setIous] = useState([]);
  const [isIouModalVisible, setIsIouModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(29, "day"), dayjs()]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" or "table"
  const alertedBudgetsRef = useRef(new Set());
  const navigate = useNavigate();

  // Standard
  // const processChartData = () => {
  //   const balanceData = [];
  //   const spendingData = {};

  //   transactions.forEach((transaction) => {
  //     const monthYear = moment(transaction.date).format("MMM YYYY");
  //     const tag = transaction.tag;

  //     if (transaction.type === "income") {
  //       if (balanceData.some((data) => data.month === monthYear)) {
  //         balanceData.find((data) => data.month === monthYear).balance +=
  //           transaction.amount;
  //       } else {
  //         balanceData.push({ month: monthYear, balance: transaction.amount });
  //       }
  //     } else {
  //       if (balanceData.some((data) => data.month === monthYear)) {
  //         balanceData.find((data) => data.month === monthYear).balance -=
  //           transaction.amount;
  //       } else {
  //         balanceData.push({ month: monthYear, balance: -transaction.amount });
  //       }

  //       if (spendingData[tag]) {
  //         spendingData[tag] += transaction.amount;
  //       } else {
  //         spendingData[tag] = transaction.amount;
  //       }
  //     }
  //   });

  //   const spendingDataArray = Object.keys(spendingData).map((key) => ({
  //     category: key,
  //     value: spendingData[key],
  //   }));

  //   return { balanceData, spendingDataArray };
  // };


  // For line chart between months and balance
//   const processChartData = () => {
//   const monthlyMap = {};
//   const spendingData = {};

//   // Group income and expenses by month
//   transactions.forEach((transaction) => {
//     const monthKey = moment(transaction.date).format("YYYY-MM"); // for sorting
//     const displayMonth = moment(transaction.date).format("MMM YYYY");
//     const tag = transaction.tag;

//     if (!monthlyMap[monthKey]) {
//       monthlyMap[monthKey] = {
//         monthKey,
//         month: displayMonth,
//         income: 0,
//         expense: 0,
//       };
//     }

//     if (transaction.type === "income") {
//       monthlyMap[monthKey].income += transaction.amount;
//     } else {
//       monthlyMap[monthKey].expense += transaction.amount;

//       if (spendingData[tag]) {
//         spendingData[tag] += transaction.amount;
//       } else {
//         spendingData[tag] = transaction.amount;
//       }
//     }
//   });

//   // Sort months chronologically
//   const sortedMonths = Object.values(monthlyMap).sort(
//     (a, b) => new Date(a.monthKey) - new Date(b.monthKey)
//   );

//   // Calculate cumulative balance
//   let cumulativeBalance = 0;
//   const balanceData = sortedMonths.map((item) => {
//     cumulativeBalance += item.income - item.expense;
//     return {
//       month: item.month,
//       balance: cumulativeBalance,
//     };
//   });

//   const spendingDataArray = Object.keys(spendingData).map((key) => ({
//     category: key,
//     value: spendingData[key],
//   }));

//   return { balanceData, spendingDataArray };
// };


// for line chart between days and balance
  const processChartData = () => {
  const dailyMap = {};
  const spendingData = {};

  transactions.forEach((transaction) => {
    const dateKey = moment(transaction.date).format("YYYY-MM-DD");
    const displayDate = moment(dateKey).format("DD MMM");
    const tag = transaction.tag;

    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = {
        dateKey,
        date: displayDate,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income") {
      dailyMap[dateKey].income += transaction.amount;
    } else {
      dailyMap[dateKey].expense += transaction.amount;

      if (spendingData[tag]) {
        spendingData[tag] += transaction.amount;
      } else {
        spendingData[tag] = transaction.amount;
      }
    }
  });

  // Sort days chronologically
  const sortedDays = Object.values(dailyMap).sort(
    (a, b) => new Date(a.dateKey) - new Date(b.dateKey)
  );

  // Calculate cumulative balance
  let cumulativeBalance = 0;
  const balanceData = sortedDays.map((item) => {
    cumulativeBalance += item.income - item.expense;
    return {
      date: item.date,
      amount: cumulativeBalance,
    };
  });

  const spendingDataArray = Object.keys(spendingData).map((key) => ({
    category: key,
    value: spendingData[key],
  }));

  return { balanceData, spendingDataArray };
};




  const { balanceData, spendingDataArray } = processChartData();
  const showExpenseModal = () => setIsExpenseModalVisible(true);
  const showIncomeModal = () => setIsIncomeModalVisible(true);
  const showBudgetModal = () => setIsBudgetModalVisible(true);
  const handleExpenseCancel = () => setIsExpenseModalVisible(false);
  const handleIncomeCancel = () => setIsIncomeModalVisible(false);
  const handleBudgetCancel = () => setIsBudgetModalVisible(false);
  
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalVisible(true);
  };
  
  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setEditingTransaction(null);
  };
  
  const handleEditFinish = async (values, type) => {
    if (!editingTransaction || !editingTransaction.id) {
      toast.error("Invalid transaction data");
      return;
    }
    
    const updatedTransaction = {
      type,
      date: values.date.format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };
    
    const success = await updateTransaction(editingTransaction.id, updatedTransaction);
    if (success) {
      setIsEditModalVisible(false);
      setEditingTransaction(null);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
    fetchQuickEntryTemplates();
    fetchIOUs();
  }, [user]);

  const onFinish = (values, type) => {
    const newTransaction = {
      type,
      date: values.date.format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };

    setAllTransactions([...allTransactions, newTransaction]);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    addTransaction(newTransaction);
  };

  const handleQuickAdd = async (transaction) => {
    try {
      // Ensure amount is a number
      const formattedTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount),
      };
      
      // Validate transaction
      if (!formattedTransaction.type || !formattedTransaction.amount || formattedTransaction.amount <= 0) {
        toast.error("Invalid transaction data");
        return;
      }
      
      // Add to local state immediately for UI responsiveness
      const updatedTransactions = [...allTransactions, formattedTransaction];
      setAllTransactions(updatedTransactions);
      
      // Save to database
      const success = await addTransaction(formattedTransaction, false);
      
      if (success) {
        // Refresh from database to ensure consistency
        await fetchTransactions();
        toast.success(`Added ${formattedTransaction.type}: ₹${formattedTransaction.amount} for ${formattedTransaction.tag}`);
      } else {
        // Revert local state on error
        setAllTransactions(allTransactions);
      }
    } catch (error) {
      console.error("Error adding quick transaction:", error);
      toast.error("Failed to add transaction. Please try again.");
      // Revert local state on error
      setAllTransactions(allTransactions);
      throw error; // Re-throw so QuickEntry can handle it
    }
  };

  const handleVoiceAdd = async (transaction) => {
    try {
      // Ensure amount is a number
      const formattedTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount),
      };
      
      // Add to local state immediately for UI responsiveness
      const updatedTransactions = [...allTransactions, formattedTransaction];
      setAllTransactions(updatedTransactions);
      
      // Save to database
      await addTransaction(formattedTransaction, false);
      
      // Refresh from database to ensure consistency
      await fetchTransactions();
    } catch (error) {
      console.error("Error adding voice transaction:", error);
      toast.error("Failed to add transaction. Please try again.");
      // Revert local state on error
      setAllTransactions(allTransactions);
    }
  };

  const calculateBalance = (data = transactions) => {
    let incomeTotal = 0;
    let expensesTotal = 0;

    data.forEach((transaction) => {
      transaction.type === "income"
        ? (incomeTotal += transaction.amount)
        : (expensesTotal += transaction.amount);
    });

    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setCurrentBalance(incomeTotal - expensesTotal);
  };

  useEffect(() => {
    calculateBalance(transactions);
  }, [transactions]);

  useEffect(() => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      setTransactions(allTransactions);
      return;
    }

    const [start, end] = dateRange;
    const startMoment = moment(start.toDate()).startOf("day");
    const endMoment = moment(end.toDate()).endOf("day");

    const filtered = allTransactions.filter((transaction) => {
      const transactionDate = moment(transaction.date);
      return transactionDate.isBetween(startMoment, endMoment, "day", "[]");
    });

    setTransactions(filtered);
  }, [allTransactions, dateRange]);

  async function addTransaction(transaction, many) {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }
    
    try {
      // Ensure all required fields are present
      const transactionData = {
        type: transaction.type,
        amount: parseFloat(transaction.amount) || 0,
        tag: transaction.tag || "miscellaneous",
        name: transaction.name || `${transaction.type} transaction`,
        date: transaction.date || moment().format("YYYY-MM-DD"),
      };

      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transactionData
      );
      
      if (!many) {
        // Don't show toast here as it's already shown in handleQuickAdd/handleVoiceAdd
        // toast.success("Transaction Added!");
      }
      return true;
    } catch (e) {
      console.error("Error adding transaction:", e);
      if (!many) {
        toast.error("Couldn't add transaction: " + (e.message || "Unknown error"));
      }
      return false;
    }
  }

  async function updateTransaction(transactionId, updatedData) {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      const transactionData = {
        type: updatedData.type,
        amount: parseFloat(updatedData.amount) || 0,
        tag: updatedData.tag || "miscellaneous",
        name: updatedData.name || `${updatedData.type} transaction`,
        date: updatedData.date || moment().format("YYYY-MM-DD"),
      };

      const transactionRef = doc(db, `users/${user.uid}/transactions/${transactionId}`);
      await updateDoc(transactionRef, transactionData);
      toast.success("Transaction updated successfully!");
      await fetchTransactions();
      return true;
    } catch (e) {
      console.error("Error updating transaction:", e);
      toast.error("Couldn't update transaction: " + (e.message || "Unknown error"));
      return false;
    }
  }

  async function deleteTransaction(transactionId) {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      const transactionRef = doc(db, `users/${user.uid}/transactions/${transactionId}`);
      await deleteDoc(transactionRef);
      toast.success("Transaction deleted successfully!");
      await fetchTransactions();
      return true;
    } catch (e) {
      console.error("Error deleting transaction:", e);
      toast.error("Couldn't delete transaction: " + (e.message || "Unknown error"));
      return false;
    }
  }

  async function fetchTransactions() {
    setLoading(true);
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
      const transactionsArray = querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setAllTransactions(transactionsArray);
      setTransactions(transactionsArray);
      // Removed toast to prevent spam - only show on initial load if needed
    }
    setLoading(false);
  }

  async function fetchBudgets() {
    if (!user) return;
    try {
      const q = query(collection(db, `users/${user.uid}/budgets`));
      const querySnapshot = await getDocs(q);
      const budgetsArray = querySnapshot.docs.map((budgetDoc) => ({
        id: budgetDoc.id,
        ...budgetDoc.data(),
      }));
      setBudgets(budgetsArray);
    } catch (error) {
      toast.error("Couldn't fetch budgets");
    }
  }

  async function fetchIOUs() {
    if (!user) return;
    try {
      const q = query(collection(db, `users/${user.uid}/ious`));
      const querySnapshot = await getDocs(q);
      const iousArray = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // show only pending IOUs by default
      setIous(iousArray.filter((i) => !i.status || i.status === "pending"));
    } catch (error) {
      console.error("Couldn't fetch IOUs", error);
    }
  }

  async function fetchQuickEntryTemplates() {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.quickEntryTemplates && userData.quickEntryTemplates.length > 0) {
          setQuickEntryTemplates(userData.quickEntryTemplates);
          return;
        }
      }
      // If no custom templates, use empty array (QuickEntry will use defaults)
      setQuickEntryTemplates([]);
    } catch (error) {
      console.error("Error fetching quick entry templates:", error);
      setQuickEntryTemplates([]);
    }
  }

  async function saveQuickEntryTemplates(templates) {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        quickEntryTemplates: templates,
      });
      
      setQuickEntryTemplates(templates);
      toast.success("Quick entry templates saved!");
      setIsQuickEntryCustomizeVisible(false);
      return true;
    } catch (error) {
      console.error("Error saving quick entry templates:", error);
      toast.error("Couldn't save templates: " + (error.message || "Unknown error"));
      return false;
    }
  }

  const normalizeTag = (value = "") => value.trim().toLowerCase();

  async function addBudget(budget) {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }
    
    try {
      const displayTag = budget.tag?.trim() || "";
      if (!displayTag) {
        toast.error("Please enter a valid tag for the budget.");
        return false;
      }
      
      const normalizedTag = normalizeTag(budget.tag);
      
      // Check for duplicate budget with the same tag (case-insensitive)
      const existingBudget = budgets.find(
        (b) => {
          const existingTag = normalizeTag(b.tag || b.tagLabel || "");
          return existingTag === normalizedTag && existingTag !== "";
        }
      );
      
      if (existingBudget) {
        const existingTagLabel = existingBudget.tagLabel || existingBudget.tag || normalizedTag;
        toast.error(
          `A budget for "${existingTagLabel}" already exists. ` +
          `Please edit or remove the existing budget first.`
        );
        return false;
      }
      
      const payload = {
        ...budget,
        tag: normalizedTag,
        tagLabel: displayTag,
        limit: parseFloat(budget.limit),
        createdAt: new Date(),
      };

      if (payload.period === "custom") {
        payload.customDays = Number(payload.customDays) || 30;
        // Validate custom days range
        if (payload.customDays < 3 || payload.customDays > 365) {
          toast.error("Custom period must be between 3 and 365 days.");
          return false;
        }
      } else {
        delete payload.customDays;
      }

      // Validate limit
      if (!payload.limit || payload.limit <= 0) {
        toast.error("Budget limit must be greater than 0.");
        return false;
      }

      await addDoc(collection(db, `users/${user.uid}/budgets`), payload);
      toast.success("Budget added successfully!");
      fetchBudgets();
      return true;
    } catch (error) {
      console.error("Error adding budget:", error);
      toast.error("Couldn't add budget: " + (error.message || "Unknown error"));
      return false;
    }
  }

  async function addIOU(iou) {
    if (!user) {
      toast.error("User not authenticated");
      return false;
    }

    try {
      const payload = {
        person: iou.person || iou.name || "",
        amount: parseFloat(iou.amount) || 0,
        date: iou.date || moment().format("YYYY-MM-DD"),
        direction: iou.direction || "give",
        note: iou.note || "",
        status: "pending",
        createdAt: new Date(),
      };

      await addDoc(collection(db, `users/${user.uid}/ious`), payload);
      toast.success("IOU added");
      fetchIOUs();
      return true;
    } catch (error) {
      console.error("Error adding IOU:", error);
      toast.error("Couldn't add IOU");
      return false;
    }
  }

  async function deleteIOU(iouId) {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/ious/${iouId}`));
      toast.success("IOU removed");
      fetchIOUs();
    } catch (error) {
      console.error("Couldn't remove IOU", error);
      toast.error("Couldn't remove IOU");
    }
  }

  // Mark IOU complete and create a corresponding transaction
  async function completeIOU(iou) {
    if (!user) return;
    try {
      // Determine transaction type: if user 'gives' money -> expense, if user 'takes' -> income
      const txType = iou.direction === "give" ? "expense" : "income";
      const transaction = {
        type: txType,
        date: iou.date || moment().format("YYYY-MM-DD"),
        amount: parseFloat(iou.amount) || 0,
        tag: iou.direction === "give" ? "iou-payment" : "iou-receipt",
        name: iou.person ? `${iou.direction === "give" ? "Paid" : "Received from"} ${iou.person}` : (iou.name || "IOU transaction"),
      };

      const success = await addTransaction(transaction, false);
      if (success) {
        // update IOU status to completed
        const iouRef = doc(db, `users/${user.uid}/ious/${iou.id}`);
        try {
          await updateDoc(iouRef, { status: "completed", completedAt: new Date() });
        } catch (e) {
          // if update fails, attempt to delete as fallback
          console.warn("Couldn't update IOU status, deleting instead", e);
          await deleteDoc(iouRef);
        }
        toast.success("IOU completed and transaction created");
        fetchIOUs();
        fetchTransactions();
      }
    } catch (error) {
      console.error("Error completing IOU:", error);
      toast.error("Couldn't complete IOU");
    }
  }

  async function removeBudget(budgetId) {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/budgets/${budgetId}`));
      toast.success("Budget removed");
      fetchBudgets();
      alertedBudgetsRef.current.delete(budgetId);
    } catch (error) { 
      toast.error("Couldn't remove budget");
    }
  }

  const getBudgetWindowStart = (budget) => {
    const today = moment();
    if (budget.period === "weekly") {
      return today.clone().startOf("week");
    }
    if (budget.period === "custom") {
      const customDays = Number(budget.customDays) || 30;
      return today.clone().subtract(customDays - 1, "days").startOf("day");
    }
    return today.clone().startOf("month");
  };

  const calculateBudgetUsage = (budget) => {
    const since = getBudgetWindowStart(budget);
    const normalizedBudgetTag = normalizeTag(budget.tag);

    const spent = transactions
      .filter(
        (transaction) =>
          transaction.type === "expense" &&
          normalizeTag(transaction.tag) === normalizedBudgetTag &&
          moment(transaction.date).isSameOrAfter(since, "day")
      )
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const percent = budget.limit ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0;

    return { spent, percent };
  };

  const getBudgetLabel = (budget) => {
    if (budget.period === "weekly") return "Weekly";
    if (budget.period === "custom") {
      const days = Number(budget.customDays) || 30;
      return `${days}-Day`;
    }
    return "Monthly";
  };

  const handleBudgetSubmit = async (values) => {
    const success = await addBudget(values);
    if (success) {
      setIsBudgetModalVisible(false);
    }
  };

  useEffect(() => {
    budgets.forEach((budget) => {
      const { spent } = calculateBudgetUsage(budget);
      if (spent >= budget.limit) {
        if (!alertedBudgetsRef.current.has(budget.id)) {
          toast.error(`Budget limit reached for ${budget.tag}!`);
          alertedBudgetsRef.current.add(budget.id);
        }
      } else if (alertedBudgetsRef.current.has(budget.id)) {
        alertedBudgetsRef.current.delete(budget.id);
      }
    });
  }, [budgets, transactions]);

  // for monthly balance chart
  // const balanceConfig = {
  //   data: balanceData,
  //   xField: "month",
  //   yField: "balance",
  //   smooth: true,
  //   autoFit: true,
  //   height: 300,
  // };

  // for daily balance chart
  const balanceConfig = {
  data: balanceData,
  xField: "date",
  yField: "amount",
  smooth: true,
  autoFit: true,
  height: 300,
};

  const spendingConfig = {
    data: spendingDataArray,
    angleField: "value",
    colorField: "category",
    radius: 1,
    innerRadius: 0.6,
    height: 300,
  };

  const exportToCsv = () => {
    const csv = unparse(transactions, {
      fields: ["name", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-2 w-full mx-auto">
      <Header />
      <div className="mt-4 bg-white shadow-md rounded-lg p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-secondary-500 uppercase tracking-wide">
            Showing data for
          </p>
          <p className="text-lg font-semibold text-secondary-800">
            {dateRange && dateRange[0] && dateRange[1]
              ? `${dateRange[0].format("DD MMM YYYY")} - ${dateRange[1].format("DD MMM YYYY")}`
              : "All Time"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <RangePicker
            value={dateRange}
            onChange={(values) => setDateRange(values && values[0] && values[1] ? values : null)}
            format="DD MMM YYYY"
            allowClear
            className="w-full sm:w-auto"
          />
          <button
            onClick={() => setDateRange([dayjs().subtract(29, "day"), dayjs()])}
            className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateRange(null)}
            className="px-4 py-2 bg-secondary-50 text-secondary-700 rounded-lg border border-secondary-200 hover:bg-secondary-100 transition-colors"
          >
            All Time
          </button>
        </div>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cards
            currentBalance={currentBalance}
            income={income}
            expenses={expenses}
            showExpenseModal={showExpenseModal}
            showIncomeModal={showIncomeModal}
            cardStyle={{}}
            reset={() => console.log("resetting")}
          />

          {/* Voice Commands & Quick Entry */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VoiceCommand onTransactionAdd={handleVoiceAdd} />
            <QuickEntry 
              onQuickAdd={handleQuickAdd}
              templates={quickEntryTemplates}
              onCustomize={() => setIsQuickEntryCustomizeVisible(true)}
            />
          </div>

          <AddExpenseModal
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={handleExpenseCancel}
            onFinish={onFinish}
          />
          <AddIncomeModal
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={handleIncomeCancel}
            onFinish={onFinish}
          />
          <AddBudgetModal
            isBudgetModalVisible={isBudgetModalVisible}
            handleBudgetCancel={handleBudgetCancel}
            onFinish={handleBudgetSubmit}
          />
          <AddIOUModal
            isVisible={isIouModalVisible}
            onCancel={() => setIsIouModalVisible(false)}
            onFinish={(values) => {
              // format date if moment object
              const payload = { ...values };
              if (values.date && values.date.format) payload.date = values.date.format("YYYY-MM-DD");
              addIOU(payload).then(() => setIsIouModalVisible(false));
            }}
          />
          <EditTransactionModal
            isEditModalVisible={isEditModalVisible}
            handleEditCancel={handleEditCancel}
            onFinish={handleEditFinish}
            transaction={editingTransaction}
          />
          <CustomizeQuickEntry
            isVisible={isQuickEntryCustomizeVisible}
            onCancel={() => setIsQuickEntryCustomizeVisible(false)}
            onSave={saveQuickEntryTemplates}
            currentTemplates={quickEntryTemplates}
          />

          <div className="shadow-md rounded-lg p-4 sm:p-6 w-full bg-white mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Smart Budgets</h2>
                <p className="text-secondary-500 text-sm">
                  Stay on top of your spending with category limits and instant alerts.
                </p>
              </div>
              <button
                onClick={showBudgetModal}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Add Budget
              </button>
            </div>
            {budgets.length === 0 ? (
              <p className="text-secondary-600">
                No smart budgets yet. Create one to start receiving alerts when you overspend.
              </p>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => {
                  const usage = calculateBudgetUsage(budget);
                  const isOver = usage.spent >= budget.limit;
                  const displayTag = budget.tagLabel || budget.tag;
                  return (
                    <div
                      key={budget.id}
                      className="border border-secondary-100 rounded-lg p-4 hover:border-primary-200 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold capitalize">{displayTag}</p>
                          <p className="text-sm text-secondary-500">{getBudgetLabel(budget)} limit</p>
                        </div>
                        <button
                          onClick={() => removeBudget(budget.id)}
                          className="text-sm text-danger-600 hover:text-danger-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-4 font-medium">
                        <span className="text-secondary-700">₹{usage.spent.toFixed(2)} used</span>
                        <span className="text-secondary-700">₹{Number(budget.limit).toFixed(2)} limit</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-secondary-100 mt-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isOver ? "bg-danger-500" : "bg-primary-500"
                          }`}
                          style={{ width: `${usage.percent}%` }}
                        />
                      </div>
                      <p
                        className={`text-sm mt-2 ${
                          isOver ? "text-danger-600 font-semibold" : "text-secondary-600"
                        }`}
                      >
                        {isOver
                          ? "You've exceeded this budget. Review your spending to get back on track."
                          : `₹${Math.max(0, Number(budget.limit) - usage.spent).toFixed(2)} remaining this period.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* IOU Section */}
          <div className="shadow-md rounded-lg p-4 sm:p-6 w-full bg-white mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Lend / Borrow (IOU)</h2>
                <p className="text-secondary-500 text-sm">
                  Track amounts you need to give or take. Mark complete to convert into transactions.
                </p>
              </div>
              <button
                onClick={() => setIsIouModalVisible(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300"
              >
                Add IOU
              </button>
            </div>
            <IOU ious={ious} onComplete={completeIOU} onDelete={deleteIOU} />
          </div>

          {transactions.length === 0 ? (
            <NoTransactions />
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 mt-6">
              <div className="shadow-md rounded-lg p-4 sm:p-6 w-full lg:w-3/5 bg-white">
                <h2 className="text-xl font-semibold mb-4">Financial Statistics</h2>
                <Line {...balanceConfig} />
              </div>
              <div className="shadow-md rounded-lg p-4 sm:p-6 w-full lg:w-2/5 bg-white">
                <h2 className="text-xl font-semibold mb-4">Total Spending</h2>
                {spendingDataArray.length === 0 ? (
                  <p className="text-gray-600">Seems like you haven't spent anything till now...</p>
                ) : (
                  <Pie {...spendingConfig} />
                )}
              </div>
            </div>
          )}

          {/* Unified Timeline View */}
          <div className="mt-6 shadow-md rounded-lg p-4 sm:p-6 w-full bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Unified Timeline</h2>
                <p className="text-secondary-500 text-sm">
                  See all your transactions, budget milestones, and daily summaries in one chronological view.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === "timeline"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    viewMode === "table"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Table
                </button>
              </div>
            </div>

            {viewMode === "timeline" ? (
              <Timeline
                transactions={transactions}
                budgets={budgets}
                dateRange={dateRange}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={deleteTransaction}
              />
            ) : (
              <TransactionSearch
                transactions={transactions}
                exportToCsv={exportToCsv}
                fetchTransactions={fetchTransactions}
                addTransaction={addTransaction}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={deleteTransaction}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;