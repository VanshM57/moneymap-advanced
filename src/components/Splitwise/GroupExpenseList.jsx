import React from "react";
import moment from "moment";

const GroupExpenseList = ({ expenses, currentUserId, memberDetails, onDelete }) => {
  const getDisplayName = (memberId) => {
    return memberDetails[memberId]?.displayName ||
      memberDetails[memberId]?.email ||
      memberId.substring(0, 8);
  };

  return (
    <div className="space-y-3">
      {expenses
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map((expense) => (
          <div
            key={expense.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-800">{expense.description}</p>
                <p className="text-sm text-gray-600">
                  Paid by {getDisplayName(expense.paidBy)}
                  {expense.paidBy === currentUserId ? " (You)" : ""}
                </p>
              </div>
              <p className="text-lg font-bold text-primary-600">
                ₹{Number(expense.amount).toFixed(2)}
              </p>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
              <span>{moment(expense.date).format("MMM DD, YYYY")}</span>
              <span>Split among {expense.splitAmong?.length || 2} people</span>
            </div>

            <button
              onClick={() => onDelete(expense.id)}
              className="px-3 py-1 text-xs bg-danger-100 text-danger-700 rounded hover:bg-danger-200 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
    </div>
  );
};

export default GroupExpenseList;
