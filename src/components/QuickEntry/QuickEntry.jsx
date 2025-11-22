import React, { useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";

const QuickEntry = ({ onQuickAdd }) => {
  const [loading, setLoading] = useState(false);
  const [lastClicked, setLastClicked] = useState(null);

  const quickTransactions = [
    {
      type: "expense",
      amount: 50,
      tag: "food",
      name: "Quick Food",
      icon: "🍔",
    },
    {
      type: "expense",
      amount: 100,
      tag: "travel",
      name: "Quick Travel",
      icon: "🚗",
    },
    {
      type: "expense",
      amount: 200,
      tag: "shopping",
      name: "Quick Shopping",
      icon: "🛍️",
    },
    {
      type: "expense",
      amount: 500,
      tag: "bills",
      name: "Quick Bill",
      icon: "💳",
    },
    {
      type: "income",
      amount: 1000,
      tag: "freelance",
      name: "Quick Income",
      icon: "💰",
    },
  ];

  const handleQuickAdd = async (template, index) => {
    // Prevent double-clicking
    if (loading) {
      return;
    }

    // Prevent clicking the same button too quickly
    if (lastClicked === index && Date.now() - (lastClicked.timestamp || 0) < 1000) {
      return;
    }

    setLoading(true);
    setLastClicked({ index, timestamp: Date.now() });

    try {
      const transaction = {
        type: template.type,
        amount: parseFloat(template.amount),
        tag: template.tag,
        name: template.name,
        date: moment().format("YYYY-MM-DD"),
      };

      await onQuickAdd(transaction);
      // Don't show toast here - let the parent handle it
    } catch (error) {
      console.error("Error in quick add:", error);
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          Quick Entry
        </h3>
        <p className="text-xs text-gray-500">
          One-tap common transactions
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {quickTransactions.map((template, index) => {
          const isDisabled = loading;
          const isActive = lastClicked?.index === index && loading;
          
          return (
            <button
              key={index}
              onClick={() => handleQuickAdd(template, index)}
              disabled={isDisabled}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 cursor-pointer"
              } ${
                template.type === "income"
                  ? isActive
                    ? "border-success-400 bg-success-100"
                    : "border-success-200 bg-success-50 hover:bg-success-100"
                  : isActive
                  ? "border-danger-400 bg-danger-100"
                  : "border-danger-200 bg-danger-50 hover:bg-danger-100"
              }`}
            >
              {isActive ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700 mb-1"></div>
              ) : (
                <span className="text-2xl mb-1">{template.icon}</span>
              )}
              <span className="text-xs font-medium text-gray-700">
                ₹{template.amount}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {template.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickEntry;

