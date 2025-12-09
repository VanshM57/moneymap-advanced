import React from "react";
import { Modal, Form, Input, Button } from "antd";

const JoinGroupModal = ({ isVisible, onCancel, onFinish }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title={<span className="text-lg font-semibold">Join Group</span>}
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
          onFinish(values.inviteCode).then((success) => {
            if (success) {
              form.resetFields();
            }
          });
        }}
      >
        <Form.Item
          label={<span className="font-semibold text-gray-700">Invite Code</span>}
          name="inviteCode"
          rules={[
            { required: true, message: "Please enter invite code" },
            { len: 6, message: "Invite code must be 6 characters" },
          ]}
        >
          <Input
            placeholder="e.g., ABC123"
            maxLength={6}
            style={{ textTransform: "uppercase" }}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              form.setFieldValue("inviteCode", e.target.value);
            }}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Join Group
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default JoinGroupModal;
