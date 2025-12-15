import { OpenAPIObject } from '@nestjs/swagger/dist/interfaces';

const pathMethods = ['get', 'post', 'put', 'patch', 'delete'] as const;

const generalResponses = {
  400: { description: 'Bad request' },
  404: { description: 'Not found' },
  500: { description: 'Server error' },
  503: { description: 'Service unavailable' },
};

const authResponses = {
  401: { description: 'Not authenticated' },
  403: { description: 'Access denied' },
};

const deleteResponses = {
  204: { description: 'No content' },
};

export class SwaggerHelper {
  static setDefaultResponses(document: OpenAPIObject): void {
    for (const key of Object.keys(document.paths)) {
      for (const method of pathMethods) {
        const route = document.paths[key]?.[method];
        if (route) {
          Object.assign(route.responses, generalResponses);

          if (route.security) {
            Object.assign(route.responses, authResponses);
          }

          if (method === 'delete') {
            delete route.responses[200];
            Object.assign(route.responses, deleteResponses);
          }
        }
      }
    }
  }
}

