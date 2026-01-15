import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Tag,
  Space,
  Tabs,
  Empty,
  Tooltip,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import {
  PREDEFINED_INCOME_TAGS,
  PREDEFINED_EXPENSE_TAGS,
  formatTag,
} from "../../constants/tagConstants";

const TagManagerModal = ({
  isVisible,
  onCancel,
  customIncomeTags = [],
  customExpenseTags = [],
  onAddIncomeTag,
  onAddExpenseTag,
  onDeleteIncomeTag,
  onDeleteExpenseTag,
}) => {
  const [form] = Form.useForm();
  const [incomeTagInput, setIncomeTagInput] = useState("");
  const [expenseTagInput, setExpenseTagInput] = useState("");

  const handleAddIncomeTag = async () => {
    const trimmedTag = incomeTagInput.trim().toLowerCase();
    
    if (!trimmedTag) {
      message.warning("Please enter a tag name");
      return;
    }

    if (
      PREDEFINED_INCOME_TAGS.includes(trimmedTag) ||
      customIncomeTags.includes(trimmedTag)
    ) {
      message.error("This tag already exists");
      return;
    }

    if (!/^[a-z0-9\-_]+$/.test(trimmedTag)) {
      message.error("Tag can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    await onAddIncomeTag(trimmedTag);
    setIncomeTagInput("");
    message.success("Income tag added successfully");
  };

  const handleAddExpenseTag = async () => {
    const trimmedTag = expenseTagInput.trim().toLowerCase();
    
    if (!trimmedTag) {
      message.warning("Please enter a tag name");
      return;
    }

    if (
      PREDEFINED_EXPENSE_TAGS.includes(trimmedTag) ||
      customExpenseTags.includes(trimmedTag)
    ) {
      message.error("This tag already exists");
      return;
    }

    if (!/^[a-z0-9\-_]+$/.test(trimmedTag)) {
      message.error("Tag can only contain letters, numbers, hyphens, and underscores");
      return;
    }

    await onAddExpenseTag(trimmedTag);
    setExpenseTagInput("");
    message.success("Expense tag added successfully");
  };

  const handleDeleteIncomeTag = async (tag) => {
    await onDeleteIncomeTag(tag);
    message.success("Income tag removed");
  };

  const handleDeleteExpenseTag = async (tag) => {
    await onDeleteExpenseTag(tag);
    message.success("Expense tag removed");
  };

  const renderTagList = (tags, isPredefined, type) => {
    if (tags.length === 0) {
      return <Empty description="No tags" />;
    }

    return (
      <div className="space-y-2">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <span className="text-gray-700 capitalize">{formatTag(tag)}</span>
            {!isPredefined && (
              <Tooltip title="Delete tag">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    type === "income"
                      ? handleDeleteIncomeTag(tag)
                      : handleDeleteExpenseTag(tag)
                  }
                />
              </Tooltip>
            )}
            {isPredefined && (
              <Tag color="blue">Default</Tag>
            )}
          </div>
        ))}
      </div>
    );
  };

  const incomeTabItems = [
    {
      key: "predefined-income",
      label: "Predefined Income Tags",
      children: renderTagList(PREDEFINED_INCOME_TAGS, true, "income"),
    },
    {
      key: "custom-income",
      label: `Custom Income Tags (${customIncomeTags.length})`,
      children: (
        <div className="space-y-4">
          {renderTagList(customIncomeTags, false, "income")}
          <div className="mt-4 pt-4 border-t">
            <Form.Item label="Add New Income Tag" className="mb-2">
              <Input
                placeholder="e.g., bonus, gift, refund"
                value={incomeTagInput}
                onChange={(e) => setIncomeTagInput(e.target.value)}
                onPressEnter={handleAddIncomeTag}
                maxLength={30}
              />
            </Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddIncomeTag}
              block
            >
              Add Income Tag
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const expenseTabItems = [
    {
      key: "predefined-expense",
      label: "Predefined Expense Tags",
      children: renderTagList(PREDEFINED_EXPENSE_TAGS, true, "expense"),
    },
    {
      key: "custom-expense",
      label: `Custom Expense Tags (${customExpenseTags.length})`,
      children: (
        <div className="space-y-4">
          {renderTagList(customExpenseTags, false, "expense")}
          <div className="mt-4 pt-4 border-t">
            <Form.Item label="Add New Expense Tag" className="mb-2">
              <Input
                placeholder="e.g., gaming, pets, hobbies"
                value={expenseTagInput}
                onChange={(e) => setExpenseTagInput(e.target.value)}
                onPressEnter={handleAddExpenseTag}
                maxLength={30}
              />
            </Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddExpenseTag}
              block
            >
              Add Expense Tag
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={<span className="text-lg font-semibold">Manage Tags</span>}
      open={isVisible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={600}
      centered
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-md font-semibold mb-3">Income Tags</h3>
          <Tabs items={incomeTabItems} />
        </div>

        <div>
          <h3 className="text-md font-semibold mb-3">Expense Tags</h3>
          <Tabs items={expenseTabItems} />
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Create custom tags that match your spending habits. They'll be available across all features (transactions, budgets, reports).
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default TagManagerModal;
