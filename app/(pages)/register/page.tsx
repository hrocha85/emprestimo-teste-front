'use client';

import { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Snackbar, Alert } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registerSchema } from '@/app/schemas/register';

export default function Register() {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const watchedFields = watch(['name', 'identifier', 'birthDate']);

  const isButtonDisabled = () => {
    // Retorna true se algum campo estiver vazio
    return watchedFields.some(field => !field?.trim());
  };

  // Manipulação do submit do formulário
  const onSubmit = async (data: any) => {
    console.log(data);
    try {
      const response = await fetch('https://emprestimo-teste-back.onrender.com/person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setErrorApi(errorData.message || 'Erro ao realizar cadastro.');

        switch (errorData.message) {
          case 'Invalid CPF':
            setErrorApi('CPF inválido');
            break;
          case 'Invalid CNPJ':
            setErrorApi('CNPJ inválido');
            break;
          case 'Identifier already exists':
            setErrorApi('O identificador já existe');
            break;
          case 'Invalid identifier':
            setErrorApi('Identificador inválido.');
            break;
          case 'Person must be at least 18 years old':
            setErrorApi('A pessoa deve ter pelo menos 18 anos');
            break;
          default:
            setErrorApi('Erro ao realizar cadastro.');
        }
      }
    } catch (error) {
      setErrorApi((error as Error).message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 3,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5">Cadastro de Pessoa</Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Nome"
              variant="outlined"
              {...register("name")}
              error={!!errors?.name}
              helperText={typeof errors?.amount?.message === 'string' ? errors?.amount?.message : undefined}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Identificador"
              variant="outlined"
              {...register('identifier')}
              error={!!errors?.identifier}
              helperText={typeof errors?.identifier?.message === 'string' ? errors?.identifier?.message : ''}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Data de Nascimento"
              type="date"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              {...register('birthDate')}
              error={!!errors.birthDate}
              helperText={typeof errors.birthDate?.message === 'string' ? errors?.birthDate?.message : ""}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={isButtonDisabled()}
            >
              Cadastrar
            </Button>
          </Box>
        </Box>
        {errorApi && (
          <Snackbar
            open={Boolean(errorApi)}
            autoHideDuration={6000}
            onClose={() => setErrorApi(null)}
          >
            <Alert onClose={() => setErrorApi(null)} severity="error" sx={{ width: '100%' }}>
              {errorApi}
            </Alert>
          </Snackbar>
        )}
        {success && (
          <Snackbar
            open={success}
            autoHideDuration={6000}
            onClose={() => setSuccess(false)}
          >
            <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
              Cadastro realizado com sucesso!
            </Alert>
          </Snackbar>
        )}
      </Container>
    </main>
  );
}
