import {InvalidOp, registeredOperations as ops} from './opCodes';

import {Constants} from '../globalConstants';

import {IOperation, ICpu} from '../emulator/interfaces';

export class OpCodes {
    
    public static ModeImmediate: number = 1;
    public static ModeZeroPage: number = 2;
    public static ModeZeroPageX: number = 3;
    public static ModeZeroPageY: number = 4;
    public static ModeAbsolute: number = 5;
    public static ModeAbsoluteX: number = 6;
    public static ModeAbsoluteY: number = 7;
    public static ModeIndirect: number = 8;
    public static ModeIndexedIndirectX: number = 9;
    public static ModeIndexedIndirectY: number = 10;
    public static ModeSingle: number = 11; 
    public static ModeRelative: number = 12;

    public static computeBranch(address: number, offset: number): number {
        var result: number = 0;
        if (offset > Constants.Memory.BranchBack) {
            result = (address - (Constants.Memory.BranchOffset - offset));
        }
        else {
            result = address + offset;
        }
        return result;
    }

    public static LoadOpCodesByName(opCode: string): IOperation[] {
        var result: IOperation[] = [];
        var idx: number;
        for(var idx = 0; idx < ops.length; idx++) {
            var operation: IOperation =  ops[idx];
            if (operation.opName === opCode) {
                result.push(operation);
            }
        }
        return result;
    }

    public static ToByte(value: number): string {
        var valueStr = value.toString(16).toUpperCase();
        return valueStr.length == 1 ? "0" + valueStr : valueStr;
    }

    public static ToWord(value: number): string {
        var padding = ["000", "00", "0"];
        var valueStr = value.toString(16).toUpperCase();
        if (valueStr.length === 4) {
            return valueStr;
        }
        else {
            return padding[valueStr.length-1] + valueStr;
        }            
    }

    public static ToDecompiledLine(address: string, opCode: string, parm: string) {
        return "$" + address + ": " + opCode + " " + parm;
    }

    public static ProcessLine(address: number, op: IOperation, bytes: number[]): string {
        if (op.addressingMode === OpCodes.ModeImmediate) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "#$" + OpCodes.ToByte(bytes[1]));
        }
        
        if (op.addressingMode === OpCodes.ModeZeroPage) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "$" + OpCodes.ToByte(bytes[1]));
        }

        if (op.addressingMode === OpCodes.ModeZeroPageX) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "$" + OpCodes.ToByte(bytes[1]) + ",X");
        }

        if (op.addressingMode === OpCodes.ModeAbsolute) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "$" + OpCodes.ToWord(bytes[1] + (bytes[2] << Constants.Memory.BitsInByte)));
        }

        if (op.addressingMode === OpCodes.ModeAbsoluteX) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "$" + OpCodes.ToWord(bytes[1] + (bytes[2] << Constants.Memory.BitsInByte)) + ", X");
        }

        if (op.addressingMode === OpCodes.ModeAbsoluteY) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "$" + OpCodes.ToWord(bytes[1] + (bytes[2] << Constants.Memory.BitsInByte)) + ", Y");
        }

        if (op.addressingMode === OpCodes.ModeRelative) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "$" + OpCodes.ToWord(OpCodes.computeBranch(address + 2, bytes[1])));
        }

        if (op.addressingMode === OpCodes.ModeSingle) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "");
        }

        if (op.addressingMode === OpCodes.ModeIndexedIndirectX) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "($" + OpCodes.ToByte(bytes[1]) + ", X)");
        }

        if (op.addressingMode === OpCodes.ModeIndexedIndirectY) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "($" + OpCodes.ToByte(bytes[1]) + "), Y");        
        }

        if (op.addressingMode === OpCodes.ModeIndirect) {
            return OpCodes.ToDecompiledLine(
                OpCodes.ToWord(address),
                op.opName,
                "($" + OpCodes.ToWord(bytes[1] + (bytes[2] << Constants.Memory.BitsInByte)) + ")");
        }

        throw "Unknown addressing mode.";
    }
    
    public static FillOps(operationMap: IOperation[]): void {
        var idx: number;
        var size: number = Constants.Memory.ByteMask + 1;
        while (size -= 1) {
            var invalid = new InvalidOp(size);            
            operationMap.push(invalid);
        }

        for (idx = 0; idx < ops.length; idx++) {
            var operation = ops[idx];
            operationMap[operation.opCode] = operation;
        }                
    }    
    
    public static AddWithCarry(cpu: ICpu, src: number) {
        var temp: number;
        var carryFactor: number = cpu.checkFlag(Constants.ProcessorStatus.CarryFlagSet) ? 1 : 0;
        var overflowFlag: boolean;

        function offsetAdjustAdd(offs: number, cutOff: number): boolean {
            if (offs >= cutOff) {
                cpu.setFlag(Constants.ProcessorStatus.CarryFlagSet, true);
                if (cpu.checkFlag(Constants.ProcessorStatus.OverflowFlagSet) && offs >= 0x180) {
                    cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, false);                       
                }
                return true;
            }
            else {
                cpu.setFlag(Constants.ProcessorStatus.CarryFlagSet, false);
                if (cpu.checkFlag(Constants.ProcessorStatus.OverflowFlagSet) && offs < Constants.ProcessorStatus.NegativeFlagSet) {
                    cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, false);
                }
                return false;
            }
        }
        
        overflowFlag = !((cpu.rA ^ src) & Constants.ProcessorStatus.NegativeFlagSet);
        cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, overflowFlag);
        if (cpu.checkFlag(Constants.ProcessorStatus.DecimalFlagSet)) {
            temp = (cpu.rA & Constants.Memory.NibbleMask) + (src & Constants.Memory.NibbleMask) + carryFactor;
            if (temp >= 0x0A) {
                temp = 0x10 | ((temp + 0x06) & Constants.Memory.NibbleMask);
            }
            temp += (cpu.rA & Constants.Memory.HighNibbleMask) + (src & Constants.Memory.HighNibbleMask);
            if (offsetAdjustAdd(temp, 0xA0)) {
                temp += 0x60;
            }
        }
        else {
            temp = cpu.rA + src + carryFactor;
            offsetAdjustAdd(temp, 0x100);
        }
        cpu.rA = temp & Constants.Memory.ByteMask; 
        cpu.setFlags(cpu.rA);
    }

    public static SubtractWithCarry(cpu: ICpu, src: number) {
        var temp: number, offset: number, carryFactor: number;
        var overflowFlag: boolean;

        function offsetAdjustSub(offs: number): boolean {
            if (offs < 0x100) {
                cpu.setFlag(Constants.ProcessorStatus.CarryFlagSet, false);
                if (cpu.checkFlag(Constants.ProcessorStatus.OverflowFlagSet) && offs < Constants.ProcessorStatus.NegativeFlagSet) {
                    cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, false);
                }
                return true;
            }
            else {
                cpu.setFlag(Constants.ProcessorStatus.CarryFlagSet, true);
                if (cpu.checkFlag(Constants.ProcessorStatus.OverflowFlagSet) && offset >= 0x180) {
                    cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, false);
                }
                return false;
            }
        };

        carryFactor = cpu.checkFlag(Constants.ProcessorStatus.CarryFlagSet) ? 1 : 0;
        
        cpu.setFlag(Constants.ProcessorStatus.OverflowFlagSet, !!((cpu.rA ^ src) & Constants.ProcessorStatus.NegativeFlagSet));
        if (cpu.checkFlag(Constants.ProcessorStatus.DecimalFlagSet)) {
            temp = Constants.Memory.NibbleMask + (cpu.rA & Constants.Memory.NibbleMask) - (src & Constants.Memory.NibbleMask) + carryFactor;
            if (temp < 0x10) {
                offset = 0;
                temp -= 0x06;
            }
            else {
                offset = 0x10;
                temp -= 0x10;
            }
            offset += Constants.Memory.HighNibbleMask + (cpu.rA & Constants.Memory.HighNibbleMask) - (src & Constants.Memory.HighNibbleMask);
            if (offsetAdjustSub(offset)) {
                offset -= 0x60;
            }
            offset += temp;
        }
        else {
            offset = Constants.Memory.ByteMask + cpu.rA - src + carryFactor;
            offsetAdjustSub(offset); 
        }
        cpu.rA = offset & Constants.Memory.ByteMask; 
        cpu.setFlags(cpu.rA);
    }
}   
