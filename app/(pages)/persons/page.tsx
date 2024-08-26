'use client';

import { useState, useEffect } from 'react';
import { PersonProps } from '../../types';
import { Button, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Snackbar, Alert, Modal, TextField } from '@mui/material';
import { formatIdentifier, formatToBRL } from '../../utils';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanSchema } from '../../schemas/loan';

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
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  console.log('success:', success)
  console.log('error:', error)

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
      } catch (error) {
        console.error('Erro ao buscar pessoas:', error);
      } finally {
        setLoading(false);
      }
    }

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
    setError(null);
    setSuccess(null);
    setSnackbarOpen(false);
  };

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loanSchema),
  });

  const [modalLoading, setModalLoading] = useState<boolean>(false);

  const onSubmit = async (data: any) => {
    if (!selectedPersonId || selectedPersonMinLoanAmount === null || selectedPersonMaxLoanAmount === null) return;

    const { amount, numberOfInstallments } = data;
    const amountNumber = Number(amount);
    const installmentsNumber = Number(numberOfInstallments);

    if (amountNumber < selectedPersonMinLoanAmount) {
      setError(`O valor do empréstimo é inferior ao mínimo permitido: ${formatToBRL(selectedPersonMinLoanAmount)}`);
      setSuccess(null);
      setSnackbarOpen(true);
      return;
    }

    if (amountNumber > selectedPersonMaxLoanAmount) {
      setError(`O valor do empréstimo excede o máximo permitido: ${formatToBRL(selectedPersonMaxLoanAmount)}`);
      setSuccess(null);
      setSnackbarOpen(true);
      return;
    }

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

      if (response.ok) {
        setError(null);
        setSuccess(`Empréstimo cadastrado com sucesso!`);
      } else {
        const errorData = await response.json();
        setError(`${errorData.message}`);
        setSuccess(null);
      }
    } catch (error) {
      console.error('Erro ao cadastrar empréstimo:', error);
      setError('Erro ao cadastrar empréstimo.');
      setSuccess(null);
    } finally {
      setModalLoading(false);
      setSnackbarOpen(true);
      handleCloseModal();
    }
  };

  const handleSnackbarClose = () => {
    setError(null);
    setSuccess(null);
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
                <TableRow key={person.id}>
                  <TableCell>{person.name}</TableCell>
                  <TableCell>
                    {formatIdentifier(person.identifier, person.identifierType)}
                  </TableCell>
                  <TableCell>{new Date(person.birthDate).toLocaleDateString()}</TableCell>
                  <TableCell>{person.identifierType}</TableCell>
                  <TableCell>{formatToBRL(person.minLoanAmount)}</TableCell>
                  <TableCell>{formatToBRL(person.maxLoanAmount)}</TableCell>
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
              type="number"
              {...register('amount')}
              error={!!errors?.amount}
              helperText={typeof errors?.amount?.message === 'string' ? errors.amount.message : ''}
              sx={{ my: 2 }}
            />
  
            <TextField
              fullWidth
              label="Número de Parcelas"
              type="number"
              {...register('numberOfInstallments')}
              error={!!errors?.numberOfInstallments}
              helperText={typeof errors?.numberOfInstallments?.message === 'string' ? errors.numberOfInstallments.message : ''}
              sx={{ my: 2 }}
            />
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button onClick={handleCloseModal} variant="outlined" sx={{ mr: 1 }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={modalLoading}>
                {modalLoading ? 'Enviando...' : 'Confirmar'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar para mensagens gerais */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        {error == 'string' ? (
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        ) : success == 'string' ? (
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        ) : <></>}
      </Snackbar>
    </main>
  );
}
