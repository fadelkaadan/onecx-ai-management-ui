import { AIContext, AIKnowledgeVectorDb } from '../../../shared/generated'

export interface AIKnowledgeVectorDbDetailsState {
  details: AIKnowledgeVectorDb | undefined
  contexts: AIContext[]
  detailsLoaded: boolean
  detailsLoadingIndicator: boolean
  contextsLoaded: boolean
  contextsLoadingIndicator: boolean
  editMode: boolean
  isSubmitting: boolean
}
