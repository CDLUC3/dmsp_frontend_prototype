// utils/routes.ts
import {stringify} from 'querystring';

// Define query param value types
type QueryParamValue = string | number | boolean | string[] | number[] | undefined;

// Define your routes with flat keys
const routes = {
  // Home route
  'app.home': '/',
  "app.login": '/login',

  // Project routes
  'projects.index': '/projects',
  'projects.show': '/projects/:projectId',
  'projects.create': '/projects/create',
  'projects.upload': '/projects/:projectId/upload',
  'projects.funder.index': '/projects/:projectId/funder',
  'projects.funder.show': '/projects/:projectId/funder/:projectFunderId',
  'projects.funder.search': '/projects/:projectId/funder/search',
  'projects.members.index': '/projects/:projectId/members',
  'projects.members.edit': '/projects/:projectId/members/edit',
  'projects.members.search': '/projects/:projectId/members/search',
  'projects.funding.index': '/projects/:projectId/project-funding',

  // DMP (Data Management Plan) routes
  'projects.dmp.index': '/projects/:projectId/dmp',
  'projects.dmp.show': '/projects/:projectId/dmp/:dmpId',
  'projects.dmp.download': '/projects/:projectId/dmp/:dmpId/download',
  'projects.dmp.funder': '/projects/:projectId/dmp/:dmpId/funder',
  'projects.dmp.members': '/projects/:projectId/dmp/:dmpId/members',
  'projects.dmp.question': '/projects/:projectId/dmp/:dmpId/q',
  'projects.dmp.research-outputs': '/projects/:projectId/dmp/:dmpId/research-outputs',
  'projects.dmp.section': '/projects/:projectId/dmp/:dmpId/s/:sectionId',
  'projects.dmp.create': '/projects/:projectId/dmp/create',
  'projects.dmp.feedback': '/projects/:projectId/dmp/:dmpId/access',

  // Template
  'template.index': '/template',
  'template.show': '/template/:templateId',
  'template.access': '/template/:templateId/access',
  'template.history': '/template/:templateId/history',
  'template.q': '/template/:templateId/q',
  'template.q.slug': '/template/:templateId/q/:q_slug',
  'template.q.new': '/template/:templateId/q/new',
  'template.section': '/template/:templateId/section',
  'template.section.slug': '/template/:templateId/section/:section_slug',
  'template.section.create': '/template/:templateId/section/create',
  'template.section.new': '/template/:templateId/section/new',
  'template.create': '/template/create',
  'template.edit': '/template/:templateId/edit',


  // Help pages
  'help.dmp.download': '/help/dmp/download',
} as const;

/**
 * Generate a URL path for a named route with parameters and query string
 *
 * @param name - Dot notation route name (e.g. 'projects.show')
 * @param params - Object containing route parameters (optional)
 * @param query - Object containing query parameters (optional)
 * @param locale - Optional locale override
 * @returns Generated URL path
 */
export function routePath(
  name: keyof typeof routes,
  params: Record<string, string | number> = {},
  query: Record<string, QueryParamValue> = {},
  locale: string = 'en-US'  // Default locale
): string {
  // Get the path pattern
  const path_pattern = routes[name];
  if (!path_pattern) {
    throw new Error(`Route not found: ${name}`);
  }

  // Replace parameters in the path
  let path = path_pattern;
  const paramNames = path.match(/:[a-zA-Z_]+/g) || [];

  for (const param of paramNames) {
    const paramName = param.substring(1); // Remove the leading colon
    if (params[paramName] === undefined) {
      throw new Error(`Missing required parameter: ${paramName} for route ${name}`);
    }
    // Use a template string to create a new string instead of replace
    path = path.split(param).join(String(params[paramName])) as typeof path;
  }

  // Add query string if query params are provided
  if (Object.keys(query).length > 0) {
    // Filter out undefined values
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined)
    );

    // Add query string if there are any params left
    if (Object.keys(filteredQuery).length > 0) {
      path += `?${stringify(filteredQuery)}`;
    }
  }

  // Special case for root path
  if (path === '/') {
    return `/${locale}`;
  }

  // Add locale prefix
  return `/${locale}${path}`;
}

// Type to get all available route names for better IDE support
export type RouteName = keyof typeof routes;

export { routes };
