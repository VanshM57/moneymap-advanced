import React from "react";

const GroupMembersList = ({ members, currentUserId, memberDetails, expenses = [] }) => {
  const shortenId = (id) => {
    if (!id) return "Unknown";
    return id.length > 12 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id;
  };

  const getDisplayName = (memberId) => {
    const md = memberDetails?.[memberId] || {};

    // Prefer explicit display name
    if (md.displayName) return md.displayName;

    // Try to infer a friendly name from recent expenses if available
    if (Array.isArray(expenses) && expenses.length) {
      const found = expenses.find(
        (e) => e.paidBy === memberId || e.payerId === memberId || e.paidByUid === memberId
      );
      if (found && found.paidByName) return found.paidByName;
    }

    // If we have an email (must contain @), show its local part — only used when no displayName or expense-derived name
    if (md.email && md.email.includes("@")) {
      const local = md.email.split("@")[0];
      if (local) return local;
    }

    // As a last resort show a shortened id but labelled as unknown (so full uid isn't presented raw)
    return shortenId(memberId) || "Unknown";
  };

  return (
    <div className="space-y-2">
      {members.map((memberId) => (
        <div
          key={memberId}
          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm text-gray-700">
            {getDisplayName(memberId)}
            {memberId === currentUserId && (
              <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                You
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
};

export default GroupMembersList;
