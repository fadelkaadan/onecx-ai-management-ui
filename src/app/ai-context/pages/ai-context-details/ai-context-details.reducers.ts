import { createReducer, on } from '@ngrx/store'
import { AiContextDetailsActions } from './ai-context-details.actions'
import { AiContextDetailsState } from './ai-context-details.state'

export const initialState: AiContextDetailsState = {
  details: undefined,
  detailsLoadingIndicator: true,
  detailsLoaded: false,
  providers: [],
  providersLoadingIndicator: true,
  providersLoaded: false,
  aiKnowledgeBases: [],
  aiKnowledgeBasesLoadingIndicator: true,
  aiKnowledgeBasesLoaded: false,
  knowledgeVectorDbs: [],
  knowledgeVectorDbsLoadingIndicator: true,
  knowledgeVectorDbsLoaded: false,
  backNavigationPossible: true,
  editMode: false,
  isSubmitting: false
}

export const aiContextDetailsReducer = createReducer(
  initialState,
  on(
    AiContextDetailsActions.aiContextDetailsReceived,
    (state: AiContextDetailsState, { details }): AiContextDetailsState => ({
      ...state,
      details,
      detailsLoadingIndicator: false,
      detailsLoaded: true,
    })
  ),
  on(
    AiContextDetailsActions.aiContextDetailsLoadingFailed,
    (state: AiContextDetailsState): AiContextDetailsState => ({
      ...state,
      details: undefined,
      detailsLoadingIndicator: false,
      detailsLoaded: false,
    })
  ),
  on(
    AiContextDetailsActions.aiContextProvidersReceived,
    (state: AiContextDetailsState, { providers }): AiContextDetailsState => ({
      ...state,
      providers,
      providersLoadingIndicator: false,
      providersLoaded: true
    })
  ),
  on(
    AiContextDetailsActions.aiContextProvidersLoadingFailed,
    (state: AiContextDetailsState): AiContextDetailsState => ({
      ...state,
      providers: [],
      providersLoadingIndicator: false,
      providersLoaded: false
    })
  ),
  on(
    AiContextDetailsActions.aiContextAiKnowledgeBasesReceived,
    (state: AiContextDetailsState, { aiKnowledgeBases }): AiContextDetailsState => ({
      ...state,
      aiKnowledgeBases,
      aiKnowledgeBasesLoadingIndicator: false,
      aiKnowledgeBasesLoaded: true
    })
  ),
  on(
    AiContextDetailsActions.navigatedToDetailsPage,
    (): AiContextDetailsState => ({
      ...initialState
    })
  ),
  on(
    AiContextDetailsActions.editButtonClicked,
    (state: AiContextDetailsState): AiContextDetailsState => ({
      ...state,
      editMode: true,
    })
  ),
  on(
    AiContextDetailsActions.saveButtonClicked,
    (state: AiContextDetailsState, { details }): AiContextDetailsState => ({
      ...state,
      details,
      editMode: false,
      isSubmitting: true
    })
  ),
  on(
    AiContextDetailsActions.navigateBackButtonClicked,
    (state: AiContextDetailsState): AiContextDetailsState => ({
      ...state,
      isSubmitting: true
    })
  ),
  on(
    AiContextDetailsActions.cancelEditConfirmClicked,
    AiContextDetailsActions.cancelEditNotDirty,
    AiContextDetailsActions.updateAiContextCancelled,
    AiContextDetailsActions.updateAiContextSucceeded,
    (state: AiContextDetailsState): AiContextDetailsState => ({
      ...state,
      editMode: false,
      isSubmitting: false
    })
  ),
  on(
    AiContextDetailsActions.updateAiContextFailed,
    (state: AiContextDetailsState): AiContextDetailsState => ({
      ...state,
      isSubmitting: false
    })
  )
)
