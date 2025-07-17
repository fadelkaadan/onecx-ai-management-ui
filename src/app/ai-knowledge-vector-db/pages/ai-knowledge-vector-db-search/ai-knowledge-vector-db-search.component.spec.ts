import { PrimeIcons } from 'primeng/api'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRoute } from '@angular/router'
import { LetDirective } from '@ngrx/component'
import { ofType } from '@ngrx/effects'
import { Store, StoreModule } from '@ngrx/store'
import { MockStore, provideMockStore } from '@ngrx/store/testing'
import { TranslateService } from '@ngx-translate/core'
import { BreadcrumbService, ColumnType, PortalCoreModule, RowListGridData, UserService } from '@onecx/portal-integration-angular'
import { TranslateTestingModule } from 'ngx-translate-testing'
import { DialogService } from 'primeng/dynamicdialog'
import { AIKnowledgeVectorDbSearchActions } from './ai-knowledge-vector-db-search.actions'
import { AIKnowledgeVectorDbSearchColumns } from './ai-knowledge-vector-db-search.columns'
import { AIKnowledgeVectorDbSearchComponent } from './ai-knowledge-vector-db-search.component'
import { AIKnowledgeVectorDbSearchHarness } from './ai-knowledge-vector-db-search.harness'
import { initialState } from './ai-knowledge-vector-db-search.reducers'
import { selectAIKnowledgeVectorDbSearchViewModel } from './ai-knowledge-vector-db-search.selectors'
import { AIKnowledgeVectorDbSearchViewModel } from './ai-knowledge-vector-db-search.viewmodel'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import * as selectors from './ai-knowledge-vector-db-search.selectors'
describe('AIKnowledgeVectorDbSearchComponent', () => {
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

  afterAll(() => {
    window.addEventListener = origAddEventListener
    window.postMessage = origPostMessage
  })

  HTMLCanvasElement.prototype.getContext = jest.fn()
  let component: AIKnowledgeVectorDbSearchComponent
  let fixture: ComponentFixture<AIKnowledgeVectorDbSearchComponent>
  let store: MockStore<Store>
  let formBuilder: FormBuilder
  let AIKnowledgeVectorDbSearch: AIKnowledgeVectorDbSearchHarness

  const mockActivatedRoute = {
    snapshot: {
      data: {}
    }
  }
  const baseAIKnowledgeVectorDbSearchViewModel: AIKnowledgeVectorDbSearchViewModel = {
    columns: AIKnowledgeVectorDbSearchColumns,
    searchCriteria: {
      name: undefined,
      description: undefined,
      vdb: undefined,
      vdbCollection: undefined,
      id: undefined,
      limit: undefined
    },
    results: [],
    displayedColumns: [],
    viewMode: 'basic',
    chartVisible: false
  }

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      }))
    })
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AIKnowledgeVectorDbSearchComponent],
      imports: [
        PortalCoreModule,
        LetDirective,
        ReactiveFormsModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations('en', require('./../../../../assets/i18n/en.json')).withTranslations(
          'de',
          require('./../../../../assets/i18n/de.json')
        ),
        NoopAnimationsModule
      ],
      providers: [
        DialogService,
        provideMockStore({
          initialState: { AIKnowledgeVectorDb: { search: initialState } }
        }),
        FormBuilder,
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents()
  })

  beforeEach(async () => {
    const userService = TestBed.inject(UserService)
    userService.hasPermission = () => true
    const translateService = TestBed.inject(TranslateService)
    translateService.use('en')
    formBuilder = TestBed.inject(FormBuilder)

    store = TestBed.inject(MockStore)
    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, baseAIKnowledgeVectorDbSearchViewModel)
    store.refreshState()

    fixture = TestBed.createComponent(AIKnowledgeVectorDbSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    AIKnowledgeVectorDbSearch = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      AIKnowledgeVectorDbSearchHarness
    )
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should dispatch resetButtonClicked action on resetSearch', async () => {
    const doneFn = jest.fn()
    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          column_1: 'val_1'
        }
      ],
      columns: [
        {
          columnType: ColumnType.STRING,
          nameKey: 'COLUMN_KEY',
          id: 'column_1'
        }
      ]
    })
    store.refreshState()

    store.scannedActions$.pipe(ofType(AIKnowledgeVectorDbSearchActions.resetButtonClicked)).subscribe(() => {
      doneFn()
    })

    const searchHeader = await AIKnowledgeVectorDbSearch.getHeader()
    await searchHeader.clickResetButton()
    expect(doneFn).toHaveBeenCalledTimes(1)
  })

  it('should have 2 overFlow header actions when search config is disabled', async () => {
    const searchHeader = await AIKnowledgeVectorDbSearch.getHeader()
    const pageHeader = await searchHeader.getPageHeader()
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton()
    await overflowActionButton?.click()

    const overflowMenuItems = await pageHeader.getOverFlowMenuItems()
    expect(overflowMenuItems.length).toBe(2)

    const exportAllActionItem = await pageHeader.getOverFlowMenuItem('Export all')
    expect(await exportAllActionItem!.getText()).toBe('Export all')

    const showHideChartActionItem = await pageHeader.getOverFlowMenuItem('Show chart')
    expect(await showHideChartActionItem!.getText()).toBe('Show chart')
  })

  it('should display hide chart action if chart is visible', async () => {
    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      chartVisible: true
    })
    store.refreshState()

    const searchHeader = await AIKnowledgeVectorDbSearch.getHeader()
    const pageHeader = await searchHeader.getPageHeader()
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton()
    await overflowActionButton?.click()

    const overflowMenuItems = await pageHeader.getOverFlowMenuItems()
    expect(overflowMenuItems.length).toBe(2)

    const showHideChartActionItem = await pageHeader.getOverFlowMenuItem('Hide chart')
    expect(await showHideChartActionItem!.getText()).toEqual('Hide chart')
  })

  it('should display chosen column in the diagram', async () => {
    component.diagramColumnId = 'column_1'
    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      chartVisible: true,
      results: [
        {
          id: '1',
          imagePath: '',
          column_1: 'val_1'
        },
        {
          id: '2',
          imagePath: '',
          column_1: 'val_2'
        },
        {
          id: '3',
          imagePath: '',
          column_1: 'val_2'
        }
      ],
      columns: [
        {
          columnType: ColumnType.STRING,
          nameKey: 'COLUMN_KEY',
          id: 'column_1'
        }
      ]
    })
    store.refreshState()

    const diagram = await (await AIKnowledgeVectorDbSearch.getDiagram())!.getDiagram()

    expect(await diagram.getTotalNumberOfResults()).toBe(3)
    expect(await diagram.getSumLabel()).toEqual('Total')
  })

  it('should display correct breadcrumbs', async () => {
    const breadcrumbService = TestBed.inject(BreadcrumbService)
    jest.spyOn(breadcrumbService, 'setItems')

    component.ngOnInit()
    fixture.detectChanges()

    expect(breadcrumbService.setItems).toHaveBeenCalledTimes(1)
    const searchHeader = await AIKnowledgeVectorDbSearch.getHeader()
    const pageHeader = await searchHeader.getPageHeader()
    const searchBreadcrumbItem = await pageHeader.getBreadcrumbItem('Search')

    expect(await searchBreadcrumbItem!.getText()).toEqual('Search')
  })

  it('should dispatch searchButtonClicked action on search', (done) => {
    const formValue = formBuilder.group({
      changeMe: '123'
    })
    component.AIKnowledgeVectorDbSearchFormGroup = formValue

    store.scannedActions$.pipe(ofType(AIKnowledgeVectorDbSearchActions.searchButtonClicked)).subscribe((a) => {
      expect(a.searchCriteria).toEqual({ changeMe: '123' })
      done()
    })

    component.search(formValue)
  })

  it('should dispatch editAIKnowledgeVectorDbButtonClicked action on item edit click', async () => {
    jest.spyOn(store, 'dispatch')

    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          column_1: 'val_1'
        }
      ],
      columns: [
        {
          columnType: ColumnType.STRING,
          nameKey: 'COLUMN_KEY',
          id: 'column_1'
        }
      ]
    })
    store.refreshState()

    const interactiveDataView = await AIKnowledgeVectorDbSearch.getSearchResults()
    const dataView = await interactiveDataView.getDataView()
    const dataTable = await dataView.getDataTable()
    const rowActionButtons = await dataTable?.getActionButtons()

    expect(rowActionButtons?.length).toBeGreaterThan(0)
    let editButton
    for (const actionButton of rowActionButtons ?? []) {
      const icon = await actionButton.getAttribute('ng-reflect-icon')
      expect(icon).toBeTruthy()
      if (icon == 'pi pi-pencil') {
        editButton = actionButton
      }
    }
    expect(editButton).toBeTruthy()
    editButton?.click()

    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.editAiKnowledgeVectorDbButtonClicked({ id: '1' })
    )
  })

  it('should dispatch aiKnowledgeVectorDetailsClicked on on item delete click', async () => {
    jest.spyOn(store, 'dispatch')

    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          column_1: 'val_1'
        }
      ],
      columns: [
        {
          columnType: ColumnType.STRING,
          nameKey: 'COLUMN_KEY',
          id: 'column_1'
        }
      ]
    })
    store.refreshState()

    const interactiveDataView = await AIKnowledgeVectorDbSearch.getSearchResults()
    const dataView = await interactiveDataView.getDataView()
    const dataTable = await dataView.getDataTable()
    const rowActionButtons = await dataTable?.getActionButtons()

    expect(rowActionButtons?.length).toBeGreaterThan(0)
    let deleteButton
    for (const actionButton of rowActionButtons ?? []) {
      const icon = await actionButton.getAttribute('ng-reflect-icon')
      expect(icon).toBeTruthy()
      if (icon == PrimeIcons.TRASH) {
        deleteButton = actionButton
      }
    }
    expect(deleteButton).toBeTruthy()
    deleteButton?.click()

    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.deleteAiKnowledgeVectorDbButtonClicked({ id: '1' }))
  })

  it('should dispatch createAIKnowledgeVectorDbButtonClicked action on create click', async () => {
    jest.spyOn(store, 'dispatch')

    const header = await AIKnowledgeVectorDbSearch.getHeader()
    const createButton = await (await header.getPageHeader()).getInlineActionButtonByIcon(PrimeIcons.PLUS)

    expect(createButton).toBeTruthy()
    await createButton?.click()

    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.createAiKnowledgeVectorDbButtonClicked()
    )
  })


  it('should dispatch detailsButtonClicked action on details', () => {
    jest.spyOn(store, 'dispatch')
    const row: RowListGridData = { id: 'test-id', imagePath:'' }
    component.details(row)
    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.detailsButtonClicked({ id: 'test-id' })
    )
  })

  it('should convert Date values to UTC and dispatch searchButtonClicked with correct searchCriteria', () => {
    jest.spyOn(store, 'dispatch')
    const formValue = {
      name: 'testName',
      description: 'testDescription',
      vdb: 'vdb1',
      vdbCollection: 'collection1',
      id: 1,
      limit: 10
    }
    component.AIKnowledgeVectorDbSearchFormGroup = {
      value: formValue,
      getRawValue: () => formValue
    } as any
  
    component.search(component.AIKnowledgeVectorDbSearchFormGroup)
  
    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.searchButtonClicked({
        searchCriteria: {
          name: 'testName',
          description: 'testDescription',
          vdb: 'vdb1',
          vdbCollection: 'collection1',
          id: 1,
          limit: 10
        }
      })
    )
  })
  it('should pass through non-date, non-empty values unchanged in searchCriteria', () => {
    jest.spyOn(store, 'dispatch')
    const formValue = {
      name: 'testName', // not a Date, not empty
    }
    component.AIKnowledgeVectorDbSearchFormGroup = {
      value: formValue,
      getRawValue: () => formValue
    } as any
  
    component.search(component.AIKnowledgeVectorDbSearchFormGroup)
  
    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.searchButtonClicked({
        searchCriteria: {
          name: 'testName'
        }
      })
    )
  })

  it('should set searchCriteria property to undefined for falsy non-date values', () => {
    jest.spyOn(store, 'dispatch')
    const formValue = {
      name: '', // not a Date, falsy value
    }
    component.AIKnowledgeVectorDbSearchFormGroup = {
      value: formValue,
      getRawValue: () => formValue
    } as any
  
    component.search(component.AIKnowledgeVectorDbSearchFormGroup)
  
    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.searchButtonClicked({
        searchCriteria: {
          name: undefined
        }
      })
    )
  })

  it('should handle isValidDate true branch for allowed key (using as any for coverage)', () => {
    jest.spyOn(store, 'dispatch')
    const testDate = new Date(2024, 4, 15, 12, 30, 45)
    const formValue = {
      id: testDate as any // force for coverage only
    }
    component.AIKnowledgeVectorDbSearchFormGroup = {
      value: formValue,
      getRawValue: () => formValue
    } as any
  
    component.search(component.AIKnowledgeVectorDbSearchFormGroup)
  
    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.searchButtonClicked({
        searchCriteria: {
          id: new Date(Date.UTC(
            testDate.getFullYear(),
            testDate.getMonth(),
            testDate.getDate(),
            testDate.getHours(),
            testDate.getMinutes(),
            testDate.getSeconds()
          )) as any // force for coverage only
        }
      })
    )
  })

  it('should pass through non-date, non-empty values unchanged in searchCriteria', () => {
    jest.spyOn(store, 'dispatch')
    const formValue = {
      name: 'testName'
    }
    component.AIKnowledgeVectorDbSearchFormGroup = {
      value: formValue,
      getRawValue: () => formValue
    } as any
  
    component.search(component.AIKnowledgeVectorDbSearchFormGroup)
  
    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.searchButtonClicked({
        searchCriteria: {
          name: 'testName'
        }
      })
    )
  })

  it('should set searchCriteria property to undefined for falsy non-date values', () => {
    jest.spyOn(store, 'dispatch')
    const formValue = {
      name: ''
    }
    component.AIKnowledgeVectorDbSearchFormGroup = {
      value: formValue,
      getRawValue: () => formValue
    } as any
  
    component.search(component.AIKnowledgeVectorDbSearchFormGroup)
  
    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.searchButtonClicked({
        searchCriteria: {
          name: undefined
        }
      })
    )
  })



  it('should export csv data on export action click', async () => {
    jest.spyOn(store, 'dispatch')

    const results = [
      {
        id: '1',
        imagePath: '',
        column_1: 'val_1'
      }
    ]
    const columns = [
      {
        columnType: ColumnType.STRING,
        nameKey: 'COLUMN_KEY',
        id: 'column_1'
      }
    ]
    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      results: results,
      columns: columns,
      displayedColumns: columns
    })
    store.refreshState()

    const searchHeader = await AIKnowledgeVectorDbSearch.getHeader()
    const pageHeader = await searchHeader.getPageHeader()
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton()
    await overflowActionButton?.click()

    const exportAllActionItem = await pageHeader.getOverFlowMenuItem('Export all')
    await exportAllActionItem!.selectItem()

    expect(store.dispatch).toHaveBeenCalledWith(AIKnowledgeVectorDbSearchActions.exportButtonClicked())
  })

  it('should dispatch viewModeChanged action on view mode changes', async () => {
    jest.spyOn(store, 'dispatch')

    component.viewModeChanged('advanced')

    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.viewModeChanged({ viewMode: 'advanced' })
    )
  })

  it('should dispatch displayedColumnsChanged on data view column change', async () => {
    jest.spyOn(store, 'dispatch')

    fixture = TestBed.createComponent(AIKnowledgeVectorDbSearchComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    AIKnowledgeVectorDbSearch = await TestbedHarnessEnvironment.harnessForFixture(
      fixture,
      AIKnowledgeVectorDbSearchHarness
    )

    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.displayedColumnsChanged({ displayedColumns: AIKnowledgeVectorDbSearchColumns })
    )

    jest.clearAllMocks()

    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      columns: [
        {
          columnType: ColumnType.STRING,
          nameKey: 'COLUMN_KEY',
          id: 'column_1'
        },
        {
          columnType: ColumnType.STRING,
          nameKey: 'SECOND_COLUMN_KEY',
          id: 'column_2'
        }
      ]
    })
    store.refreshState()

    const interactiveDataView = await AIKnowledgeVectorDbSearch.getSearchResults()
    const columnGroupSelector = await interactiveDataView?.getCustomGroupColumnSelector()
    expect(columnGroupSelector).toBeTruthy()
    await columnGroupSelector!.openCustomGroupColumnSelectorDialog()
    const pickList = await columnGroupSelector!.getPicklist()
    const transferControlButtons = await pickList.getTransferControlsButtons()
    expect(transferControlButtons.length).toBe(4)
    const activateAllColumnsButton = transferControlButtons[3]
    await activateAllColumnsButton.click()
    const saveButton = await columnGroupSelector!.getSaveButton()
    await saveButton.click()

    expect(store.dispatch).toHaveBeenCalledWith(
      AIKnowledgeVectorDbSearchActions.displayedColumnsChanged({
        displayedColumns: [
          {
            columnType: ColumnType.STRING,
            nameKey: 'COLUMN_KEY',
            id: 'column_1'
          },
          {
            columnType: ColumnType.STRING,
            nameKey: 'SECOND_COLUMN_KEY',
            id: 'column_2'
          }
        ]
      })
    )
  })

  it('should dispatch chartVisibilityToggled on show/hide chart header', async () => {
    jest.spyOn(store, 'dispatch')

    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      chartVisible: false
    })
    store.refreshState()

    const searchHeader = await AIKnowledgeVectorDbSearch.getHeader()
    const pageHeader = await searchHeader.getPageHeader()
    const overflowActionButton = await pageHeader.getOverflowActionMenuButton()
    await overflowActionButton?.click()

    const showChartActionItem = await pageHeader.getOverFlowMenuItem('Show chart')
    await showChartActionItem!.selectItem()
    expect(store.dispatch).toHaveBeenCalledWith(AIKnowledgeVectorDbSearchActions.chartVisibilityToggled())
  })

  it('should display translated headers', async () => {
    const searchHeader = await AIKnowledgeVectorDbSearch.getHeader()
    const pageHeader = await searchHeader.getPageHeader()
    expect(await pageHeader.getHeaderText()).toEqual('AIKnowledgeVectorDb Search')
    expect(await pageHeader.getSubheaderText()).toEqual('Searching and displaying of AIKnowledgeVectorDb')
  })

  it('should display translated empty message when no search results', async () => {
    const columns = [
      {
        columnType: ColumnType.STRING,
        nameKey: 'COLUMN_KEY',
        id: 'column_1'
      }
    ]
    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      results: [],
      columns: columns,
      displayedColumns: columns
    })
    store.refreshState()

    const interactiveDataView = await AIKnowledgeVectorDbSearch.getSearchResults()
    const dataView = await interactiveDataView.getDataView()
    const dataTable = await dataView.getDataTable()
    const rows = await dataTable?.getRows()
    expect(rows?.length).toBe(1)

    const rowData = await rows?.at(0)?.getData()
    expect(rowData?.length).toBe(1)
    expect(rowData?.at(0)).toEqual('No results.')
  })

  it('should not display chart when no results or toggled to not visible', async () => {
    component.diagramColumnId = 'column_1'

    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      results: [],
      chartVisible: true,
      columns: [
        {
          columnType: ColumnType.STRING,
          nameKey: 'COLUMN_KEY',
          id: 'column_1'
        }
      ]
    })
    store.refreshState()

    let diagram = await AIKnowledgeVectorDbSearch.getDiagram()
    expect(diagram).toBeNull()

    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          column_1: 'val_1'
        }
      ],
      chartVisible: false,
      columns: [
        {
          columnType: ColumnType.STRING,
          nameKey: 'COLUMN_KEY',
          id: 'column_1'
        }
      ]
    })
    store.refreshState()

    diagram = await AIKnowledgeVectorDbSearch.getDiagram()
    expect(diagram).toBeNull()

    store.overrideSelector(selectAIKnowledgeVectorDbSearchViewModel, {
      ...baseAIKnowledgeVectorDbSearchViewModel,
      results: [
        {
          id: '1',
          imagePath: '',
          column_1: 'val_1'
        }
      ],
      chartVisible: true,
      columns: [
        {
          columnType: ColumnType.STRING,
          nameKey: 'COLUMN_KEY',
          id: 'column_1'
        }
      ]
    })
    store.refreshState()

    diagram = await AIKnowledgeVectorDbSearch.getDiagram()
    expect(diagram).toBeTruthy()
  })

  describe('AIKnowledgeVectorDbSearchReducer', () => {
    const { AIKnowledgeVectorDbSearchReducer, initialState } = require('./ai-knowledge-vector-db-search.reducers')
    const { AIKnowledgeVectorDbSearchActions } = require('./ai-knowledge-vector-db-search.actions')
  
    it('should reset results and criteria on resetButtonClicked', () => {
      const preState = { ...initialState, results: [{ id: '1' }], criteria: { test: 'val' } }
      const action = AIKnowledgeVectorDbSearchActions.resetButtonClicked()
      const state = AIKnowledgeVectorDbSearchReducer(preState, action)
      expect(state.results).toEqual([])
      expect(state.criteria).toEqual({})
    })
  
    it('should set searchLoadingIndicator and criteria on searchButtonClicked', () => {
      const searchCriteria = { name: 'foo' }
      const action = AIKnowledgeVectorDbSearchActions.searchButtonClicked({ searchCriteria })
      const state = AIKnowledgeVectorDbSearchReducer(initialState, action)
      expect(state.searchLoadingIndicator).toBe(true)
      expect(state.criteria).toEqual(searchCriteria)
    })
  
    it('should set results on aiKnowledgeVectorDbSearchResultsReceived', () => {
      const results = [{ id: '1' }, { id: '2' }]
      const action = AIKnowledgeVectorDbSearchActions.aiKnowledgeVectorDbSearchResultsReceived({ results })
      const state = AIKnowledgeVectorDbSearchReducer(initialState, action)
      expect(state.results).toEqual(results)
    })
  
    it('should clear results on aiKnowledgeVectorDbSearchResultsLoadingFailed', () => {
      const preState = { ...initialState, results: [{ id: '1' }] }
      const action = AIKnowledgeVectorDbSearchActions.aiKnowledgeVectorDbSearchResultsLoadingFailed()
      const state = AIKnowledgeVectorDbSearchReducer(preState, action)
      expect(state.results).toEqual([])
    })
  
    it('should set chartVisible on chartVisibilityRehydrated', () => {
      const action = AIKnowledgeVectorDbSearchActions.chartVisibilityRehydrated({ visible: true })
      const state = AIKnowledgeVectorDbSearchReducer(initialState, action)
      expect(state.chartVisible).toBe(true)
    })
  
    it('should toggle chartVisible on chartVisibilityToggled', () => {
      const preState = { ...initialState, chartVisible: false }
      const action = AIKnowledgeVectorDbSearchActions.chartVisibilityToggled()
      const state = AIKnowledgeVectorDbSearchReducer(preState, action)
      expect(state.chartVisible).toBe(true)
      const state2 = AIKnowledgeVectorDbSearchReducer(state, action)
      expect(state2.chartVisible).toBe(false)
    })
  
    it('should set viewMode on viewModeChanged', () => {
      const action = AIKnowledgeVectorDbSearchActions.viewModeChanged({ viewMode: 'advanced' })
      const state = AIKnowledgeVectorDbSearchReducer(initialState, action)
      expect(state.viewMode).toBe('advanced')
    })
  
    it('should set displayedColumns on displayedColumnsChanged', () => {
      const displayedColumns = [
        { id: 'col1' },
        { id: 'col2' }
      ]
      const action = AIKnowledgeVectorDbSearchActions.displayedColumnsChanged({ displayedColumns })
      const state = AIKnowledgeVectorDbSearchReducer(initialState, action)
      expect(state.displayedColumns).toEqual(['col1', 'col2'])
    })

    it('should set criteria and searchLoadingIndicator=true when routerNavigatedAction succeeds and queryParams present', () => {
      const { routerNavigatedAction } = require('@ngrx/router-store')
      // Mock the schema to always succeed
      const mockSchema = require('./ai-knowledge-vector-db-search.parameters')
      jest.spyOn(mockSchema.AIKnowledgeVectorDbSearchCriteriasSchema, 'safeParse').mockReturnValue({
        success: true,
        data: { foo: 'bar' }
      })
      const preState = { ...initialState, criteria: {}, searchLoadingIndicator: false }
      const action = routerNavigatedAction({ payload: { routerState: { root: { queryParams: { foo: 'bar' } } } } })
      const state = AIKnowledgeVectorDbSearchReducer(preState, action)
      expect(state.criteria).toEqual({ foo: 'bar' })
      expect(state.searchLoadingIndicator).toBe(true)
    })
    
    it('should not change state when routerNavigatedAction fails schema parse', () => {
      const { routerNavigatedAction } = require('@ngrx/router-store')
      // Mock the schema to always fail
      const mockSchema = require('./ai-knowledge-vector-db-search.parameters')
      jest.spyOn(mockSchema.AIKnowledgeVectorDbSearchCriteriasSchema, 'safeParse').mockReturnValue({
        success: false
      })
      const preState = { ...initialState, criteria: { foo: 'bar' }, searchLoadingIndicator: true }
      const action = routerNavigatedAction({ payload: { routerState: { root: { queryParams: { foo: 'bar' } } } } })
      const state = AIKnowledgeVectorDbSearchReducer(preState, action)
      expect(state).toBe(preState) // unchanged
    })
  })

  describe('AIKnowledgeVectorDbSearch selectors', () => {
    it('selectResults should map results to RowListGridData[]', () => {
      const state = {
        ...initialState,
        results: [
          { id: '1', name: 'A', description: 'desc', vdb: 'vdb1', vdbCollection: 'c1' },
          { id: '2', name: 'B', description: 'desc2', vdb: 'vdb2', vdbCollection: 'c2' }
        ]
      }
      const result = selectors.selectResults.projector(state.results)
      expect(result).toEqual([
        { imagePath: '', id: '1', name: 'A', description: 'desc', vdb: 'vdb1', vdbCollection: 'c1' },
        { imagePath: '', id: '2', name: 'B', description: 'desc2', vdb: 'vdb2', vdbCollection: 'c2' }
      ])
    })

    it('selectDisplayedColumns should map displayedColumns ids to columns', () => {
      const columns = [
        { id: 'col1', nameKey: 'Col 1', columnType: ColumnType.STRING },
        { id: 'col2', nameKey: 'Col 2', columnType: ColumnType.STRING }
      ]
      const displayedColumns = ['col2', 'col1']
      const result = selectors.selectDisplayedColumns.projector(columns, displayedColumns)
      expect(result).toEqual([
        { id: 'col2', nameKey: 'Col 2', columnType: ColumnType.STRING },
        { id: 'col1', nameKey: 'Col 1', columnType: ColumnType.STRING }
      ])
    })

    it('selectAIKnowledgeVectorDbSearchViewModel should combine all selector results', () => {
      const columns = [{ id: 'col1', nameKey: 'Col 1', columnType: ColumnType.STRING }]
      const searchCriteria = {
        name: 'Test Name',
        description: 'Test Description',
        vdb: 'vdb1',
        vdbCollection: 'collection1',
        id: 1,
        limit: 10
      }
      const results = [
        { imagePath: '', id: '1', name: 'A', description: 'desc', vdb: 'vdb1', vdbCollection: 'c1' }
      ]
      const displayedColumns = [{ id: 'col1', nameKey: 'Col 1', columnType: ColumnType.STRING }]
      const viewMode = 'advanced'
      const chartVisible = true
    
      const result = selectors.selectAIKnowledgeVectorDbSearchViewModel.projector(
        columns,
        searchCriteria,
        results,
        displayedColumns,
        viewMode,
        chartVisible
      )
      expect(result).toEqual({
        columns,
        searchCriteria,
        results,
        displayedColumns,
        viewMode,
        chartVisible
      })
    })


    it('selectDisplayedColumns should return [] if displayedColumns is undefined', () => {
      const columns = [
        { id: 'col1', nameKey: 'Col 1', columnType: ColumnType.STRING },
        { id: 'col2', nameKey: 'Col 2', columnType: ColumnType.STRING }
      ]
      const displayedColumns = null
      const result = selectors.selectDisplayedColumns.projector(columns, displayedColumns)
      expect(result).toEqual([])
    })

  })

})