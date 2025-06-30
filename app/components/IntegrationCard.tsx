// components/IntegrationCard.tsx
import {
  Button,
  Card,
  BlockStack,
  InlineStack,
  Box,
  Divider,
  Badge,
  Text,
} from "@shopify/polaris";

export function IntegrationCard({
                                  service,
                                  connected,
                                  title,
                                  description,
                                  isActive,
                                  actionType,
                                  onConnect, // Add this prop
                                }: any & { onConnect?: () => void }) {
  const status = connected ? "connected" : isActive ? "connecting" : "disconnected";

  return (
    <Card padding="400" background="bg-surface">
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <InlineStack gap="300" blockAlign="center">
            <Box
              padding="200"
              borderRadius="200"
              background={
                status === "connected"
                  ? "bg-fill-success"
                  : status === "connecting"
                  ? "bg-fill-info"
                  : "bg-fill-caution"
              }
            >
              <Text variant="bodyLg" fontWeight="bold">
                {service.charAt(0).toUpperCase()}
              </Text>
            </Box>
            <BlockStack gap="100">
              <Text variant="headingSm" as="h3">
                {title}
              </Text>
              <Text variant="bodySm" tone="subdued">
                {description}
              </Text>
            </BlockStack>
          </InlineStack>

          <Button
            size="medium"
            variant={connected ? "plain" : "primary"}
            tone={connected ? "success" : undefined}
            loading={isActive}
            disabled={isActive}
            onClick={onConnect} // Use the onClick handler
          >
            {connected ? "Disconnect" : isActive ? "Connecting..." : "Connect"}
          </Button>
        </InlineStack>

        <Divider />

        <InlineStack gap="200" blockAlign="center">
          <Badge
            status={
              status === "connected"
                ? "success"
                : status === "connecting"
                ? "attention"
                : "warning"
            }
            progress={
              status === "connecting" ? "partiallyComplete" : "complete"
            }
          />
          <Text variant="bodySm" tone="subdued">
            {status === "connected"
              ? "Active connection"
              : status === "connecting"
                ? "Establishing connection..."
                : "Not connected"}
          </Text>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
