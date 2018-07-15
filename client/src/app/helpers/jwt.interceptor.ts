import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let access_token = localStorage.getItem('access_token');

        request = request.clone({
          setHeaders: {
            Authorization: access_token ? `Bearer ${access_token}` : '',
            Localize: localStorage.getItem('Localize') || 'en'
          }
        });

        return next.handle(request);
    }
}
