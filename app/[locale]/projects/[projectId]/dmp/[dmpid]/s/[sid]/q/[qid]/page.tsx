'use client';

// BASE variant
import { PlanOverviewQuestionPageShared, QuestionPageConfig } from '@/components/PlanOverviewQuestionPageShared';
import { PublishedQuestionDocument } from '@/generated/graphql';

const config: QuestionPageConfig = {
  questionIdParamKey: 'qid',
  sectionIdParamKey: 'sid',
  sectionIdField: 'versionedSectionId',
  questionDocument: PublishedQuestionDocument,
  questionVariableKey: 'versionedQuestionId',
  extractQuestion: (data) => (data as any)?.publishedQuestion,
  sectionType: 'BASE',
  buildGuidanceMutationParams: ({ planId, versionedSectionId, versionedQuestionId }) => ({
    planId, versionedSectionId, versionedQuestionId,
  }),
  buildRouteParams: ({ projectId, dmpId, versionedSectionId, versionedQuestionId }) => ({
    projectId, dmpId, versionedSectionId, qid: versionedQuestionId,
  }),
  buildBackRoute: ({ projectId, dmpId, versionedSectionId }) => ({
    route: 'projects.dmp.versionedSection',
    params: { projectId, dmpId, versionedSectionId },
  }),
};

const PlanOverviewQuestionPage: React.FC = () => (
  <PlanOverviewQuestionPageShared config={config} />
);

export default PlanOverviewQuestionPage;