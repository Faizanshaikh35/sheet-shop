import {
  Badge,
  Card,
  DataTable,
  Layout,
  Page,
  BlockStack,
  InlineStack,
  Icon,
  Box,
  Text,
  Divider,
  Button,
} from "@shopify/polaris";
import { useState } from "react";
import { ProductFilledIcon, RefreshIcon, CalendarIcon } from "@shopify/polaris-icons";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [syncHistory, setSyncHistory] = useState([
    {
      id: "1",
      date: "2023-05-15",
      time: "14:30:45",
      type: "Products to Sheet",
      status: "Success",
      items: 24,
    },
    {
      id: "2",
      date: "2023-05-14",
      time: "09:15:22",
      type: "Sheet to Products",
      status: "Failed",
      items: 0,
      error: "Connection timeout",
    },
    {
      id: "3",
      date: "2023-05-12",
      time: "16:45:10",
      type: "Products to Sheet",
      status: "Success",
      items: 18,
    },
  ]);

  const handleManualSync = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSyncHistory([
        {
          id: "4",
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString(),
          type: "Manual Sync",
          status: "Success",
          items: 5,
        },
        ...syncHistory,
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <Page
      title="Product Sync Dashboard"
      subtitle="Manage your product data synchronization"
      primaryAction={{
        content: "Sync Now",
        loading: isLoading,
        onAction: handleManualSync,
        icon: RefreshIcon,
      }}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            <InlineStack gap="400" blockAlign="center" wrap={false}>
              {/* Total Products Card */}
              <Card padding="400" background="bg-surface">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Box
                      background="bg-fill-brand"
                      padding="200"
                      borderRadius="200"
                    >
                      <Icon source={ProductFilledIcon} tone="base" />
                    </Box>
                    <Text variant="headingSm" as="h3">
                      Total Products Synced
                    </Text>
                  </InlineStack>
                  <Text variant="headingXl" as="p" fontWeight="bold">
                    142
                  </Text>
                  <Divider />
                  <InlineStack gap="100" blockAlign="center">
                    <Badge status="success" progress="complete" />
                    <Text variant="bodySm" tone="subdued">
                      Active synchronization
                    </Text>
                  </InlineStack>
                </BlockStack>
              </Card>

              {/* Last Sync Card */}
              <Card padding="400" background="bg-surface">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Box
                      background="bg-fill-info"
                      padding="200"
                      borderRadius="200"
                    >
                      <Icon source={RefreshIcon} tone="base" />
                    </Box>
                    <Text variant="headingSm" as="h3">
                      Last Sync
                    </Text>
                  </InlineStack>
                  <BlockStack gap="100">
                    <Text variant="headingLg" as="p" fontWeight="bold">
                      24 products
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      May 15, 2023 at 2:30 PM
                    </Text>
                  </BlockStack>
                  <Divider />
                  <Badge status="success">Completed</Badge>
                </BlockStack>
              </Card>

              {/* Next Sync Card */}
              <Card padding="400" background="bg-surface">
                <BlockStack gap="200">
                  <InlineStack gap="200" blockAlign="center">
                    <Box
                      background="bg-fill-caution"
                      padding="200"
                      borderRadius="200"
                    >
                      <Icon source={CalendarIcon} tone="base" />
                    </Box>
                    <Text variant="headingSm" as="h3">
                      Next Sync
                    </Text>
                  </InlineStack>
                  <BlockStack gap="100">
                    <Text variant="headingLg" as="p" fontWeight="bold">
                      Auto
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      Scheduled in 2 hours
                    </Text>
                  </BlockStack>
                  <Divider />
                  <Badge status="attention">Pending</Badge>
                </BlockStack>
              </Card>
            </InlineStack>

            {/* Sync History Card */}
            <Card padding="0">
              <Box padding="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">
                    Sync History
                  </Text>
                  <Button
                    variant="plain"
                    onClick={() => console.log("View all")}
                  >
                    View all
                  </Button>
                </InlineStack>
              </Box>
              <Divider />
              <Box padding="400">
                <DataTable
                  columnContentTypes={[
                    "text",
                    "text",
                    "text",
                    "text",
                    "numeric",
                  ]}
                  headings={["Date", "Time", "Type", "Status", "Items"]}
                  rows={syncHistory.map((item) => [
                    <Text variant="bodyMd" key={`${item.id}-date`} fontWeight="medium">
                      {item.date}
                    </Text>,
                    <Text variant="bodyMd" key={`${item.id}-time`}>
                      {item.time}
                    </Text>,
                    <Text variant="bodyMd" key={`${item.id}-type`}>
                      {item.type}
                    </Text>,
                    <Badge
                      key={`${item.id}-status`}
                      status={item.status === "Success" ? "success" : "critical"}
                    >
                      {item.status}
                    </Badge>,
                    <Text
                      variant="bodyMd"
                      key={`${item.id}-items`}
                      alignment="end"
                      numeric
                    >
                      {item.items}
                    </Text>,
                  ])}
                  footerContent={`Showing ${syncHistory.length} recent syncs`}
                />
              </Box>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
