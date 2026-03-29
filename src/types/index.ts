export type AuthTab = "login" | "signup";
export type ToastType = "info" | "error" | "success";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface ChartDataItem {
  label: string;
  value: number;
  active?: boolean;
}

export const APP_CONFIG = {
  name: "Smart EdTech Solutions",
  tagline: "Reimagining Education Through Technology",
  problemArea: "Learning & Assessment",
  version: "1.0.0",
} as const;
