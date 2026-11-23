import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import localeEsCl from '@angular/common/locales/es-CL';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

// Fechas y números con formato chileno ("23 de noviembre de 2026", "1.250").
registerLocaleData(localeEsCl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Los parámetros de la ruta (/temas/:id) llegan a la página como input().
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    // Solo lo usa la pantalla "Conexión con el BackEnd"; el resto de la aplicación trabaja con arreglos.
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'es-CL' },
  ],
};
