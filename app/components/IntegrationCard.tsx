import {
  BlockStack,
  Card,
  Text,
  InlineStack,
  Box,
  Divider,
  Badge,
  Button,
} from "@shopify/polaris";
import { ReactNode } from "react";

interface IntegrationCardProps {
  service: "google" | "microsoft" | "airtable";
  connected: boolean;
  title: string;
  description: string;
  icon?: ReactNode;
  isActive?: boolean;
  onConnect: (service: "google" | "microsoft" | "airtable") => void;
}

export function IntegrationCard({
                                  service,
                                  connected,
                                  title,
                                  description,
                                  icon,
                                  isActive = false,
                                  onConnect,
                                }: IntegrationCardProps) {
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
              {icon || (
                <Text variant="bodyLg" fontWeight="bold">
                  {service.charAt(0).toUpperCase()}
                </Text>
              )}
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
            disabled={connected || isActive}
            onClick={() => onConnect(service)}
          >
            {connected ? "Connected" : isActive ? "Connecting..." : "Connect"}
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
