export type UserAction = "LOGIN" | "LOGOUT" | "SIGNUP";

export interface UserEvent {
  userId: string;
  action: UserAction;
  timestamp: string; // ISO string (es. new Date().toISOString())
  metadata?: Record<string, unknown>;
}

// (opzionale) piccolo type guard runtime
export function isUserEvent(value: any): value is UserEvent {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.userId === "string" &&
    typeof value.action === "string" &&
    typeof value.timestamp === "string"
  );
}
