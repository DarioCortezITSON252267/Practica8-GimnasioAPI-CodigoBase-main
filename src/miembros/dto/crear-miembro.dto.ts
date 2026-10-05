import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

// Las membresias que el gimnasio reconoce. Se exporta para que la
// lista viva en un solo lugar.
export const MEMBRESIAS = ['basica', 'plus', 'premium'] as const;

export class CrearMiembroDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;

  // No basta con que sea texto: tiene que parecer un correo.
  @IsEmail()
  @MaxLength(160)
  correo: string;

  // Y la membresia solo puede ser una de las tres.
  @IsIn(MEMBRESIAS)
  membresia: string;
}
