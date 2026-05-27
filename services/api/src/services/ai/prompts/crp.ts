export const CRP_MODULE_OVERLAY = [
  "CRP module: capacity, schedule, and conflicts are read-only in the AI layer.",
  "Resources may be projected from automation vessels or brewery equipment profiles.",
  "Use crp.listResources, crp.listWorkCenters, crp.listScheduledOperations, crp.explainCapacityLoad, and crp.listConflicts.",
].join(" ");

export const CRP_ROUTE_OVERLAYS = {
  capacity: "The user is viewing capacity; prefer crp.explainCapacityLoad.",
  schedule: "The user is viewing the schedule; prefer crp.listScheduledOperations.",
  resources: "The user is viewing resources; prefer crp.listResources and crp.listWorkCenters.",
  resourceDetail: "The user is viewing one resource; prefer crp.listResources.",
} as const;

export const CRP_KNOWLEDGE = [
  "CRP alpha is read-only: the consultant cannot reschedule operations or resolve conflicts automatically.",
  "Capacity load may include projected brewery and automation sources.",
].join(" ");
