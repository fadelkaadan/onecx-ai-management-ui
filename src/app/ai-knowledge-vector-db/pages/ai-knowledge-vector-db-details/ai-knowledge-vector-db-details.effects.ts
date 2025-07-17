import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { concatLatestFrom } from '@ngrx/operators'
import { routerNavigatedAction } from '@ngrx/router-store'
import { Action, Store } from '@ngrx/store'
import { filterForNavigatedTo } from '@onecx/ngrx-accelerator'
import { DialogState, PortalDialogService, PortalMessageService } from '@onecx/portal-integration-angular'
import { catchError, filter, map, mergeMap, of, switchMap, tap } from 'rxjs'
import { selectRouteParam, selectUrl } from 'src/app/shared/selectors/router.selectors'
import {
  AIContextBffService,
  AIKnowledgeVectorDb,
  AIKnowledgeVectorDbBffService,
  UpdateAIKnowledgeVectorDbRequest,
  SearchAIContextRequest
} from '../../../shared/generated'
import { AIKnowledgeVectorDbDetailsActions } from './ai-knowledge-vector-db-details.actions'
import { AIKnowledgeVectorDbDetailsComponent } from './ai-knowledge-vector-db-details.component'
import { AIKnowledgeVectorDbDetailsSelectors } from './ai-knowledge-vector-db-details.selectors'
import { PrimeIcons } from 'primeng/api'
import { selectBackNavigationPossible } from 'src/app/shared/selectors/onecx.selectors'

@Injectable()
export class AIKnowledgeVectorDbDetailsEffects {
  constructor(
    private actions$: Actions,
    private readonly aiKnowledgeVectorDbService: AIKnowledgeVectorDbBffService,
    private readonly aiContextService: AIContextBffService,
    private router: Router,
    private store: Store,
    private readonly messageService: PortalMessageService,
    private readonly portalDialogService: PortalDialogService
  ) {}

  navigatedToDetailsPage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(routerNavigatedAction),
      filterForNavigatedTo(this.router, AIKnowledgeVectorDbDetailsComponent),
      concatLatestFrom(() => this.store.select(selectRouteParam('id'))),
      map(([, id]) => {
        return AIKnowledgeVectorDbDetailsActions.navigatedToDetailsPage({
          id
        })
      })
    )
  })

  loadItemById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AIKnowledgeVectorDbDetailsActions.navigatedToDetailsPage),
      switchMap(({ id }) => {
        return this.aiKnowledgeVectorDbService.getAIKnowledgeVectorDbById(id ?? '').pipe(
          map(({ result }) =>
            AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbDetailsReceived({
              details: result
            })
          ),
          catchError((error) =>
            of(
              AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbDetailsLoadingFailed({
                error
              })
            )
          )
        )
      })
    )
  })
  loadContextsById$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AIKnowledgeVectorDbDetailsActions.navigatedToDetailsPage),
      switchMap(() => {
        const fetchAllReq: SearchAIContextRequest = { id: undefined, appId: '', name: '', description: '' }
        return this.aiContextService.searchAIContexts(fetchAllReq).pipe(
          map(({ stream }) =>
            AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbContextsReceived({
              contexts: stream
            })
          ),
          catchError((error) =>
            of(
              AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbContextsLoadingFailed({
                error
              })
            )
          )
        )
      })
    )
  })

  cancelButtonNotDirty$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AIKnowledgeVectorDbDetailsActions.cancelButtonClicked),
      filter((action) => !action.dirty),
      map(() => {
        return AIKnowledgeVectorDbDetailsActions.cancelEditNotDirty()
      })
    )
  })

  cancelButtonClickedDirty$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AIKnowledgeVectorDbDetailsActions.cancelButtonClicked),
      filter((action) => action.dirty),
      switchMap(() => {
        return this.portalDialogService.openDialog<AIKnowledgeVectorDb | undefined>(
          'AI_KNOWLEDGE_BASE_DETAILS.CANCEL.HEADER',
          'AI_KNOWLEDGE_BASE_DETAILS.CANCEL.MESSAGE',
          'AI_KNOWLEDGE_BASE_DETAILS.CANCEL.CONFIRM'
        )
      }),
      switchMap((dialogResult) => {
        if (!dialogResult || dialogResult.button == 'secondary') {
          return of(AIKnowledgeVectorDbDetailsActions.cancelEditBackClicked())
        }
        return of(AIKnowledgeVectorDbDetailsActions.cancelEditConfirmClicked())
      })
    )
  })

  saveButtonClicked$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AIKnowledgeVectorDbDetailsActions.saveButtonClicked),
      concatLatestFrom(() => this.store.select(AIKnowledgeVectorDbDetailsSelectors.selectDetails)),
      switchMap(([action, details]) => {
        const itemToEditId = details?.id

        if (!itemToEditId) {
          return of(AIKnowledgeVectorDbDetailsActions.updateAIKnowledgeVectorDbCancelled())
        }

        const updatedItem = {
          ...details,
          ...action.details
        }
        const itemToEdit = {
          dataObject: { ...updatedItem, appId: itemToEditId }
        } as UpdateAIKnowledgeVectorDbRequest
        return this.aiKnowledgeVectorDbService.updateAIKnowledgeVectorDb(itemToEditId, itemToEdit).pipe(
          map(() => {
            this.messageService.success({
              summaryKey: 'AI_KNOWLEDGE_BASE_DETAILS.UPDATE.SUCCESS'
            })
            return AIKnowledgeVectorDbDetailsActions.updateAIKnowledgeVectorDbSucceeded()
          }),
          catchError((error) => {
            this.messageService.error({
              summaryKey: 'AI_KNOWLEDGE_BASE_DETAILS.UPDATE.ERROR'
            })
            return of(
              AIKnowledgeVectorDbDetailsActions.updateAIKnowledgeVectorDbFailed({
                error
              })
            )
          })
        )
      })
    )
  })
  deleteButtonClicked$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AIKnowledgeVectorDbDetailsActions.deleteButtonClicked),
      concatLatestFrom(() => this.store.select(AIKnowledgeVectorDbDetailsSelectors.selectDetails)),
      mergeMap(([, itemToDelete]) => {
        return this.portalDialogService
          .openDialog<unknown>(
            'AI_KNOWLEDGE_BASE_DETAILS.DELETE.HEADER',
            'AI_KNOWLEDGE_BASE_DETAILS.DELETE.MESSAGE',
            {
              key: 'AI_KNOWLEDGE_BASE_DETAILS.DELETE.CONFIRM',
              icon: PrimeIcons.CHECK
            },
            {
              key: 'AI_KNOWLEDGE_BASE_DETAILS.DELETE.CANCEL',
              icon: PrimeIcons.TIMES
            }
          )
          .pipe(
            map((state): [DialogState<unknown>, AIKnowledgeVectorDb | undefined] => {
              return [state, itemToDelete]
            })
          )
      }),
      switchMap(([dialogResult, itemToDelete]) => {
        if (!dialogResult || dialogResult.button == 'secondary') {
          return of(AIKnowledgeVectorDbDetailsActions.deleteAIKnowledgeVectorDbCancelled())
        }
        if (!itemToDelete) {
          throw new Error('Item to delete not found!')
        }

        return this.aiKnowledgeVectorDbService.deleteAIKnowledgeVectorDb(itemToDelete.id).pipe(
          map(() => {
            this.messageService.success({
              summaryKey: 'AI_KNOWLEDGE_BASE_DETAILS.DELETE.SUCCESS'
            })
            return AIKnowledgeVectorDbDetailsActions.deleteAIKnowledgeVectorDbSucceeded()
          }),
          catchError((error) => {
            this.messageService.error({
              summaryKey: 'AI_KNOWLEDGE_BASE_DETAILS.DELETE.ERROR'
            })
            return of(
              AIKnowledgeVectorDbDetailsActions.deleteAIKnowledgeVectorDbFailed({
                error
              })
            )
          })
        )
      })
    )
  })

  deleteAIKnowledgeVectorDbSucceeded$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(AIKnowledgeVectorDbDetailsActions.deleteAIKnowledgeVectorDbSucceeded),
        concatLatestFrom(() => this.store.select(selectUrl)),
        tap(([, currentUrl]) => {
          const urlTree = this.router.parseUrl(currentUrl)
          urlTree.queryParams = {}
          urlTree.fragment = null

          const targetUrl = urlTree.toString().split('/').slice(0, -2).join('/')
          this.router.navigate([targetUrl])
        })
      )
    },
    { dispatch: false }
  )

  errorMessages: { action: Action; key: string }[] = [
    {
      action: AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbDetailsLoadingFailed,
      key: 'AI_KNOWLEDGE_VECTOR_DB_DETAILS.ERROR_MESSAGES.DETAILS_LOADING_FAILED'
    },
    {
      action: AIKnowledgeVectorDbDetailsActions.aiKnowledgeVectorDbContextsLoadingFailed,
      key: 'AI_KNOWLEDGE_VECTOR_DB_DETAILS.ERROR_MESSAGES.CONTEXTS_LOADING_FAILED'
    }
  ]

  displayError$ = createEffect(
    () => {
      return this.actions$.pipe(
        tap((action) => {
          const e = this.errorMessages.find((e) => e.action.type === action.type)
          if (e) {
            this.messageService.error({ summaryKey: e.key })
          }
        })
      )
    },
    { dispatch: false }
  )

  navigateBack$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(AIKnowledgeVectorDbDetailsActions.navigateBackButtonClicked),
      concatLatestFrom(() => [this.store.select(selectBackNavigationPossible)]),
      switchMap(([, backNavigationPossible]) => {
        if (!backNavigationPossible) {
          return of(AIKnowledgeVectorDbDetailsActions.backNavigationFailed())
        }
        window.history.back()
        return of(AIKnowledgeVectorDbDetailsActions.backNavigationStarted())
      })
    )
  })
}
