import { IsInt } from 'class-validator';

export class CrearInscripcionDto {
  @IsInt()
  horarioId: number;

  @IsInt()
  miembroId: number;
}
