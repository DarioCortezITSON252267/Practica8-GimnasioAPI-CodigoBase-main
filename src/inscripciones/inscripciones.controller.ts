import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { InscripcionesService } from './inscripciones.service';
import { CrearInscripcionDto } from './dto/crear-inscripcion.dto';
import { aInscripcionDto } from './dto/inscripcion-respuesta.dto';
import { UsuarioActual } from '../auth/decoradores/usuario-actual.decorator';
import { Rol, type PayloadJwt } from '../auth/dominio/usuario';

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private readonly servicio: InscripcionesService) {}

  @Get()
  async listar() {
    const lista = await this.servicio.listar();
    return lista.map(aInscripcionDto);
  }

  @Get(':id')
  async buscar(@Param('id') id: string) {
    const inscripcion = await this.servicio.buscar(Number(id));
    if (!inscripcion) {
      throw new NotFoundException(`No existe la inscripcion ${id}`);
    }
    return aInscripcionDto(inscripcion);
  }

  @Post()
  @HttpCode(201)
  async crear(
    @Body() dto: CrearInscripcionDto,
    @UsuarioActual() usuario: PayloadJwt, // quien viene en el token
    @Res({ passthrough: true }) res: Response,
  ) {
    // Quien eres lo dice el TOKEN, no el cuerpo. Un miembro solo puede
    // inscribirse a si mismo; si intenta inscribir a otro, 403: se quien
    // eres y aun asi no puedes. El entrenador y el admin si pueden.
    if (usuario.rol === Rol.miembro && usuario.miembroId !== dto.miembroId) {
      throw new ForbiddenException('Solo puedes inscribirte a ti mismo');
    }

    // Ya no hay validacion a mano: la hace ValidationPipe en la
    // frontera. Y ya no hay try/catch: los errores de dominio los
    // traduce DominioExcepcionFilter. Este metodo volvio a ser lo que
    // debia: pedir, poner la cabecera y devolver.
    const inscripcion = await this.servicio.crear(dto);
    res.setHeader('Location', `/inscripciones/${inscripcion.id}`);
    return aInscripcionDto(inscripcion);
  }

  @Delete(':id')
  async cancelar(@Param('id') id: string) {
    const cancelada = await this.servicio.cancelar(Number(id));
    if (!cancelada) {
      throw new NotFoundException(`No existe la inscripcion ${id}`);
    }
    return aInscripcionDto(cancelada);
  }
}
