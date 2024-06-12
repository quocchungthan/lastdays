import { Injectable } from '@angular/core';
import { PREFERED_INK_COLOR, SUPPORTED_COLORS } from '../../configs/theme.constants';

type SupportedColors = typeof SUPPORTED_COLORS[number];

@Injectable()
export class ToolCompositionService {
  private _color = PREFERED_INK_COLOR;

  constructor() { }

  get color() {
    return this._color;
  }

  setColor(color: SupportedColors) {
    this._color = color;
  }
}
