import { z } from 'zod';

export const loanSchema = z.object({
  amount: z
  .string()
  .transform((value) => parseFloat(value.replace(/[^0-9,-]+/g, '').replace(',', '.')))
  .refine((value) => value >= 3000, {
    message: 'Não será possível realizar seu empréstimo, valor solicitado a baixo',
  }),
  numberOfInstallments: z
  .string()
  .refine((value) => value.length <= 2, { message: 'Máximo de 2 caracteres' })
  .refine((value) => parseInt(value, 10) <= 24, { message: 'O valor máximo é 24' })

});
