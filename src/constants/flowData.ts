export const DEMOGRAPHIC_TAGS = [
  { id: "age_18_24", name: "Age 18-24", segmentSize: 15000 },
  { id: "age_25_34", name: "Age 25-34", segmentSize: 25000 },
  { id: "age_35_plus", name: "Age 35+", segmentSize: 30000 },
  { id: "gender_male", name: "Male", segmentSize: 35000 },
  { id: "gender_female", name: "Female", segmentSize: 35000 },
  { id: "location_urban", name: "Urban", segmentSize: 40000 },
  { id: "location_rural", name: "Rural", segmentSize: 30000 }
];

export const AVAILABLE_AUDIENCES = [
  { id: "csv1", name: "Import 1", contacts: 50000 },
  { id: "csv2", name: "Import 2", contacts: 75000 },
  { id: "csv3", name: "Import 3", contacts: 100000 },
  { id: "csv4", name: "Import 4", contacts: 85000 }
];

export const STOP_PHRASES = [
  "Reply STOP to opt out",
  "Reply STOP to cancel",
  "STOP 2 END",
  "Reply STOP to unsubscribe"
] as const;

export const nodeTypes = {
  audience: AudienceNode,
  message: MessageNode,
  sequence: SequenceNode,
  poll: PollNode,
};