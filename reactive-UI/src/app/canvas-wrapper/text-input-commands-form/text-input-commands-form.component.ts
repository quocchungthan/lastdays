import {
  AfterViewInit,
  Component,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ModalContentComponent } from '../../../ui-utilities/controls/form-modal/IModalContentComponent';
import { TextEditorComponent } from '../../../ui-utilities/controls/text-editor/text-editor.component';
import { TEXT_PREVIEW_CONTAINER } from '../../../configs/html-ids.constants';
import Konva from 'konva';
import { TranslateService } from '@ngx-translate/core';
import { ColorBoardComponent } from '../../../ui-utilities/painting/color-board/color-board.component';
import { SUPPORTED_COLORS } from '../../../configs/theme.constants';
import { Dimension } from '../../../ui-utilities/types/Dimension';
import { TextInputCommands } from '../commands/text-input.command';
import { Point } from '@ui/types/Point';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-text-input-commands-form',
  standalone: true,
  imports: [TextEditorComponent, ColorBoardComponent, ColorBoardComponent],
  templateUrl: './text-input-commands-form.component.html',
  styleUrl: './text-input-commands-form.component.scss',
})
export class TextInputCommandsFormComponent
  extends ModalContentComponent
  implements AfterViewInit, OnDestroy
{
  override dialogTitle = 'DIALOG_TITLE_TEXT_INPUT';
  currentText: string = '';
  textPreviewContainerId = TEXT_PREVIEW_CONTAINER;
  @ViewChild('textEditor')
  textEditor!: TextEditorComponent;
  private unsubscribe$ = new Subject<void>();
  private _konvaText!: Konva.Text;
  private _textLayer?: Konva.Group;

  constructor(private _translateService: TranslateService) {
    super(_translateService);
    this._translateService.get(this.dialogTitle).pipe(takeUntil(this.unsubscribe$)).subscribe((translated) => {
      this.dialogTitle = translated;
    });
  }

  get builtComponent() {
    return this._konvaText;
  }

  get preview() {
    return this._textLayer!;
  }

  ngAfterViewInit(): void {
    this.renderPreview();
    this.textEditor.focus();
  }

  ngOnDestroy(): void {
    this.preview?.destroy();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setText($event: string) {
    this.currentText = $event;
    this._updateTextLayer();
  }

  renderPreview() {
    this._textLayer = this._buildPlaceholderTextLayer({ x: 0, y: 0 });
    this.onPreviewCreated.emit();
  }

  private _updateTextLayer() {
    if (!this._konvaText) {
      return;
    }

    this._konvaText.setText(this.currentText);
  }

  private _buildPlaceholderTextLayer(position: Point) {
    this._konvaText = TextInputCommandsFormComponent.BuildTextComponent(
      this.currentText,
      SUPPORTED_COLORS[0],
      position,
      {
        width: 250,
        height: 60,
      }
    );

    const textLayer = new Konva.Group();
    textLayer.add(this._konvaText);
    const transformer = new Konva.Transformer({
      nodes: [this._konvaText],
      draggable: true,
    });
    transformer.on('transformend', (e) => {
      const newSize = {
        width: this._konvaText.width() * this._konvaText.scaleX(),
        height: this._konvaText.height() * this._konvaText.scaleY(),
      };
      this._konvaText.scale({ x: 1, y: 1 });
      this._konvaText.size(newSize);
      this.textEditor.focus();
    });
    textLayer.add(transformer);
    return textLayer;
  }

  public static BuildTextComponent(
    text: string,
    color: string,
    pos: { x: number; y: number },
    size: Dimension
  ) {
    return new Konva.Text({
      name: TextInputCommands.CLASS_NAME,
      x: pos.x,
      y: pos.y,
      fontSize: 20,
      text: text,
      width: size.width,
      height: size.height,
      lineHeight: 1,
      draggable: true,
      fontFamily: 'Baelast',
      fill: color,
    });
  }
}
