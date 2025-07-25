import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, ActivatedRouteSnapshot, EventType, Router } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { Store } from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { TranslateService } from '@ngx-translate/core'
import {
  BreadcrumbService,
  PortalCoreModule,
  PortalDialogService,
  PortalMessageService,
  UserService
} from '@onecx/portal-integration-angular'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { AiContextDetailsComponent } from './ai-context-details.component'
import { AiContextDetailsHarness } from './ai-context-details.harness'
import { initialState } from './ai-context-details.reducers'
import { aiContextDetailsSelectors, selectAiContextDetailsViewModel } from './ai-context-details.selectors'
import { AiContextDetailsViewModel } from './ai-context-details.viewmodel'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import {
  AIKnowledgeDocumentStatusEnum,
  AIContextBffService,
  // SearchAIContextResponse,
  UpdateAIContextResponse,
  GetAIContextByIdResponse,
  AiKnowledgeBaseBffService,
  // GetAIKnowledgeBaseByIdResponse,
  SearchAIKnowledgeBaseResponse
} from 'src/app/shared/generated'
import { ofType } from '@ngrx/effects'
import { AiContextDetailsActions } from './ai-context-details.actions'
import { ReplaySubject, of, throwError } from 'rxjs'
import { AiContextDetailsEffects } from './ai-context-details.effects'
import { provideMockActions } from '@ngrx/effects/testing'
import { HttpResponse } from '@angular/common/http'
import { selectBackNavigationPossible } from 'src/app/shared/selectors/onecx.selectors'
import { selectRouteParam } from 'src/app/shared/selectors/router.selectors'
import { routerNavigatedAction } from '@ngrx/router-store'
import { AutoCompleteModule } from 'primeng/autocomplete'
import { MultiSelectModule } from 'primeng/multiselect'
import { InputTextModule } from 'primeng/inputtext'

describe('AiContextDetailsComponent', () => {
  const origAddEventListener = window.addEventListener
  const origPostMessage = window.postMessage

  let listeners: any[] = []
  window.addEventListener = (_type: any, listener: any) => {
    listeners.push(listener)
  }

  window.removeEventListener = (_type: any, listener: any) => {
    listeners = listeners.filter((l) => l !== listener)
  }

  window.postMessage = (m: any) => {
    listeners.forEach((l) =>
      l({
        data: m,
        stopImmediatePropagation: () => {},
        stopPropagation: () => {}
      })
    )
  }

  const mockActivatedRoute = {
    snapshot: {
      data: {}
    }
  }

  afterAll(() => {
    window.addEventListener = origAddEventListener
    window.postMessage = origPostMessage
  })

  let component: AiContextDetailsComponent
  let fixture: ComponentFixture<AiContextDetailsComponent>
  let store: MockStore<Store>
  let breadcrumbService: BreadcrumbService
  let AiContextDetails: AiContextDetailsHarness
  let effects: AiContextDetailsEffects
  let actions$: ReplaySubject<any>
  let aiContextService: jest.Mocked<AIContextBffService>
  let aiKnowledgeBaseService: jest.Mocked<AiKnowledgeBaseBffService>
  let portalDialogService: jest.Mocked<PortalDialogService>
  let messageService: jest.Mocked<PortalMessageService>
  let router: jest.Mocked<Router>

  const baseAiContextDetailsViewModel: AiContextDetailsViewModel = {
    details: {
      id: 'string',
      appId: 'string',
      name: 'string',
      description: 'string',
      modificationCount: -2147483648,
      modificationUser: 'string',
      creationUser: 'string',
      AIKnowledgeBase: {
        modificationCount: -2147483648,
        id: 'string',
        name: 'string',
        description: 'string',
        aiContext: []
      },
      provider: {
        modificationCount: -2147483648,
        id: 'string',
        name: 'string',
        description: 'string',
        llmUrl: 'string',
        appId: 'string',
        modelName: 'string',
        modelVersion: 'string',
        apiKey: 'string'
      },
      aIKnowledgeVectorDb: {
        modificationCount: -2147483648,
        id: 'string',
        name: 'string',
        description: 'string',
        vdb: 'string',
        vdbCollection: 'string',
        aiContext: {}
      },
      aIKnowledgeUrl: [
        {
          modificationCount: -2147483648,
          modificationUser: 'string',
          creationUser: 'string',
          id: 'string',
          url: 'string',
          name: 'string',
          description: 'string'
        }
      ],
      aIKnowledgeDbs: [
        {
          modificationCount: -2147483648,
          modificationUser: 'string',
          id: 'string',
          name: 'string',
          description: 'string',
          db: 'string',
          user: 'string',
          pwd: 'string',
          tables: ['string']
        }
      ],
      aIKnowledgeDocuments: [
        {
          modificationCount: -2147483648,
          id: 'string',
          name: 'string',
          documentRefId: 'string',
          status: AIKnowledgeDocumentStatusEnum.New
        }
      ]
    },
    detailsLoaded: true,
    detailsLoadingIndicator: false,
    aiProviders: [
      {
        modificationCount: -2147483648,
        id: 'string',
        name: 'string',
        description: 'string',
        llmUrl: 'string',
        appId: 'string',
        modelName: 'string',
        modelVersion: 'string',
        apiKey: 'string'
      }
    ],
    aiProvidersLoaded: false,
    aiProvidersLoadingIndicator: false,
    aiKnowledgeBases: [
      {
        modificationCount: -2147483648,
        id: 'string',
        name: 'string',
        description: 'string',
        aiContext: []
      }
    ],
    aiKnowledgeBasesLoaded: false,
    aiKnowledgeBasesLoadingIndicator: false,
    aiKnowledgeVectorDbs: [
      {
        modificationCount: -2147483648,
        id: 'string',
        name: 'string',
        description: 'string',
        vdb: 'string',
        vdbCollection: 'string',
        aiContext: {}
      }
    ],
    aiKnowledgeVectorDbsLoaded: false,
    aiKnowledgeVectorDbsLoadingIndicator: false,
    backNavigationPossible: true,
    editMode: false,
    isSubmitting: false
  }

  beforeEach(async () => {
    actions$ = new ReplaySubject(1)
    aiContextService = {
      getAIContextById: jest.fn(),
      updateAIContext: jest.fn(),
      deleteAIContext: jest.fn(),
      searchAIContexts: jest.fn()
    } as unknown as jest.Mocked<AIContextBffService>

    aiKnowledgeBaseService = {
      searchAIKnowledgeBases: jest.fn()
    } as unknown as jest.Mocked<AiKnowledgeBaseBffService>

    portalDialogService = {
      openDialog: jest.fn()
    } as unknown as jest.Mocked<PortalDialogService>

    const mockId = '123'
    router = {
      events: of(),
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      parseUrl: jest.fn().mockImplementation((url: string) => ({
        queryParams: {},
        fragment: null,
        toString: () => url,
        url
      })),
      createUrlTree: jest.fn().mockImplementation((commands: any[]) => ({
        toString: () => commands.join('/')
      })),
      isActive: jest.fn(),
      serializeUrl: jest.fn().mockImplementation((urlTree: any) => urlTree.toString()),
      routerState: {
        root: {
          component: AiContextDetailsComponent,
          firstChild: {
            component: AiContextDetailsComponent,
            paramMap: new Map([['id', mockId]]),
            url: '',
            urlSegments: [],
            outlet: 'primary',
            params: {},
            queryParams: {},
            fragment: null,
            data: {},
            children: []
          }
        },
        snapshot: {
          url: '',
          root: {
            component: AiContextDetailsComponent,
            firstChild: {
              component: AiContextDetailsComponent,
              paramMap: new Map([['id', mockId]]),
              url: '',
              urlSegments: [],
              outlet: 'primary',
              params: {},
              queryParams: {},
              fragment: null,
              data: {},
              children: []
            }
          }
        }
      }
    } as unknown as jest.Mocked<Router>

    messageService = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<PortalMessageService>

    await TestBed.configureTestingModule({
      declarations: [AiContextDetailsComponent],
      imports: [
        PortalCoreModule,
        LetDirective,
        FormsModule,
        ReactiveFormsModule,
        AutoCompleteModule,
        MultiSelectModule,
        InputTextModule,
        TranslateTestingModule.withTranslations('en', require('./../../../../assets/i18n/en.json')).withTranslations(
          'de',
          require('./../../../../assets/i18n/de.json')
        ),
        HttpClientTestingModule
      ],
      providers: [
        AiContextDetailsEffects,
        provideMockStore({
          initialState: { AiContext: { details: initialState, backNavigationPossible: true } }
        }),
        provideMockActions(() => actions$),

        BreadcrumbService,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AIContextBffService, useValue: aiContextService },
        { provide: AiKnowledgeBaseBffService, useValue: aiKnowledgeBaseService },
        { provide: Router, useValue: router },
        { provide: PortalMessageService, useValue: messageService },
        { provide: PortalDialogService, useValue: portalDialogService }
      ]
    }).compileComponents()

    effects = TestBed.inject(AiContextDetailsEffects)
    effects.displayError$.subscribe()

    const userService = TestBed.inject(UserService)
    userService.hasPermission = () => true
    const translateService = TestBed.inject(TranslateService)
    translateService.use('en')

    store = TestBed.inject(MockStore)
    store.overrideSelector(selectAiContextDetailsViewModel, baseAiContextDetailsViewModel)
    store.refreshState()

    fixture = TestBed.createComponent(AiContextDetailsComponent)
    component = fixture.componentInstance
    breadcrumbService = TestBed.inject(BreadcrumbService)
    fixture.detectChanges()
    AiContextDetails = await TestbedHarnessEnvironment.harnessForFixture(fixture, AiContextDetailsHarness)
  })

  describe('AiContextDetailsEffects', () => {
    describe('saveButtonClicked$', () => {
      it('should handle saveButtonClicked$ and dispatch saveAiContextSucceeded on success', (done) => {
        const details = { id: '123', name: 'Test DB' }
        const res = new HttpResponse<UpdateAIContextResponse>({
          body: { dataObject: { name: 'updated name' } },
          status: 200
        })

        aiContextService.updateAIContext.mockReturnValue(of(res))

        store.overrideSelector(aiContextDetailsSelectors.selectDetails, {
          id: '123',
          name: 'Original Name'
        })
        store.refreshState()

        actions$.next(AiContextDetailsActions.saveButtonClicked({ details }))

        effects.saveButtonClicked$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.updateAiContextSucceeded())
          done()
        })
      })

      it('should handle saveButtonClicked$ and dispatch saveAiContextFailed on error', (done) => {
        const details = { id: '123', name: 'Test DB' }
        const error = 'Save failed'

        aiContextService.updateAIContext.mockReturnValue(throwError(() => error))
        actions$.next(AiContextDetailsActions.saveButtonClicked({ details }))

        effects.saveButtonClicked$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.updateAiContextFailed({ error }))
          done()
        })
      })

      it('should handle saveButtonClicked$ with undefined itemToEditId and dispatch updateAiContextCancelled', (done) => {
        const details = { name: 'Test DB' } as any
        store.overrideSelector(aiContextDetailsSelectors.selectDetails, details)
        store.refreshState()

        actions$.next(AiContextDetailsActions.saveButtonClicked({ details: { name: 'Updated Name' } } as any))

        effects.saveButtonClicked$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.updateAiContextCancelled())
          done()
        })
      })

      it('should handle saveButtonClicked$ and dispatch updateAiContextCancelled on success if details is undefined', (done) => {
        const details = { id: '123', name: 'Test DB' }
        const error = 'Update failed'

        store.overrideSelector(aiContextDetailsSelectors.selectDetails, undefined)
        store.refreshState()

        aiContextService.deleteAIContext.mockReturnValue(throwError(() => error))

        actions$.next(AiContextDetailsActions.saveButtonClicked({ details }))

        effects.saveButtonClicked$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.updateAiContextCancelled())
          done()
        })
      })
    })

    describe('deleteButtonClicked$', () => {
      it('should handle deleteButtonClicked$ and dispatch deleteAiContextSucceeded on success', (done) => {
        const res = new HttpResponse({ status: 204 })
        const details = { id: '123', name: 'Test Item', description: 'Test Description' }

        store.overrideSelector(aiContextDetailsSelectors.selectDetails, details)
        store.refreshState()

        portalDialogService.openDialog.mockReturnValue(
          of({
            button: 'primary',
            data: details,
            result: []
          })
        )

        aiContextService.deleteAIContext.mockReturnValue(of(res))
        actions$.next(AiContextDetailsActions.deleteButtonClicked())

        effects.deleteButtonClicked$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.deleteAiContextSucceeded())
          done()
        })
      })

      it('should handle deleteButtonClicked$ and dispatch deleteAiContextFailed on error', (done) => {
        const error = 'Delete failed'
        const mockItemToDelete = {
          id: '123',
          name: 'Test Item',
          description: 'Test Description'
        }

        portalDialogService.openDialog.mockReturnValue(
          of({
            button: 'primary',
            data: mockItemToDelete,
            result: []
          })
        )
        aiContextService.deleteAIContext.mockReturnValue(throwError(() => error))

        store.overrideSelector(aiContextDetailsSelectors.selectDetails, mockItemToDelete)
        store.refreshState()

        actions$.next(AiContextDetailsActions.deleteButtonClicked())

        effects.deleteButtonClicked$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.deleteAiContextFailed({ error }))
          done()
        })
      })

      it('should handle deleteButtonClicked$ and dispatch deleteAiContextCancelled on cancel', (done) => {
        const mockItemToDelete = {
          id: '123',
          name: 'Test Item',
          description: 'Test Description'
        }

        portalDialogService.openDialog.mockReturnValue(
          of({
            button: 'secondary',
            data: mockItemToDelete,
            result: []
          })
        )
        store.overrideSelector(aiContextDetailsSelectors.selectDetails, mockItemToDelete)
        store.refreshState()

        actions$.next(AiContextDetailsActions.deleteButtonClicked())

        effects.deleteButtonClicked$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.deleteAiContextCancelled())
          done()
        })
      })

      it('should handle deleteButtonClicked$ and throw an error on item not found', (done) => {
        const mockItemToDelete = undefined

        portalDialogService.openDialog.mockReturnValue(
          of({
            button: 'primary',
            data: mockItemToDelete,
            result: []
          })
        )
        store.overrideSelector(aiContextDetailsSelectors.selectDetails, mockItemToDelete)
        store.refreshState()

        actions$.next(AiContextDetailsActions.deleteButtonClicked())

        effects.deleteButtonClicked$.subscribe({
          next: () => {
            fail('Expected error to be thrown')
          },
          error: (err) => {
            expect(err.message).toBe('Item to delete or its ID not found!')
            done()
          }
        })
      })

      it('should navigate to parent route on delete success', (done) => {
        const mockUrl = '/some/path/to/item'
        const expectedUrl = '/some/path'

        router.navigate = jest.fn()
        store.select = jest.fn().mockReturnValue(of(mockUrl))

        actions$.next(AiContextDetailsActions.deleteAiContextSucceeded())

        effects.deleteAiContextSucceeded$.subscribe(() => {
          expect(router.navigate).toHaveBeenCalledWith([expectedUrl])
          done()
        })
      })
    })

    describe('navigatedToDetailsPage$', () => {
      it('should dispatch navigatedToDetailsPage with id', (done) => {
        const mockId = '123'
        const mockAction = routerNavigatedAction({
          payload: {
            event: {
              urlAfterRedirects: '',
              type: EventType.NavigationEnd,
              id: 0,
              url: ''
            },
            routerState: {
              root: new ActivatedRouteSnapshot(),
              url: ''
            }
          }
        })

        store.overrideSelector(selectRouteParam('id'), mockId)
        store.refreshState()

        actions$.next(mockAction)
        effects.navigatedToDetailsPage$.subscribe((action) => {
          expect(action.type).toEqual(AiContextDetailsActions.navigatedToDetailsPage({ id: mockId }).type)
          done()
        })
      })
    })

    // TODO: add tests for aiProviders$ and aiKnowledgeVectorDbs$
    describe('searchAIKnowledgeBases$', () => {
      it('should dispatch aiContextDetailsReceived on successful loadItemById$', (done) => {
        const details = { id: '123' }
        const res = new HttpResponse<GetAIContextByIdResponse>({
          body: { result: details },
          status: 200
        })

        aiContextService.getAIContextById.mockReturnValue(of(res.body as any))
        actions$.next(AiContextDetailsActions.navigatedToDetailsPage({ id: '123' }))

        effects.loadAiContextById$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.aiContextDetailsReceived({ details }))
          done()
        })
      })

      it('should dispatch aiContextDetailsLoadingFailed on failed loadItemById$', (done) => {
        aiContextService.getAIContextById.mockReturnValue(throwError(() => 'fail'))
        actions$.next(AiContextDetailsActions.navigatedToDetailsPage({ id: '123' }))

        effects.loadAiContextById$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.aiContextDetailsLoadingFailed({ error: 'fail' }))
          done()
        })
      })

      it('should dispatch aiContextAiKnowledgeBasesReceived on successful searchAIKnowledgeBases$', (done) => {
        const knowledgeBases = [{ id: 'kb1', name: 'Knowledge Base 1' }]
        const res = new HttpResponse<SearchAIKnowledgeBaseResponse>({
          body: { stream: knowledgeBases, size: 1, number: 1, totalElements: 1, totalPages: 1 },
          status: 200
        })

        aiKnowledgeBaseService.searchAIKnowledgeBases.mockReturnValue(of(res.body as any))
        actions$.next(AiContextDetailsActions.navigatedToDetailsPage({ id: '123' }))

        effects.loadAIKnowledgeBases$.subscribe((action) => {
          expect(action).toEqual(
            AiContextDetailsActions.aiContextAiKnowledgeBasesReceived({
              aiKnowledgeBases: knowledgeBases
            })
          )
          done()
        })
      })

      it('should dispatch aiContextAiKnowledgeBasesLoadingFailed on failed searchAIKnowledgeBases$', (done) => {
        aiKnowledgeBaseService.searchAIKnowledgeBases.mockReturnValue(throwError(() => 'fail'))
        actions$.next(AiContextDetailsActions.navigatedToDetailsPage({ id: '123' }))

        effects.loadAIKnowledgeBases$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.aiContextAiKnowledgeBasesLoadingFailed({ error: 'fail' }))
          done()
        })
      })

      it('should load aiContextAiKnowledgeBases and dispatch success action', (done) => {
        const knowledgeBases = [{ id: '1', name: 'Knowledge Base 1' }]
        aiKnowledgeBaseService.searchAIKnowledgeBases.mockReturnValue(of({ stream: knowledgeBases } as any))

        actions$.next(AiContextDetailsActions.navigatedToDetailsPage({ id: '123' }))

        effects.loadAIKnowledgeBases$.subscribe((action) => {
          expect(aiKnowledgeBaseService.searchAIKnowledgeBases).toHaveBeenCalled()
          expect(action).toEqual(
            AiContextDetailsActions.aiContextAiKnowledgeBasesReceived({
              aiKnowledgeBases: knowledgeBases
            })
          )
          done()
        })
      })

      it('should handle error when loading aiContextAiKnowledgeBases fails', (done) => {
        const error = 'Failed to load contexts'
        aiKnowledgeBaseService.searchAIKnowledgeBases.mockReturnValue(throwError(() => error))

        actions$.next(AiContextDetailsActions.navigatedToDetailsPage({ id: '123' }))

        effects.loadAIKnowledgeBases$.subscribe((action) => {
          expect(aiKnowledgeBaseService.searchAIKnowledgeBases).toHaveBeenCalled()
          expect(action).toEqual(
            AiContextDetailsActions.aiContextAiKnowledgeBasesLoadingFailed({
              error
            })
          )
          done()
        })
      })
    })

    describe('cancelButtonClick', () => {
      it('should dispatch cancelEditNotDirty if cancelButtonClicked with dirty=false', (done) => {
        actions$.next(AiContextDetailsActions.cancelButtonClicked({ dirty: false }))
        effects.cancelButtonNotDirty$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.cancelEditNotDirty())
          done()
        })
      })

      it('should dispatch cancelEditBackClicked if dialogResult.button is secondary', (done) => {
        portalDialogService.openDialog.mockReturnValue(of({ button: 'secondary', result: [] }))
        actions$.next(AiContextDetailsActions.cancelButtonClicked({ dirty: true }))
        effects.cancelButtonClickedDirty$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.cancelEditBackClicked())
          done()
        })
      })

      it('should dispatch cancelEditConfirmClicked if dialogResult.button is not secondary', (done) => {
        portalDialogService.openDialog.mockReturnValue(of({ button: 'primary', result: [] }))
        actions$.next(AiContextDetailsActions.cancelButtonClicked({ dirty: true }))
        effects.cancelButtonClickedDirty$.subscribe((action) => {
          expect(action).toEqual(AiContextDetailsActions.cancelEditConfirmClicked())
          done()
        })
      })

      it('should handle secondary button click in dialog - dirty', (done) => {
        portalDialogService.openDialog.mockReturnValue(of({ button: 'secondary' } as any))

        actions$.next(AiContextDetailsActions.cancelButtonClicked({ dirty: true }))

        effects.cancelButtonClickedDirty$.subscribe((action) => {
          expect(portalDialogService.openDialog).toHaveBeenCalled()
          expect(action).toEqual(AiContextDetailsActions.cancelEditBackClicked())
          done()
        })
      })

      it('should handle primary button click in dialog - dirty', (done) => {
        portalDialogService.openDialog.mockReturnValue(of({ button: 'primary' } as any))

        actions$.next(AiContextDetailsActions.cancelButtonClicked({ dirty: true }))

        effects.cancelButtonClickedDirty$.subscribe((action) => {
          expect(portalDialogService.openDialog).toHaveBeenCalled()
          expect(action).toEqual(AiContextDetailsActions.cancelEditConfirmClicked())
          done()
        })
      })
    })

    describe('displayError$', () => {
      const testCases = [
        {
          description: 'should show error message for details loading failure',
          action: AiContextDetailsActions.aiContextDetailsLoadingFailed({
            error: 'Test error'
          }),
          expectedKey: 'AI_CONTEXT_DETAILS.ERROR_MESSAGES.DETAILS_LOADING_FAILED'
        },
        {
          description: 'should show error message for aiKnowledgeBases loading failure',
          action: AiContextDetailsActions.aiContextAiKnowledgeBasesLoadingFailed({
            error: 'Test error'
          }),
          expectedKey: 'AI_KNOWLEDGE_BASE_SEARCH.ERROR_MESSAGES.SEARCH_RESULTS_LOADING_FAILED'
        }
      ]

      testCases.forEach(({ description, action, expectedKey }) => {
        it(description, (done) => {
          const errorSpy = jest.spyOn(messageService, 'error')

          actions$.next(action)

          setTimeout(() => {
            try {
              expect(errorSpy).toHaveBeenCalledWith({
                summaryKey: expectedKey
              })
              done()
            } catch (e) {
              done(e)
            }
          }, 0)
        })
      })

      it('should not show error message for unhandled actions', (done) => {
        const errorSpy = jest.spyOn(messageService, 'error')

        const unhandledAction = { type: '[Test] Unhandled Action' }
        actions$.next(unhandledAction as any)

        setTimeout(() => {
          try {
            expect(errorSpy).not.toHaveBeenCalled()
            done()
          } catch (e) {
            done(e)
          }
        }, 0)
      })
    })

    describe('navigateBack$', () => {
      let backSpy: jest.SpyInstance

      beforeEach(() => {
        backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {})
      })

      afterEach(() => {
        backSpy.mockRestore()
      })

      it('should navigate back when back navigation is possible', (done) => {
        store.overrideSelector(selectBackNavigationPossible, true)
        const action = AiContextDetailsActions.navigateBackButtonClicked()

        actions$.next(action)

        effects.navigateBack$.subscribe((result) => {
          expect(backSpy).toHaveBeenCalled()
          expect(result).toEqual(AiContextDetailsActions.backNavigationStarted())
          done()
        })
      })

      it('should dispatch backNavigationFailed when back navigation is not possible', (done) => {
        store.overrideSelector(selectBackNavigationPossible, false)
        const action = AiContextDetailsActions.navigateBackButtonClicked()

        actions$.next(action)

        effects.navigateBack$.subscribe((result) => {
          expect(backSpy).not.toHaveBeenCalled()
          expect(result).toEqual(AiContextDetailsActions.backNavigationFailed())
          done()
        })
      })
    })

    it('should create', () => {
      expect(component).toBeTruthy()
    })

    it('should display correct breadcrumbs', async () => {
      jest.spyOn(breadcrumbService, 'setItems')

      component.ngOnInit()
      fixture.detectChanges()

      expect(breadcrumbService.setItems).toHaveBeenCalledTimes(1)
      const pageHeader = await AiContextDetails.getHeader()
      const searchBreadcrumbItem = await pageHeader.getBreadcrumbItem('Details')
      expect(await searchBreadcrumbItem!.getText()).toEqual('Details')
    })

    it('should display translated headers', async () => {
      const pageHeader = await AiContextDetails.getHeader()
      expect(await pageHeader.getHeaderText()).toEqual('AiContext Details')
      expect(await pageHeader.getSubheaderText()).toEqual('Display of AiContext Details')
    })

    it('should have 2 inline actions', async () => {
      const pageHeader = await AiContextDetails.getHeader()
      const inlineActions = await pageHeader.getInlineActionButtons()
      expect(inlineActions.length).toBe(2)

      const backAction = await pageHeader.getInlineActionButtonByLabel('Back')
      expect(backAction).toBeTruthy()

      const editAction = await pageHeader.getInlineActionButtonByLabel('Edit')
      expect(editAction).toBeTruthy()
    })

    it('should navigate back on back button click', async () => {
      jest.spyOn(window.history, 'back')
      const doneFn = jest.fn()

      const pageHeader = await AiContextDetails.getHeader()
      const backAction = await pageHeader.getInlineActionButtonByLabel('Back')
      store.scannedActions$.pipe(ofType(AiContextDetailsActions.navigateBackButtonClicked)).subscribe(() => {
        doneFn()
      })
      await backAction?.click()
      expect(doneFn).toHaveBeenCalledTimes(1)
    })

    // it('should display item details in form fields', async () => {
    //   store.overrideSelector(selectAiContextDetailsViewModel, baseAiContextDetailsViewModel)
    //   store.refreshState()

    //   fixture.detectChanges()
    //   await fixture.whenStable()

    //   if (!component.formGroup) {
    //     component.ngOnInit()
    //     fixture.detectChanges()
    //     await fixture.whenStable()
    //   }

    //   const pageDetails = component.formGroup.value
    //   expect(pageDetails).toEqual({
    //     ...baseAiContextDetailsViewModel.details,
    //     aiContext: component.getContextFormValue(
    //       baseAiContextDetailsViewModel.details?.aiContext ? [baseAiContextDetailsViewModel.details?.aiContext] : []
    //     )[0]
    //   })
    // })

    // it('should display item details in page header', async () => {
    //   component.headerLabels$ = of([
    //     {
    //       label: 'first',
    //       value: 'first value'
    //     },
    //     {
    //       label: 'second',
    //       value: 'second value'
    //     },
    //     {
    //       label: 'third',
    //       icon: PrimeIcons.PLUS
    //     },
    //     {
    //       label: 'fourth',
    //       value: 'fourth value',
    //       icon: PrimeIcons.QUESTION
    //     }
    //   ])

    //   const pageHeader = await AiContextDetails.getHeader()
    //   const objectDetails = await pageHeader.getObjectInfos()
    //   expect(objectDetails.length).toBe(4)

    //   const firstDetailItem = await pageHeader.getObjectInfoByLabel('first')
    //   expect(await firstDetailItem?.getLabel()).toEqual('first')
    //   expect(await firstDetailItem?.getValue()).toEqual('first value')
    //   expect(await firstDetailItem?.getIcon()).toBeUndefined()

    //   const secondDetailItem = await pageHeader.getObjectInfoByLabel('second')
    //   expect(await secondDetailItem?.getLabel()).toEqual('second')
    //   expect(await secondDetailItem?.getValue()).toEqual('second value')
    //   expect(await secondDetailItem?.getIcon()).toBeUndefined()

    //   const thirdDetailItem = await pageHeader.getObjectInfoByLabel('third')
    //   expect(await thirdDetailItem?.getLabel()).toEqual('third')
    //   expect(await thirdDetailItem?.getValue()).toEqual('')
    //   expect(await thirdDetailItem?.getIcon()).toEqual(PrimeIcons.PLUS)

    //   const fourthDetailItem = await pageHeader.getObjectInfoByLabel('fourth')
    //   expect(await fourthDetailItem?.getLabel()).toEqual('fourth')
    //   expect(await fourthDetailItem?.getValue()).toEqual('fourth value')
    //   expect(await fourthDetailItem?.getIcon()).toEqual(PrimeIcons.QUESTION)
    // })

    // it('should enable or disable the form based on editMode', async () => {
    //   const viewModelView = {
    //     ...baseAiContextDetailsViewModel,
    //     editMode: false
    //   }
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModelView)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   await fixture.whenStable()
    //   expect(component.formGroup.disabled).toBeTruthy()

    //   const viewModelEdit = {
    //     ...baseAiContextDetailsViewModel,
    //     editMode: true
    //   }
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModelEdit)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   await fixture.whenStable()
    //   expect(component.formGroup.enabled).toBeTruthy()
    // })

    // it('should show the correct actions for edit and view modes', async () => {
    //   const viewModelView = {
    //     ...baseAiContextDetailsViewModel,
    //     editMode: false
    //   }
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModelView)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   await fixture.whenStable()
    //   let actions: any[] = []
    //   component.headerActions$.subscribe((a) => (actions = a))
    //   const visibleActionsView = actions.filter((a) => a.showCondition)
    //   const actionLabelsView = visibleActionsView.map((a) => a.labelKey)
    //   expect(actionLabelsView).toContain('AI_CONTEXT_DETAILS.GENERAL.BACK')
    //   expect(actionLabelsView).toContain('AI_CONTEXT_DETAILS.GENERAL.EDIT')
    //   expect(actionLabelsView).not.toContain('AI_CONTEXT_DETAILS.GENERAL.SAVE')
    //   expect(actionLabelsView).not.toContain('AI_CONTEXT_DETAILS.GENERAL.CANCEL')

    //   const viewModelEdit = {
    //     ...baseAiContextDetailsViewModel,
    //     editMode: true
    //   }
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModelEdit)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   await fixture.whenStable()
    //   actions = []
    //   component.headerActions$.subscribe((a) => (actions = a))
    //   const visibleActionsEdit = actions.filter((a) => a.showCondition)
    //   const actionLabelsEdit = visibleActionsEdit.map((a) => a.labelKey)
    //   expect(actionLabelsEdit).toContain('AI_CONTEXT_DETAILS.GENERAL.SAVE')
    //   expect(actionLabelsEdit).toContain('AI_CONTEXT_DETAILS.GENERAL.CANCEL')
    //   expect(actionLabelsEdit).not.toContain('AI_CONTEXT_DETAILS.GENERAL.BACK')
    //   expect(actionLabelsEdit).not.toContain('AI_CONTEXT_DETAILS.GENERAL.EDIT')
    // })

    // it('should dispatch edit action when edit() is called', () => {
    //   const dispatchSpy = jest.spyOn(store, 'dispatch')
    //   component.edit()
    //   expect(dispatchSpy).toHaveBeenCalledWith(AiContextDetailsActions.editButtonClicked())
    // })

    // it('should dispatch navigate back action when goBack() is called', () => {
    //   const dispatchSpy = jest.spyOn(store, 'dispatch')
    //   component.goBack()
    //   expect(dispatchSpy).toHaveBeenCalledWith(AiContextDetailsActions.navigateBackButtonClicked())
    // })

    // it('should dispatch cancel action with dirty state when cancel() is called', () => {
    //   const dispatchSpy = jest.spyOn(store, 'dispatch')
    //   component.formGroup.markAsDirty()
    //   component.cancel()
    //   expect(dispatchSpy).toHaveBeenCalledWith(AiContextDetailsActions.cancelButtonClicked({ dirty: true }))
    // })

    // it('should dispatch save action with form values when save() is called', () => {
    //   const dispatchSpy = jest.spyOn(store, 'dispatch')
    //   component.formGroup.setValue({
    //     id: 'id',
    //     name: 'name',
    //     description: 'desc'
    //   })
    //   component.save()
    //   expect(dispatchSpy).toHaveBeenCalledWith(
    //     AiContextDetailsActions.saveButtonClicked({
    //       details: {
    //         id: 'id',
    //         name: 'name',
    //         description: 'desc'
    //       }
    //     })
    //   )
    // })

    // it('should dispatch delete action when delete() is called', () => {
    //   const dispatchSpy = jest.spyOn(store, 'dispatch')
    //   component.delete()
    //   expect(dispatchSpy).toHaveBeenCalledWith(AiContextDetailsActions.deleteButtonClicked())
    // })

    // it('should call breadcrumbService.setItems on ngOnInit', () => {
    //   const breadcrumbSpy = jest.spyOn(breadcrumbService, 'setItems')
    //   component.ngOnInit()
    //   expect(breadcrumbSpy).toHaveBeenCalledWith([
    //     {
    //       titleKey: 'AI_CONTEXT_DETAILS.BREADCRUMB',
    //       labelKey: 'AI_CONTEXT_DETAILS.BREADCRUMB',
    //       routerLink: '/ai-context'
    //     }
    //   ])
    // })

    // it('should execute actionCallback for each header action', () => {
    //   const editSpy = jest.spyOn(component, 'edit')
    //   const goBackSpy = jest.spyOn(component, 'goBack')
    //   const cancelSpy = jest.spyOn(component, 'cancel')
    //   const saveSpy = jest.spyOn(component, 'save')
    //   const deleteSpy = jest.spyOn(component, 'delete')

    //   const viewModelView = {
    //     ...baseAiContextDetailsViewModel,
    //     editMode: false
    //   }
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModelView)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   let actions: any[] = []
    //   component.headerActions$.subscribe((a) => (actions = a))
    //   actions.forEach((action) => {
    //     if (typeof action.actionCallback === 'function') {
    //       action.actionCallback()
    //     }
    //   })
    //   expect(editSpy).toHaveBeenCalled()
    //   expect(goBackSpy).toHaveBeenCalled()
    //   expect(cancelSpy).toHaveBeenCalled()
    //   expect(saveSpy).toHaveBeenCalled()
    //   expect(deleteSpy).toHaveBeenCalled()

    //   const viewModelEdit = {
    //     ...baseAiContextDetailsViewModel,
    //     editMode: true
    //   }
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModelEdit)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   actions = []
    //   component.headerActions$.subscribe((a) => (actions = a))
    //   actions.forEach((action) => {
    //     if (typeof action.actionCallback === 'function') {
    //       action.actionCallback()
    //     }
    //   })
    //   expect(cancelSpy).toHaveBeenCalled()
    //   expect(saveSpy).toHaveBeenCalled()
    // })

    // it('should dispatch cancel action with pristine state when cancel() is called', () => {
    //   const dispatchSpy = jest.spyOn(store, 'dispatch')
    //   component.formGroup.markAsPristine()
    //   component.cancel()
    //   expect(dispatchSpy).toHaveBeenCalledWith(AiContextDetailsActions.cancelButtonClicked({ dirty: false }))
    // })

    // it('should patch the form with details and matched context', () => {
    //   const context = { id: 'ctx1', name: 'Context 1' } as any
    //   const details = { ...baseAiContextDetailsViewModel.details, aiContext: context } as any
    //   const viewModel = {
    //     ...baseAiContextDetailsViewModel,
    //     details,
    //     editMode: false,
    //     contexts: [context]
    //   } as any
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModel)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   expect(component.formGroup.value.id).toBe(details.id)
    //   expect(component.formGroup.value.aiContext.value).toEqual(context)
    // })

    // // it('should emit correct displayContexts$ for details with aiContext', (done) => {
    // //   const context = { value: [{ id: 'ctx1' }], name: 'Context 1' } as any
    // //   const details = { ...baseAiContextDetailsViewModel.details, aiContext: context } as any
    // //   const viewModel = { ...baseAiContextDetailsViewModel, details, contexts: [context] } as any
    // //   store.overrideSelector(selectAiContextDetailsViewModel, viewModel)
    // //   store.refreshState()
    // //   fixture.detectChanges()
    // //   component.displayContexts$.subscribe((contexts) => {
    // //     expect(contexts.length).toBeGreaterThan(0)
    // //     expect(contexts[0].value).toEqual(context)
    // //     done()
    // //   })
    // // })

    // it('should handle missing details gracefully', () => {
    //   const viewModel = { ...baseAiContextDetailsViewModel, details: undefined } as any
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModel)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   expect(component.formGroup.value.id).toBe('')
    // })

    // it('should handle empty contexts array gracefully', () => {
    //   const details = { ...baseAiContextDetailsViewModel.details, aiContext: { name: '', value: {} } } as any
    //   const viewModel = { ...baseAiContextDetailsViewModel, details, contexts: [] } as any
    //   store.overrideSelector(selectAiContextDetailsViewModel, viewModel)
    //   store.refreshState()
    //   fixture.detectChanges()
    //   expect(component.formGroup.value.aiContext).toStrictEqual({ label: 'undefined:', value: { name: '', value: {} } })
    // })

    // describe('aiContextDetailsReducer (integration)', () => {
    //   it('should return the initial state for an unknown action', () => {
    //     const action = { type: 'Unknown' } as any
    //     const state = aiContextDetailsReducer(undefined, action)
    //     expect(state).toBe(initialState)
    //   })

    //   it('should handle aiContextDetailsReceived', () => {
    //     const details = {
    //       id: '1',
    //       name: 'Test',
    //       description: '',
    //       aiContext: { id: 'ctx', name: 'Context' },
    //       vdb: '',
    //       vdbCollection: '',
    //       modificationCount: 0
    //     }
    //     const action = AiContextDetailsActions.aiContextDetailsReceived({ details })
    //     const state = aiContextDetailsReducer(initialState, action)
    //     expect(state.details).toEqual(details)
    //     expect(state.detailsLoadingIndicator).toBe(false)
    //     expect(state.detailsLoaded).toBe(true)
    //   })

    //   it('should handle aiContextDetailsLoadingFailed', () => {
    //     const preState: AiContextDetailsState = {
    //       ...initialState,
    //       details: {
    //         id: '2',
    //         name: 'Old',
    //         description: '',
    //         aIKnowledgeDbs: [
    //           {
    //             id: 'ctx',
    //             name: 'Context',
    //             db: '',
    //             user: '',
    //             pwd: ''
    //           }
    //         ]
    //       },
    //       detailsLoadingIndicator: true,
    //       detailsLoaded: true
    //     }
    //     const action = AiContextDetailsActions.aiContextDetailsLoadingFailed({ error: null })
    //     const state = aiContextDetailsReducer(preState, action)
    //     expect(state.details).toEqual(initialState.details)
    //     expect(state.detailsLoadingIndicator).toBe(false)
    //     expect(state.detailsLoaded).toBe(false)
    //   })

    //   it('should handle aiContextAiKnowledgeBasesReceived', () => {
    //     const aiknowledgeBases = [{ id: 'ctx1', name: 'Context 1' }]
    //     const action = AiContextDetailsActions.aiContextAiKnowledgeBasesReceived({ aiKnowledgeBases: aiknowledgeBases })
    //     const state = aiContextDetailsReducer(initialState, action)
    //     expect(state.aiKnowledgeBases).toEqual(aiknowledgeBases)
    //     expect(state.aiKnowledgeBasesLoadingIndicator).toBe(false)
    //     expect(state.aiKnowledgeBasesLoaded).toBe(true)
    //   })

    //   it('should handle aiContextAiKnowledgeBasesLoadingFailed', () => {
    //     const preState: AiContextDetailsState = {
    //       ...initialState,
    //       aiKnowledgeBases: [{ id: 'ctx2', name: 'Old Context' }],
    //       aiKnowledgeBasesLoadingIndicator: true,
    //       aiKnowledgeBasesLoaded: true
    //     }
    //     const action = AiContextDetailsActions.aiContextAiKnowledgeBasesLoadingFailed({ error: null })
    //     const state = aiContextDetailsReducer(preState, action)
    //     expect(state.aiKnowledgeBases).toEqual(initialState.aiKnowledgeBases)
    //     expect(state.aiKnowledgeBasesLoadingIndicator).toBe(false)
    //     expect(state.aiKnowledgeBasesLoaded).toBe(false)
    //   })

    //   it('should handle navigatedToDetailsPage', () => {
    //     const preState: AiContextDetailsState = {
    //       ...initialState,
    //       details: {
    //         id: '2',
    //         name: 'Old',
    //         description: '',
    //         aIKnowledgeDbs: [
    //           {
    //             id: 'ctx',
    //             name: 'Context',
    //             db: '',
    //             user: '',
    //             pwd: ''
    //           }
    //         ]
    //       },
    //       editMode: true
    //     }
    //     const action = AiContextDetailsActions.navigatedToDetailsPage({ id: undefined })
    //     const state = aiContextDetailsReducer(preState, action)
    //     expect(state).toEqual(initialState)
    //   })

    //   it('should handle editButtonClicked', () => {
    //     const action = AiContextDetailsActions.editButtonClicked()
    //     const state = aiContextDetailsReducer(initialState, action)
    //     expect(state.editMode).toBe(true)
    //   })

    //   it('should handle saveButtonClicked', () => {
    //     const details = {
    //       id: '3',
    //       name: 'Save',
    //       description: '',
    //       aiContext: { id: 'ctx', name: 'Context' },
    //       vdb: '',
    //       vdbCollection: '',
    //       modificationCount: 0
    //     }
    //     const action = AiContextDetailsActions.saveButtonClicked({ details })
    //     const state = aiContextDetailsReducer(initialState, action)
    //     expect(state.details).toEqual(details)
    //     expect(state.editMode).toBe(false)
    //     expect(state.isSubmitting).toBe(true)
    //   })

    //   it('should handle navigateBackButtonClicked', () => {
    //     const action = AiContextDetailsActions.navigateBackButtonClicked()
    //     const state = aiContextDetailsReducer(initialState, action)
    //     expect(state).toEqual(initialState)
    //   })

    //   it('should handle cancelEditConfirmClicked and related actions', () => {
    //     const actions = [
    //       AiContextDetailsActions.cancelEditConfirmClicked(),
    //       AiContextDetailsActions.cancelEditNotDirty(),
    //       AiContextDetailsActions.updateAiContextCancelled(),
    //       AiContextDetailsActions.updateAiContextSucceeded()
    //     ]
    //     actions.forEach((action) => {
    //       const preState: AiContextDetailsState = { ...initialState, editMode: true, isSubmitting: true }
    //       const state = aiContextDetailsReducer(preState, action)
    //       expect(state.editMode).toBe(false)
    //       expect(state.isSubmitting).toBe(false)
    //     })
    //   })

    //   it('should handle updateAiContextFailed', () => {
    //     const preState: AiContextDetailsState = { ...initialState, isSubmitting: true }
    //     const action = AiContextDetailsActions.updateAiContextFailed({ error: null })
    //     const state = aiContextDetailsReducer(preState, action)
    //     expect(state.isSubmitting).toBe(false)
    //   })
    // })

    // describe('AiContextDetails Selectors', () => {
    //   const baseState: any = {
    //     details: {
    //       id: '1',
    //       name: 'Test',
    //       aiContext: { id: 'ctx', name: 'Context' },
    //       vdb: '',
    //       vdbCollection: '',
    //       modificationCount: 0
    //     },
    //     contexts: [{ id: 'ctx', name: 'Context' }],
    //     detailsLoaded: true,
    //     detailsLoadingIndicator: false,
    //     contextsLoaded: true,
    //     contextsLoadingIndicator: false,
    //     backNavigationPossible: true,
    //     editMode: false,
    //     isSubmitting: false
    //   }

    // it('should select the full view model', () => {
    //   const result = selectAiContextDetailsViewModel.projector(
    //     baseState.details,
    //     baseState.contexts,
    //     baseState.detailsLoaded,
    //     baseState.detailsLoadingIndicator,
    //     baseState.contextsLoaded,
    //     baseState.contextsLoadingIndicator,
    //     true,
    //     baseState.editMode,
    //     baseState.isSubmitting
    //   )

    //   expect(result).toEqual({
    //     details: baseState.details,
    //     contexts: baseState.contexts,
    //     detailsLoaded: true,
    //     detailsLoadingIndicator: false,
    //     contextsLoaded: true,
    //     contextsLoadingIndicator: false,
    //     backNavigationPossible: true,
    //     editMode: false,
    //     isSubmitting: false
    //   })
    // })

    // it('should handle undefined details and empty contexts', () => {
    //   const result = selectAiContextDetailsViewModel.projector(
    //     undefined,
    //     [],
    //     false,
    //     true,
    //     false,
    //     true,
    //     false,
    //     true,
    //     false
    //   )
    //   expect(result.details).toBeUndefined()
    //   expect(result.contexts).toEqual([])
    //   expect(result.detailsLoaded).toBe(false)
    //   expect(result.detailsLoadingIndicator).toBe(true)
    // })
    // })
  })
})
