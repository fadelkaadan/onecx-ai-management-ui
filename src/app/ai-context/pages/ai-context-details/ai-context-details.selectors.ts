import { createSelector } from '@ngrx/store'
import { createChildSelectors } from '@onecx/ngrx-accelerator'
import { selectBackNavigationPossible } from 'src/app/shared/selectors/onecx.selectors'
import { AIContext, AIKnowledgeBase, AIKnowledgeVectorDb, AIProvider } from '../../../shared/generated'
import { aiContextFeature } from '../../ai-context.reducers'
import { initialState } from './ai-context-details.reducers'
import { AiContextDetailsViewModel } from './ai-context-details.viewmodel'

export const aiContextDetailsSelectors = createChildSelectors(aiContextFeature.selectDetails, initialState)

export const selectAiContextDetailsViewModel = createSelector(
  aiContextDetailsSelectors.selectDetails,
  aiContextDetailsSelectors.selectDetailsLoadingIndicator,
  aiContextDetailsSelectors.selectDetailsLoaded,
  aiContextDetailsSelectors.selectProviders,
  aiContextDetailsSelectors.selectProvidersLoadingIndicator,
  aiContextDetailsSelectors.selectProvidersLoaded,
  aiContextDetailsSelectors.selectAiKnowledgeBases,
  aiContextDetailsSelectors.selectAiKnowledgeBasesLoadingIndicator,
  aiContextDetailsSelectors.selectAiKnowledgeBasesLoaded,
  aiContextDetailsSelectors.selectKnowledgeVectorDbs,
  aiContextDetailsSelectors.selectKnowledgeVectorDbsLoadingIndicator,
  aiContextDetailsSelectors.selectKnowledgeVectorDbsLoaded,
  selectBackNavigationPossible,
  aiContextDetailsSelectors.selectEditMode,
  aiContextDetailsSelectors.selectIsSubmitting,
  (
    details: AIContext | undefined,
    detailsLoadingIndicator: boolean,
    detailsLoaded: boolean,
    aiProviders: AIProvider[] | undefined,
    aiProvidersLoadingIndicator: boolean,
    aiProvidersLoaded: boolean,
    aiKnowledgeBases: AIKnowledgeBase[] | undefined,
    aiKnowledgeBasesLoadingIndicator: boolean,
    aiKnowledgeBasesLoaded: boolean,
    knowledgeVectorDbs: AIKnowledgeVectorDb[] | undefined,
    knowledgeVectorDbsLoadingIndicator: boolean,
    knowledgeVectorDbsLoaded: boolean,
    backNavigationPossible: boolean,
    editMode: boolean,
    isSubmitting: boolean
  ): AiContextDetailsViewModel => ({
    details,
    detailsLoadingIndicator,
    detailsLoaded,
    aiProviders,
    aiProvidersLoadingIndicator,
    aiProvidersLoaded,
    aiKnowledgeBases,
    aiKnowledgeBasesLoaded,
    aiKnowledgeBasesLoadingIndicator,
    knowledgeVectorDbs,
    knowledgeVectorDbsLoadingIndicator,
    knowledgeVectorDbsLoaded,
    backNavigationPossible,
    editMode,
    isSubmitting
  })
)
