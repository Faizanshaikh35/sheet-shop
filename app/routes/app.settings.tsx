import {
  BlockStack,
  Layout,
  Page,
  Text,
  Button,
} from "@shopify/polaris";
import { json, redirect } from "@remix-run/node";
import {useLoaderData, useFetcher, useActionData} from "@remix-run/react";
import { useState, useEffect } from "react";
import { authenticate } from "../shopify.server";
import {generateAuthUrl} from "../services/google";

// Types
type GoogleIntegration = {
  connected: boolean;
  email?: string;
};

type LoaderData = {
  google: GoogleIntegration;
};

export async function loader({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  return json<LoaderData>({
    google: {
      connected: false,
      email: "",
    },
  });
}

export async function action({ request }: { request: Request }) {
  const { session } = await authenticate.admin(request);
  const authUrl = generateAuthUrl();
  return json({ authUrl });
}

export default function SettingsPage() {
  const { google } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (fetcher.data?.authUrl) {
      window.open(fetcher.data.authUrl, '_blank');
    }
    setIsConnecting(fetcher.state === "submitting");
  }, [fetcher.state, fetcher.data]);

  return (
    <Page title="Google Integration">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Google Integration
            </Text>

            {google.connected ? (
              <BlockStack gap="200">
                <Text as="p">Connected as: {google.email}</Text>
                <fetcher.Form method="post">
                  <Button
                    submit
                    name="action"
                    value="disconnect-google"
                    loading={isConnecting}
                    tone="critical"
                  >
                    Disconnect Google
                  </Button>
                </fetcher.Form>
              </BlockStack>
            ) : (
              <fetcher.Form method="post">
                <Button
                  submit
                  name="action"
                  value="connect-google"
                  loading={isConnecting}
                  tone="success"
                >
                  Connect Google Account
                </Button>
              </fetcher.Form>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
