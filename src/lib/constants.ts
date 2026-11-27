import type { CategoryMeta } from "./types";

export const MANDATORY_DISCLAIMERS: readonly string[] = [
  "This is a planning tool, not a contract or legal document.",
  "Hard limits must be respected. Safewords always stop the scene.",
  "Ongoing consent can be withdrawn at any time.",
  "This does not replace education, communication, STI testing, or risk awareness.",
];

export const PALETTE = {
  bgPrimary: "#0F0F0F",
  bgSecondary: "#1A1A1A",
  surface: "#242424",
  textPrimary: "#F5F5F0",
  textSecondary: "#A0A0A0",
  accentLeather: "#8B4513",
  accentBurgundy: "#6B2D3C",
  successGreen: "#4A7C59",
  warningYellow: "#C4A35A",
  stopRed: "#8B3A3A",
} as const;

export const CATEGORIES: readonly CategoryMeta[] = [
  {
    slug: "negotiation-foundation",
    name: "Negotiation & Foundation",
    discreetName: "Core Planning & Agreements",
    description:
      "Pre-scene alignment, limits mapping, health disclosure, visibility agreements, and aftercare planning.",
    icon: "ClipboardCheck",
  },
  {
    slug: "pup-play-training",
    name: "Pup Play & Training",
    discreetName: "Structured Roleplay & Drills",
    description:
      "Headspace, gear-up rituals, handler inspection, progressive training levels, and weekend protocols.",
    icon: "Shield",
  },
  {
    slug: "ownership-collar-protocol",
    name: "Ownership, Collar & Protocol",
    discreetName: "Commitment & Formal Rituals",
    description:
      "Collar ceremonies, high-protocol dining, temporary transfers, and rules installation.",
    icon: "Award",
  },
  {
    slug: "leather-gear",
    name: "Leather & Gear",
    discreetName: "Equipment & Maintenance",
    description:
      "Leather inspections, boot blacking service, gear breaking-in, and event preparation.",
    icon: "Wrench",
  },
  {
    slug: "service-structured-time",
    name: "Service & Structured Time",
    discreetName: "Task & Schedule Frameworks",
    description:
      "Service weekends, domestic structure, scheduled blocks, and morning/evening routines.",
    icon: "Clock",
  },
  {
    slug: "denial-control-challenge",
    name: "Denial, Control & Challenge",
    discreetName: "Endurance & Pacing Protocols",
    description:
      "Multi-day pacing, permission frameworks, device checklists, and structured check-ins.",
    icon: "Lock",
  },
  {
    slug: "impact-bondage-sensation",
    name: "Impact, Bondage & Sensation",
    discreetName: "Physical & Sensory Sessions",
    description:
      "Progressive warm-up to cool-down impact, restraint hybrids, clinical inspection, and sensation play.",
    icon: "Flame",
  },
  {
    slug: "supporting-modules",
    name: "Supporting Modules",
    discreetName: "Reference & Debrief Cards",
    description:
      "Aftercare menus, immediate and next-day debriefs, multi-partner add-ons, risk matrix, and signal cards.",
    icon: "FileText",
  },
] as const;

export const PROGRESSIVE_TRACKS = [
  {
    id: "pup-training-track",
    title: "Pup Training Track",
    discreetTitle: "Progressive Roleplay Track",
    description: "Structured progression from basic headspace and commands to full weekend protocol.",
    sceneIds: [
      "pup-training-level-1",
      "pup-training-level-2",
      "handler-inspection-gear-up-ritual",
      "pup-training-level-3",
      "pup-weekend-protocol",
    ],
  },
  {
    id: "leather-service-track",
    title: "Leather & Service Track",
    discreetTitle: "Equipment & Structured Service Track",
    description: "From foundational negotiation and boot care to full leather inspection and service weekends.",
    sceneIds: [
      "full-scene-negotiation-framework",
      "boot-blacking-service-scene",
      "leather-care-maintenance-service",
      "full-leather-inspection-ritual",
      "service-weekend-structure",
    ],
  },
  {
    id: "protocol-ownership-track",
    title: "Protocol & Ownership Track",
    discreetTitle: "Formal Agreement & Ritual Track",
    description: "Establishing clear rules, daily check-ins, high-protocol dining, and collar ceremonies.",
    sceneIds: [
      "established-dynamic-renegotiation",
      "morning-evening-protocol-pack",
      "high-protocol-evening-dinner",
      "collar-acceptance-ceremony",
      "rules-protocol-installation-weekend",
    ],
  },
] as const;

export const SHARE_EXPIRY_MS = 72 * 60 * 60 * 1000;
