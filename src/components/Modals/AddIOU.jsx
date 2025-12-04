import React from "react";
import { Modal, Form, Input, DatePicker, Select, Button } from "antd";

const AddIOUModal = ({ isVisible, onCancel, onFinish }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={<span className="text-lg font-semibold">Add IOU</span>}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onFinish(values);
          form.resetFields();
        }}
      >
        <Form.Item
          label={<span className="font-semibold text-gray-700">Person</span>}
          name="person"
          rules={[{ required: true, message: "Please enter the person's name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Amount</span>}
          name="amount"
          rules={[{ required: true, message: "Please enter amount" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Date</span>}
          name="date"
          rules={[{ required: true, message: "Please select date" }]}
        >
          <DatePicker format="YYYY-MM-DD" className="w-full" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Direction</span>}
          name="direction"
          rules={[{ required: true, message: "Select give or take" }]}
          initialValue="give"
        >
          <Select>
            <Select.Option value="give">I have to give (mark as expense on complete)</Select.Option>
            <Select.Option value="take">I have to take (mark as income on complete)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label={<span className="font-semibold text-gray-700">Note</span>} name="note">
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Add IOU
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddIOUModal;
