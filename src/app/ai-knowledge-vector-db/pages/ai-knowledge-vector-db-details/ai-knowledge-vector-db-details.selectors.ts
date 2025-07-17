import { createSelector } from '@ngrx/store'
import { createChildSelectors } from '@onecx/ngrx-accelerator'
import { selectBackNavigationPossible } from '../../../shared/selectors/onecx.selectors'
import { AIContext, AIKnowledgeVectorDb } from '../../../shared/generated'
import { AIKnowledgeVectorDbFeature } from '../../ai-knowledge-vector-db.reducers'
import { initialState } from './ai-knowledge-vector-db-details.reducers'
import { AIKnowledgeVectorDbDetailsViewModel } from './ai-knowledge-vector-db-details.viewmodel'

export const AIKnowledgeVectorDbDetailsSelectors = createChildSelectors(
  AIKnowledgeVectorDbFeature.selectDetails,
  initialState
)

export const selectAIKnowledgeVectorDbDetailsViewModel = createSelector(
  AIKnowledgeVectorDbDetailsSelectors.selectDetails,
  AIKnowledgeVectorDbDetailsSelectors.selectContexts,
  AIKnowledgeVectorDbDetailsSelectors.selectDetailsLoaded,
  AIKnowledgeVectorDbDetailsSelectors.selectDetailsLoadingIndicator,
  AIKnowledgeVectorDbDetailsSelectors.selectContextsLoaded,
  AIKnowledgeVectorDbDetailsSelectors.selectContextsLoadingIndicator,
  selectBackNavigationPossible,
  AIKnowledgeVectorDbDetailsSelectors.selectEditMode,
  AIKnowledgeVectorDbDetailsSelectors.selectIsSubmitting,

  (
    details: AIKnowledgeVectorDb | undefined,
    contexts: AIContext[],
    detailsLoaded: boolean,
    detailsLoadingIndicator: boolean,
    contextsLoaded: boolean,
    contextsLoadingIndicator: boolean,
    backNavigationPossible: boolean,
    editMode: boolean,
    isSubmitting
  ): AIKnowledgeVectorDbDetailsViewModel => ({
    details,
    contexts,
    detailsLoaded,
    detailsLoadingIndicator,
    contextsLoaded,
    contextsLoadingIndicator,
    backNavigationPossible,
    editMode,
    isSubmitting
  })
)
