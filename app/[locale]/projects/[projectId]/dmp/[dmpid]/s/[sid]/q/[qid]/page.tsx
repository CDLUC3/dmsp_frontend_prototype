'use client';

// BASE variant
import { PlanOverviewQuestionPageShared, QuestionPageConfig } from '@/components/PlanOverviewQuestionPageShared';
import {
  PublishedQuestionDocument
} from '@/generated/graphql';

const config: QuestionPageConfig = {
  questionIdParamKey: 'qid',
  sectionIdParamKey: 'sid',
  sectionIdField: 'versionedSectionId',
  questionDocument: PublishedQuestionDocument,
  questionVariableKey: 'versionedQuestionId',
  extractQuestion: (data) => data?.publishedQuestion,
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
  buildAnswerQueryVariables: ({ projectId, planId, questionId }) => ({
    projectId,
    planId,
    versionedQuestionId: questionId,
  }),
  buildAddAnswerParams: ({ planId, sectionId, questionId }) => ({
    planId,
    versionedSectionId: sectionId,
    versionedQuestionId: questionId,
  }),
};

const PlanOverviewQuestionPage: React.FC = () => (
  <PlanOverviewQuestionPageShared config={config} />
);

export default PlanOverviewQuestionPage;