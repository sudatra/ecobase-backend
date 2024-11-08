
export interface User {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  password?: string | null;
  referrerId?: string | null;
  aadharNumber?: string | null;
  panImageLink?: string | null;
  directJoinees: string[];
  isMembershipActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface userHierarchyTree {
  id?: string;
  userid?: string;
  parentId?: string | null;
  siblings?: string[];
  slabNumber?: number;
}