// __mocks__/meMock.ts

const meMock = {
  __typename: "User",
  id: 1,
  givenName: "Super",
  surName: "Admin",
  languageId: "en-US",
  role: "SUPERADMIN",
  emails: [
    {
      __typename: "UserEmail",
      id: 1,
      email: "super@example.com",
      isPrimary: true,
      isConfirmed: true
    }
  ],
  errors: {
    __typename: "UserErrors",
    general: null,
    email: null,
    password: null,
    role: null
  },
  affiliation: {
    __typename: "Affiliation",
    id: 1,
    name: "California Digital Library",
    searchName: "California Digital Library | cdlib.org | CDL ",
    uri: "https://ror.org/03yrm5c26",
    acronyms: [
      "CDL"
    ]
  }
};

export default meMock;