import { TemplateItemProps, } from '@/app/types';

export const filterTemplates = (
  templates: TemplateItemProps[],
  term: string
): TemplateItemProps[] =>
  templates.filter(template =>
    [template.title, template.funder, template.description].some(field =>
      field?.toLowerCase().includes(term.toLowerCase())
    )
  );

