import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { QueryFailedError } from "typeorm";
import { Request, Response } from "express";

@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.UNPROCESSABLE_ENTITY;
    const error = {
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    };

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json(error);
  }
}
