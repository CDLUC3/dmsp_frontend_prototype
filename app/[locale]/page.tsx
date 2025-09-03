'use client'

import {ContentContainer, LayoutContainer} from '@/components/Container';
import PageLinkCard, { PageLinkSection } from '@/components/PageLinkCard';
import { routePath } from '@/utils/routes';

const Home = () => {
  const sections: PageLinkSection[] = [
    {
      title: "Create & Manage",
      description: "Create new templates and projects",
      items: [
        {
          title: "Template Management",
          description: "Create and manage templates (Must be Admin to access)",
          href: routePath('template.index')
        },
        {
          title: "Project Management",
          description: "Create and manage projects",
          href: routePath('projects.index')
        }
      ]
    },
    {
      title: "Account & Administration",
      description: "Manage your account and access admin features",
      items: [
        {
          title: "Account Settings",
          description: "View and manage your account",
          href: routePath('account.index')
        },
        {
          title: "Admin Overview",
          description: "Access administrative functions",
          href: routePath('admin.index')
        }
      ]
    }
  ];

  return (
    <LayoutContainer>
      <ContentContainer>
        <h1>Home Page</h1>
        <PageLinkCard sections={sections} />
      </ContentContainer>
    </LayoutContainer>
  )
}

export default Home;
