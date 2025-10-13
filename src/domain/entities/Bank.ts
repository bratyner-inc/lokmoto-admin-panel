/**
 * Bank Entity
 * Domain layer - Entidade de banco brasileiro
 */

export interface Bank {
  id: string;
  code: string;
  name: string;
  createdAt: Date;
}

