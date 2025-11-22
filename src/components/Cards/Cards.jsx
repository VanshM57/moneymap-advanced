import React from 'react'
import { Card, Row } from "antd";

const Cards = ({
  currentBalance,
  income,
  expenses,
  showExpenseModal,
  showIncomeModal,
  reset,
}) => {
  return (
    <Row className="flex flex-col md:flex-row flex-wrap lg:flex-nowrap gap-6 justify-center items-stretch w-full px-4 mt-10">
      <Card
        className="bg-white shadow-card hover:shadow-card-hover transition-all duration-300 rounded-xl min-w-[280px] w-full md:w-[45%] lg:w-[30%] p-6 border-0"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-800">
              Current Balance
            </h2>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-primary-600 mb-6">₹{currentBalance}</p>
          <button
            className="mt-auto w-full text-center bg-primary-500 text-white rounded-lg py-2.5 font-medium hover:bg-primary-600 transition-all duration-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            onClick={reset}
          >
            Reset Balance
          </button>
        </div>
      </Card>

      <Card
        className="bg-white shadow-card hover:shadow-card-hover transition-all duration-300 rounded-xl min-w-[280px] w-full md:w-[45%] lg:w-[30%] p-6 border-0"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-800">Total Income</h2>
            <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-success-600 mb-6">₹{income}</p>
          <button
            className="mt-auto w-full text-center bg-success-500 text-white rounded-lg py-2.5 font-medium hover:bg-success-600 transition-all duration-300 focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
            onClick={showIncomeModal}
          >
            Add Income
          </button>
        </div>
      </Card>

      <Card
        className="bg-white shadow-card hover:shadow-card-hover transition-all duration-300 rounded-xl min-w-[280px] w-full md:w-[45%] lg:w-[30%] p-6 border-0"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-800">Total Expenses</h2>
            <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-danger-600 mb-6">₹{expenses}</p>
          <button
            className="mt-auto w-full text-center bg-danger-500 text-white rounded-lg py-2.5 font-medium hover:bg-danger-600 transition-all duration-300 focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
            onClick={showExpenseModal}
          >
            Add Expense
          </button>
        </div>
      </Card>
    </Row>
  )
}

export default Cards