import {BaseOpCode} from './baseOpCode';
import {OpCodes} from './opsCodes';
import {Constants} from '../globalConstants';
import {ICpu, IOperation} from './interfaces';

export var registeredOperations: IOperation[] = [];

function IsOpCode(target: any) {
    registeredOperations.push(new target());    
}

/* ================== 
   === Invalid OP === 
   ================== */
export class InvalidOp extends BaseOpCode {
    
    constructor(value: number) {
        super("???", 0x01, OpCodes.ModeSingle, value & Constants.Memory.ByteMask);            
    }
    public execute(cpu: ICpu): void {
        var prev = cpu.rPC - 1;
        var opCode = cpu.peek(prev);
        throw "Invalid op code 0x" + opCode.toString(16).toUpperCase() +
                " encountered at $" + prev.toString(16).toUpperCase();
    }
}
 
/* =========== 
    === ADC === 
    =========== */
@IsOpCode
export class AddWithCarryImmediate extends BaseOpCode {
    constructor() {
        super("ADC", 0x02, OpCodes.ModeImmediate, 0x69);
    }
    public execute(cpu: ICpu): void {
        OpCodes.AddWithCarry(cpu, cpu.addrPop());
    }
}    

@IsOpCode
export class AddWithCarryZeroPage extends BaseOpCode {
    constructor() {
        super("ADC", 0x02, OpCodes.ModeZeroPage, 0x65);
    }        
    public execute(cpu: ICpu): void {
        var zeroPage = cpu.addrPop();
        OpCodes.AddWithCarry(cpu, cpu.peek(zeroPage));
    }
}    

@IsOpCode
export class AddWithCarryZeroPageX extends BaseOpCode {
    constructor() {
        super("ADC", 0x02, OpCodes.ModeZeroPageX, 0x75);
    }
    public execute(cpu: ICpu): void {
        OpCodes.AddWithCarry(cpu, cpu.peek(cpu.addrZeroPageX()));
    }
}    

@IsOpCode
export class AddWithCarryAbsolute extends BaseOpCode {
    constructor() {
        super("ADC", 0x03, OpCodes.ModeAbsolute, 0x6D);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrPopWord());
        OpCodes.AddWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class AddWithCarryAbsoluteX extends BaseOpCode {
    constructor() {
        super("ADC", 0x03, OpCodes.ModeAbsoluteX, 0x7D);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrAbsoluteX());
        OpCodes.AddWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class AddWithCarryAbsoluteY extends BaseOpCode {
    constructor() {
        super("ADC", 0x03, OpCodes.ModeAbsoluteY, 0x79);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrAbsoluteY());
        OpCodes.AddWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class AddWithCarryIndexedIndirectX extends BaseOpCode {
    constructor() {
        super("ADC", 0x02, OpCodes.ModeIndexedIndirectX, 0x61);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrIndexedIndirectX());
        OpCodes.AddWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class AddWithCarryIndirectIndexedY extends BaseOpCode {
    constructor() {
        super("ADC", 0x02, OpCodes.ModeIndexedIndirectY, 0x71);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrIndirectIndexedY());
        OpCodes.AddWithCarry(cpu, targetValue);
    }
}    

/* =========== 
    === AND === 
    =========== */

@IsOpCode
export class AndImmediate extends BaseOpCode {
    constructor() {
        super("AND", 0x02, OpCodes.ModeImmediate, 0x29);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA & cpu.addrPop();
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class AndZeroPage extends BaseOpCode {
    constructor() {
        super("AND", 0x02, OpCodes.ModeZeroPage, 0x25);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA & cpu.peek(cpu.addrPop());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class AndZeroPageX extends BaseOpCode {
    constructor() {
        super("AND", 0x02, OpCodes.ModeZeroPageX, 0x35);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA & cpu.peek(cpu.addrZeroPageX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class AndAbsolute extends BaseOpCode {
    constructor() {
        super("AND", 0x03, OpCodes.ModeAbsolute, 0x2D);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA & cpu.peek(cpu.addrPopWord());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class AndAbsoluteX extends BaseOpCode {
    constructor() {
        super("AND", 0x03, OpCodes.ModeAbsoluteX, 0x3D);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA & cpu.peek(cpu.addrAbsoluteX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class AndAbsoluteY extends BaseOpCode {
    constructor() {
        super("AND", 0x03, OpCodes.ModeAbsoluteY, 0x39);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA & cpu.peek(cpu.addrAbsoluteY());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class AndIndirectX extends BaseOpCode {
    constructor() {
        super("AND", 0x02, OpCodes.ModeIndexedIndirectX, 0x21);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA & cpu.peek(cpu.addrIndexedIndirectX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class AndIndirectY extends BaseOpCode {
    constructor() {
        super("AND", 0x02, OpCodes.ModeIndexedIndirectY, 0x31);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA & cpu.peek(cpu.addrIndirectIndexedY());
        cpu.setFlags(cpu.rA);
    }
}    

/* ===========
    === BIT ===
    =========== */
@IsOpCode
export class BitAbsolute extends BaseOpCode {
    constructor() {
        super("BIT", 0x03, OpCodes.ModeAbsolute, 0x2C);
    }
    public execute(cpu: ICpu): void {
        var address: number = cpu.addrPopWord();
        var value: number = cpu.peek(address); 
        cpu.setFlag(Constants.ProcessorStatus.ZeroFlagSet, (cpu.rA & value) === 0);
        cpu.setFlag(Constants.ProcessorStatus.NegativeFlagSet, !!(value & Constants.ProcessorStatus.NegativeFlagSet));
        cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, !!(value & Constants.ProcessorStatus.OverflowFlagSet));
    }
}

@IsOpCode
export class BitZeroPage extends BaseOpCode {
    constructor() {
        super("BIT", 0x02, OpCodes.ModeAbsolute, 0x24);
    }
    public execute(cpu: ICpu): void {
        var zeroPage: number = cpu.addrPop();
        var value: number = cpu.peek(zeroPage); 
        cpu.setFlag(Constants.ProcessorStatus.ZeroFlagSet, (cpu.rA & value) === 0);
        cpu.setFlag(Constants.ProcessorStatus.NegativeFlagSet, (value & Constants.ProcessorStatus.NegativeFlagSet) > 0);
        cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, (value & Constants.ProcessorStatus.OverflowFlagSet) > 0);
    }
}

/* ================ 
    === BRANCHES === 
    ================ */

@IsOpCode
export class BranchNotEqualRelative extends BaseOpCode {
    constructor() {
        super("BNE", 0x02, OpCodes.ModeRelative, 0xD0);
    }        
    public execute(cpu: ICpu): void {
        var branch: number = cpu.addrPop();
        if (!cpu.checkFlag(Constants.ProcessorStatus.ZeroFlagSet)) {                
            cpu.rPC = OpCodes.computeBranch(cpu.rPC, branch);
        }
    }
}    

@IsOpCode
export class BranchEqualRelative extends BaseOpCode {
    constructor() {
        super("BEQ", 0x02, OpCodes.ModeRelative, 0xF0);
    }
    public execute(cpu: ICpu): void {
        var branch: number = cpu.addrPop();
        if (cpu.checkFlag(Constants.ProcessorStatus.ZeroFlagSet)) {                
            cpu.rPC = OpCodes.computeBranch(cpu.rPC, branch);
        }
    }
}    

@IsOpCode
export class BranchMinusRelative extends BaseOpCode {
    constructor() {
        super("BMI", 0x02, OpCodes.ModeRelative, 0x30);
    }   
    public execute(cpu: ICpu): void {
        var branch = cpu.addrPop();
        if (cpu.checkFlag(Constants.ProcessorStatus.NegativeFlagSet)) {                
            cpu.rPC = OpCodes.computeBranch(cpu.rPC, branch);
        }
    }
}    

@IsOpCode
export class BranchPlusRelative extends BaseOpCode {
    constructor() {
        super("BPL", 0x02, OpCodes.ModeRelative, 0x10);
    }
    public execute(cpu: ICpu): void {
        var branch = cpu.addrPop();
        if (!cpu.checkFlag(Constants.ProcessorStatus.NegativeFlagSet)) {                
            cpu.rPC = OpCodes.computeBranch(cpu.rPC, branch);
        }
    }
}   

@IsOpCode
export class BranchOverflowClearRelative extends BaseOpCode {
    constructor() {
        super("BVC", 0x02, OpCodes.ModeRelative, 0x50);
    }
    public execute(cpu: ICpu): void {
        var branch: number = cpu.addrPop();
        if (!cpu.checkFlag(Constants.ProcessorStatus.OverflowFlagSet)) {                
            cpu.rPC = OpCodes.computeBranch(cpu.rPC, branch);
        }
    }
}    

@IsOpCode
export class BranchOverflowSetRelative extends BaseOpCode {
    constructor() {
        super("BVS", 0x02, OpCodes.ModeRelative, 0x70);
    }
    public execute(cpu: ICpu): void {
        var branch: number = cpu.addrPop();
        if (cpu.checkFlag(Constants.ProcessorStatus.OverflowFlagSet)) {                
            cpu.rPC = OpCodes.computeBranch(cpu.rPC, branch);
        }
    }
}    

@IsOpCode
export class BranchCarryClearRelative extends BaseOpCode {
    constructor() {
        super("BCC", 0x02, OpCodes.ModeRelative, 0x90);
    }
    public execute(cpu: ICpu): void {
        var branch = cpu.addrPop();
        if (!cpu.checkFlag(Constants.ProcessorStatus.CarryFlagSet)) {                
            cpu.rPC = OpCodes.computeBranch(cpu.rPC, branch);
        }
    }
}    

@IsOpCode
export class BranchCarrySetRelative extends BaseOpCode {
    constructor() {
        super("BCS", 0x02, OpCodes.ModeRelative, 0xB0);
    }
    public execute(cpu: ICpu): void {
        var branch = cpu.addrPop();
        if (cpu.checkFlag(Constants.ProcessorStatus.CarryFlagSet)) {                
            cpu.rPC = OpCodes.computeBranch(cpu.rPC, branch);
        }
    }
}    

/* ===========
    === CMP ===
    =========== */

@IsOpCode
export class CompareAccumulatorImmediate extends BaseOpCode {
    constructor() {
        super("CMP", 0x02, OpCodes.ModeImmediate, 0xC9);
    }
    public execute(cpu: ICpu): void {
        cpu.compareWithFlags(cpu.rA, cpu.addrPop());
    }
}

@IsOpCode
export class CompareAccumulatorZeroPage extends BaseOpCode {
    constructor() {
        super("CMP", 0x02, OpCodes.ModeZeroPage, 0xC5);
    }        
    public execute(cpu: ICpu): void {
        var zeroPage = cpu.addrPop();
        cpu.compareWithFlags(cpu.rA, cpu.peek(zeroPage));
    }
}    

@IsOpCode
export class CompareAccumulatorZeroPageX extends BaseOpCode {
    constructor() {
        super("CMP", 0x02, OpCodes.ModeZeroPageX, 0xD5);
    }
    public execute(cpu: ICpu): void {
        cpu.compareWithFlags(cpu.rA, cpu.peek(cpu.addrZeroPageX()));
    }
}    

@IsOpCode
export class CompareAccumulatorAbsolute extends BaseOpCode {
    constructor() {
        super("CMP", 0x03, OpCodes.ModeAbsolute, 0xCD);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrPopWord());
        cpu.compareWithFlags(cpu.rA, targetValue);
    }
}    

@IsOpCode
export class CompareAccumulatorAbsoluteX extends BaseOpCode {
    constructor() {
        super("CMP", 0x03, OpCodes.ModeAbsoluteX, 0xDD);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrAbsoluteX());
        cpu.compareWithFlags(cpu.rA, targetValue);
    }
}    

@IsOpCode
export class CompareAccumulatorAbsoluteY extends BaseOpCode {
    constructor() {
        super("CMP", 0x03, OpCodes.ModeAbsoluteY, 0xD9);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrAbsoluteY());
        cpu.compareWithFlags(cpu.rA, targetValue);
    }
}    

@IsOpCode
export class CompareAccumulatorIndexedIndirectX extends BaseOpCode {
    constructor() {
        super("CMP", 0x02, OpCodes.ModeIndexedIndirectX, 0xC1);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrIndexedIndirectX());
        cpu.compareWithFlags(cpu.rA, targetValue);
    }
}    

@IsOpCode
export class CompareAccumulatorIndirectIndexedY extends BaseOpCode {
    constructor() {
        super("CMP", 0x02, OpCodes.ModeIndexedIndirectY, 0xD1);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrIndirectIndexedY());
        cpu.compareWithFlags(cpu.rA, targetValue);
    }
}    

/* ===========
    === CPX ===
    =========== */

@IsOpCode
export class CompareXImmediate extends BaseOpCode {
    constructor() {
        super("CPX", 0x02, OpCodes.ModeImmediate, 0xE0);
    }
    public execute(cpu: ICpu): void {
        cpu.compareWithFlags(cpu.rX, cpu.addrPop());
    }
}

@IsOpCode
export class CompareXZeroPage extends BaseOpCode {
    constructor() {
        super("CPX", 0x02, OpCodes.ModeZeroPage, 0xE4);
    }        
    public execute(cpu: ICpu): void {
        var zeroPage = cpu.addrPop();
        cpu.compareWithFlags(cpu.rX, cpu.peek(zeroPage));
    }
}    

@IsOpCode
export class CompareXAbsolute extends BaseOpCode {
    constructor() {
        super("CPX", 0x03, OpCodes.ModeAbsolute, 0xEC);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrPopWord());
        cpu.compareWithFlags(cpu.rX, targetValue);
    }
}    

/* ===========
    === CPY ===
    =========== */

@IsOpCode
export class CompareYImmediate extends BaseOpCode {
    constructor() {
        super("CPY", 0x02, OpCodes.ModeImmediate, 0xC0);
    }
    public execute(cpu: ICpu): void {
        cpu.compareWithFlags(cpu.rY, cpu.addrPop());
    }
}

@IsOpCode
export class CompareYZeroPage extends BaseOpCode {
    constructor() {
        super("CPY", 0x02, OpCodes.ModeZeroPage, 0xC4);
    }        
    public execute(cpu: ICpu): void {
        var zeroPage = cpu.addrPop();
        cpu.compareWithFlags(cpu.rY, cpu.peek(zeroPage));
    }
}    

@IsOpCode
export class CompareYAbsolute extends BaseOpCode {
    constructor() {
        super("CPY", 0x03, OpCodes.ModeAbsolute, 0xCC);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrPopWord());
        cpu.compareWithFlags(cpu.rY, targetValue);
    }
}    

@IsOpCode
export class DecXSingle extends BaseOpCode {
    constructor() {
        super("DEX", 0x01, OpCodes.ModeSingle, 0xCA);
    }
    public execute(cpu: ICpu): void {
        cpu.rX -= 1;
        if (cpu.rX < 0) {
            cpu.rX = Constants.Memory.ByteMask;
        }
        cpu.setFlags(cpu.rX);
    }
}

@IsOpCode
export class DecYSingle extends BaseOpCode {
    constructor() {
        super("DEY", 0x01, OpCodes.ModeSingle, 0x88);
    }
    public execute(cpu: ICpu): void {
        cpu.rY -= 1;
        if (cpu.rY < 0) {
            cpu.rY = Constants.Memory.ByteMask;
        }
        cpu.setFlags(cpu.rY);
    }
}

/* =========== 
    === EOR === 
    =========== */

@IsOpCode
export class ExclusiveOrImmediate extends BaseOpCode {
    constructor() {
        super("EOR", 0x02, OpCodes.ModeImmediate, 0x49);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA ^ cpu.addrPop();
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class ExclusiveOrZeroPage extends BaseOpCode {
    constructor() {
        super("EOR", 0x02, OpCodes.ModeZeroPage, 0x45);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA ^ cpu.peek(cpu.addrPop());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class ExclusiveOrZeroPageX extends BaseOpCode {
    constructor() {
        super("EOR", 0x02, OpCodes.ModeZeroPageX, 0x55);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA ^ cpu.peek(cpu.addrZeroPageX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class ExclusiveOrAbsolute extends BaseOpCode {
    constructor() {
        super("EOR", 0x03, OpCodes.ModeAbsolute, 0x4D);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA ^ cpu.peek(cpu.addrPopWord());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class ExclusiveOrAbsoluteX extends BaseOpCode {
    constructor() {
        super("EOR", 0x03, OpCodes.ModeAbsoluteX, 0x5D);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA ^ cpu.peek(cpu.addrAbsoluteX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class ExclusiveOrAbsoluteY extends BaseOpCode {
    constructor() {
        super("EOR", 0x03, OpCodes.ModeAbsoluteY, 0x59);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA ^ cpu.peek(cpu.addrAbsoluteY());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class ExclusiveOrIndirectX extends BaseOpCode {
    constructor() {
        super("EOR", 0x02, OpCodes.ModeIndexedIndirectX, 0x41);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA ^ cpu.peek(cpu.addrIndexedIndirectX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class ExclusiveOrIndirectY extends BaseOpCode {
    constructor() {
        super("EOR", 0x02, OpCodes.ModeIndexedIndirectY, 0x51);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA ^ cpu.peek(cpu.addrIndirectIndexedY());
        cpu.setFlags(cpu.rA);
    }
}    

/* =======================
    === Flag Operations === 
    ======================= */

@IsOpCode
export class ClearCarrySingle extends BaseOpCode {
    constructor() {
        super("CLC", 0x01, OpCodes.ModeSingle, 0x18);
    }
    public execute(cpu: ICpu): void {
        cpu.setFlag(Constants.ProcessorStatus.CarryFlagSet, false);
    }
}    

@IsOpCode
export class SetCarrySingle extends BaseOpCode {
    constructor() {
        super("SEC", 0x01, OpCodes.ModeSingle, 0x38);
    }
    public execute(cpu: ICpu): void {
        cpu.setFlag(Constants.ProcessorStatus.CarryFlagSet, true);
    }
}    

@IsOpCode
export class ClearOverflowSingle extends BaseOpCode {
    constructor() {
        super("CLV", 0x01, OpCodes.ModeSingle, 0xB8);
    }
    public execute(cpu: ICpu): void {
        cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, false);
    }
}    

@IsOpCode
export class ClearDecimalSingle extends BaseOpCode {
    constructor() {
        super("CLD", 0x01, OpCodes.ModeSingle, 0xD8);
    }
    public execute(cpu: ICpu): void {
        cpu.setFlag(Constants.ProcessorStatus.DecimalFlagSet, false);
    }
}    

@IsOpCode
export class SetDecimalSingle extends BaseOpCode {
    constructor() {
        super("SED", 0x01, OpCodes.ModeSingle, 0xF8);
    }
    public execute(cpu: ICpu): void {
        cpu.setFlag(Constants.ProcessorStatus.DecimalFlagSet, true);
    }
}    

/* =================
    === INC (X,Y) ===
    ================= */

@IsOpCode
export class IncAbsolute extends BaseOpCode {
    constructor() {
        super("INC", 0x03, OpCodes.ModeAbsolute, 0xEE);
    }
    public execute(cpu: ICpu): void {
        var target: number = cpu.addrPopWord();
        var value: number = cpu.peek(target);
        value = (value + 1) & Constants.Memory.ByteMask;
        cpu.poke(target, value);
        cpu.setFlags(value);
    }
}

@IsOpCode
export class IncAbsoluteX extends BaseOpCode {
    constructor() {
        super("INC", 0x03, OpCodes.ModeAbsoluteX, 0xFE);
    }
    public execute(cpu: ICpu): void {
        var target: number = cpu.addrAbsoluteX();
        var value: number = cpu.peek(target);
        value = (value + 1) & Constants.Memory.ByteMask;
        cpu.poke(target, value);
        cpu.setFlags(value);
    }
}

@IsOpCode
export class IncZeroPage extends BaseOpCode {
    constructor() {
        super("INC", 0x02, OpCodes.ModeZeroPage, 0xE6);
    }
    public execute(cpu: ICpu): void {
        var target: number = cpu.addrPop();
        var value: number = cpu.peek(target);
        value = (value + 1) & Constants.Memory.ByteMask;
        cpu.poke(target, value);
        cpu.setFlags(value);
    }
}

@IsOpCode
export class IncZeroPageX extends BaseOpCode {
    constructor() {
        super("INC", 0x02, OpCodes.ModeZeroPageX, 0xF6);
    }
    public execute(cpu: ICpu): void {
        var target: number = cpu.addrZeroPageX();
        var value: number = cpu.peek(target);
        value = (value + 1) & Constants.Memory.ByteMask;
        cpu.poke(target, value);
        cpu.setFlags(value);
    }
}

@IsOpCode
export class IncYSingle extends BaseOpCode {
    constructor() {
        super("INY", 0x01, OpCodes.ModeSingle, 0xC8);
    }
    public execute(cpu: ICpu): void {
        cpu.rY = ((cpu.rY) + 1) & Constants.Memory.ByteMask;
        cpu.setFlags(cpu.rY);
    }
}

@IsOpCode
export class IncrementXSingle extends BaseOpCode {
    constructor() {
        super("INX", 0x01, OpCodes.ModeSingle, 0xE8);
    }
    public execute(cpu: ICpu): void {
        cpu.rX = (cpu.rX + 1) & Constants.Memory.ByteMask;
        cpu.setFlags(cpu.rX);
    }
}

/* ===========
    === JMP ===
    =========== */

@IsOpCode
export class JmpIndirect extends BaseOpCode {
    constructor() {
        super("JMP", 0x03, OpCodes.ModeIndirect, 0x6C);
    }
    public execute(cpu: ICpu): void {
        cpu.rPC = cpu.addrIndirect();
    }
}

@IsOpCode
export class JmpAbsolute extends BaseOpCode {
    constructor() {
        super("JMP", 0x03, OpCodes.ModeAbsolute, 0x4C);
    }
    public execute(cpu: ICpu): void {
        var newAddress: number = cpu.addrPopWord();
        cpu.rPC = newAddress;
    }
}

@IsOpCode
export class JmpSubroutineAbsolute extends BaseOpCode {
    constructor() {
        super("JSR", 0x03, OpCodes.ModeAbsolute, 0x20);
    }
    public execute(cpu: ICpu): void {
        var newAddress: number = cpu.addrPopWord();
        cpu.stackPush(((cpu.rPC - 1) >> Constants.Memory.BitsInByte) & Constants.Memory.ByteMask);
        cpu.stackPush((cpu.rPC - 1) & (Constants.Memory.ByteMask));
        cpu.rPC = newAddress;
    }
}

@IsOpCode
export class LoadAccumulatorImmediate extends BaseOpCode {
    constructor() {
        super("LDA", 0x02, OpCodes.ModeImmediate, 0xA9);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.addrPop();
        cpu.setFlags(cpu.rA);
    }
}

@IsOpCode
export class LoadAccumulatorAbsolute extends BaseOpCode {
    constructor() {
        super("LDA", 0x03, OpCodes.ModeAbsolute, 0xAD);
    }
    public execute(cpu: ICpu): void {
        var memory: number = cpu.addrPopWord();
        cpu.rA = cpu.peek(memory);
        cpu.setFlags(cpu.rA);
    }
}

@IsOpCode
export class LoadAccumulatorAbsoluteX extends BaseOpCode {
    constructor() {
        super("LDA", 0x03, OpCodes.ModeAbsoluteX, 0xBD);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.peek(cpu.addrAbsoluteX());
        cpu.setFlags(cpu.rA);
    }
}

@IsOpCode
export class LoadAccumulatorZeroPage extends BaseOpCode {
    constructor() {
        super("LDA", 0x02, OpCodes.ModeZeroPage, 0xA5);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.peek(cpu.addrPop());
        cpu.setFlags(cpu.rA);
    }
}

@IsOpCode
export class LoadAccumulatorIndexedIndirectY extends BaseOpCode {
    constructor() {
        super("LDA", 0x02, OpCodes.ModeIndexedIndirectY, 0xB1);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.peek(cpu.addrIndirectIndexedY());
        cpu.setFlags(cpu.rA);
    }
}

@IsOpCode
export class LoadYRegisterAbsolute extends BaseOpCode {
    constructor() {
        super("LDY", 0x03, OpCodes.ModeAbsolute, 0xAC);
    }
    public execute(cpu: ICpu): void {
        var target: number = cpu.addrPopWord();
        cpu.rY = cpu.peek(target);
        cpu.setFlags(cpu.rY);
    }
}

@IsOpCode
export class LoadYRegisterImmediate extends BaseOpCode {
    constructor() {
        super("LDY", 0x02, OpCodes.ModeImmediate, 0xA0);
    }
    public execute(cpu: ICpu): void {
        cpu.rY = cpu.addrPop();
        cpu.setFlags(cpu.rY);
    }
}

@IsOpCode
export class LoadYRegisterZeroPage extends BaseOpCode {
    constructor() {
        super("LDY", 0x02, OpCodes.ModeZeroPage, 0xA4);
    }
    public execute(cpu: ICpu): void {
        var zeroPage: number = cpu.addrPop();
        cpu.rY = cpu.peek(zeroPage);
        cpu.setFlags(cpu.rY);
    }
}

@IsOpCode
export class LoadXRegisterImmediate extends Function implements IOperation {

    public opName: string = "LDX";
    public sizeBytes: number = 0x02; 
    public decompile (address: number, bytes: number[]): string {
        return  OpCodes.ToDecompiledLine(
            OpCodes.ToWord(address),
            this.opName,
            "#$" + OpCodes.ToByte(bytes[1]));
    }
    
    public addressingMode: number = OpCodes.ModeImmediate; 
    public opCode: number = 0xa2; 
    public execute(cpu: ICpu): void {
        cpu.rX = cpu.addrPop();
        cpu.setFlags(cpu.rX);
    }
}

@IsOpCode
export class LoadXRegisterZeroPage extends Function implements IOperation {

    public opName: string = "LDX";
    public sizeBytes: number = 0x02; 
    public decompile (address: number, bytes: number[]): string {
        return  OpCodes.ToDecompiledLine(
            OpCodes.ToWord(address),
            this.opName,
            "$" + OpCodes.ToByte(bytes[1]));
    }
    
    public addressingMode: number = OpCodes.ModeZeroPage; 
    public opCode: number = 0xa6; 
    public execute(cpu: ICpu): void {
        var zeroPage: number = cpu.addrPop();
        cpu.rX = cpu.peek(zeroPage);
        cpu.setFlags(cpu.rX);
    }
}

/* =========== 
    === NOP === 
    =========== */

@IsOpCode
export class NoOperationSingle extends BaseOpCode {
    constructor() {
        super("NOP", 0x01, OpCodes.ModeSingle, 0xEA);
    }
    public execute(cpu: ICpu): void {
        return; 
    }
}

/* =========== 
    === ORA === 
    =========== */

@IsOpCode
export class OrImmediate extends BaseOpCode {
    constructor() {
        super("ORA", 0x02, OpCodes.ModeImmediate, 0x09);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA | cpu.addrPop();
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class OrZeroPage extends BaseOpCode {
    constructor() {
        super("ORA", 0x02, OpCodes.ModeZeroPage, 0x05);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA | cpu.peek(cpu.addrPop());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class OrZeroPageX extends BaseOpCode {
    constructor() {
        super("ORA", 0x02, OpCodes.ModeZeroPageX, 0x15);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA | cpu.peek(cpu.addrZeroPageX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class OrAbsolute extends BaseOpCode {
    constructor() {
        super("ORA", 0x03, OpCodes.ModeAbsolute, 0x0D);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA | cpu.peek(cpu.addrPopWord());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class OrAbsoluteX extends BaseOpCode {
    constructor() {
        super("ORA", 0x03, OpCodes.ModeAbsoluteX, 0x1D);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA | cpu.peek(cpu.addrAbsoluteX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class OrAbsoluteY extends BaseOpCode {
    constructor() {
        super("ORA", 0x03, OpCodes.ModeAbsoluteY, 0x19);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA | cpu.peek(cpu.addrAbsoluteY());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class OrIndirectX extends BaseOpCode {
    constructor() {
        super("ORA", 0x02, OpCodes.ModeIndexedIndirectX, 0x01);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA | cpu.peek(cpu.addrIndexedIndirectX());
        cpu.setFlags(cpu.rA);
    }
}    

@IsOpCode
export class OrIndirectY extends BaseOpCode {
    constructor() {
        super("ORA", 0x02, OpCodes.ModeIndexedIndirectY, 0x11);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rA | cpu.peek(cpu.addrIndirectIndexedY());
        cpu.setFlags(cpu.rA);
    }
}    

/* ===========
    === RTS ===
    =========== */

@IsOpCode
export class RtsSingle extends BaseOpCode {
    constructor() {
        super("RTS", 0x01, OpCodes.ModeSingle, 0x60);
    }
    public execute(cpu: ICpu): void {
        cpu.stackRts();
    }
}

/* ==========================
    === Stack Instructions ===
    ========================== */

@IsOpCode
export class PullProcessorStatusSingle extends BaseOpCode {
    constructor() {
        super("PLP", 0x01, OpCodes.ModeSingle, 0x28);
    }
    public execute(cpu: ICpu): void {
        cpu.rP = cpu.stackPop();            
    }
}

@IsOpCode
export class PushProcessorStatusSingle extends BaseOpCode {
    constructor() {
        super("PHP", 0x01, OpCodes.ModeSingle, 0x08);
    }
    public execute(cpu: ICpu): void {
        cpu.stackPush(cpu.rP);
    }
}

@IsOpCode
export class PullAccumulatorSingle extends BaseOpCode {
    constructor() {
        super("PLA", 0x01, OpCodes.ModeSingle, 0x68);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.stackPop();
        cpu.setFlags(cpu.rA);
    }
}

@IsOpCode
export class PushAccumulatorSingle extends BaseOpCode {
    constructor() {
        super("PHA", 0x01, OpCodes.ModeSingle, 0x48);
    }
    public execute(cpu: ICpu): void {
        cpu.stackPush(cpu.rA);
    }
}

@IsOpCode
export class TransferXRegisterToStackPointerSingle extends BaseOpCode {
    constructor() {
        super("TXS", 0x01, OpCodes.ModeSingle, 0x9A);
    }
    public execute(cpu: ICpu): void {
        cpu.rSP = cpu.rX; 
    }
}

@IsOpCode
export class TransferStackPointerToXRegisterSingle extends BaseOpCode {
    constructor() {
        super("TSX", 0x01, OpCodes.ModeSingle, 0xBA);
    }
    public execute(cpu: ICpu): void {
        cpu.rX = cpu.rSP; 
    }
}

/* ===========
    === STA ===
    =========== */

@IsOpCode
export class StoreAccumulatorAbsolute extends BaseOpCode {
    constructor() {
        super("STA", 0x03, OpCodes.ModeAbsolute, 0x8D);
    }
    public execute(cpu: ICpu): void {
        var targetAddress: number = cpu.addrPopWord();
        cpu.poke(targetAddress, cpu.rA);
    }
}

@IsOpCode
export class StoreAccumulatorAbsoluteX extends BaseOpCode {
    constructor() {
        super("STA", 0x03, OpCodes.ModeAbsoluteX, 0x9D);
    }
    public execute(cpu: ICpu): void {
        cpu.poke(cpu.addrAbsoluteX(), cpu.rA);
    }
}

@IsOpCode
export class StoreAccumulatorAbsoluteY extends BaseOpCode {
    constructor() {
        super("STA", 0x03, OpCodes.ModeAbsoluteY, 0x99);
    }
    public execute(cpu: ICpu): void {
        cpu.poke(cpu.addrAbsoluteY(), cpu.rA);
    }
}

@IsOpCode
export class StoreAccumulatorIndirectY extends BaseOpCode {
    constructor() {
        super("STA", 0x02, OpCodes.ModeIndexedIndirectY, 0x91);
    }
    public execute(cpu: ICpu): void {
        cpu.poke(cpu.addrIndirectIndexedY(), cpu.rA);
    }
}

@IsOpCode
export class StoreAccumulatorIndirectX extends BaseOpCode {
    constructor() {
        super("STA", 0x02, OpCodes.ModeIndexedIndirectX, 0xA1);
    }
    public execute(cpu: ICpu): void {
        cpu.poke(cpu.addrIndexedIndirectX(), cpu.rA);
    }
}

@IsOpCode
export class StoreAccumulatorZeroPage extends BaseOpCode {
    constructor() {
        super("STA", 0x02, OpCodes.ModeZeroPage, 0x85);
    }
    public execute(cpu: ICpu): void {
        var zeroPage: number = cpu.addrPop();
        cpu.poke(zeroPage, cpu.rA);
    }
}

@IsOpCode
export class StoreYRegisterAbsolute extends BaseOpCode {
    constructor() {
        super("STY", 0x03, OpCodes.ModeAbsolute, 0x8C);
    }
    public execute(cpu: ICpu): void {
        var targetAddress: number = cpu.addrPopWord();
        cpu.poke(targetAddress, cpu.rY);
    }
}

/* ===========
    === SBC ===
    =========== */

@IsOpCode
export class SubtractWithCarryImmediate extends BaseOpCode {
    constructor() {
        super("SBC", 0x02, OpCodes.ModeImmediate, 0xE9);
    }
    public execute(cpu: ICpu): void {
        OpCodes.SubtractWithCarry(cpu, cpu.addrPop());
    }
}    

@IsOpCode
export class SubtractWithCarryZeroPage extends BaseOpCode {
    constructor() {
        super("SBC", 0x02, OpCodes.ModeZeroPage, 0xE5);
    }        
    public execute(cpu: ICpu): void {
        var zeroPage = cpu.addrPop();
        OpCodes.SubtractWithCarry(cpu, cpu.peek(zeroPage));
    }
}    

@IsOpCode
export class SubtractWithCarryZeroPageX extends BaseOpCode {
    constructor() {
        super("SBC", 0x02, OpCodes.ModeZeroPageX, 0xF5);
    }
    public execute(cpu: ICpu): void {
        OpCodes.SubtractWithCarry(cpu, cpu.peek(cpu.addrZeroPageX()));
    }
}    

@IsOpCode
export class SubtractWithCarryAbsolute extends BaseOpCode {
    constructor() {
        super("SBC", 0x03, OpCodes.ModeAbsolute, 0xED);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrPopWord());
        OpCodes.SubtractWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class SubtractWithCarryAbsoluteX extends BaseOpCode {
    constructor() {
        super("SBC", 0x03, OpCodes.ModeAbsoluteX, 0xFD);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrAbsoluteX());
        OpCodes.SubtractWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class SubtractWithCarryAbsoluteY extends BaseOpCode {
    constructor() {
        super("SBC", 0x03, OpCodes.ModeAbsoluteY, 0xF9);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrAbsoluteY());
        OpCodes.SubtractWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class SubtractWithCarryIndexedIndirectX extends BaseOpCode {
    constructor() {
        super("SBC", 0x02, OpCodes.ModeIndexedIndirectX, 0xE1);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrIndexedIndirectX());
        OpCodes.SubtractWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class SubtractWithCarryIndirectIndexedY extends BaseOpCode {
    constructor() {
        super("SBC", 0x02, OpCodes.ModeIndexedIndirectY, 0xF1);
    }
    public execute(cpu: ICpu): void {
        var targetValue: number = cpu.peek(cpu.addrIndirectIndexedY());
        OpCodes.SubtractWithCarry(cpu, targetValue);
    }
}    

@IsOpCode
export class TransferAccumulatorToXSingle extends BaseOpCode {
    constructor() {
        super("TAX", 0x01, OpCodes.ModeSingle, 0xAA);
    }
    public execute(cpu: ICpu): void {
        cpu.rX = cpu.rA;
        cpu.setFlags(cpu.rX);
    }
}

@IsOpCode
export class TransferAccumulatorToYSingle extends BaseOpCode {
    constructor() {
        super("TAY", 0x01, OpCodes.ModeSingle, 0xA8);
    }
    public execute(cpu: ICpu): void {
        cpu.rY = cpu.rA;
        cpu.setFlags(cpu.rY);
    }
}

@IsOpCode
export class TransferXToAccumulatorSingle extends BaseOpCode {
    constructor() {
        super("TXA", 0x01, OpCodes.ModeSingle, 0x8A);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rX;
        cpu.setFlags(cpu.rA);
    }
}

@IsOpCode
export class TransferYToAccumulatorSingle extends BaseOpCode {
    constructor() {
        super("TYA", 0x01, OpCodes.ModeSingle, 0x98);
    }
    public execute(cpu: ICpu): void {
        cpu.rA = cpu.rY;
        cpu.setFlags(cpu.rA);
    }
}