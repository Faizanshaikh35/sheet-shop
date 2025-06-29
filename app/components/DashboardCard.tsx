import {Badge, Card, Text, TextContainer,} from "@shopify/polaris";

interface DashboardCardProps {
  title: string;
  value: string | number;
  description?: string;
  badge?: string;
  badgeStatus?: "success" | "info" | "attention" | "warning" | "critical";
}

export function DashboardCard({
                                title,
                                value,
                                description,
                                badge,
                                badgeStatus = "info",
                              }: DashboardCardProps) {
  return (
    <Card sectioned>
      <Text variant="headingMd" as="h3">
        {title}
      </Text>
      <Text variant="headingXl" as="p">
        {value}
      </Text>
      {description && (
        <TextContainer>
          <Text variant="bodyMd" as="p" color="subdued">
            {description}
          </Text>
        </TextContainer>
      )}
      {badge && <Badge status={badgeStatus}>{badge}</Badge>}
    </Card>
  );
}
