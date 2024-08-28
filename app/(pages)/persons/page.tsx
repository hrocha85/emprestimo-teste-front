'use client';

import { useState, useEffect } from 'react';
import { PersonProps } from '../../types';
import { Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Snackbar, Alert, Modal, TextField } from '@mui/material';
import { formatIdentifier, formatToBRL } from '../../utils/index';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanSchema } from '../../schemas/loan';
import InputMask from 'react-input-mask';



export default function Persons() {
  const [persons, setPersons] = useState<PersonProps[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(null);
  const [selectedPersonMinLoanAmount, setSelectedPersonMinLoanAmount] = useState<number | null>(null);
  const [selectedPersonMaxLoanAmount, setSelectedPersonMaxLoanAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [severity, setSeverity] = useState<'success' | 'error'>('success'); // Adicionando estado para controlar o tipo de alerta
  
  useEffect(() => {
    async function fetchPersons() {
      setLoading(true);
      try {
        const response = await fetch('https://emprestimo-teste-back.onrender.com/person');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        const data = await response.json();
        setPersons(data);
        setSeverity('success')
        setStatus('Dados carregados com sucesso!');
      } catch (error) {
        setSeverity('error')
        console.error('Erro ao buscar pessoas:', error);
        setStatus('Erro ao buscar dados');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    }
    
    setStatus('');
    fetchPersons();
  }, []);

  const handleOpenModal = (person: PersonProps) => {
    setSelectedPersonId(person.id);
    setSelectedPersonName(person.name);
    setSelectedPersonMinLoanAmount(person.minLoanAmount);
    setSelectedPersonMaxLoanAmount(person.maxLoanAmount);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPersonId(null);
    setSelectedPersonName(null);
    setSelectedPersonMinLoanAmount(null);
    setSelectedPersonMaxLoanAmount(null);
  };

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(loanSchema),
  });

  const watchedFields = watch(['amount', 'numberOfInstallments']);

  const isButtonDisabled = () => {
    return watchedFields.some(field => !field?.trim());
  };

  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const onSubmit = async (data: any) => {
    console.log(data, "data");
    const { amount, numberOfInstallments } = data;
    const amountNumber = Number(amount);
    const installmentsNumber = Number(numberOfInstallments);

    setModalLoading(true);
    try {
      const response = await fetch('https://emprestimo-teste-back.onrender.com/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personId: selectedPersonId,
          amount: amountNumber,
          numberOfInstallments: installmentsNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json(); 
        setStatus(errorData?.message?.toString() || 'Erro ao solicitar empréstimo');
        setSeverity('error'); // Define o tipo de alerta como erro
      } else {
        const data = await response.json();
        console.log('Sucesso:', data);
        setStatus('Empréstimo solicitado com sucesso');
        setSeverity('success'); // Define o tipo de alerta como sucesso
      }  
    } finally {
      setModalLoading(false);
      setSnackbarOpen(true);
      handleCloseModal();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
        <Typography variant='h4' component='h1' gutterBottom>Pessoas Cadastradas</Typography>
        <Link href='/register' passHref className='p-2 my-2'>
          <Button variant='contained'>
            Cadastrar nova pessoa
          </Button>
        </Link>
      </Box>

      {loading ? (
        <Box my={2}>
          <CircularProgress size={120}/>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxWidth: '100%', minHeight: '20rem' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Identificador</TableCell>
                <TableCell>Data de Nascimento</TableCell>
                <TableCell>Tipo de Identificador</TableCell>
                <TableCell>Valor Mínimo</TableCell>
                <TableCell>Valor Máximo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {persons.map((person) => (
                <TableRow key={person?.id}>
                  <TableCell>{person?.name}</TableCell>
                  <TableCell>
                    {formatIdentifier(person?.identifier, person?.identifierType)}
                  </TableCell>
                  <TableCell>{new Date(person?.birthDate).toLocaleDateString()}</TableCell>
                  <TableCell>{person?.identifierType}</TableCell>
                  <TableCell>{formatToBRL(person?.minLoanAmount)}</TableCell>
                  <TableCell>{formatToBRL(person?.maxLoanAmount)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenModal(person)}
                    >
                      Cadastrar Empréstimo
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal para cadastro de empréstimo */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: '10%', bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="h6" component="h2">
            Cadastrar Empréstimo para {selectedPersonName}
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            
              <TextField
                fullWidth
                label="Valor"
                type="text"
                {...register('amount', {
                  required: 'O valor é obrigatório',
                  validate: (value) => {
                    const numericValue = parseFloat(value.replace(/[^0-9,-]+/g, '').replace(',', '.'));
                    return numericValue >= 3000 || 'Não será possível realizar seu empréstimo';
                  },
                })}
                error={!!errors?.amount}
                helperText={typeof errors?.amount?.message === 'string' ? errors.amount.message : ''}
                sx={{ my: 2 }}
                InputProps={{
                  inputComponent: InputMask as any,
                  inputProps: {
                    mask: 'R$ 999.999.999,99',
                    maskChar: null,
                    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                      // Remove caracteres não numéricos e formata corretamente
                      const numericValue = parseFloat(event.target.value.replace(/[^0-9,-]+/g, '').replace(',', '.'));
                      setValue('amount', numericValue);
                    },
                  },
                }}
              />

              <TextField
              fullWidth
              label="Número de Parcelas"
              type="number"
              {...register('numberOfInstallments', {
                maxLength: 2, // Limita a entrada para dois caracteres
                validate: (value) => {
                  if (value > 24) return 'O valor máximo é 24'; // Validação customizada para o valor máximo
                  return true;
                }
              })}
              error={!!errors?.numberOfInstallments}
              helperText={typeof errors?.numberOfInstallments?.message === 'string' ? errors.numberOfInstallments.message : ''}
              sx={{ my: 2 }}
              inputProps={{ maxLength: 2, min: 1, max: 24 }} // Limita a entrada de caracteres e define o valor máximo
            />
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button onClick={handleCloseModal} variant="outlined" sx={{ mr: 1 }}>
                Cancelar
              </Button>
            <Button type="submit" variant="contained" color="primary" disabled={ modalLoading || isButtonDisabled() }>
                {modalLoading ? 'Enviando...' : 'Confirmar'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose} // Chamada direta da função
      >
        <Alert onClose={handleSnackbarClose} severity={severity} sx={{ width: '100%' }}>
          {status}
        </Alert>   
      </Snackbar>
    </main>
  );
}
