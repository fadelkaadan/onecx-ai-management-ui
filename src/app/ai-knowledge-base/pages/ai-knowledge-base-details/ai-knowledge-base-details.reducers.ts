import { createReducer, on } from '@ngrx/store'
import { AiKnowledgeBaseDetailsActions } from './ai-knowledge-base-details.actions'
import { AiKnowledgeBaseDetailsState } from './ai-knowledge-base-details.state'

export const initialState: AiKnowledgeBaseDetailsState = {
  details: { id: '', name: '', description: '', aiContext: [], modificationCount: 0 },
  detailsLoadingIndicator: true,
  detailsLoaded: false,
  contexts: [],
  contextsLoadingIndicator: true,
  contextsLoaded: false,
  editMode: false,
  isSubmitting: false
}

export const aiKnowledgeBaseDetailsReducer = createReducer(
  initialState,
  on(
    AiKnowledgeBaseDetailsActions.aiKnowledgeBaseDetailsReceived,
    (state: AiKnowledgeBaseDetailsState, { details }): AiKnowledgeBaseDetailsState => ({
      ...state,
      details,
      detailsLoadingIndicator: false,
      detailsLoaded: true
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.aiKnowledgeBaseDetailsLoadingFailed,
    (state: AiKnowledgeBaseDetailsState): AiKnowledgeBaseDetailsState => ({
      ...state,
      details: initialState.details,
      detailsLoadingIndicator: false,
      detailsLoaded: false
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.aiKnowledgeBaseContextsReceived,
    (state: AiKnowledgeBaseDetailsState, { contexts }): AiKnowledgeBaseDetailsState => ({
      ...state,
      contexts,
      contextsLoadingIndicator: false,
      contextsLoaded: true
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.aiKnowledgeBaseContextsLoadingFailed,
    (state: AiKnowledgeBaseDetailsState): AiKnowledgeBaseDetailsState => ({
      ...state,
      contexts: initialState.contexts,
      contextsLoadingIndicator: false,
      contextsLoaded: false
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.navigatedToDetailsPage,
    (): AiKnowledgeBaseDetailsState => ({
      ...initialState
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.editButtonClicked,
    (state: AiKnowledgeBaseDetailsState): AiKnowledgeBaseDetailsState => ({
      ...state,
      editMode: true
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.saveButtonClicked,
    (state: AiKnowledgeBaseDetailsState, { details }): AiKnowledgeBaseDetailsState => ({
      ...state,
      details,
      editMode: false,
      isSubmitting: true
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.navigateBackButtonClicked,
    (state: AiKnowledgeBaseDetailsState): AiKnowledgeBaseDetailsState => ({
      ...state
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.cancelEditConfirmClicked,
    AiKnowledgeBaseDetailsActions.cancelEditNotDirty,
    AiKnowledgeBaseDetailsActions.updateAiKnowledgeBaseCancelled,
    AiKnowledgeBaseDetailsActions.updateAiKnowledgeBaseSucceeded,
    (state: AiKnowledgeBaseDetailsState): AiKnowledgeBaseDetailsState => ({
      ...state,
      editMode: false,
      isSubmitting: false
    })
  ),
  on(
    AiKnowledgeBaseDetailsActions.updateAiKnowledgeBaseFailed,
    (state: AiKnowledgeBaseDetailsState): AiKnowledgeBaseDetailsState => ({
      ...state,
      isSubmitting: false
    })
  )
)
