import type { FieldError } from '../types/spot.js';

// Erreur "métier" avec un code HTTP : on la lance (throw) n'importe où,
// et le middleware errorHandler la transforme en réponse JSON.
export class HttpError extends Error {
  status: number;
  details?: FieldError[];

  constructor(status: number, message: string, details?: FieldError[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
