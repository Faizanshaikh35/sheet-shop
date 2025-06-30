// routes/settings.tsx
import {
  BlockStack,
  Layout,
  Page,
  Text,
} from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useLoaderData, useFetcher, useNavigate} from "@remix-run/react";
import { AlertModal } from "../components/AlertModal";
import { IntegrationCard } from "../components/IntegrationCard";
import { useState, useEffect } from "react";

// Mock database (replace with real DB in production)
const mockIntegrationsDB = {
  google: { connected: false },
  microsoft: { connected: false },
  airtable: { connected: false },
};

// Types
type IntegrationStatus = {
  google: boolean;
  microsoft: boolean;
  airtable: boolean;
};

type ActionResponse = {
  status: "success" | "error";
  message: string;
  updatedIntegrations?: IntegrationStatus;
};

// Loader function
export async function loader() {
  return json({
    integrations: mockIntegrationsDB,
  });
}

// Action function
export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const service = formData.get("service") as "google" | "microsoft" | "airtable";
  const action = formData.get("action") as "connect" | "disconnect";

  await new Promise(resolve => setTimeout(resolve, 1000));
  const success = Math.random() > 0.2;

  if (success) {
    mockIntegrationsDB[service].connected = action === "connect";
    return json({
      status: "success",
      message: `${service} ${action}ed successfully!`,
      updatedIntegrations: mockIntegrationsDB,
    });
  } else {
    return json<ActionResponse>({
      status: "error",
      message: `Failed to ${action} ${service}`,
    });
  }
}

export default function SettingsPage() {
  const { integrations } = useLoaderData<typeof loader>();
  const [localIntegrations, setLocalIntegrations] = useState(integrations);
  const [modal, setModal] = useState({
    open: false,
    type: "success" as "success" | "error",
    message: "",
  });

  const fetcher = useFetcher<ActionResponse>();
  const navigate = useNavigate();

  // Handle fetcher state changes
  useEffect(() => {
    if (fetcher.data) {
      setModal({
        open: true,
        type: fetcher.data.status,
        message: fetcher.data.message,
      });
      if (fetcher.data.updatedIntegrations) {
        setLocalIntegrations(fetcher.data.updatedIntegrations);
      }
    }
  }, [fetcher.data]);

  const handleConnect = (service: "google" | "microsoft" | "airtable") => {
    const action = localIntegrations[service].connected ? "disconnect" : "connect";
    fetcher.submit(
      { service, action },
      { method: "POST" }
    );
  };

  return (
    <Page
      title="Settings"
      backAction={{ content: "Back", onAction: () => navigate(-1) }}
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
                connected={localIntegrations.google.connected}
                title="Google Workspace"
                description="Connect with Google Sheets and Drive"
                isActive={fetcher.state === "submitting" && fetcher.formData?.get("service") === "google"}
                actionType={localIntegrations.google.connected ? "disconnect" : "connect"}
                onConnect={() => handleConnect("google")}
              />

              <IntegrationCard
                service="microsoft"
                connected={localIntegrations.microsoft.connected}
                title="Microsoft 365"
                description="Connect with Microsoft Excel and OneDrive"
                isActive={fetcher.state === "submitting" && fetcher.formData?.get("service") === "microsoft"}
                actionType={localIntegrations.microsoft.connected ? "disconnect" : "connect"}
                onConnect={() => handleConnect("microsoft")}
              />

              <IntegrationCard
                service="airtable"
                connected={localIntegrations.airtable.connected}
                title="Airtable"
                description="Connect with your Airtable base"
                isActive={fetcher.state === "submitting" && fetcher.formData?.get("service") === "airtable"}
                actionType={localIntegrations.airtable.connected ? "disconnect" : "connect"}
                onConnect={() => handleConnect("airtable")}
              />
            </BlockStack>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <AlertModal
        open={modal.open}
        onClose={() => setModal({...modal, open: false})}
        title={modal.type === "success" ? "Success" : "Error"}
        content={modal.message}
        status={modal.type}
      />
    </Page>
  );
}
