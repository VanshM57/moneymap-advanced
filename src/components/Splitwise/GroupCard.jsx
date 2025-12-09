import React from "react";

const GroupCard = ({ group, onView, onDelete }) => {
  const totalMembers = group.members ? group.members.length : 0;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{group.name}</h3>
      {group.description && (
        <p className="text-gray-600 text-sm mb-4">{group.description}</p>
      )}

      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{totalMembers}</span> members
        </p>
        {group.inviteCode && (
          <p className="text-sm text-gray-600">
            Code: <span className="font-mono font-semibold">{group.inviteCode}</span>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => {
            if (window.confirm("Delete this group?")) {
              onDelete(group.id);
            }
          }}
          className="px-4 py-2 bg-danger-100 text-danger-700 rounded-lg hover:bg-danger-200 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default GroupCard;
