import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { Store } from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { provideMockActions } from '@ngrx/effects/testing'
import { ReplaySubject, of, throwError } from 'rxjs'
import { AIContextBffService } from '../../../shared/generated'
import { ExportDataService, PortalMessageService, PortalDialogService } from '@onecx/portal-integration-angular'
import { AiContextSearchEffects } from './ai-context-search.effects'
import { AiContextSearchActions } from './ai-context-search.actions'
import { aiContextSearchSelectors } from './ai-context-search.selectors'
import { AiContextSearchCriteria } from './ai-context-search.parameters'
import { initialState } from './ai-context-search.reducers'
import { selectUrl } from 'src/app/shared/selectors/router.selectors'

describe('AiContextSearchEffects', () => {
  const mockActivatedRoute = {
    snapshot: {
      data: {}
    }
  }

  let actions$: ReplaySubject<unknown>
  let effects: AiContextSearchEffects
  let store: MockStore<Store>
  let router: jest.Mocked<Router>
  let route: ActivatedRoute
  let aiContextService: jest.Mocked<AIContextBffService>
  let portalDialogService: jest.Mocked<PortalDialogService>
  let messageService: jest.Mocked<PortalMessageService>
  let exportDataService: jest.Mocked<ExportDataService>

  const mockCriteria: AiContextSearchCriteria = {
    appId: 'test-app',
    name: 'test-name',
    description: 'test-description'
  }

  beforeEach(async () => {
    actions$ = new ReplaySubject(1)

    aiContextService = {
      searchAIContexts: jest.fn(),
      createAIContext: jest.fn(),
      updateAIContext: jest.fn(),
      deleteAIContext: jest.fn()
    } as unknown as jest.Mocked<AIContextBffService>

    router = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      parseUrl: jest.fn().mockImplementation((url: string) => {
        const urlParts = url.split('?')[0]
        return {
          queryParams: {},
          fragment: null,
          toString: () => urlParts
        }
      }),
      events: of()
    } as unknown as jest.Mocked<Router>

    portalDialogService = {
      openDialog: jest.fn()
    } as unknown as jest.Mocked<PortalDialogService>

    messageService = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<PortalMessageService>

    exportDataService = {
      exportCsv: jest.fn()
    } as unknown as jest.Mocked<ExportDataService>

    route = {
      queryParams: of({
        appId: 'test-app',
        name: 'test-name',
        description: 'test-description'
      }),
      snapshot: {
        queryParams: {}
      }
    } as unknown as ActivatedRoute

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AiContextSearchEffects,
        provideMockStore({
          initialState: { aiContextSearch: initialState }
        }),
        provideMockActions(() => actions$),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: AIContextBffService, useValue: aiContextService },
        { provide: PortalDialogService, useValue: portalDialogService },
        { provide: PortalMessageService, useValue: messageService },
        { provide: ExportDataService, useValue: exportDataService }
      ]
    }).compileComponents()

    effects = TestBed.inject(AiContextSearchEffects)
    store = TestBed.inject(MockStore)
  })

  describe('syncParamsToUrl$', () => {
    beforeEach(() => {
      store.overrideSelector(aiContextSearchSelectors.selectCriteria, mockCriteria)
      store.refreshState()
    })

    it('should navigate to update URL when criteria differs from query params', (done) => {
      const navigateSpy = jest.spyOn(router, 'navigate')

      route.queryParams = of({
        appId: 'different-app',
        name: 'different-name',
        description: 'different-description'
      })

      actions$.next(AiContextSearchActions.searchButtonClicked({ searchCriteria: mockCriteria }))

      effects.syncParamsToUrl$.subscribe(() => {
        expect(navigateSpy).toHaveBeenCalledWith([], {
          relativeTo: route,
          queryParams: mockCriteria,
          replaceUrl: true,
          onSameUrlNavigation: 'ignore'
        })
        done()
      })
    })

    it('should not navigate when criteria matches query params', (done) => {
      const navigateSpy = jest.spyOn(router, 'navigate')

      route.queryParams = of(mockCriteria)

      actions$.next(AiContextSearchActions.searchButtonClicked({ searchCriteria: mockCriteria }))

      effects.syncParamsToUrl$.subscribe(() => {
        expect(navigateSpy).not.toHaveBeenCalled()
        done()
      })
    })

    it('should navigate when resetButtonClicked action is triggered', (done) => {
      const navigateSpy = jest.spyOn(router, 'navigate')

      route.queryParams = of({
        appId: 'different-app'
      })

      actions$.next(AiContextSearchActions.resetButtonClicked())

      effects.syncParamsToUrl$.subscribe(() => {
        expect(navigateSpy).toHaveBeenCalledWith([], {
          relativeTo: route,
          queryParams: mockCriteria,
          replaceUrl: true,
          onSameUrlNavigation: 'ignore'
        })
        done()
      })
    })
  })

  describe('detailsButtonClicked$', () => {
    beforeEach(() => {
      store.overrideSelector(selectUrl, '/search?param=value#fragment')
      store.refreshState()
    })

    it('should navigate to details page with correct URL structure', (done) => {
      const testId = 'test-123'
      const navigateSpy = jest.spyOn(router, 'navigate')

      actions$.next(AiContextSearchActions.detailsButtonClicked({ id: testId }))

      effects.detailsButtonClicked$.subscribe(() => {
        expect(navigateSpy).toHaveBeenCalledWith(['/search', 'details', testId])
        done()
      })
    })

    it('should clear query params and fragment from URL', (done) => {
      const testId = 'test-456'
      const parseUrlSpy = jest.spyOn(router, 'parseUrl')

      const mockUrlTree = {
        toString: jest.fn(() => '/search'),
        queryParams: { param: 'value' },
        fragment: 'fragment'
      }

      parseUrlSpy.mockReturnValue(mockUrlTree as never)

      actions$.next(AiContextSearchActions.detailsButtonClicked({ id: testId }))

      effects.detailsButtonClicked$.subscribe(() => {
        expect(mockUrlTree.queryParams).toEqual({})
        expect(mockUrlTree.fragment).toBeNull()
        done()
      })
    })
  })

  describe('searchByUrl$', () => {
    beforeEach(() => {
      store.overrideSelector(aiContextSearchSelectors.selectCriteria, mockCriteria)
      store.refreshState()

      aiContextService.searchAIContexts.mockReturnValue(
        of({
          stream: [{ id: '1', name: 'Test Context' }],
          size: 10,
          number: 0,
          totalElements: 1,
          totalPages: 1
        }) as never
      )
    })

    it('should call performSearch and dispatch aiContextSearchResultsReceived on successful search', (done) => {
      effects.performSearch(mockCriteria).subscribe((action) => {
        expect(action.type).toEqual(AiContextSearchActions.aiContextSearchResultsReceived.type)
        expect(action).toEqual(
          AiContextSearchActions.aiContextSearchResultsReceived({
            stream: [{ id: '1', name: 'Test Context' }],
            size: 10,
            number: 0,
            totalElements: 1,
            totalPages: 1
          })
        )
        done()
      })
    })

    it('should dispatch aiContextSearchResultsLoadingFailed on search error', (done) => {
      const mockError = 'Search failed'

      aiContextService.searchAIContexts.mockReturnValue(throwError(() => mockError))

      effects.performSearch(mockCriteria).subscribe((action) => {
        expect(action.type).toEqual(AiContextSearchActions.aiContextSearchResultsLoadingFailed.type)
        expect(action).toEqual(
          AiContextSearchActions.aiContextSearchResultsLoadingFailed({
            error: mockError
          })
        )
        done()
      })
    })
  })

  describe('refreshSearchAfterCreateUpdate$', () => {
    beforeEach(() => {
      store.overrideSelector(aiContextSearchSelectors.selectCriteria, mockCriteria)
      store.refreshState()

      aiContextService.searchAIContexts.mockReturnValue(
        of({
          stream: [{ id: '2', name: 'Updated Context' }],
          size: 10,
          number: 0,
          totalElements: 1,
          totalPages: 1
        }) as never
      )
    })

    it('should trigger search when createAiContextSucceeded action is dispatched', (done) => {
      actions$.next(AiContextSearchActions.createAiContextSucceeded())

      effects.refreshSearchAfterCreateUpdate$.subscribe((action) => {
        expect(action.type).toEqual(AiContextSearchActions.aiContextSearchResultsReceived.type)
        expect(action).toEqual(
          AiContextSearchActions.aiContextSearchResultsReceived({
            stream: [{ id: '2', name: 'Updated Context' }],
            size: 10,
            number: 0,
            totalElements: 1,
            totalPages: 1
          })
        )
        done()
      })
    })

    it('should trigger search when updateAiContextSucceeded action is dispatched', (done) => {
      actions$.next(AiContextSearchActions.updateAiContextSucceeded())

      effects.refreshSearchAfterCreateUpdate$.subscribe((action) => {
        expect(action.type).toEqual(AiContextSearchActions.aiContextSearchResultsReceived.type)
        expect(action).toEqual(
          AiContextSearchActions.aiContextSearchResultsReceived({
            stream: [{ id: '2', name: 'Updated Context' }],
            size: 10,
            number: 0,
            totalElements: 1,
            totalPages: 1
          })
        )
        done()
      })
    })

    it('should handle search errors properly', (done) => {
      const mockError = 'Refresh search failed'

      aiContextService.searchAIContexts.mockReturnValue(throwError(() => mockError))

      actions$.next(AiContextSearchActions.createAiContextSucceeded())

      effects.refreshSearchAfterCreateUpdate$.subscribe((action) => {
        expect(action.type).toEqual(AiContextSearchActions.aiContextSearchResultsLoadingFailed.type)
        expect(action).toEqual(
          AiContextSearchActions.aiContextSearchResultsLoadingFailed({
            error: mockError
          })
        )
        done()
      })
    })
  })
})
