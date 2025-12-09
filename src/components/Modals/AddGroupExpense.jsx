import React from "react";
import { Modal, Form, Input, DatePicker, Button, Select } from "antd";

const AddGroupExpenseModal = ({
  isVisible,
  onCancel,
  onFinish,
  groupMembers = [],
  currentUser,
  memberDetails = {},
}) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={<span className="text-lg font-semibold">Add Group Expense</span>}
      open={isVisible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onFinish(values).then((success) => {
            if (success) {
              form.resetFields();
            }
          });
        }}
      >
        <Form.Item
          label={<span className="font-semibold text-gray-700">Description</span>}
          name="description"
          rules={[{ required: true, message: "Please enter expense description" }]}
        >
          <Input placeholder="e.g., Dinner" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Amount</span>}
          name="amount"
          rules={[
            { required: true, message: "Please enter amount" },
            {
              pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
              message: "Please enter a valid amount",
            },
          ]}
        >
          <Input type="number" placeholder="0.00" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Date</span>}
          name="date"
          rules={[{ required: true, message: "Please select date" }]}
        >
          <DatePicker format="YYYY-MM-DD" className="w-full" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Split Among</span>}
          name="splitAmong"
          initialValue={groupMembers}
        >
          <Select mode="multiple" placeholder="Select members">
            {groupMembers.map((memberId) => (
              <Select.Option key={memberId} value={memberId}>
                {memberId === currentUser.uid
                  ? "You"
                  : (memberDetails[memberId]?.displayName || memberDetails[memberId]?.email || memberId)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Add Expense
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddGroupExpenseModal;
