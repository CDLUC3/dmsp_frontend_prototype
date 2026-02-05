// __mocks__/guidanceSourcesForPlanMock.ts

const guidanceSourcesForPlanMock = [
  {
    __typename: "GuidanceSource",
    id: "bestPractice",
    type: "BEST_PRACTICE",
    label: "DMP Tool",
    shortName: "DMP Tool",
    orgURI: "bestPractice",
    hasGuidance: true,
    items: [
      {
        __typename: "GuidanceItem",
        id: 1,
        title: "Storage & security",
        guidanceText: "<ul><li>Investigators carrying out research involving human participants should request consent to preserve and share the data. Do not just ask for permission to use the data in your study or make unnecessary promises to delete it at the end.</li><li>Consider how you will protect the identity of participants, e.g., via anonymization or using managed access procedures.</li><li>Ethical issues may affect how you store and transfer data, who can see/use it, and how long it is kept. You should demonstrate that you are aware of this and have planned accordingly.</li><li>See <a href=\"http://www.icpsr.umich.edu/icpsrweb/content/datamanagement/confidentiality/index.html\">ICPSR approach to confidentiality</a>&nbsp;and Health Insurance Portability and Accountability Act&nbsp;<a href=\"https://privacyruleandresearch.nih.gov/\">(HIPAA) regulations for health research</a>.</li><li>If you are collecting Traditional Knowledge as part of the project it is advisable to apply <a title=\"TK Notices\" href=\"https://www.localcontexts.org/\" target=\"_blank\" rel=\"noopener\">TK Notices</a> and engage with communities around the application of Labels to support ongoing connection to inform future data management.&nbsp;</li><li>If you are generating data derived from Indigenous lands and/or waters, it is advisable to use&nbsp;<a title=\"BC Notice\" href=\"https://www.localcontexts.org/\" target=\"_blank\" rel=\"noopener\">B</a><a title=\"BC Notices\" href=\"https://www.localcontexts.org/\">C Notices</a> and engage with communities around the application of Labels to support ongoing connection to inform future data management.</li></ul>"
      },
      {
        __typename: "GuidanceItem",
        id: 3,
        title: "Data Collection",
        guidanceText: "<ul><li>Consider whether there are any existing procedures that you can base your approach on. If your group/department has local guidelines that you work to, point to them here.</li><li>List any other relevant funder, institutional, departmental, or group policies on data management, data sharing, and data security.</li></ul>"
      }
    ]
  },
  {
    __typename: "GuidanceSource",
    id: "affiliation-https://ror.org/01cwqze88",
    type: "USER_SELECTED",
    label: "National Institutes of Health (nih.gov)",
    shortName: "NIH",
    orgURI: "https://ror.org/01cwqze88",
    hasGuidance: true,
    items: [
      {
        __typename: "GuidanceItem",
        id: 1,
        title: "Storage & security",
        guidanceText: "<p>This is NIH's Storage &amp; Security guidance</p>"
      },
      {
        __typename: "GuidanceItem",
        id: 3,
        title: "Data Collection",
        guidanceText: "<p>This is NIH's Data Collection guidance</p>"
      }
    ]
  },
  {
    __typename: "GuidanceSource",
    id: "affiliation-https://ror.org/021nxhr62",
    type: "TEMPLATE_OWNER",
    label: "National Science Foundation (nsf.gov)",
    shortName: "NSF",
    orgURI: "https://ror.org/021nxhr62",
    hasGuidance: true,
    items: [
      {
        __typename: "GuidanceItem",
        id: null,
        title: "National Science Foundation (nsf.gov)",
        guidanceText: "<p>my question guidance</p>"
      },
      {
        __typename: "GuidanceItem",
        id: 1,
        title: "Storage & security",
        guidanceText: "<p>This is NSF's Storage &amp; Security guidance</p>"
      },
      {
        __typename: "GuidanceItem",
        id: 3,
        title: "Data Collection",
        guidanceText: "<p>This is NSF's Data Collection guidance</p>"
      }
    ]
  },
  {
    __typename: "GuidanceSource",
    id: "affiliation-https://ror.org/03yrm5c26",
    type: "USER_SELECTED",
    label: "California Digital Library (cdlib.org)",
    shortName: "CDL",
    orgURI: "https://ror.org/03yrm5c26",
    hasGuidance: true,
    items: [
      {
        __typename: "GuidanceItem",
        id: 1,
        title: "Storage & security",
        guidanceText: "<ul><li>Investigators carrying out research involving human participants should request consent to preserve and share the data. Do not just ask for permission to use the data in your study or make unnecessary promises to delete it at the end.</li><li>Consider how you will protect the identity of participants, e.g., via anonymization or using managed access procedures.</li><li>Ethical issues may affect how you store and transfer data, who can see/use it, and how long it is kept. You should demonstrate that you are aware of this and have planned accordingly.</li><li>See <a href=\"http://www.icpsr.umich.edu/icpsrweb/content/datamanagement/confidentiality/index.html\">ICPSR approach to confidentiality</a>&nbsp;and Health Insurance Portability and Accountability Act&nbsp;<a href=\"https://privacyruleandresearch.nih.gov/\">(HIPAA) regulations for health research</a>.</li><li>If you are collecting Traditional Knowledge as part of the project it is advisable to apply <a title=\"TK Notices\" href=\"https://www.localcontexts.org/\" target=\"_blank\" rel=\"noopener\">TK Notices</a> and engage with communities around the application of Labels to support ongoing connection to inform future data management.&nbsp;</li><li>If you are generating data derived from Indigenous lands and/or waters, it is advisable to use&nbsp;<a title=\"BC Notice\" href=\"https://www.localcontexts.org/\" target=\"_blank\" rel=\"noopener\">B</a><a title=\"BC Notices\" href=\"https://www.localcontexts.org/\">C Notices</a> and engage with communities around the application of Labels to support ongoing connection to inform future data management.</li></ul>\n\n<p>This is the CDL guidance for Storage &amp; Security from Guidance Group \"Data Sharing\"</p>"
      },
      {
        __typename: "GuidanceItem",
        id: 3,
        title: "Data Collection",
        guidanceText: "<ul><li>Consider whether there are any existing procedures that you can base your approach on. If your group/department has local guidelines that you work to, point to them here.</li><li>List any other relevant funder, institutional, departmental, or group policies on data management, data sharing, and data security.</li></ul>\n\n<p>This is the CDL guidance for Data Collection for the guidance group \"Data Sharing\"</p>"
      }
    ]
  }
];

export default guidanceSourcesForPlanMock;