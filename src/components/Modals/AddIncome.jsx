import React from "react";
import {
  Card,
  Col,
  Row,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
} from "antd";
import {
  PREDEFINED_INCOME_TAGS,
  getAllIncomeTags,
  formatTag,
} from "../../constants/tagConstants";

const AddIncomeModal = ({
  isIncomeModalVisible,
  handleIncomeCancel,
  onFinish,
  customIncomeTags = [],
}) => {
  const [form] = Form.useForm();
  const allTags = getAllIncomeTags(customIncomeTags);

  return (
    <Modal
      title={<span className="text-lg font-semibold">Add Income</span>}
      open={isIncomeModalVisible}
      onCancel={handleIncomeCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onFinish(values, "income");
          form.resetFields();
        }}
      >
        <Form.Item
          label={<span className="font-semibold text-gray-700">Name</span>}
          name="name"
          rules={[{ required: true, message: "Please input the name of the transaction!" }]}
        >
          <Input className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Amount</span>}
          name="amount"
          rules={[{ required: true, message: "Please input the income amount!" }]}
        >
          <Input
            type="number"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Date</span>}
          name="date"
          rules={[{ required: true, message: "Please select the income date!" }]}
        >
          <DatePicker
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Tag</span>}
          name="tag"
          rules={[{ required: true, message: "Please select a tag!" }]}
        >
          <Select
            className="w-full border rounded-md px-3 py-2"
            placeholder="Select or search a tag"
          >
            {allTags.map((tag) => (
              <Select.Option key={tag} value={tag} className="capitalize">
                {formatTag(tag)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-600 text-white font-medium rounded-md px-4 py-2 hover:bg-blue-700 transition-colors w-full"
          >
            Add Income
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddIncomeModal;
