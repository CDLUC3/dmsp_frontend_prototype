'use client';

// CUSTOM variant
import { PlanOverviewQuestionPageShared, QuestionPageConfig } from '@/components/PlanOverviewQuestionPageShared';
import { PublishedCustomQuestionDocument } from '@/generated/graphql';

const config: QuestionPageConfig = {
  questionIdParamKey: 'cqid',
  sectionIdParamKey: 'sid',
  sectionIdField: 'versionedSectionId',
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
    projectId, dmpId,
    sid: versionedSectionId,
    cqid: versionedQuestionId,
  }),
  buildBackRoute: ({ projectId, dmpId, versionedSectionId }) => ({
    route: 'projects.dmp.versionedSection',
    params: { projectId, dmpId, versionedSectionId },
  }),
  buildAnswerQueryVariables: ({ projectId, planId, questionId }) => ({
    projectId,
    planId,
    versionedCustomQuestionId: questionId,
  }),
  buildAddAnswerParams: ({ planId, sectionId, questionId }) => ({
    planId,
    versionedSectionId: sectionId,
    versionedCustomQuestionId: questionId,
  }),
};

const PlanOverviewCustomQuestionUnderVersionedSectionPage: React.FC = () => (
  <PlanOverviewQuestionPageShared config={config} />
);

export default PlanOverviewCustomQuestionUnderVersionedSectionPage;