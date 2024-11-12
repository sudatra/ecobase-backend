
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

export interface UserAddress {
  id: string;
  street: string;
  locality: string;
  city: string;
  district: string;
  pincode: string;
  state: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface UserHierarchyTree {
  id?: string;
  userid?: string;
  parentId?: string | null;
  siblings?: string[];
  slabNumber?: number;
}

export interface UserSibling {
  userId?: string;
  order?: number;
  slabNumber?: number;
  isActive?: boolean;
}