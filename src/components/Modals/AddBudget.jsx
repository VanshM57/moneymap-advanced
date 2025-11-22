import React from "react";
import { Modal, Form, Input, Select } from "antd";

const { Option } = Select;

const AddBudgetModal = ({
  isBudgetModalVisible,
  handleBudgetCancel,
  onFinish,
}) => {
  const [form] = Form.useForm();
  const selectedPeriod = Form.useWatch("period", form);

  const closeModal = () => {
    handleBudgetCancel();
    form.resetFields();
  };

  return (
    <Modal
      title={<span className="text-lg font-semibold">Create Smart Budget</span>}
      open={isBudgetModalVisible}
      onCancel={closeModal}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ period: "monthly" }}
        onFinish={(values) => {
          onFinish(values);
          form.resetFields();
        }}
      >
        <Form.Item
          label={<span className="font-semibold text-gray-700">Tag</span>}
          name="tag"
          rules={[{ required: true, message: "Please enter a spending tag." }]}
        >
          <Input
            placeholder="e.g. food, travel"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Limit (₹)</span>}
          name="limit"
          rules={[
            { required: true, message: "Please set a budget limit." },
            {
              validator: (_, value) =>
                value && Number(value) > 0
                  ? Promise.resolve()
                  : Promise.reject(new Error("Limit must be greater than 0")),
            },
          ]}
        >
          <Input
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter amount"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Period</span>}
          name="period"
          rules={[{ required: true, message: "Please select a budget period." }]}
        >
          <Select className="w-full">
            <Option value="monthly">Monthly</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="custom">Custom (days)</Option>
          </Select>
        </Form.Item>

        {selectedPeriod === "custom" && (
          <Form.Item
            label={<span className="font-semibold text-gray-700">Custom Window (days)</span>}
            name="customDays"
            rules={[
              { required: true, message: "Please enter number of days." },
              {
                validator: (_, value) =>
                  value && Number(value) >= 3
                    ? Promise.resolve()
                    : Promise.reject(new Error("Custom window must be at least 3 days.")),
              },
            ]}
          >
            <Input
              type="number"
              min="3"
              max="365"
              placeholder="e.g. 45"
              className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Form.Item>
        )}

        <Form.Item>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Save Budget
          </button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddBudgetModal;

