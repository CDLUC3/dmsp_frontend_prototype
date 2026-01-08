import {
  TypePolicies,
  TypePolicy,
  FieldPolicy,
  FieldReadFunction
} from '@apollo/client';

// Define all types that have error fields
export const TYPES_WITH_ERRORS = [
  'Section',
  'Question',
  'Project',
  'ProjectFunding',
  'Plan',
  'PlanMember',
  'Template',
] as const;

// Map of typeName to additional fields needing merge: false
const EXTRA_FIELDS: Record<string, string[]> = {
  Section: ['questions'],
  Template: ['sections']
};

// Typed read function
const errorRead: FieldReadFunction = (existing, { canRead }) => {
  return canRead(existing) ? existing : undefined;
};

/**
 * Creates type policies that set merge: false for error fields
 * on all specified types. This prevents Apollo from trying to merge
 * error objects which have inconsistent shapes.
 */
export function createErrorTypePolicies(
  typeNames: readonly string[]
): TypePolicies {
  return typeNames.reduce<TypePolicies>((acc, typeName) => {
    const fields: TypePolicy['fields'] = {
      errors: {
        merge: false,
        read: errorRead,
      } satisfies FieldPolicy,
    };

    // Add extra fields with merge: false
    if (EXTRA_FIELDS[typeName]) {
      EXTRA_FIELDS[typeName].forEach((field) => {
        fields![field] = { merge: false };
      });
    }

    acc[typeName] = { fields };
    return acc;
  }, {});
}

export const errorTypePolicies = createErrorTypePolicies(TYPES_WITH_ERRORS);