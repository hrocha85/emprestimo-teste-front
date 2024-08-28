'use client';

import { useState, useEffect } from 'react';
import { TextField, Button, Typography, Container, Box, Snackbar, Alert, MenuItem } from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registerSchema } from '@/app/schemas/register';

export default function Register() {
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState('CPF');

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const watchedFields = watch(['name', 'identifier', 'birthDate']);

  const isButtonDisabled = () => {
    return watchedFields.some(field => !field?.trim());
  };

  // Manipulação do submit do formulário
  const onSubmit = async (data: any) => {
    const cleanIdentifier = (identifier: string): string => {
      return identifier.replace(/[\.\-\s\/]/g, '');
    };

    // Limpa o valor do identifier
    const cleanedData = {
      ...data,
      identifier: cleanIdentifier(data.identifier),
  };

    try {
      const response = await fetch('https://emprestimo-teste-back.onrender.com/person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
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

  function formatIdentifier(value: string): string {
    // Remove todos os caracteres que não são dígitos
    value = value.replace(/\D/g, '');

    switch (tipoDocumento) {
      case 'CNPJ':
        // Máscara para CNPJ (XX.XXX.XXX/XXXX-XX)
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
        break;

      default:
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        break;
    }

    return value;
  }

  function handleChangeIdentifier(event: any) {
    const input = event.target;
    input.value = formatIdentifier(input.value);
    setValue('identifier', input.value)
  }

  // Limpa o campo "Identificador" quando "tipoDocumento" é alterado
  useEffect(() => {
    setValue('identifier', ''); // Limpa o campo "identifier"
  }, [tipoDocumento, setValue]);

  const handleChangeEscolha = (event:any) => {
    setTipoDocumento(event.target.value);
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
              helperText={typeof errors?.name?.message === 'string' ? errors?.name?.message : ""}
            />
             <TextField
              fullWidth
              margin="normal"
              label="Tipo de Documento"
              variant="outlined"
              value={tipoDocumento}
              onChange={handleChangeEscolha}
              select
            >
              <MenuItem value="CPF">CPF</MenuItem>
              <MenuItem value="CNPJ">CNPJ</MenuItem>
              <MenuItem value="EU">Estudante Universitário</MenuItem>
              <MenuItem value="AP">Aposentado</MenuItem>
            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Identificador"
              variant="outlined"
              {...register('identifier')}
              onChange={handleChangeIdentifier}
              inputProps={{ 
                maxLength: 
                  tipoDocumento === 'CPF' ? 14 : 
                  tipoDocumento === 'CNPJ' ? 18 :
                  tipoDocumento === 'EU' ? 8 : 
                  tipoDocumento === 'AP' ? 10 : 
                  undefined
              }}
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
