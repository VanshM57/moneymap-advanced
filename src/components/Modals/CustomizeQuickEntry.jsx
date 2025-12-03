import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, Space } from "antd";

const { Option } = Select;

const DEFAULT_TEMPLATES = [
  {
    type: "expense",
    amount: 50,
    tag: "food",
    name: "Quick Food",
    icon: "🍔",
  },
  {
    type: "expense",
    amount: 100,
    tag: "travel",
    name: "Quick Travel",
    icon: "🚗",
  },
  {
    type: "expense",
    amount: 200,
    tag: "shopping",
    name: "Quick Shopping",
    icon: "🛍️",
  },
  {
    type: "expense",
    amount: 500,
    tag: "bills",
    name: "Quick Bill",
    icon: "💳",
  },
  {
    type: "income",
    amount: 1000,
    tag: "freelance",
    name: "Quick Income",
    icon: "💰",
  },
];

const ICON_OPTIONS = [
  { value: "🍔", label: "Food" },
  { value: "🚗", label: "Travel" },
  { value: "🛍️", label: "Shopping" },
  { value: "💳", label: "Bills" },
  { value: "💰", label: "Income" },
  { value: "🏥", label: "Health" },
  { value: "📚", label: "Education" },
  { value: "☕", label: "Coffee" },
  { value: "🎬", label: "Entertainment" },
  { value: "🏠", label: "Home" },
  { value: "👕", label: "Clothing" },
  { value: "🎁", label: "Gift" },
];

const TAG_OPTIONS = {
  expense: ["food", "travel", "shopping", "bills", "health", "education", "office", "miscellaneous"],
  income: ["salary", "freelance", "investment", "gift", "other"],
};

const CustomizeQuickEntry = ({
  isVisible,
  onCancel,
  onSave,
  currentTemplates = [],
}) => {
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState(
    currentTemplates.length > 0 ? currentTemplates : DEFAULT_TEMPLATES
  );

  useEffect(() => {
    if (isVisible) {
      setTemplates(
        currentTemplates.length > 0 ? currentTemplates : DEFAULT_TEMPLATES
      );
    }
  }, [isVisible, currentTemplates]);

  const addTemplate = () => {
    setTemplates([
      ...templates,
      {
        type: "expense",
        amount: 100,
        tag: "miscellaneous",
        name: "Quick Entry",
        icon: "💰",
      },
    ]);
  };

  const removeTemplate = (index) => {
    if (templates.length > 1) {
      setTemplates(templates.filter((_, i) => i !== index));
    }
  };

  const updateTemplate = (index, field, value) => {
    const updated = [...templates];
    updated[index] = { ...updated[index], [field]: value };
    setTemplates(updated);
  };

  const handleSave = () => {
    // Validate templates
    const validTemplates = templates.filter(
      (t) => t.amount > 0 && t.tag && t.name && t.icon
    );

    if (validTemplates.length === 0) {
      return;
    }

    onSave(validTemplates);
  };

  const resetToDefaults = () => {
    setTemplates(DEFAULT_TEMPLATES);
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold">Customize Quick Entry</span>}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Customize your quick entry buttons. You can change amounts, categories, names, and icons.
        </p>
        <Button
          type="link"
          onClick={resetToDefaults}
          className="text-xs text-gray-500 p-0"
        >
          Reset to defaults
        </Button>
      </div>

      <div className="max-h-96 overflow-y-auto pr-2">
        <Space direction="vertical" size="middle" className="w-full">
          {templates.map((template, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    Button {index + 1}
                  </span>
                </div>
                {templates.length > 1 && (
                  <Button
                    type="text"
                    danger
                    onClick={() => removeTemplate(index)}
                    size="small"
                    className="flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <Select
                    value={template.type}
                    onChange={(value) => updateTemplate(index, "type", value)}
                    className="w-full"
                    size="small"
                  >
                    <Option value="expense">Expense</Option>
                    <Option value="income">Income</Option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={template.amount}
                    onChange={(e) =>
                      updateTemplate(index, "amount", parseFloat(e.target.value) || 0)
                    }
                    className="w-full"
                    size="small"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <Select
                    value={template.tag}
                    onChange={(value) => updateTemplate(index, "tag", value)}
                    className="w-full"
                    size="small"
                  >
                    {TAG_OPTIONS[template.type]?.map((tag) => (
                      <Option key={tag} value={tag}>
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <Select
                    value={template.icon}
                    onChange={(value) => updateTemplate(index, "icon", value)}
                    className="w-full"
                    size="small"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <Option key={icon.value} value={icon.value}>
                        {icon.value} {icon.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    value={template.name}
                    onChange={(e) => updateTemplate(index, "name", e.target.value)}
                    placeholder="e.g., Quick Food"
                    className="w-full"
                    size="small"
                  />
                </div>
              </div>
            </div>
          ))}
        </Space>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <Button
          type="dashed"
          onClick={addTemplate}
          className="flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Button
        </Button>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default CustomizeQuickEntry;

