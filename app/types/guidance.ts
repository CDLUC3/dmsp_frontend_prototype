import { TagsInterface } from "@/app/types";

export interface GuidanceTag {
  id: number;
  name: string;
}

export type UpdateGuidanceTextErrors = {
  general?: string;
  guidanceGroupId?: string;
  guidanceText?: string;
  tagId?: string;
};

export type AddGuidanceTextErrors = {
  general?: string;
  guidanceGroupId?: string;
  guidanceText?: string;
  tagId?: string;
};

export type PublishGuidanceGroupErrors = {
  general?: string;
  affiliationId?: string;
  bestPractice?: string;
  name?: string;
  description?: string;
};

export interface GuidanceText {
  id: string;
  guidanceText: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  url: string;
  tagId: number;
}

export interface TagGuidanceItem {
  tag: TagsInterface;
  guidance: GuidanceText | null;
}

export interface GuidanceGroup {
  guidanceGroupId: number;
  name: string;
  description: string;
  optionalSubset: boolean;
  bestPractice?: boolean;
  status: string;
  lastPublishedDate: string;
}

export interface AddGuidanceResponse {
  success: boolean;
  data?: {
    id: number;
    errors?: Record<string, string>;
    guidanceText: string;
  }
  errors?: string[];
  redirect?: string;
}