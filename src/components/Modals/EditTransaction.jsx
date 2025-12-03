import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
} from "antd";
import dayjs from "dayjs";

const EditTransactionModal = ({
  isEditModalVisible,
  handleEditCancel,
  onFinish,
  transaction,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (transaction && isEditModalVisible) {
      form.setFieldsValue({
        name: transaction.name,
        amount: transaction.amount,
        date: dayjs(transaction.date),
        tag: transaction.tag,
      });
    }
  }, [transaction, isEditModalVisible, form]);

  const getTagOptions = () => {
    if (transaction?.type === "income") {
      return (
        <>
          <Select.Option value="salary">Salary</Select.Option>
          <Select.Option value="freelance">Freelance</Select.Option>
          <Select.Option value="investment">Investment</Select.Option>
        </>
      );
    } else {
      return (
        <>
          <Select.Option value="food">Food</Select.Option>
          <Select.Option value="education">Education</Select.Option>
          <Select.Option value="office">Office</Select.Option>
          <Select.Option value="travel">Travel</Select.Option>
          <Select.Option value="shopping">Shopping</Select.Option>
          <Select.Option value="health">Health & Fitness</Select.Option>
          <Select.Option value="bills">Bills & Utilities</Select.Option>
          <Select.Option value="miscellaneous">Miscellaneous</Select.Option>
        </>
      );
    }
  };

  return (
    <Modal
      title={
        <span className="text-lg font-semibold">
          Edit {transaction?.type === "income" ? "Income" : "Expense"}
        </span>
      }
      open={isEditModalVisible}
      onCancel={handleEditCancel}
      footer={null}
      afterClose={() => form.resetFields()}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onFinish(values, transaction?.type);
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
          rules={[{ required: true, message: "Please input the amount!" }]}
        >
          <Input
            type="number"
            step="0.01"
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Date</span>}
          name="date"
          rules={[{ required: true, message: "Please select the date!" }]}
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
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            dropdownStyle={{ fontWeight: 500 }}
          >
            {getTagOptions()}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-600 text-white font-medium rounded-md px-4 py-2 hover:bg-blue-700 transition-colors w-full"
          >
            Update Transaction
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTransactionModal;

