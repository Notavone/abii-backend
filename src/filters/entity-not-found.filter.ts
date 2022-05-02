import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { EntityNotFoundError } from "typeorm";
import { Request, Response } from "express";

@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
  catch(exception: EntityNotFoundError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.UNPROCESSABLE_ENTITY;
    const message = "Le serveur à rencontré un problème en essayant de trouver une entité";
    const error = {
      status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(error);
  }
}
