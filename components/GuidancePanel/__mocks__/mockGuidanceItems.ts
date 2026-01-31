import { GuidanceSourceType } from '@/generated/graphql';
import { GuidanceItemInterface } from '@/app/types';

const mockGuidanceItems: GuidanceItemInterface[] = [
  {
    type: GuidanceSourceType.BestPractice,
    orgURI: 'https://dmp.tool',
    orgName: 'DMP Tool',
    orgShortname: 'DMP Tool',
    items: [
      {
        id: 1212,
        title: 'Storage & security',
        guidanceText: '<ul><li>Best practice guidance for storage</li></ul>',
      },
      {
        id: 1220,
        title: 'Data Collection',
        guidanceText: '<ul><li>Best practice guidance for data collection</li></ul>',
      },
    ],
  },
  {
    type: GuidanceSourceType.UserAffiliation,
    orgURI: 'https://ror.org/03yrm5c26',
    orgName: 'California Digital Library',
    orgShortname: 'CDL',
    items: [
      {
        id: 1,
        title: 'Storage & security',
        guidanceText: '<p>This is guidance for storage &amp; security</p>',
      },
    ],
  },
];

export default mockGuidanceItems;