import React from "react";
import moment from "moment";

const IOU = ({ ious = [], onComplete, onDelete }) => {
  if (!ious || ious.length === 0) {
    return (
      <div className="text-secondary-600">No pending IOUs. Add one to get started.</div>
    );
  }

  return (
    <div className="space-y-4">
      {ious.map((iou) => (
        <div
          key={iou.id}
          className="border border-secondary-100 rounded-lg p-4 hover:border-primary-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">{iou.person || iou.name || "Unknown"}</p>
              <p className="text-sm text-secondary-500">{iou.note}</p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold text-lg ${
                  iou.direction === "give" ? "text-danger-600" : "text-success-600"
                }`}
              >
                {iou.direction === "give" ? "Give" : "Take"} ₹{Number(iou.amount).toFixed(2)}
              </p>
              <p className="text-xs text-secondary-500">{moment(iou.date).format("YYYY-MM-DD")}</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onComplete(iou)}
              className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
            >
              Mark Complete
            </button>
            <button
              onClick={() => onDelete(iou.id)}
              className="px-3 py-1 bg-danger-100 text-danger-700 rounded hover:bg-danger-200 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IOU;
