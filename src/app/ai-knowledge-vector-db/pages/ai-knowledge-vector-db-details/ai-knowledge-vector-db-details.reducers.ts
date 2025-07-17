import { createReducer, on } from '@ngrx/store'
import { AIKnowledgeVectorDbDetailsActions } from './ai-knowledge-vector-db-details.actions'
import { AIKnowledgeVectorDbDetailsState } from './ai-knowledge-vector-db-details.state'

export const initialState: AIKnowledgeVectorDbDetailsState = {
  details: {
    id: '',
    name: '',
    description: '',
    aiContext: { id: 'id', name: 'name' },
    vdb: '',
    vdbCollection: '',
    modificationCount: 0
  },
  contexts: [],
  detailsLoaded: false,
  detailsLoadingIndicator: true,
  contextsLoaded: false,
  contextsLoadingIndicator: true,
  editMode: false,
  isSubmitting: false
}

export const AIKnowledgeVectorDbDetailsReducer = createReducer(
  initialState,
  on(
    AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbDetailsReceived,
    (state: AIKnowledgeVectorDbDetailsState, { details }): AIKnowledgeVectorDbDetailsState => ({
      ...state,
      details,
      detailsLoadingIndicator: false,
      detailsLoaded: true
    })
  ),
  on(
    AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbDetailsLoadingFailed,
    (state: AIKnowledgeVectorDbDetailsState): AIKnowledgeVectorDbDetailsState => ({
      ...state,
      details: initialState.details,
      detailsLoadingIndicator: false,
      detailsLoaded: false
    })
  ),
  on(
    AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbContextsReceived,
    (state: AIKnowledgeVectorDbDetailsState, { contexts }): AIKnowledgeVectorDbDetailsState => ({
      ...state,
      contexts,
      contextsLoadingIndicator: false,
      contextsLoaded: true
    })
  ),
  on(
    AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbContextsLoadingFailed,
    (state: AIKnowledgeVectorDbDetailsState): AIKnowledgeVectorDbDetailsState => ({
      ...state,
      contexts: initialState.contexts,
      contextsLoadingIndicator: false,
      contextsLoaded: false
    })
  ),
  on(
    AIKnowledgeVectorDbDetailsActions.navigatedToDetailsPage,
    (): AIKnowledgeVectorDbDetailsState => ({
      ...initialState
    })
  ),

  on(
    AIKnowledgeVectorDbDetailsActions.editButtonClicked,
    (state: AIKnowledgeVectorDbDetailsState): AIKnowledgeVectorDbDetailsState => ({
      ...state,
      editMode: true
    })
  ),
  on(
    AIKnowledgeVectorDbDetailsActions.saveButtonClicked,
    (state: AIKnowledgeVectorDbDetailsState, { details }): AIKnowledgeVectorDbDetailsState => ({
      ...state,
      details,
      editMode: false,
      isSubmitting: true
    })
  ),
  on(
    AIKnowledgeVectorDbDetailsActions.navigateBackButtonClicked,
    (state: AIKnowledgeVectorDbDetailsState): AIKnowledgeVectorDbDetailsState => ({
      ...state
    })
  ),
  on(
    AIKnowledgeVectorDbDetailsActions.cancelEditConfirmClicked,
    AIKnowledgeVectorDbDetailsActions.cancelEditNotDirty,
    AIKnowledgeVectorDbDetailsActions.updateAIKnowledgeVectorDbCancelled,
    AIKnowledgeVectorDbDetailsActions.updateAIKnowledgeVectorDbSucceeded,
    (state: AIKnowledgeVectorDbDetailsState): AIKnowledgeVectorDbDetailsState => ({
      ...state,
      editMode: false,
      isSubmitting: false
    })
  ),
  on(
    AIKnowledgeVectorDbDetailsActions.updateAIKnowledgeVectorDbFailed,
    (state: AIKnowledgeVectorDbDetailsState): AIKnowledgeVectorDbDetailsState => ({
      ...state,
      isSubmitting: false
    })
  )
)
