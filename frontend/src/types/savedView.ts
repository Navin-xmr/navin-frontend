export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  createdAt: string; // ISO string
}
