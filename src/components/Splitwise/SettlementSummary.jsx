import React, { useMemo, useState } from "react";
import moment from "moment";
import { addDoc, collection, updateDoc, doc as firestoreDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";

const SettlementSummary = ({
  expenses,
  members,
  currentUserId,
  memberDetails,
  groupName,
  groupId,
  groupCreatorId,
  finalSettlementMeta,
}) => {
  // Helper to get timestamp from createdAt (handles Firestore Timestamps, strings, and Dates)
  const getCreatedAtTime = (e) => {
    if (!e) return 0;
    const c = e.createdAt;
    if (!c) return 0;
    if (typeof c === 'object' && typeof c.toDate === 'function') {
      return c.toDate().getTime();
    }
    try {
      const dt = new Date(c);
      if (!isNaN(dt.getTime())) return dt.getTime();
    } catch (err) {
      // noop
    }
    return 0;
  };

  // Get previous settlement execution time
  const getPrevExecutedAtMs = () => {
    if (!finalSettlementMeta || !finalSettlementMeta.executedAt) return 0;
    const ea = finalSettlementMeta.executedAt;
    if (typeof ea === 'object' && typeof ea.toDate === 'function') return ea.toDate().getTime();
    if (typeof ea === 'string') return Date.parse(ea) || 0;
    if (ea instanceof Date) return ea.getTime();
    return 0;
  };

  // Filter expenses to only those after last settlement
  const filteredExpenses = useMemo(() => {
    const prevExecutedAtMs = getPrevExecutedAtMs();
    return Array.isArray(expenses)
      ? expenses.filter((e) => getCreatedAtTime(e) > prevExecutedAtMs)
      : [];
  }, [expenses, finalSettlementMeta]);

  // Calculate who owes whom (based on filtered expenses only)
  const settlements = useMemo(() => {
    const balances = {};

    // Initialize balances for all members
    members.forEach((memberId) => {
      balances[memberId] = 0;
    });

    // Calculate balances (subtract each participant's share first, then credit payer)
    filteredExpenses.forEach((expense) => {
      const participants = expense.splitAmong || members;
      const splitAmount = expense.amount / (participants.length || 1);

      // Subtract each participant's share
      participants.forEach((memberId) => {
        balances[memberId] = (balances[memberId] || 0) - splitAmount;
      });

      // Credit full amount to payer (nets correctly because payer's share was subtracted)
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    });

    // Generate settlement suggestions
    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([memberId, balance]) => {
      // normalize to 2 decimals to avoid floating point issues
      const b = Math.round((balance + Number.EPSILON) * 100) / 100;
      if (b > 0.01) creditors.push({ memberId, amount: b });
      else if (b < -0.01) debtors.push({ memberId, amount: Math.abs(b) });
    });

    // Sort creditors and debtors (largest first) for stable matching
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Match debtors with creditors
    const settlements = [];
    let di = 0;
    let ci = 0;
    while (di < debtors.length && ci < creditors.length) {
      const debtor = debtors[di];
      const creditor = creditors[ci];
      const amount = Math.round((Math.min(debtor.amount, creditor.amount) + Number.EPSILON) * 100) / 100;

      if (amount > 0) {
        settlements.push({ from: debtor.memberId, to: creditor.memberId, amount });
      }

      debtor.amount = Math.round(((debtor.amount - amount) + Number.EPSILON) * 100) / 100;
      creditor.amount = Math.round(((creditor.amount - amount) + Number.EPSILON) * 100) / 100;

      if (debtor.amount <= 0.009) di++;
      if (creditor.amount <= 0.009) ci++;
    }

    return settlements;
  }, [filteredExpenses, members]);

  // Aggregate totals per member: totalPaid and totalShare (based on filtered expenses only)
  const totals = useMemo(() => {
    const paid = {};
    const share = {};
    members.forEach((m) => {
      paid[m] = 0;
      share[m] = 0;
    });

    filteredExpenses.forEach((expense) => {
      const participants = expense.splitAmong || members;
      const splitAmount = expense.amount / (participants.length || 1);

      // Credit payer
      paid[expense.paidBy] = (paid[expense.paidBy] || 0) + (expense.amount || 0);

      // Add share for each participant
      participants.forEach((m) => {
        share[m] = (share[m] || 0) + splitAmount;
      });
    });

    return { paid, share };
  }, [filteredExpenses, members]);

  const myPaid = totals.paid[currentUserId] || 0;
  const myShare = totals.share[currentUserId] || 0;
  const myNet = Math.round(((myPaid - myShare) + Number.EPSILON) * 100) / 100;

  const [finalSettling, setFinalSettling] = useState(false);

  // Final settlement: create aggregated transactions for all members
  const handleFinalSettle = async () => {
    if (!window.confirm('Create final settlement transactions for all members in their Dashboards?')) return;

    // Only allow group creator to perform final settlement
    if (groupCreatorId !== currentUserId) {
      toast.error('Only the group creator can perform the final settlement');
      return;
    }

    // Idempotency check: determine last executed timestamp and overall expense metrics
    const currentExpenseCount = Array.isArray(expenses) ? expenses.length : 0;

    const getCreatedAtTime = (e) => {
      if (!e) return 0;
      const c = e.createdAt;
      if (!c) return 0;
      // Firestore Timestamp has toDate()
      if (typeof c === 'object' && typeof c.toDate === 'function') {
        return c.toDate().getTime();
      }
      // ISO string or Date
      try {
        const dt = new Date(c);
        if (!isNaN(dt.getTime())) return dt.getTime();
      } catch (err) {
        // noop
      }
      return 0;
    };

    const lastExpenseAt = Array.isArray(expenses) && expenses.length > 0
      ? expenses.reduce((max, e) => {
          const t = getCreatedAtTime(e);
          return t > max ? t : max;
        }, 0)
      : 0;

    const prevExecutedAtMs = (() => {
      if (!finalSettlementMeta || !finalSettlementMeta.executedAt) return 0;
      const ea = finalSettlementMeta.executedAt;
      if (typeof ea === 'object' && typeof ea.toDate === 'function') return ea.toDate().getTime();
      if (typeof ea === 'string') return Date.parse(ea) || 0;
      if (ea instanceof Date) return ea.getTime();
      return 0;
    })();

    // If no new expenses since last execution, skip
    if (finalSettlementMeta && prevExecutedAtMs) {
      if (currentExpenseCount === (finalSettlementMeta.expenseCount || 0) && lastExpenseAt === (finalSettlementMeta.lastExpenseAt ? new Date(finalSettlementMeta.lastExpenseAt).getTime() : 0)) {
        toast.info('Final settlement already executed and no changes detected');
        return;
      }
    }
    try {
      setFinalSettling(true);

      // Compute shares only for expenses AFTER previous final settlement
      const filteredExpenses = Array.isArray(expenses)
        ? expenses.filter((e) => getCreatedAtTime(e) > prevExecutedAtMs)
        : [];

      if (!filteredExpenses || filteredExpenses.length === 0) {
        toast.info('No new expenses since the last settlement');
        setFinalSettling(false);
        return;
      }

      // Compute totals (paid & share) over filteredExpenses only
      const paid = {};
      const share = {};
      members.forEach((m) => {
        paid[m] = 0;
        share[m] = 0;
      });

      filteredExpenses.forEach((expense) => {
        const participants = expense.splitAmong || members;
        const splitAmount = expense.amount / (participants.length || 1);

        paid[expense.paidBy] = (paid[expense.paidBy] || 0) + (expense.amount || 0);
        participants.forEach((m) => {
          share[m] = (share[m] || 0) + splitAmount;
        });
      });

      const ops = [];
      Object.keys(share).forEach((memberId) => {
        const memberShare = Math.round((share[memberId] + Number.EPSILON) * 100) / 100;
        if (memberShare < 0.01) return;

        const description = `[Group: ${groupName}] Your share of group expenses`;
        ops.push(
          addDoc(collection(db, `users/${memberId}/transactions`), {
            type: 'expense',
            date: moment().format('YYYY-MM-DD'),
            amount: memberShare,
            tag: groupName || 'trip',
            name: description,
            groupId,
            createdAt: new Date(),
          })
        );
      });

      await Promise.all(ops);

      // Update group document with finalSettlement metadata to enforce idempotency
      try {
        const groupRef = firestoreDoc(db, 'splitwise_groups', groupId);
        await updateDoc(groupRef, {
          finalSettlement: {
            executedBy: currentUserId,
            executedAt: new Date(),
            expenseCount: currentExpenseCount,
            lastExpenseAt: lastExpenseAt ? new Date(lastExpenseAt).toISOString() : null,
          },
        });
      } catch (metaErr) {
        console.warn('Could not update group finalSettlement metadata:', metaErr);
      }

      toast.success('Final settlement (shares) recorded in members Dashboards');
    } catch (e) {
      console.error('Error creating final settlement transactions:', e);
      toast.error('Failed to create final settlement transactions');
    } finally {
      setFinalSettling(false);
    }
  };

  const getDisplayName = (memberId) => {
    if (!memberId) return "Unknown";

    // Direct mapping by memberId (common case)
    const md = memberDetails && memberDetails[memberId];

    // Prefer explicit display name
    if (md && md.displayName) return md.displayName;

    // Try to infer a friendly name from recent expenses if available
    if (Array.isArray(expenses)) {
      for (const exp of expenses) {
        if (exp && exp.paidBy === memberId && exp.paidByName && typeof exp.paidByName === "string") {
          // prefer a friendly paidByName (may be a name or an email)
          if (exp.paidByName.includes("@")) return exp.paidByName.split("@")[0];
          return exp.paidByName;
        }
      }
    }

    // If profile email exists, use its local-part only when name is not available
    if (md && md.email && md.email.includes("@")) return md.email.split("@")[0];

    // memberId might be an email stored as the identifier
    if (typeof memberId === "string" && memberId.includes("@")) {
      // prefer local-part for privacy/readability
      return memberId.split("@")[0];
    }

    // Try to find a matching profile where the stored email equals this id
    if (memberDetails) {
      for (const k of Object.keys(memberDetails)) {
        const v = memberDetails[k];
        if (v && v.email === memberId) return v.displayName || (v.email && v.email.includes("@") ? v.email.split("@")[0] : v.email) || shortenId(memberId);
      }
    }

    // Fallback: short id to avoid printing full uid
    return shortenId(memberId);
  };

  const shortenId = (id) => {
    if (!id) return "Unknown";
    if (typeof id !== "string") return String(id);
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  // Helper to check if there are new expenses since last settlement
  const hasNewExpensesSinceLastSettlement = () => {
    if (!finalSettlementMeta || !finalSettlementMeta.executedAt) return true; // No settlement yet, so show button
    
    const getCreatedAtTime = (e) => {
      if (!e) return 0;
      const c = e.createdAt;
      if (!c) return 0;
      if (typeof c === 'object' && typeof c.toDate === 'function') {
        return c.toDate().getTime();
      }
      try {
        const dt = new Date(c);
        if (!isNaN(dt.getTime())) return dt.getTime();
      } catch (err) {
        // noop
      }
      return 0;
    };

    const prevExecutedAtMs = (() => {
      if (!finalSettlementMeta || !finalSettlementMeta.executedAt) return 0;
      const ea = finalSettlementMeta.executedAt;
      if (typeof ea === 'object' && typeof ea.toDate === 'function') return ea.toDate().getTime();
      if (typeof ea === 'string') return Date.parse(ea) || 0;
      if (ea instanceof Date) return ea.getTime();
      return 0;
    })();

    // Check if any expense was created after last settlement
    const newExpenses = Array.isArray(expenses)
      ? expenses.filter((e) => getCreatedAtTime(e) > prevExecutedAtMs)
      : [];
    
    return newExpenses.length > 0;
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Settlement Summary</h2>
        <p className="text-gray-500">No expenses to settle</p>
      </div>
    );
  }

  // If settlement has been completed and there are NO new expenses, show success message for all users
  if (finalSettlementMeta && finalSettlementMeta.executedAt && !hasNewExpensesSinceLastSettlement()) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Settlement Summary</h2>
        <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
          <p className="text-sm text-success-700 font-semibold">✓ Final settlement completed</p>
          <p className="text-xs text-success-600 mt-1">All members' shares have been recorded in their Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Settlement Summary</h2>

      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">You paid: <span className="font-semibold">₹{myPaid.toFixed(2)}</span></p>
        <p className="text-sm text-gray-600">Your share: <span className="font-semibold">₹{myShare.toFixed(2)}</span></p>
        <p className="text-sm">Net: <span className={`font-semibold ${myNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{Math.abs(myNet).toFixed(2)} {myNet >= 0 ? 'owed to you' : 'you owe'}</span></p>
      </div>

      {settlements.length === 0 ? (
        <p className="text-gray-500">All settled!</p>
      ) : (
        <div className="space-y-3">
          {settlements.map((settlement, index) => {
            const fromName = getDisplayName(settlement.from);
            const toName = getDisplayName(settlement.to);
            const isCurrentUserInvolved =
              settlement.from === currentUserId || settlement.to === currentUserId;

            return (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  isCurrentUserInvolved
                    ? settlement.from === currentUserId
                      ? "bg-danger-50 border-danger-200"
                      : "bg-success-50 border-success-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <p className="text-sm">
                  <span className="font-semibold">{fromName}</span>
                  {settlement.from === currentUserId ? " (You)" : ""} pays{" "}
                  <span className="font-semibold">₹{settlement.amount.toFixed(2)}</span> to{" "}
                  <span className="font-semibold">{toName}</span>
                  {settlement.to === currentUserId ? " (You)" : ""}
                </p>
                {/* per-settlement Pay/Receive removed — use Final Settlement for dashboard writes */}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Final settlement action */}
      <div className="mt-4">
        <button
          onClick={handleFinalSettle}
          disabled={finalSettling}
          className="ml-auto px-4 py-2 text-sm rounded bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {finalSettling ? 'Settling...' : 'Final Settlement'}
        </button>
      </div>
    </div>
  );
};

export default SettlementSummary;
