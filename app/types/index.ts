export interface EmailInterface {
  id?: number | null;
  email: string;
  isPrimary: boolean;
  isConfirmed: boolean;
}

export interface LanguageInterface {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface ProfileDataInterface {
  firstName: string;
  lastName: string;
  affiliationName: string;
  affiliationId: string;
  otherAffiliationName: string;
  languageId: string;
  languageName: string;
}

export interface FormErrorsInterface {
  firstName: string;
  lastName: string;
  affiliationName: string;
  affiliationId: string;
  languageId: string;
  languageName: string;
  otherAffiliationName: string;
}
