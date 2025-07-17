import { createActionGroup, emptyProps, props } from '@ngrx/store'
import { AIContext, AIKnowledgeVectorDb } from '../../../shared/generated'

export const AIKnowledgeVectorDbDetailsActions = createActionGroup({
  source: 'AIKnowledgeVectorDbDetails',
  events: {
    'navigated to details page': props<{
      id: string | undefined
    }>(),
    'ai knowledge vector db details received': props<{
      details: AIKnowledgeVectorDb
    }>(),
    'ai knowledge vector db details loading failed': props<{ error: string | null }>(),
    'ai knowledge vector db contexts received': props<{
      contexts: AIContext[]
    }>(),
    'ai knowledge vector db contexts loading failed': props<{ error: string | null }>(),

    'Update AIKnowledge vector db cancelled': emptyProps(),
    'Update AIKnowledge vector db succeeded': emptyProps(),
    'Update AIKnowledge vector db failed': props<{
      error: string | null
    }>(),
    'Delete AIKnowledge vector db cancelled': emptyProps(),
    'Delete AIKnowledge vector db succeeded': emptyProps(),
    'Delete AIKnowledge vector db failed': props<{
      error: string | null
    }>(),
    'cancel edit back clicked': emptyProps(),
    'cancel edit confirm clicked': emptyProps(),
    'cancel edit not dirty': emptyProps(),

    'edit mode set': props<{ editMode: boolean }>(),
    'edit button clicked': emptyProps(),
    'save button clicked': props<{
      details: AIKnowledgeVectorDb
    }>(),
    'cancel button clicked': props<{
      dirty: boolean
    }>(),
    'delete button clicked': emptyProps(),
    'navigate back button clicked': emptyProps(),
    'back navigation started': emptyProps(),
    'back navigation failed': emptyProps(),
    'navigation to search started': emptyProps(),
    'navigation to search not started': emptyProps()
  }
})
