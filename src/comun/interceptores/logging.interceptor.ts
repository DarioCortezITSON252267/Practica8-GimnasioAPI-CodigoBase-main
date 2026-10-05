// Un interceptor. Envuelve al controller: ve la peticion ANTES y la
// respuesta DESPUES. Es el unico nombre que coincide con Spring
// (HandlerInterceptor).
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(
    contexto: ExecutionContext,
    siguiente: CallHandler,
  ): Observable<unknown> {
    // ANTES del controller: tomamos la peticion y la hora de inicio.
    const req = contexto
      .switchToHttp()
      .getRequest<{ method: string; url: string }>();
    const inicio = Date.now();

    // siguiente.handle() ejecuta el controller. Lo que va dentro del
    // .pipe() corre DESPUES, cuando el controller ya respondio.
    return siguiente.handle().pipe(
      // tap solo corre si el controller respondio bien. Si lanzo un
      // error (el 409), se salta directo al filtro y aqui no pasa nada.
      tap(() => {
        const ms = Date.now() - inicio;
        this.logger.log(`${req.method} ${req.url} - ${ms}ms`);
      }),
    );
  }
}
