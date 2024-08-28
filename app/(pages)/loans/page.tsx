'use client';

import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box } from '@mui/material';

import { LoanProps } from '../../types';
import { formatIdentifier, formatToBRL } from '@/app/utils';

export default function Loans() {
  const [loans, setLoans] = useState<LoanProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Estado para controlar o carregamento

  useEffect(() => {
    // Buscar todos os empréstimos no backend
    async function fetchLoans() {
      setLoading(true); // Inicia o carregamento
      try {
        const response = await fetch('https://emprestimo-teste-back.onrender.com/loans');
        if (!response.ok) throw new Error('Erro ao buscar empréstimos');
        const data = await response.json();
        setLoans(data);
      } catch (error) {
        console.error('Erro ao buscar empréstimos:', error);
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    }

    fetchLoans();
  }, []);

  const handleStatusName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'paid':
        return 'Pago';
      default:
        return 'Desconhecido';
    }
  }

  const handlePayLoan = async (loanId: string) => {
    // Realizar pagamento de um empréstimo específico
    const response = await fetch(`https://emprestimo-teste-back.onrender.com/loans/${loanId}/pay`, {
      method: 'POST'
    });

    if (response.ok) {
      alert('Pagamento realizado com sucesso!');
      // Atualizar lista de empréstimos
      setLoans(loans.map(loan => loan.id === loanId ? { ...loan, status: 'paid' } : loan));
    } else {
      alert('Erro ao realizar pagamento.');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Typography variant="h4" component="h1" gutterBottom>
        Empréstimos
      </Typography>
      {loading ? (
        <Box my={2} >
          <CircularProgress size={120}/>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ maxWidth: '100%', minHeight: '20rem' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Identificador</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Parcelas</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.person.name}</TableCell>
                  <TableCell>{formatIdentifier(loan.person.identifier, loan.person.identifierType)}</TableCell>
                  <TableCell>{formatToBRL(loan.amount)}</TableCell>
                  <TableCell>{loan.numberOfInstallments}</TableCell>
                  <TableCell>{handleStatusName(loan.status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => handlePayLoan(loan.id)}
                      disabled={loan.status === 'paid'}
                    >
                      Pagar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </main>
  );
}
