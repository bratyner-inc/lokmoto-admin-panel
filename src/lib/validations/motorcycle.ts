import { z } from 'zod';

// Regex para validação de placa no formato brasileiro (ABC-1234 ou ABC1D234)
const plateRegex = /^[A-Z]{3}-?\d{1}[A-Z0-9]{1}\d{2}$/;

// Regex para validação de RENAVAM (11 dígitos)
const renavamRegex = /^\d{11}$/;

// Regex para validação de Chassi (17 caracteres alfanuméricos, sem I, O, Q)
const chassisRegex = /^[A-HJ-NPR-Z0-9]{17}$/;

export const motorcycleFormSchema = z.object({
  // Identificação do veículo
  brand: z.string()
    .min(2, 'Marca deve ter pelo menos 2 caracteres')
    .max(50, 'Marca deve ter no máximo 50 caracteres')
    .trim(),
  
  model: z.string()
    .min(2, 'Modelo deve ter pelo menos 2 caracteres')
    .max(100, 'Modelo deve ter no máximo 100 caracteres')
    .trim(),
  
  version: z.string()
    .min(1, 'Versão é obrigatória')
    .max(50, 'Versão deve ter no máximo 50 caracteres')
    .trim(),
  
  year: z.number()
    .int('Ano deve ser um número inteiro')
    .min(1990, 'Ano deve ser maior ou igual a 1990')
    .max(new Date().getFullYear() + 1, `Ano não pode ser maior que ${new Date().getFullYear() + 1}`),
  
  // Documentação
  plate: z.string()
    .min(7, 'Placa deve ter pelo menos 7 caracteres')
    .max(8, 'Placa deve ter no máximo 8 caracteres')
    .toUpperCase()
    .regex(plateRegex, 'Placa inválida. Use o formato ABC-1234 ou ABC1D23')
    .transform(val => val.replace('-', '')), // Remove hífen para padronizar
  
  renavam: z.string()
    .length(11, 'RENAVAM deve ter exatamente 11 dígitos')
    .regex(renavamRegex, 'RENAVAM deve conter apenas números'),
  
  chassis: z.string()
    .length(17, 'Chassi deve ter exatamente 17 caracteres')
    .toUpperCase()
    .regex(chassisRegex, 'Chassi inválido. Deve ter 17 caracteres alfanuméricos (sem I, O, Q)'),
  
  // Características
  color: z.string()
    .min(3, 'Cor deve ter pelo menos 3 caracteres')
    .max(30, 'Cor deve ter no máximo 30 caracteres')
    .trim(),
  
  engineCapacity: z.number()
    .int('Cilindrada deve ser um número inteiro')
    .min(50, 'Cilindrada deve ser maior ou igual a 50cc')
    .max(2500, 'Cilindrada deve ser menor ou igual a 2500cc'),
  
  // Valor da diária
  dailyRate: z.number()
    .positive('Valor da diária deve ser maior que zero')
    .min(0.01, 'Valor da diária deve ser no mínimo R$ 0,01')
    .max(9999.99, 'Valor da diária deve ser no máximo R$ 9.999,99'),
  
  // Categoria (opcional)
  categoryId: z.string().uuid('ID de categoria inválido').optional().nullable(),
  
  // Disponibilidade
  isAvailable: z.boolean().default(true),
});

export type MotorcycleFormData = z.infer<typeof motorcycleFormSchema>;

// Schema para validação de período de disponibilidade
export const availabilityPeriodSchema = z.object({
  start: z.date({ required_error: 'Data de início é obrigatória' }),
  end: z.date({ required_error: 'Data de fim é obrigatória' }),
}).refine(
  (data) => data.end > data.start,
  {
    message: 'Data de fim deve ser posterior à data de início',
    path: ['end'],
  }
);

export type AvailabilityPeriod = z.infer<typeof availabilityPeriodSchema>;
