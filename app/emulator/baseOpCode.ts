import {OpCodes} from './opsCodes';
import {IOperation, ICpu} from '../emulator/interfaces';

export class BaseOpCode implements IOperation {
        
    constructor(
        public opName: string, 
        public sizeBytes: number, 
        public addressingMode: number, 
        public opCode: number) {                
    }
    
    public decompile (address: number, bytes: number[]): string {
        return OpCodes.ProcessLine(address, this, bytes);                
    }

    public execute(cpu: ICpu): void {
        return;
    }
}
