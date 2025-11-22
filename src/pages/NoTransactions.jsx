import React from "react";
import transactions from "../assets/transactions.svg";

function NoTransactions() {
  return (
    <div className="flex flex-col items-center justify-center w-full mb-8">
      <img src={transactions} alt="No Transactions" className="w-[400px] my-16" />
      <h3 className="text-xl font-semibold text-secondary-800 mb-2">No Transactions Yet</h3>
      <p className="text-secondary-600 text-center max-w-md">
        Start tracking your finances by adding your first income or expense transaction.
      </p>
    </div>
  );
}

export default NoTransactions;


//w-[400px] my-16