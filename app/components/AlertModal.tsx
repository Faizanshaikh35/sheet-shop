import {Banner, Modal, Text,} from "@shopify/polaris";

interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  status: "success" | "error";
}

export function AlertModal({open, onClose, title, content, status}: AlertModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      primaryAction={{
        content: "Close",
        onClose,
      }}
    >
      <Modal.Section>
        <Banner status={status}>
          <Text variant="bodyMd" as="p">
            {content}
          </Text>
        </Banner>
      </Modal.Section>
    </Modal>
  );
}
