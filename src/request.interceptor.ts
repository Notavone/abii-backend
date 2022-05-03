import {CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from '@nestjs/common';
import {Observable, tap} from 'rxjs';
import {Request, Response} from "express";

@Injectable()
export class RequestInterceptor implements NestInterceptor {
    private logger = new Logger(RequestInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();
        this.logger.log(`(${res.statusCode}) ${req.method} ${req.url}`);
        return next.handle();
    }
}
