import React, { useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";

const DEFAULT_TEMPLATES = [
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

const QuickEntry = ({ onQuickAdd, templates = [], onCustomize }) => {
  const [loading, setLoading] = useState(false);
  const [lastClicked, setLastClicked] = useState(null);

  // Use custom templates if available, otherwise use defaults
  const quickTransactions = templates.length > 0 ? templates : DEFAULT_TEMPLATES;

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
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">
            Quick Entry
          </h3>
          <p className="text-xs text-gray-500">
            One-tap common transactions
          </p>
        </div>
        {onCustomize && (
          <button
            onClick={onCustomize}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
            title="Customize quick entry buttons"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Customize
          </button>
        )}
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

