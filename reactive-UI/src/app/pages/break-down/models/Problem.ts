import { Range } from '../../../../utilities/types/Range';

export class Problem {
    id: string = '';
    uncertaintyScore: Range<1, 100> = 1;
    name: string = '';
    breakFrom?: Problem;
}