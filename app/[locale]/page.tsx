
import { Link } from '@/i18n/routing';
import {
  LayoutContainer,
  ContentContainer
} from '@/components/Container';

export default async function Home() {


  return (
    <LayoutContainer>
      <ContentContainer>
        <h1> Dashboards</ h1>
        <ul>
          <li><Link href="/template">Organization Templates</Link></li>
          <li><Link href="/account/profile">User Profile</Link></li>
          <li><Link href="/template/1/history">Template History</Link></li>
        </ul>
      </ContentContainer>
    </LayoutContainer>
  )
}