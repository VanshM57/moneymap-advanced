import React, { useRef, useState } from "react";
import { Input, Table, Select, Radio } from "antd";
import { parse } from "papaparse";
import { toast } from "react-toastify";
import search from "../assets/search.svg";

const { Option } = Select;

const TransactionSearch = ({
  transactions,
  exportToCsv,
  addTransaction,
  fetchTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");
  const fileInput = useRef();

  function importFromCsv(event) {
    event.preventDefault();
    try {
      parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          for (const transaction of results.data) {
            const newTransaction = {
              ...transaction,
              amount: parseInt(transaction.amount),
            };
            await addTransaction(newTransaction, true);
          }
        },
      });
      toast.success("All Transactions Added");
      fetchTransactions();
      event.target.value = null;
    } catch (e) {
      toast.error(e.message);
    }
  }

  const columns = [
    { 
      title: "Name", 
      dataIndex: "name", 
      key: "name",
      render: (text) => <span className="text-secondary-800">{text}</span>
    },
    { 
      title: "Type", 
      dataIndex: "type", 
      key: "type",
      render: (text) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          text === "income" 
            ? "bg-success-100 text-success-800" 
            : "bg-danger-100 text-danger-800"
        }`}>
          {text}
        </span>
      )
    },
    { 
      title: "Date", 
      dataIndex: "date", 
      key: "date",
      render: (text) => <span className="text-secondary-600">{text}</span>
    },
    { 
      title: "Amount", 
      dataIndex: "amount", 
      key: "amount",
      render: (text, record) => (
        <span className={`font-medium ${
          record.type === "income" ? "text-success-600" : "text-danger-600"
        }`}>
          ₹{text}
        </span>
      )
    },
    { 
      title: "Tag", 
      dataIndex: "tag", 
      key: "tag",
      render: (text) => <span className="text-secondary-600">{text}</span>
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    const searchMatch = searchTerm
      ? transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    const tagMatch = selectedTag ? transaction.tag === selectedTag : true;
    const typeMatch = typeFilter ? transaction.type === typeFilter : true;
    return searchMatch && tagMatch && typeMatch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortKey === "amount") {
      return a.amount - b.amount;
    }
    return 0;
  });

  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: index,
    ...transaction,
  }));

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 mt-10">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <img src={search} alt="Search" className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-secondary-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <Select
          className="w-full md:w-48"
          onChange={(value) => setTypeFilter(value)}
          value={typeFilter}
          placeholder="Filter by Type"
          allowClear
        >
          <Option value="">All Types</Option>
          <Option value="income">Income</Option>
          <Option value="expense">Expense</Option>
        </Select>
      </div>

      {/* Sorting and Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <Radio.Group
            onChange={(e) => setSortKey(e.target.value)}
            value={sortKey}
            className="flex flex-wrap gap-2"
          >
            <Radio.Button value="" className="!text-secondary-600 hover:!text-primary-600">
              No Sort
            </Radio.Button>
            <Radio.Button value="date" className="!text-secondary-600 hover:!text-primary-600">
              Sort by Date
            </Radio.Button>
            <Radio.Button value="amount" className="!text-secondary-600 hover:!text-primary-600">
              Sort by Amount
            </Radio.Button>
          </Radio.Group>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCsv}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Export to CSV
          </button>
          <label
            htmlFor="file-csv"
            className="px-4 py-2 bg-white text-primary-600 border-2 border-primary-500 rounded-lg cursor-pointer hover:bg-primary-50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Import from CSV
          </label>
          <input
            onChange={importFromCsv}
            id="file-csv"
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInput}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-card overflow-x-auto">
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ 
            pageSize: 5,
            className: "px-4 py-2",
            itemRender: (page, type, originalElement) => {
              if (type === 'prev') {
                return <span className="text-primary-600">Previous</span>;
              }
              if (type === 'next') {
                return <span className="text-primary-600">Next</span>;
              }
              return originalElement;
            }
          }}
          className="transaction-table"
        />
      </div>
    </div>
  );
};

export default TransactionSearch;
