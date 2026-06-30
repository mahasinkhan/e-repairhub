export interface CreateFranchiseDto {
  name: string;
  location: string;
  contact: string;
  commissionAmount?: number;
  isActive?: boolean;
}

export interface UpdateFranchiseDto {
  name?: string;
  location?: string;
  contact?: string;
  commissionAmount?: number;
  isActive?: boolean;
}
