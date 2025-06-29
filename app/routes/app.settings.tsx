import {
  BlockStack,
  Layout,
  Page,
  Text,
  Banner,
} from "@shopify/polaris";
import { useState } from "react";
import { AlertModal } from "../components/AlertModal";
import { IntegrationCard } from "../components/IntegrationCard";

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

  return (
    <Page
      title="Integration Settings"
      subtitle="Connect with third-party services"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
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
                isActive={isConnecting === "google"}
                onConnect={handleConnect}
              />

              <IntegrationCard
                service="microsoft"
                connected={microsoftConnected}
                title="Microsoft 365"
                description="Connect with Microsoft Excel and OneDrive"
                isActive={isConnecting === "microsoft"}
                onConnect={handleConnect}
              />

              <IntegrationCard
                service="airtable"
                connected={airtableConnected}
                title="Airtable"
                description="Connect with your Airtable base"
                isActive={isConnecting === "airtable"}
                onConnect={handleConnect}
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
