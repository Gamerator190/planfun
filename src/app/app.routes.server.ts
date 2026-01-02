import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'reset-password/:token',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'event/:id/:time/seats',
    renderMode: RenderMode.Server
  },
  {
    path: 'checkout/:id/:time/:seats',
    renderMode: RenderMode.Server
  },
  {
    path: 'e-ticket/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
