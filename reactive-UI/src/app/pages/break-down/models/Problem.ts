import { Range } from '../../../../ultilities/types/Range';

export class Problem {
    id: string = '';
    uncertaintyScore: Range<1, 100> = 1;
}