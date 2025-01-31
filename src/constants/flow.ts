export const STOP_PHRASES = [
  "Reply STOP to unsubscribe",
  "Text STOP to opt-out",
  "Send STOP to end messages"
] as const;

export const DEMOGRAPHIC_TAGS = [
  { id: "age-18-24", name: "Age 18-24" },
  { id: "age-25-34", name: "Age 25-34" },
  { id: "age-35-44", name: "Age 35-44" },
  { id: "location-urban", name: "Urban" },
  { id: "location-suburban", name: "Suburban" },
  { id: "location-rural", name: "Rural" }
];

export const AVAILABLE_AUDIENCES = [
  { id: "all-users", name: "All Users", contacts: 10000 },
  { id: "active-users", name: "Active Users", contacts: 5000 },
  { id: "new-users", name: "New Users", contacts: 2000 }
];