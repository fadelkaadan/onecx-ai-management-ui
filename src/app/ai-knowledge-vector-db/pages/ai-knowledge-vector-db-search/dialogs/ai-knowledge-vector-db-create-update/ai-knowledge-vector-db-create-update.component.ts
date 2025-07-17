import { Component, EventEmitter, Input, OnInit } from '@angular/core'
import { DialogButtonClicked, DialogPrimaryButtonDisabled, DialogResult } from '@onecx/portal-integration-angular'

import { FormControl, FormGroup, Validators } from '@angular/forms'
import { map } from 'rxjs'
import { AIKnowledgeVectorDb } from 'src/app/shared/generated'

import { AIKnowledgeVectorDbCreateUpdateViewModel } from './ai-knowledge-vector-db-create-update.viewmodel'

@Component({
  selector: 'app-ai-knowledge-vector-db-create-update',
  templateUrl: './ai-knowledge-vector-db-create-update.component.html',
  styleUrls: ['./ai-knowledge-vector-db-create-update.component.scss']
})
export class AIKnowledgeVectorDbCreateUpdateComponent
  implements
    DialogPrimaryButtonDisabled,
    DialogResult<AIKnowledgeVectorDb | undefined>,
    DialogButtonClicked<AIKnowledgeVectorDbCreateUpdateComponent>,
    OnInit
{
  @Input() public vm: AIKnowledgeVectorDbCreateUpdateViewModel = {
    itemToEdit: undefined
  }

  public formGroup: FormGroup

  primaryButtonEnabled = new EventEmitter<boolean>()
  dialogResult: AIKnowledgeVectorDb | undefined = undefined

  constructor() {
    this.formGroup = new FormGroup({
      name: new FormControl('', [Validators.maxLength(255)]),
      description: new FormControl('', [Validators.maxLength(255)]),
      vdb: new FormControl('', [Validators.maxLength(255)]),
      vdbCollection: new FormControl('', [Validators.maxLength(255)])
    })
    this.formGroup.statusChanges
      .pipe(
        map((status) => {
          return status === 'VALID'
        })
      )
      .subscribe(this.primaryButtonEnabled)
  }

  ocxDialogButtonClicked() {
    this.dialogResult = {
      ...this.vm.itemToEdit,
      ...this.formGroup.value
    }
  }

  ngOnInit() {
    if (this.vm.itemToEdit) {
      this.formGroup.patchValue({
        name: this.vm.itemToEdit.name,
        description: this.vm.itemToEdit.description,
        vdb: this.vm.itemToEdit.vdb,
        vdbCollection: this.vm.itemToEdit.vdbCollection
      })
    }
  }
}
