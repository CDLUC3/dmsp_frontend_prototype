// __tests__/utils/routes.test.ts
import {RouteName, routePath, routes} from '@/utils/routes';

describe('routePath utility', () => {
  // Basic route generation
  describe('basic route generation', () => {
    it('should generate basic routes correctly', () => {
      expect(routePath('app.home')).toBe('/en-US');
      expect(routePath('app.login')).toBe('/en-US/login');
      expect(routePath('projects.index')).toBe('/en-US/projects');
    });

    it('should handle routes with parameters', () => {
      expect(routePath('projects.show', { projectId: '123' }))
        .toBe('/en-US/projects/123');

      expect(routePath('projects.dmp.show', { projectId: '123', dmpId: '456' }))
        .toBe('/en-US/projects/123/dmp/456');

      expect(routePath('projects.dmp.section', { projectId: '123', dmpId: '456', sectionId: '789' }))
        .toBe('/en-US/projects/123/dmp/456/s/789');
    });

    it('should generate routes with query parameters', () => {
      expect(routePath('projects.index', {}, { sort: 'name' }))
        .toBe('/en-US/projects?sort=name');

      expect(routePath('projects.index', {}, { page: 2, limit: 10 }))
        .toBe('/en-US/projects?page=2&limit=10');

      expect(routePath('projects.members.search', { projectId: '123' }, { role: 'PI', status: 'active' }))
        .toBe('/en-US/projects/123/members/search?role=PI&status=active');
    });

    it('should handle different locales', () => {
      expect(routePath('projects.show', { projectId: '123' }, {}, 'pt-BR'))
        .toBe('/pt-BR/projects/123');

      expect(routePath('projects.dmp.show', { projectId: '123', dmpId: '456' }, {}, 'pt-BR'))
        .toBe('/pt-BR/projects/123/dmp/456');
    });
  });

  // Parameter handling
  describe('parameter handling', () => {
    it('should throw error for missing parameters', () => {
      expect(() => routePath('projects.show')).toThrow('Missing required parameter: projectId');
      expect(() => routePath('projects.dmp.show', { projectId: '123' })).toThrow('Missing required parameter: dmpId');
    });

    it('should properly convert parameters to strings', () => {
      expect(routePath('projects.show', { projectId: 123 }))
        .toBe('/en-US/projects/123');
    });
  });

  // Query parameter handling
  describe('query parameter handling', () => {
    it('should filter out undefined query parameters', () => {
      expect(routePath('projects.index', {}, { sort: 'name', filter: undefined }))
        .toBe('/en-US/projects?sort=name');
    });

    it('should handle array query parameters', () => {
      expect(routePath('projects.index', {}, { published:true, filters: ['active', 'draft'] }))
        .toBe('/en-US/projects?published=true&filters[]=active&filters[]=draft');
    });

    it('should handle boolean query parameters', () => {
      expect(routePath('projects.index', {}, { active: true, draft: false }))
        .toBe('/en-US/projects?active=true&draft=false');
    });
  });

  // Error handling
  describe('error handling', () => {
    it('should throw error for non-existent routes', () => {
      expect(() => routePath('non.existent.route' as RouteName)).toThrow('Route not found');
    });
  });

  // Root path special case
  describe('root path handling', () => {
    it('should handle root path correctly', () => {
      expect(routePath('app.home')).toBe('/en-US');
      expect(routePath('app.home', {}, {}, 'pt-BR')).toBe('/pt-BR');
    });
  });

  // Template routes
  describe('template routes', () => {
    // Add tests for template routes once you've added them
    it('should generate template routes correctly', () => {
      // Assuming you've added template routes:
      if ('template.show' in routes) {
        expect(routePath('template.show' as RouteName, { templateId: '123' }))
          .toBe('/en-US/template/123');
      }
    });
  });
});
