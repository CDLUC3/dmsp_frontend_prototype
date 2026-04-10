
'use client';

// CUSTOM variant
import { PublishedCustomQuestionsDocument, PublishedCustomSectionDocument } from '@/generated/graphql';
import { SectionPageConfig, PlanOverviewSectionPageShared } from '@/components/PlanOverviewSectionPageShared';
import { routePath } from '@/utils/routes';

const config: SectionPageConfig = {
  sectionIdParamKey: 'csid',
  questionsDocument: PublishedCustomQuestionsDocument,
  questionsVariableKey: 'versionedCustomSectionId',
  sectionDocument: PublishedCustomSectionDocument,
  buildSectionVariables: ({ sectionId, planId }) => ({
    customSectionId: sectionId,
    planId, // custom section query needs planId to determine if section is answered or not
  }),
  extractQuestions: (data) => data?.publishedCustomQuestions,
  extractSection: (data) => data?.publishedCustomSection,
  extractBreadcrumbName: (data) => data?.publishedCustomSection?.name,
  buildQuestionLink: ({ projectId, dmpId, sectionId, question }) =>
    routePath('projects.dmp.customQuestion.underCustomSection', {
      projectId, dmpId,
      csid: sectionId,
      cqid: String(question.customQuestionId)
    }),
  sectionType: 'CUSTOM',
  buildGuidanceMutationParams: ({ planId, sectionId }) => ({
    planId,
    versionedSectionId: sectionId,
    customSectionId: sectionId,
  }),
};

const PlanOverviewCustomSectionPage: React.FC = () => (
  <PlanOverviewSectionPageShared config={config} />
);
export default PlanOverviewCustomSectionPage;