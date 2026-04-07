'use client';

// BASE variant
import { PublishedQuestionsDocument, PublishedSectionDocument } from '@/generated/graphql';
import { SectionPageConfig, PlanOverviewSectionPageShared } from '@/components/PlanOverviewSectionPageShared';
import { routePath } from '@/utils/routes';

const config: SectionPageConfig = {
  sectionIdParamKey: 'sid',
  questionsDocument: PublishedQuestionsDocument,
  questionsVariableKey: 'versionedSectionId',
  sectionDocument: PublishedSectionDocument,
  buildSectionVariables: ({ sectionId }) => ({ versionedSectionId: sectionId }),
  extractQuestions: (data) => data?.publishedQuestions,
  extractSection: (data) => data?.publishedSection,
  extractBreadcrumbName: (data) => data?.publishedSection?.name,
  buildQuestionLink: ({ projectId, dmpId, sectionId, question }) =>
    question.questionType === 'BASE'
      ? routePath('projects.dmp.versionedQuestion.detail', {
        projectId, dmpId,
        versionedSectionId: sectionId,
        versionedQuestionId: String(question.versionedQuestionId)
      })
      : routePath('projects.dmp.customQuestion.underVersionedSection', {
        projectId, dmpId,
        sid: sectionId,
        cqid: String(question.customQuestionId)
      }),
  sectionType: 'BASE',
  buildGuidanceMutationParams: ({ planId, sectionId }) => ({
    planId,
    versionedSectionId: sectionId,
    customSectionId: undefined,
  }),
};

const PlanOverviewSectionPage: React.FC = () => (
  <PlanOverviewSectionPageShared config={config} />
);
export default PlanOverviewSectionPage;
