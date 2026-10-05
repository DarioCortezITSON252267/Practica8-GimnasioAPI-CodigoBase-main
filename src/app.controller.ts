import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Publico } from './auth/decoradores/publico.decorator';

// @Publico() sobre la clase: aplica a todos sus metodos.
@Publico()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {} // Nest arma AppService y lo entrega ya listo aquí

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
