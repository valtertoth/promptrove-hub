// Validação de CPF
export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;
  if (digito1 !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;
  if (digito2 !== parseInt(cpf.charAt(10))) return false;

  return true;
}

// Validação de CNPJ
export function validarCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj.charAt(i)) * pesos1[i];
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  if (digito1 !== parseInt(cnpj.charAt(12))) return false;

  // Validação do segundo dígito verificador
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj.charAt(i)) * pesos2[i];
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  if (digito2 !== parseInt(cnpj.charAt(13))) return false;

  return true;
}

// Formatar CPF: 000.000.000-00
export function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length > 11) cpf = cpf.substring(0, 11);
  
  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

// Formatar CNPJ: 00.000.000/0000-00
export function formatarCNPJ(cnpj: string): string {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length > 14) cnpj = cnpj.substring(0, 14);
  
  return cnpj
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// Validar documento (CPF ou CNPJ baseado no tipo)
export function validarDocumento(documento: string, tipo: 'cpf' | 'cnpj'): boolean {
  if (tipo === 'cpf') {
    return validarCPF(documento);
  }
  return validarCNPJ(documento);
}

// Formatar documento baseado no tipo
export function formatarDocumento(documento: string, tipo: 'cpf' | 'cnpj'): string {
  if (tipo === 'cpf') {
    return formatarCPF(documento);
  }
  return formatarCNPJ(documento);
}
