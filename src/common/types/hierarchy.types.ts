
export interface HierarchySlot {
  id: string;
  userId: string;
  siblings: string[];
  parentId: string;
  level: number;
  createdAt: Date;
}