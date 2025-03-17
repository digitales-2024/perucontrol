import { components } from "@/types/api";

export interface Project {
  id: string;
  area: number;
  spacesCount: number;
  orderNumber?: number;
  status?: string;
  address?: string;
  client?: components["schemas"]["Client"];
  services?: Array<components["schemas"]["Service"]>;
  quotation?: components["schemas"]["Quotation"];
  supplies?: Array<{ id: string; name: string; quantity: number; unit: string }>;
}
