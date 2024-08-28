

export function formatToBRL(value: number): string {
  return (value / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatIdentifier(identifier: string, type: string) {
  if (type === 'PF') {
    // Formatar CPF: xxx.xxx.xxx-xx
    return identifier.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (type === 'PJ') {
    // Formatar CNPJ: xx.xxx.xxx/xxxx-xx
    return identifier.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return identifier;
};

