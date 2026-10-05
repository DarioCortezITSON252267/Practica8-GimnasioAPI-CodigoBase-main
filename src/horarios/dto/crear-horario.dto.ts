import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CrearHorarioDto {
  // El identificador de la clase: entero, no texto. Esta es la linea
  // que cierra el hueco de la practica anterior, donde claseId: "uno"
  // respondia 201.
  @IsInt()
  claseId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dia: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5)
  horaInicio: string;

  @IsInt()
  @Min(1)
  cupoMaximo: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  entrenador: string;
}
