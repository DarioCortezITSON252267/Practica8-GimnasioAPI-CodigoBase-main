// Traduce los errores de dominio a HTTP en UN solo lugar. Sustituye al
// try/catch que habia en el controller.
// Ojo con el nombre: no es el Filter de Java (ese corre primero). Este
// corre AL FINAL y solo si algo lanzo un error. En Spring es
// @ControllerAdvice.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  CupoLlenoError,
  ErrorDeDominio,
  HorarioNoEncontradoError,
  InscripcionDuplicadaError,
  MiembroNoEncontradoError,
} from '../../inscripciones/dominio/errores';

// Atrapa ErrorDeDominio y TODAS sus hijas. Los demas errores (un 400 del
// ValidationPipe, un NotFoundException) siguen su camino normal.
@Catch(ErrorDeDominio)
export class DominioExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Dominio');

  private codigoPara(error: ErrorDeDominio): number {
    // Lo que no existe -> 404
    if (
      error instanceof HorarioNoEncontradoError ||
      error instanceof MiembroNoEncontradoError
    ) {
      return HttpStatus.NOT_FOUND;
    }
    // Las reglas del gimnasio -> 409 (la peticion esta bien, pero choca
    // con el estado actual)
    if (
      error instanceof CupoLlenoError ||
      error instanceof InscripcionDuplicadaError
    ) {
      return HttpStatus.CONFLICT;
    }
    // Un error de dominio que olvidamos mapear -> 500, para que se note.
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  catch(error: ErrorDeDominio, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<{ url: string; method: string }>();
    const estado = this.codigoPara(error);

    this.logger.warn(
      `${req.method} ${req.url} -> ${estado} ${error.constructor.name}`,
    );

    // Todos los errores de dominio responden con la MISMA forma.
    res.status(estado).json({
      statusCode: estado,
      error: error.constructor.name,
      message: error.message,
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}
