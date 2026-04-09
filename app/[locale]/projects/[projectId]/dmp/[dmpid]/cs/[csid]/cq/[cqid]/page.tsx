'use client';

// CUSTOM variant
import { PlanOverviewQuestionPageShared, QuestionPageConfig } from '@/components/PlanOverviewQuestionPageShared';
import { PublishedCustomQuestionDocument } from '@/generated/graphql';

const config: QuestionPageConfig = {
  questionIdParamKey: 'cqid',
  sectionIdParamKey: 'csid',                      // ← reads params.csid
  sectionIdField: 'customSectionId',              // ← checks section.customSectionId
  questionDocument: PublishedCustomQuestionDocument,
  questionVariableKey: 'versionedCustomQuestionId',
  extractQuestion: (data) => data?.publishedCustomQuestion,
  sectionType: 'CUSTOM',
  buildGuidanceMutationParams: ({ planId, versionedSectionId, versionedQuestionId }) => ({
    planId,
    customSectionId: versionedSectionId,
    customQuestionId: versionedQuestionId,
  }),
  buildRouteParams: ({ projectId, dmpId, versionedSectionId, versionedQuestionId }) => ({
    projectId, dmpId, csid: versionedSectionId, cqid: versionedQuestionId,
  }),
  buildBackRoute: ({ projectId, dmpId, versionedSectionId }) => ({
    route: 'projects.dmp.customSection',          // ← different route
    params: { projectId, dmpId, csid: versionedSectionId },
  }),
};

const PlanOverviewCustomQuestionUnderCustomSectionPage: React.FC = () => (
  <PlanOverviewQuestionPageShared config={config} />
);

export default PlanOverviewCustomQuestionUnderCustomSectionPage;