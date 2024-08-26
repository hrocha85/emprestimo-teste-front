export interface PersonProps {
  id: string;
  name: string;
  identifier: string;
  birthDate: string;
  identifierType: string;
  minLoanAmount: number;
  maxLoanAmount: number;
}

export interface LoanProps {
  id: string;
  amount: number;
  numberOfInstallments: number;
  status: string;
  createdAt: string;
  person: PersonProps;
}