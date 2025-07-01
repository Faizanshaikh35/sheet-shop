import {
  BlockStack,
  Layout,
  Page,
  Text,
  Button,
  Banner,
} from "@shopify/polaris";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import { authenticate } from "../shopify.server";
import {generateAuthUrl, createNewSpreadsheet, syncProductsToSpreadsheet} from "../services/google";
import {
  deleteConnectorByShopId,
  findShopByShopId,
  getAdminShopInfo,
  getConnectorByType,
  updateConnector,
} from "../services/query";
import { CONNECTOR_TYPE } from "../constant/index";
import {getAllShopifyProducts} from "../services/shopify";

type GoogleIntegration = {
  connected: boolean;
  email?: string;
  sheetUrl?: string;
};

type LoaderData = {
  google: GoogleIntegration;
};

export async function loader({ request }: { request: Request }) {
  const { admin } = await authenticate.admin(request);
  const shopData = await getAdminShopInfo(admin);
  const shopId = shopData.data.shop.id;
  const shop = await findShopByShopId(shopId);

  const googleConnector = await getConnectorByType(shop.id, CONNECTOR_TYPE.GOOGLE);

  return json<LoaderData>({
    google: {
      connected: !!googleConnector,
      email: googleConnector?.email || "",
      sheetUrl: googleConnector?.sheetLinkUrl || "",
    },
  });
}

export async function action({ request }: { request: Request }) {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  console.log("action", action)

  const shopData = await getAdminShopInfo(admin);
  const shopId = shopData.data.shop.id;
  const shop = await findShopByShopId(shopId);
  const googleConnector = await getConnectorByType(shop.id, CONNECTOR_TYPE.GOOGLE);

  if (action === 'sync-products') {
    try {
      if (!googleConnector) {
        throw new Error('Google account not connected');
      }

      // 1. Get all products
      const products = await getAllShopifyProducts(admin);

      // 2. Sync to spreadsheet
      const result = await syncProductsToSpreadsheet(
        {
          access_token: googleConnector.accessToken,
          refresh_token: googleConnector.refreshToken,
          expiry_date: googleConnector.expiryDate
        },
        products,
        googleConnector.sheetLinkUrl || undefined
      );

      // 3. Update connector with sheet URL if new one was created
      if (!googleConnector.sheetLinkUrl) {
        await updateConnector(googleConnector.id, {
          sheetLinkUrl: result.url
        });
      }
      return json({
        success: true,
        sheetUrl: result.url,
        productCount: products.length
      });

    } catch (error) {
      console.error('Product sync failed:', error);
      return json(
        { error: 'Failed to sync products: ' + error.message },
        { status: 500 }
      );
    }
  }

  if (action === "connect-google") {
    const authUrl = generateAuthUrl();
    return json({ authUrl });
  }

  if (action === "disconnect-google") {
    await deleteConnectorByShopId(shop.id, CONNECTOR_TYPE.GOOGLE);
    return redirect("/app/settings");
  }

  if (action === "create-spreadsheet") {
    if (!googleConnector) {
      return json({ error: "Google account not connected" }, { status: 400 });
    }

    try {
      const spreadsheet = await createNewSpreadsheet(googleConnector, `Shopify Data - ${shopData.data.shop.name}`);

      await updateConnector(googleConnector.id, {
        sheetLinkUrl: spreadsheet.url,
      });

      return json({ sheetUrl: spreadsheet.url });
    } catch (error) {
      console.error("Failed to create spreadsheet:", error);
      return json(
        { error: "Failed to create spreadsheet" },
        { status: 500 }
      );
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function SettingsPage() {
  const { google } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    if (fetcher.data?.authUrl) {
      window.open(fetcher.data.authUrl, "_blank");
    }

    if (fetcher.data?.sheetUrl) {
      navigate(".", { replace: true });
    }

    if (fetcher.data?.error) {
      setError(fetcher.data.error);
    }

    if (fetcher.data?.productCount) {
      setSyncResult(fetcher.data);
    }

    setIsLoading(fetcher.state === "submitting");
  }, [fetcher, navigate]);

  const handleCreateSpreadsheet = () => {
    setError(null);
    fetcher.submit(
      { action: "create-spreadsheet" },
      { method: "POST" }
    );
  };

  const handleDisconnect = () => {
    setError(null);
    fetcher.submit(
      { action: "disconnect-google" },
      { method: "POST" }
    );
  };

  const handleSyncProducts = () => {
    setError(null);
    setSyncResult(null);
    fetcher.submit(
      { action: "sync-products" },
      { method: "POST" }
    );
  };

  const handleConnect = () => {
    fetcher.submit(
      { action: "connect-google" },
      { method: "POST" }
    );
  };

  return (
    <Page title="Google Integration">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Google Integration
            </Text>

            {error && (
              <Banner tone="critical">
                <Text as="p">{error}</Text>
              </Banner>
            )}

            {syncResult?.productCount && (
              <Banner tone="success">
                <Text as="p">
                  Synced {syncResult.productCount} products to{" "}
                  <a href={syncResult.sheetUrl} target="_blank" rel="noopener noreferrer">
                    spreadsheet
                  </a>
                </Text>
              </Banner>
            )}

            {google.connected ? (
              <BlockStack gap="400">
                <BlockStack gap="200">
                  {google.email && (
                    <Text as="p">Connected as: {google.email}</Text>
                  )}

                  {google.sheetUrl ? (
                    <>
                      <Text as="p">
                        Spreadsheet:{" "}
                        <a href={google.sheetUrl} target="_blank" rel="noopener noreferrer">
                          View Spreadsheet
                        </a>
                      </Text>

                      {/* Manual Sync Button - Only shows when both Google and sheet are connected */}
                      <Button
                        onClick={handleSyncProducts}
                        loading={isLoading}
                        tone="success"
                      >
                        Sync Products Now
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleCreateSpreadsheet}
                      loading={isLoading}
                    >
                      Create New Spreadsheet
                    </Button>
                  )}
                </BlockStack>

                <Button
                  onClick={handleDisconnect}
                  loading={isLoading}
                  tone="critical"
                >
                  Disconnect Google
                </Button>
              </BlockStack>
            ) : (
                <Button
                  onClick={handleConnect}
                  loading={isLoading}
                  tone="success"
                >
                  Connect Google Account
                </Button>
            )}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
