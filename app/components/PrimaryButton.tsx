import {
  Button,
} from "@shopify/polaris";
import React, { useState } from "react";

interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function PrimaryButton({
                                label,
                                onClick,
                                loading = false,
                                disabled = false,
                                icon,
                              }: PrimaryButtonProps) {
  return (
    <Button
      primary
      onClick={onClick}
      loading={loading}
      disabled={disabled}
      icon={icon}
    >
      {label}
    </Button>
  );
}
