// utils/routes.ts

// Define query param value types
type QueryParamValue =
  string
  | number
  | boolean
  | string[]
  | number[]
  | undefined;

export const supportedLocales = ['en-US', 'pt-BR'] as const;
export type SupportedLocale = typeof supportedLocales[number];

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
  'projects.members.edit': '/projects/:projectId/members/:memberId/edit',
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
  'projects.dmp.feedback': '/projects/:projectId/dmp/:dmpId/feedback',
  'projects.dmp.feedback.invite': '/projects/:projectId/dmp/:dmpId/feedback/invite',

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

  // account/profile
  'account.profile': '/account/profile',
  'account.password': '/account/update-password',
  'account.connections': '/account/connections',
  'account.notifications': '/account/notifications',


  // Help pages
  'help.dmp.download': '/help/dmp/download',


} as const;

type RoutesMap = typeof routes;

/**
 * Helper type for documentation purposes
 * Combines route names with their path patterns for better IDE hover documentation
 * @example 'projects.show ➜ /projects/:projectId'
 */
// eslint-disable-line @typescript-eslint/no-unused-vars
type RouteNameWithPath = {// eslint-disable-line @typescript-eslint/no-unused-vars
  [K in keyof RoutesMap]: `${K} ➜ ${RoutesMap[K]}`
}[keyof RoutesMap];

// Only used for documentation - not directly referenced in code
// This prevents unused type lint errors
declare const _ROUTE_DOCS: RouteNameWithPath; // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars


/**
 * Generate a URL path for a named route with parameters and query string.
 *
 * Route mappings are available as:
 * @example 'projects.show ➜ /projects/:projectId'
 * @see {routes} for all available route definitions
 * @see {RouteNameWithPath}
 *
 * @param name - Route identifier (`RouteName`) - e.g., 'projects.show'
 * @param params - Route parameters (optional)
 * @param query - Query parameters (optional)
 * @param locale - Optional locale (default: 'en-US')
 * @returns Fully constructed URL path
 */
export function routePath(
  name: keyof RoutesMap,
  params: Record<string, string | number> = {},
  query: Record<string, QueryParamValue> = {},
  locale?: string
): string {

  // Default to 'en-US' if no locale is provided
  if (!locale) {
    locale = 'en-US'; // Always set a default value
  }

  // Automatically detect and validate locale from URL if not provided or invalid
  if (!supportedLocales.includes(locale as SupportedLocale) && typeof window !== 'undefined') {
    // Only try to detect from URL on client-side, because NextJs also has server-side rendering
    const segments = window.location.pathname.split('/');
    const potentialLocale = segments[1];
    if (supportedLocales.includes(potentialLocale as SupportedLocale)) {
      locale = potentialLocale;
    } else {
      locale = 'en-US'; // explicit fallback
    }
  }

  // Get the path pattern
  const path_pattern = routes[name];

  if (!path_pattern) {
    throw new Error(`Route not found: ${name}`);
  }

  let path = path_pattern.replace(/:([a-zA-Z_]+)/g, (_, paramName) => {
    if (!(paramName in params)) {
      throw new Error(`Missing required parameter: ${paramName} for route ${name}`);
    }
    return encodeURIComponent(String(params[paramName]));
  });

  // Handle query params
  const queryParams: string[] = [];

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      value.forEach((v) => {
        queryParams.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(String(v))}`);
      });
    } else {
      queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  const queryString = queryParams.join('&');
  if (queryString) {
    path += `?${queryString}`;
  }

  if (path === '/') {
    return `/${locale}`;
  }

  return `/${locale}${path}`;
}

// Type to get all available route names for better IDE support
export type RouteName = keyof typeof routes;
export {routes};
