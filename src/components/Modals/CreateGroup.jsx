import React from "react";
import { Modal, Form, Input, Button } from "antd";

const CreateGroupModal = ({ isVisible, onCancel, onFinish }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={<span className="text-lg font-semibold">Create New Group</span>}
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
          label={<span className="font-semibold text-gray-700">Group Name</span>}
          name="name"
          rules={[{ required: true, message: "Please enter group name" }]}
        >
          <Input placeholder="e.g., Trip to Goa" />
        </Form.Item>

        <Form.Item
          label={<span className="font-semibold text-gray-700">Description</span>}
          name="description"
        >
          <Input.TextArea
            placeholder="Optional description"
            rows={3}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Create Group
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateGroupModal;
