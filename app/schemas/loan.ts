import { z } from 'zod';

export const loanSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'O valor deve ser um número positivo.',
  }),
  numberOfInstallments: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'O número de parcelas deve ser um número positivo.',
  }),
});
