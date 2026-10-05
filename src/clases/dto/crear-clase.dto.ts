import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Era una interfaz. Ahora es una CLASE, y esa es toda la diferencia:
// una interfaz se borra al compilar, una clase sobrevive. Los
// decoradores viajan con ella hasta el .js, asi que ValidationPipe si
// tiene algo que leer en tiempo de ejecucion.
export class CrearClaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nombre: string;
}
