export interface Contract {
  id: string;
  creationDate: string;  // LocalDate in backend → string here
  endDate: string;
  status: string;
  clientId: string;
  insurerId: string;
  beneficiaryId: string;
  [key: string]: unknown;
}

export interface ContractWithUser extends Contract {
  user?: {
    id: string;
    name?: string;
    avatar?: string;
    email?: string;
  };
}
export interface ContractWithInsurer extends Contract {
  insurer?: {
    id: string;
    name?: string;
    avatar?: string;
    email?: string;
  };
}   

export interface ContractChangeRequest {
  id: string;
  contractId: string;
  requesterId: string;
  field: string; // e.g., 'beneficiaryId' | 'insurerId' | 'montant' | 'endDate'
  currentValue: string;
  requestedValue: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerId?: string;
  reviewerNote?: string;
  createdAt: string;
  updatedAt?: string;
}