'use client'

import {ContentContainer, LayoutContainer} from '@/components/Container';
import {Link,} from "react-aria-components";

const Home = () => {
  return (
    <LayoutContainer>
      <ContentContainer>
        <h1>Home Page</h1>
        <ul>
          <li><Link href="/template">Create Template</Link>(Must be Admin to access)</li>
          <li><Link href="/projects">Create Project</Link></li>
          <li><Link href="/account/profile">Account Profile</Link></li>
        </ul>

      </ContentContainer>
    </LayoutContainer>
  )
}

export default Home;
