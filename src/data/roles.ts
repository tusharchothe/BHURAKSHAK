import type { RoleDefinition, UserRole } from "@/types";

export const ROLES: RoleDefinition[] = [
  {
    id: "operator",
    title: "Mine Operator",
    summary:
      "Shift-level situational awareness: live surface sensor network, anomalies and immediate response actions.",
    priorities: [
      "Live sensor feed and health",
      "Active alerts and acknowledgement",
      "Panel-wise ground movement",
    ],
    route: "/operator",
  },
  {
    id: "planner",
    title: "Mine Planner",
    summary:
      "Medium-term analysis: deformation trends, panel extraction sequencing and predicted subsidence envelopes.",
    priorities: [
      "Temporal deformation trends",
      "Predicted subsidence zones",
      "Monitoring coverage gaps",
    ],
    route: "/planner",
  },
  {
    id: "regulator",
    title: "Regulator",
    summary:
      "Oversight view: compliance posture, evidence trails behind each alert and cross-mine risk comparison.",
    priorities: [
      "Evidence-backed alert history",
      "Cross-mine risk overview",
      "Monitoring coverage reporting",
    ],
    route: "/regulator",
  },
];

export const getRole = (id: UserRole) => ROLES.find((r) => r.id === id)!;
