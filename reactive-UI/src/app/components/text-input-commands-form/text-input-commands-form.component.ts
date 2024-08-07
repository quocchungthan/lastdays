import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalContentComponent } from '../../../utilities/controls/form-modal/IModalContentComponent';
import { TextEditorComponent } from '../../../utilities/controls/text-editor/text-editor.component';
import { TEXT_PREVIEW_CONTAINER } from '../../configs/html-ids.constants';
import Konva from 'konva';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-text-input-commands-form',
  standalone: true,
  imports: [TextEditorComponent],
  templateUrl: './text-input-commands-form.component.html',
  styleUrl: './text-input-commands-form.component.scss'
})
export class TextInputCommandsFormComponent extends ModalContentComponent implements AfterViewInit, OnDestroy {
  override dialogTitle = 'DIALOG_TITLE_TEXT_INPUT';
  currentText: string = '';
  textPreviewContainerId = TEXT_PREVIEW_CONTAINER;
  @ViewChild('textEditor')
  textEditor!: TextEditorComponent;
  private _konvaText!: Konva.Text;
  private _konvaStage!: Konva.Stage;

  constructor(private _translateService: TranslateService) {
    super(_translateService);
    this._translateService.getTranslation(this.dialogTitle)
      .subscribe((translated) => {
        this.dialogTitle = translated;
      });
  }

  ngAfterViewInit(): void {
    this.renderPreview();
  }

  ngOnDestroy(): void {
    this._konvaStage.destroy();
  }

  setText($event: string) {
    this.currentText = $event;
    this._konvaText.setText(this.currentText);
  }

  renderPreview() {
    this._konvaStage = new Konva.Stage({
      width: this.textEditor.width,
      height: 200,
      container: this.textPreviewContainerId
    });

    this._konvaText = new Konva.Text({
      x: 10,
      y: 50,
      fontSize: 20,
      text: this.currentText,
      width: 250,
      lineHeight: 1,
      draggable: true,
      fontFamily: 'Baelast'
    });

    const textLayer = new Konva.Layer();
    textLayer.add(this._konvaText);
    const transformer = new Konva.Transformer({ nodes: [this._konvaText], draggable: true });
    transformer.on('transformend', (e) => {
      const newSize = { width: this._konvaText.width() * this._konvaText.scaleX(), height: this._konvaText.height() * this._konvaText.scaleY() }
      this._konvaText.scale({x: 1, y: 1});
      this._konvaText.size(newSize);
    });
    textLayer.add(transformer);
    this._konvaStage.add(textLayer);
  }
}
