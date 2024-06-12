import { Injectable } from '@angular/core';
import { PREFERED_INK_COLOR, SUPPORTED_COLORS } from '../../configs/theme.constants';
import { SupportedColors } from '../../events/drawings/EventQueue';

@Injectable()
export class ToolCompositionService {
  private _color = PREFERED_INK_COLOR;
  private _tool: string = '';

  constructor() { }

  get color() {
    return this._color;
  }

  get tool() {
    return this._tool;
  }

  setColor(color: SupportedColors) {
    this._color = color;
  }

  setTool(tool: SupportedColors) {
    this._tool = tool;
  }
}
