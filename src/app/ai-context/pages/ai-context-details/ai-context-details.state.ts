import { AIContext, AIKnowledgeBase, AIKnowledgeVectorDb, AIProvider } from '../../../shared/generated'

export interface AiContextDetailsState {
  details: AIContext | undefined
  detailsLoadingIndicator: boolean
  detailsLoaded: boolean

  providers: AIProvider[] | undefined
  providersLoaded: boolean
  providersLoadingIndicator: boolean

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
