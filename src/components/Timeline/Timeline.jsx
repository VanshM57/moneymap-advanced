import React, { useMemo } from "react";
import moment from "moment";

const Timeline = ({ transactions, budgets, dateRange }) => {
  const normalizeTag = (value = "") => value.trim().toLowerCase();

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

  const calculateBudgetUsage = (budget, transactions) => {
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

  // Generate timeline events
  const timelineEvents = useMemo(() => {
    const events = [];

    // Add transaction events
    transactions.forEach((transaction) => {
      events.push({
        id: `transaction-${transaction.date}-${transaction.name}-${transaction.amount}`,
        type: "transaction",
        date: transaction.date,
        timestamp: moment(transaction.date).valueOf(),
        data: transaction,
      });
    });

    // Add budget milestone events
    budgets.forEach((budget) => {
      const usage = calculateBudgetUsage(budget, transactions);
      const displayTag = budget.tagLabel || budget.tag;

      // Check for budget milestones (50%, 75%, 90%, 100%)
      const milestones = [50, 75, 90, 100];
      milestones.forEach((milestone) => {
        if (usage.percent >= milestone && usage.percent < milestone + 5) {
          // Only add milestone if there are transactions in the budget period
          const since = getBudgetWindowStart(budget);
          const hasTransactions = transactions.some(
            (t) =>
              t.type === "expense" &&
              normalizeTag(t.tag) === normalizeTag(budget.tag) &&
              moment(t.date).isSameOrAfter(since, "day")
          );

          if (hasTransactions) {
            events.push({
              id: `budget-${budget.id}-${milestone}`,
              type: "budget",
              date: moment().format("YYYY-MM-DD"),
              timestamp: moment().valueOf(),
              data: {
                budget,
                milestone,
                usage,
                displayTag,
              },
            });
          }
        }
      });
    });

    // Add daily summary events (group transactions by date)
    const dailySummaries = {};
    transactions.forEach((transaction) => {
      const date = transaction.date;
      if (!dailySummaries[date]) {
        dailySummaries[date] = {
          date,
          income: 0,
          expenses: 0,
          count: 0,
        };
      }
      if (transaction.type === "income") {
        dailySummaries[date].income += transaction.amount;
      } else {
        dailySummaries[date].expenses += transaction.amount;
      }
      dailySummaries[date].count += 1;
    });

    Object.keys(dailySummaries).forEach((date) => {
      const summary = dailySummaries[date];
      if (summary.count > 3) {
        // Only show summary if more than 3 transactions in a day
        events.push({
          id: `summary-${date}`,
          type: "summary",
          date,
          timestamp: moment(date).valueOf(),
          data: summary,
        });
      }
    });

    // Sort by timestamp (newest first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, budgets]);

  const getEventIcon = (event) => {
    switch (event.type) {
      case "transaction":
        return event.data.type === "income" ? (
          <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-success-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-danger-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "budget":
        return (
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
            />
            </svg>
          </div>
        );
      case "summary":
        return (
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-primary-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const renderEventContent = (event) => {
    switch (event.type) {
      case "transaction":
        const t = event.data;
        return (
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{t.name}</p>
                <p className="text-sm text-gray-500 capitalize">{t.tag}</p>
              </div>
              <p
                className={`text-lg font-bold ${
                  t.type === "income" ? "text-success-600" : "text-danger-600"
                }`}
              >
                {t.type === "income" ? "+" : "-"}₹{Number(t.amount).toFixed(2)}
              </p>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {moment(t.date).format("MMM DD, YYYY")}
            </p>
          </div>
        );

      case "budget":
        const { budget, milestone, usage, displayTag } = event.data;
        const isOver = usage.percent >= 100;
        return (
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">
                  Budget {milestone}% Reached
                </p>
                <p className="text-sm text-gray-500 capitalize">{displayTag}</p>
              </div>
              <p
                className={`text-lg font-bold ${
                  isOver ? "text-danger-600" : "text-primary-600"
                }`}
              >
                {usage.percent}%
              </p>
            </div>
            <div className="mt-2">
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isOver ? "bg-danger-500" : "bg-primary-500"
                  }`}
                  style={{ width: `${Math.min(100, usage.percent)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                ₹{usage.spent.toFixed(2)} / ₹{Number(budget.limit).toFixed(2)}
              </p>
            </div>
          </div>
        );

      case "summary":
        const summary = event.data;
        return (
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Daily Summary</p>
                <p className="text-sm text-gray-500">
                  {summary.count} transactions
                </p>
              </div>
              <div className="text-right">
                {summary.income > 0 && (
                  <p className="text-sm font-semibold text-success-600">
                    +₹{summary.income.toFixed(2)}
                  </p>
                )}
                {summary.expenses > 0 && (
                  <p className="text-sm font-semibold text-danger-600">
                    -₹{summary.expenses.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {moment(summary.date).format("MMM DD, YYYY")}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups = {};
    timelineEvents.forEach((event) => {
      const dateKey = moment(event.date).format("YYYY-MM-DD");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    return groups;
  }, [timelineEvents]);

  const sortedDates = Object.keys(groupedEvents).sort(
    (a, b) => moment(b).valueOf() - moment(a).valueOf()
  );

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No timeline events to display</p>
        <p className="text-sm text-gray-400 mt-2">
          Add transactions to see your financial timeline
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => {
        const events = groupedEvents[dateKey];
        const date = moment(dateKey);
        const isToday = date.isSame(moment(), "day");
        const isYesterday = date.isSame(moment().subtract(1, "day"), "day");

        let dateLabel;
        if (isToday) {
          dateLabel = "Today";
        } else if (isYesterday) {
          dateLabel = "Yesterday";
        } else {
          dateLabel = date.format("MMMM DD, YYYY");
        }

        return (
          <div key={dateKey} className="relative">
            <div className="sticky top-0 bg-white z-10 py-2 mb-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {dateLabel}
              </h3>
            </div>
            <div className="space-y-4 pl-6 border-l-2 border-gray-200">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="relative flex items-start gap-4 pb-4"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[29px] top-0">
                    {getEventIcon(event)}
                  </div>

                  {/* Event content */}
                  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    {renderEventContent(event)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;

