import {
  BlockStack,
  Card,
  Layout,
  Page,
  Text,
  InlineStack,
  Box,
  Icon,
  Divider,
  Badge,
  Button,
  Banner,
} from "@shopify/polaris";
import { useState } from "react";
import { AlertModal } from "../components/AlertModal";

export default function SettingsPage() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [airtableConnected, setAirtableConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState<
    "google" | "microsoft" | "airtable" | null
    >(null);
  const [modal, setModal] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });

  const handleConnect = (service: "google" | "microsoft" | "airtable") => {
    setIsConnecting(service);

    // Simulate API connection
    setTimeout(() => {
      setIsConnecting(null);
      if (Math.random() > 0.2) {
        // 80% success rate for demo
        setModal({
          open: true,
          type: "success",
          message: `${
            service.charAt(0).toUpperCase() + service.slice(1)
          } connected successfully!`,
        });
        if (service === "google") setGoogleConnected(true);
        if (service === "microsoft") setMicrosoftConnected(true);
        if (service === "airtable") setAirtableConnected(true);
      } else {
        setModal({
          open: true,
          type: "error",
          message: `Failed to connect with ${service}. Please try again.`,
        });
      }
    }, 2000);
  };

  const IntegrationCard = ({
                             service,
                             connected,
                             title,
                             description,
                             icon,
                           }: {
    service: "google" | "microsoft" | "airtable";
    connected: boolean;
    title: string;
    description: string;
    icon: React.ReactNode;
  }) => {
    const isActive = isConnecting === service;
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
                {icon}
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
              onClick={() => handleConnect(service)}
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
  };

  return (
    <Page
      title="Integration Settings"
      subtitle="Connect with third-party services"
      backAction={{ content: "Dashboard", url: "/" }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/*<Banner*/}
            {/*  title="Before you connect"*/}
            {/*  tone="info"*/}
            {/*  action={{ content: "Learn more", url: "#" }}*/}
            {/*>*/}
            {/*  <Text variant="bodyMd" as="p">*/}
            {/*    Ensure you have admin access to the services you want to connect.*/}
            {/*  </Text>*/}
            {/*</Banner>*/}

            <BlockStack gap="200">
              <Text variant="headingMd" as="h2">
                Available Integrations
              </Text>
              <Text variant="bodyMd" tone="subdued">
                Connect with these services to sync your product data
              </Text>
            </BlockStack>

            <BlockStack gap="300">
              <IntegrationCard
                service="google"
                connected={googleConnected}
                title="Google Workspace"
                description="Connect with Google Sheets and Drive"
              />

              <IntegrationCard
                service="microsoft"
                connected={microsoftConnected}
                title="Microsoft 365"
                description="Connect with Microsoft Excel and OneDrive"
              />

              <IntegrationCard
                service="airtable"
                connected={airtableConnected}
                title="Airtable"
                description="Connect with your Airtable base"
              />
            </BlockStack>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <AlertModal
        open={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.type === "success" ? "Success" : "Error"}
        content={modal.message}
        status={modal.type}
      />
    </Page>
  );
}
