export type ExperimentVariant = "A" | "B";
export type ExperimentEventType = "exposure" | "conversion";

export interface ExperimentEventProps {
  experimentId: string;
  variant: ExperimentVariant;
  eventType: ExperimentEventType;
  sessionId: string;
  createdAt?: Date;
}
