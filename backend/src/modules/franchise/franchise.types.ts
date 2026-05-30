export interface CreateFranchiseDto {
  name: string;
  location: string;
  contact: string;
  commissionPercent?: number;
  isActive?: boolean;
}

export interface UpdateFranchiseDto {
  name?: string;
  location?: string;
  contact?: string;
  commissionPercent?: number;
  isActive?: boolean;
}