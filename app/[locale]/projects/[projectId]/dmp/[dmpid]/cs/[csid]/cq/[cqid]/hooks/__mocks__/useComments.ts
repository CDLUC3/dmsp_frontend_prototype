import mockMergedComments from '../../__mocks__/mockMergedComments.json'

export const mockUseComments = jest.fn();

export const defaultMockReturn = {
  mergedComments: mockMergedComments,
  editingCommentId: null,
  editingCommentText: '',
  canAddComments: true,
  errors: [],
  commentsEndRef: { current: null },
  setEditingCommentText: jest.fn(),
  setCommentsFromData: jest.fn(),
  updateCanAddComments: jest.fn(),
  handleAddComment: jest.fn(),
  handleDeleteComment: jest.fn(),
  handleEditComment: jest.fn(),
  handleUpdateComment: jest.fn(),
  handleCancelEdit: jest.fn(),
};

mockUseComments.mockReturnValue(defaultMockReturn);

export const useComments = mockUseComments;
