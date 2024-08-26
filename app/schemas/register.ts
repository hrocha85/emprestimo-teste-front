import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  identifier: z.string().min(1, 'Identificador é obrigatório'),
  birthDate: z.string()
    .refine(value => {
      // Verifica o formato da data de nascimento
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        return false;
      }

      // Extraindo o ano da data
      const year = parseInt(value.split('-')[0], 10);

      // Verifica se o ano possui 4 dígitos
      if (year < 1000 || year > 9999) {
        return false;
      }

      // Calcula a idade
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();

      return age >= 18; // Verifica se a pessoa tem pelo menos 18 anos
    }, 'Data de nascimento inválida ou a pessoa deve ter pelo menos 18 anos'),
});

export type FormData = z.infer<typeof registerSchema>;
