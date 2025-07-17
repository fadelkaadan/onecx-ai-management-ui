import { AIContext, AIKnowledgeBase, AIKnowledgeVectorDb, AIProvider } from '../../../shared/generated'

export interface AiContextDetailsViewModel {
  details: AIContext | undefined
  detailsLoadingIndicator: boolean
  detailsLoaded: boolean

  aiProviders: AIProvider[] | undefined
  aiProvidersLoaded: boolean
  aiProvidersLoadingIndicator: boolean

  aiKnowledgeBases: AIKnowledgeBase[] | undefined
  aiKnowledgeBasesLoaded: boolean
  aiKnowledgeBasesLoadingIndicator: boolean

  knowledgeVectorDbs: AIKnowledgeVectorDb[] | undefined
  knowledgeVectorDbsLoaded: boolean
  knowledgeVectorDbsLoadingIndicator: boolean

  backNavigationPossible: boolean
  editMode: boolean
  isSubmitting: boolean
}
