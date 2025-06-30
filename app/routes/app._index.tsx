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
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { ProductFilledIcon, RefreshIcon, CalendarIcon } from "@shopify/polaris-icons";

// Types
type SyncHistoryItem = {
  id: string;
  date: string;
  time: string;
  type: string;
  status: "Success" | "Failed";
  items: number;
  error?: string;
};

type DashboardStats = {
  totalProducts: number;
  lastSync: {
    count: number;
    timestamp: string;
  };
  nextSync: string;
};

type LoaderData = {
  stats: DashboardStats;
  syncHistory: SyncHistoryItem[];
};

type ActionData = {
  newSync?: SyncHistoryItem;
  error?: string;
};

// Mock database
let mockStats = {
  totalProducts: 142,
  lastSync: {
    count: 24,
    timestamp: "May 15, 2023 at 2:30 PM",
  },
  nextSync: "Scheduled in 2 hours",
};

let mockSyncHistory: SyncHistoryItem[] = [
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
];

// Loader function
export async function loader() {
  return json<LoaderData>({
    stats: mockStats,
    syncHistory: mockSyncHistory,
  });
}

// Action function
export async function action() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate 80% success rate
  const success = Math.random() > 0.2;

  if (success) {
    const newSync: SyncHistoryItem = {
      id: (mockSyncHistory.length + 1).toString(),
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
      type: "Manual Sync",
      status: "Success",
      items: Math.floor(Math.random() * 10) + 1,
    };

    mockSyncHistory = [newSync, ...mockSyncHistory];
    mockStats.lastSync = {
      count: newSync.items,
      timestamp: new Date().toLocaleString(),
    };

    return json<ActionData>({ newSync });
  } else {
    return json<ActionData>(
      { error: "Sync failed. Please try again." },
      { status: 500 }
    );
  }
}

export default function HomePage() {
  const { stats, syncHistory } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const isSyncing = fetcher.state === "submitting";

  return (
    <Page
      title="Product Sync Dashboard"
      subtitle="Manage your product data synchronization"
      primaryAction={{
        content: "Sync Now",
        loading: isSyncing,
        onAction: () => fetcher.submit({}, { method: "POST" }),
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
                    {stats.totalProducts}
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
                      {stats.lastSync.count} products
                    </Text>
                    <Text variant="bodySm" tone="subdued">
                      {stats.lastSync.timestamp}
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
                      {stats.nextSync}
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
                  rows={(fetcher.data?.newSync ? [fetcher.data.newSync, ...syncHistory] : syncHistory).map((item) => [
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
