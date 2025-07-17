import { AIContext, AIKnowledgeVectorDb } from '../../../shared/generated'

export interface AIKnowledgeVectorDbDetailsViewModel {
  details: AIKnowledgeVectorDb | undefined
  contexts: AIContext[]
  detailsLoaded: boolean
  detailsLoadingIndicator: boolean
  contextsLoaded: boolean
  contextsLoadingIndicator: boolean
  backNavigationPossible: boolean
  editMode: boolean
  isSubmitting: boolean
}
