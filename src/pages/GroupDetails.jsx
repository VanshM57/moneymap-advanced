import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Header from "../components/Header/Header";
import Loader from "../components/Loader/Loader";
import AddGroupExpenseModal from "../components/Modals/AddGroupExpense";
import SettlementSummary from "../components/Splitwise/SettlementSummary";
import GroupExpenseList from "../components/Splitwise/GroupExpenseList";
import GroupMembersList from "../components/Splitwise/GroupMembersList";

const GroupDetails = () => {
  const { groupId } = useParams();
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddExpenseModalVisible, setIsAddExpenseModalVisible] = useState(false);
  const [memberDetails, setMemberDetails] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchGroupDetails();
    }
  }, [user, groupId, navigate]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const groupRef = doc(db, "splitwise_groups", groupId);
      const groupSnapshot = await getDoc(groupRef);

      if (!groupSnapshot.exists()) {
        toast.error("Group not found");
        navigate("/splitwise");
        return;
      }

      const groupData = groupSnapshot.data();

      // Check if user is member
      if (!groupData.members || !groupData.members.includes(user.uid)) {
        toast.error("You are not a member of this group");
        navigate("/splitwise");
        return;
      }

      setGroup({ id: groupId, ...groupData });

      // Fetch expenses
      const q = query(
        collection(db, "splitwise_groups", groupId, "expenses"),
      );
      const querySnapshot = await getDocs(q);
      const expensesArray = querySnapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      setExpenses(expensesArray);

      // Fetch member details from users collection (displayName, email)
      // Note: Keep `displayName` and `email` `null` if they are not available in the user profile
      // so the UI can fall back to friendly heuristics (recent expense name) and finally a short id.
      const memberInfo = {};
      for (const memberId of groupData.members || []) {
        try {
          const userRef = doc(db, "users", memberId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const ud = userSnap.data();
            memberInfo[memberId] = {
              uid: memberId,
              displayName: ud.displayName || ud.name || null,
              email: ud.email || null,
            };
          } else {
            memberInfo[memberId] = { uid: memberId, displayName: null, email: null };
          }
        } catch (err) {
          console.warn("Couldn't fetch user profile for", memberId, err);
          memberInfo[memberId] = { uid: memberId, displayName: null, email: null };
        }
      }
      setMemberDetails(memberInfo);
    } catch (error) {
      console.error("Error fetching group details:", error);
      toast.error("Failed to fetch group details");
    }
    setLoading(false);
  };

  // Calculate settlement for group expenses
  const calculateSettlement = (groupExpenses, splitMembers) => {
    const balances = {};

    // Initialize balances for all members
    splitMembers.forEach((memberId) => {
      balances[memberId] = 0;
    });

    // Calculate balances
    groupExpenses.forEach((expense) => {
      const participants = expense.splitAmong || splitMembers;
      const splitAmount = expense.amount / (participants.length || 1);

      // Subtract each participant's share (including payer if present)
      participants.forEach((memberId) => {
        balances[memberId] = (balances[memberId] || 0) - splitAmount;
      });

      // Credit full amount to payer (this nets correctly because payer also had their share subtracted above)
      balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    });

    // Generate settlement suggestions
    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([memberId, balance]) => {
      // normalize small rounding differences
      const b = Math.round((balance + Number.EPSILON) * 100) / 100;
      if (b > 0.01) creditors.push({ memberId, amount: b });
      else if (b < -0.01) debtors.push({ memberId, amount: Math.abs(b) });
    });

    // Sort creditors and debtors to make matching stable (largest first)
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
  };

  const handleAddExpense = async (values) => {
    if (!group) return false;

    try {
      // Ensure paidBy is set to current user
      const expenseData = {
        description: values.description,
        amount: parseFloat(values.amount) || 0,
        paidBy: user.uid,
        paidByName: user.displayName || user.email || user.uid,
        date: values.date ? values.date.format("YYYY-MM-DD") : new Date().toISOString().split("T")[0],
        splitAmong: values.splitAmong || group.members, // All members by default
        createdAt: new Date(),
      };

      // Add expense to Splitwise group
      const expenseDocRef = await addDoc(
        collection(db, "splitwise_groups", groupId, "expenses"),
        expenseData
      );

      // NOTE: Previously we automatically created a Dashboard transaction for the payer here.
      // That behavior has been removed so Splitwise does not auto-write to the user's Dashboard.
      // Settlements can be created explicitly via the SettlementSummary 'Settle' button.

      // Calculate settlement (used only for display) but DO NOT persist IOUs from Splitwise to the database.
      // Splitwise will show suggested settlements in the UI, but IOU persistence and Dashboard IOUs are kept separate.
      const splitMembers = expenseData.splitAmong || group.members;
      const allExpenses = [...expenses, expenseData];
      const settlements = calculateSettlement(allExpenses, splitMembers);

      toast.success("Expense added and settlement calculated!");
      fetchGroupDetails();
      setIsAddExpenseModalVisible(false);
      return true;
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
      return false;
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await deleteDoc(
        doc(db, "splitwise_groups", groupId, "expenses", expenseId)
      );
      toast.success("Expense deleted successfully!");
      fetchGroupDetails();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  if (loading) return <Loader />;

  if (!group) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/splitwise")}
            className="mb-4 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{group.name}</h1>
          {group.description && (
            <p className="text-gray-600">{group.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expenses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Expenses</h2>
                <button
                  onClick={() => setIsAddExpenseModalVisible(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add Expense
                </button>
              </div>

              {expenses.length === 0 ? (
                <p className="text-gray-500">No expenses yet</p>
              ) : (
                <GroupExpenseList
                  expenses={expenses}
                  currentUserId={user.uid}
                  memberDetails={memberDetails}
                  onDelete={handleDeleteExpense}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              <GroupMembersList
                members={group.members || []}
                currentUserId={user.uid}
                memberDetails={memberDetails}
                expenses={expenses}
              />
            </div>

            {/* Settlement Summary */}
            <SettlementSummary
              expenses={expenses}
              members={group.members || []}
              currentUserId={user.uid}
              memberDetails={memberDetails}
              groupName={group.name}
              groupId={groupId}
              groupCreatorId={group.createdBy}
              finalSettlementMeta={group.finalSettlement}
            />
          </div>
        </div>
      </div>

      <AddGroupExpenseModal
        isVisible={isAddExpenseModalVisible}
        onCancel={() => setIsAddExpenseModalVisible(false)}
        onFinish={handleAddExpense}
        groupMembers={group.members || []}
        currentUser={user}
        memberDetails={memberDetails}
      />
    </div>
  );
};

export default GroupDetails;
