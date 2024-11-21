import { Router } from 'express';
import { ALAppNavigation } from '@cbto/nodepackages.utils/models/app-navigation.alportal.model';
import { HttpStatusCode } from '@angular/common/http';

export function serve(server: Router) {
   server.get('/app-navigation', (req, res) => {
      const apps: ALAppNavigation[] = [
         {
            name: 'AL Portal',
            baseUrl: process.env['App_AlPortalBaseUrl'] ?? ''
         },
         {
            name: 'Flash card',
            baseUrl: process.env['App_FlashcardBaseUrl'] ?? ''
         },
         {
            name: 'Whiteboard',
            baseUrl: process.env['App_WhiteBoardBaseUrl'] ?? ''
         }
      ];
      
      res.json(apps.filter(x => x.baseUrl))
         .status(HttpStatusCode.Ok)
         .end();
   });
}