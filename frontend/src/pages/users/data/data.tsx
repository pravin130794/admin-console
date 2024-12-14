import { IconShield, IconUser, IconUserShield } from "@tabler/icons-react";
import { UserStatus } from "./schema";
export const statuses = [
  {
    value: "true",
    label: "Active",
  },
  {
    value: "false",
    label: "Inactive",
  },
];

export const callTypes = new Map<UserStatus, string>([
  ["active", "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200"],
  ["inactive", "bg-neutral-300/40 border-neutral-300"],
]);

export const userTypes = [
  {
    label: "Superadmin",
    value: "superadmin",
    icon: IconShield,
  },
  {
    label: "User",
    value: "user",
    icon: IconUser,
  },
  {
    label: "Groupadmin",
    value: "groupadmin",
    icon: IconUserShield,
  },
] as const;
