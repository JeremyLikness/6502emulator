import {Injectable, Inject} from 'angular2/core';

import {InvalidOp} from './opCodes';
import {OpCodes} from './opsCodes';

import {IConsoleService} from '../services/interfaces';
import {ConsoleService} from '../services/consoleService';

import {ICpu, ICpuExtended, ICompiledLine, ICompilerResult, ILabel, ICompiler, IOperation} from './interfaces';

import {Cpu} from './cpu';

import {Constants} from '../globalConstants';

@Injectable()
export class Compiler implements ICompiler {

    private pcAddress: number; // current address set by source
    private opCodeCache: { [opCodeName: string] : IOperation[] };
    private opCode: RegExp = /^\s*([A-Z]{3})\s*\S*/;  // matches an op code          
    private notWhitespace: RegExp = /\S/; // true when there is non-whitespace
    private whitespaceTrim: RegExp = /^\s+/; // trim whitespace
    private whitespaceTrimEnd: RegExp = /\s+$/; // further trim whitespace
    private labelMath: RegExp = /^\s*([A-Z][A-Z_0-9]+)\s*=\s*([A-Z][A-Z_0-9]+)\s*([\+\-])\s*([0-9]{1,3})\s*$/; // LABEL = OTHERLABEL + 1
    private memoryLabelHex: RegExp = /^(\$[0-9A-F]+):.*/; // $C000:
    private memoryLabelDec: RegExp = /^([0-9]+):.*/; // 49152:
    private regularLabel: RegExp = /^([A-Z][A-Z_0-9]+):.*/; // LABEL:
    private memorySet: RegExp = /^\*\s*\=\s*[\$]?[0-9A-F]*$/; // *=$C000 or *=49152
    private setAddress: RegExp = /^[\s]*\*[\s]*=[\s]*/; // for parsing out the value
    private immediate: RegExp = /^\#([0-9]{1,3})\s*/; // #$0A
    private immediateHex: RegExp = /^\#([0-9A-F]{1,2})\s*/; // #111
    private immediateLabel: RegExp = /^\#([<>])([A-Z][A-Z_0-9]+)\s*/; // #<label or #>label 
    private indirectX: RegExp = /^\(([0-9]{1,3})(\,\s*X)\)\s*/; // (111, X)         
    private indirectXHex: RegExp = /^\(([0-9A-F]{1,2})(\,\s*X)\)\s*/; // ($C0, X)         
    private indirectY: RegExp = /^\(([0-9]{1,3})\)(\,\s*Y)\s*/; // (111), Y         
    private indirectYHex: RegExp = /^\(([0-9A-F]{1,2})\)(\,\s*Y)\s*/; // ($C0), Y         
    private absoluteX: RegExp = /^([0-9]{1,5})(\,\s*X)\s*/; // 49152, X 
    private absoluteXHex: RegExp = /^([0-9A-F]{1,4})(\,\s*X)\s*/; // $C000, X 
    private absoluteXLabel: RegExp = /^([A-Z][A-Z_0-9]+)(\,\s*X)\s*/; // LABEL, X 
    private absoluteY: RegExp = /^([0-9]{1,5})(\,\s*Y)\s*/; // 49152, Y 
    private absoluteYHex: RegExp = /^([0-9A-F]{1,4})(\,\s*Y)\s*/; // $C000, Y 
    private absoluteYLabel: RegExp = /^([A-Z][A-Z_0-9]+)(\,\s*Y)\s*/; // LABEL, Y 
    private indirect: RegExp = /^\(([0-9]{1,5})\)(^\S)*(\s*\;.*)?$/;  // JMP (49152)
    private indirectHex: RegExp = /^\(([0-9A-F]{1,4})\)(^\S)*(\s*\;.*)?$/;  // JMP ($C000)
    private indirectLabel: RegExp = /^\(([A-Z][A-Z_0-9]+)\)\s*/; // JMP (LABEL)
    private absolute: RegExp = /^([0-9]{1,5})(^\S)*(\s*\;.*)?$/;  // JMP 49152
    private absoluteHex: RegExp = /^([0-9A-F]{1,4})(^\S)*(\s*\;.*)?$/;  // JMP $C000
    private absoluteLabel: RegExp = /^([A-Z][A-Z_0-9]+)\s*/; // JMP LABEL
        
    constructor(
        @Inject(Cpu)private cpu: ICpuExtended, 
        @Inject(ConsoleService)private consoleService: IConsoleService) {
        
        this.opCodeCache = {};
    }

    public decompile(startAddress: number): string {
        
        var address: number = startAddress & Constants.Memory.Max;
        var instructions: number = 0;
        var lines: string[] = [];

        while (instructions < Constants.Memory.MaxInstructionsDecompile && address <= Constants.Memory.Max) {
        
            var opCode: number = this.cpu.peek(address);

            var parms = [
                opCode,
                this.cpu.peek(address + 1), 
                this.cpu.peek(address + 2)
            ];

            var operation = this.cpu.getOperation(opCode);

            if (!operation) {
                operation = new InvalidOp(opCode);    
            }

            lines.push(operation.decompile(address, parms));

            instructions += 1;
            address += operation.sizeBytes;
        }

        return lines.join("\r\n");
    }

    public dump(startAddress: number): string {
        
        var address: number = startAddress & Constants.Memory.Max;
        var instructions: number = 0;
        var lines: string[] = [];

        while (instructions < Constants.Memory.MaxInstructionsDecompile && address <= Constants.Memory.Max) {
        
            var line: string = "$" +  OpCodes.ToWord(address) +
                ": " + 
                 OpCodes.ToByte(this.cpu.peek(address)) + 
                " " + 
                 OpCodes.ToByte(this.cpu.peek(address + 1)) + 
                " " +
                 OpCodes.ToByte(this.cpu.peek(address + 2)) + 
                " " +
                 OpCodes.ToByte(this.cpu.peek(address + 3)) + 
                " " +
                 OpCodes.ToByte(this.cpu.peek(address + 4)) + 
                " " + 
                 OpCodes.ToByte(this.cpu.peek(address + 5)) + 
                " " +
                 OpCodes.ToByte(this.cpu.peek(address + 6)) + 
                " " +
                 OpCodes.ToByte(this.cpu.peek(address + 7)); 
            
            lines.push(line);    
            instructions += 1;
            address += 8;
        }

        return lines.join("\r\n");
    }

    public compile(source: string): boolean {  
        
        var lines: string[] = source.split('\n'); 
        this.pcAddress = this.cpu.rPC;
        
        this.consoleService.log("Starting compilation.");          
        
        try {
            // first pass actually compiles and picks up labels, then flags 
            // compiled lines that must be updated because they reference labels
            // that are defined later 
            var compiled: ICompilerResult = this.parseLabels(lines);

            // this pass simply goes through and updates the labels or throws 
            // an exception if a label is not found 
            compiled = this.compileSource(compiled);

            this.consoleService.log("Compilation complete.");
            
            var totalBytes: number = 0;
            var idx: number;
            var offset: number;
            for (idx = 0; idx < compiled.compiledLines.length; idx++) {
                var compiledLine: ICompiledLine = compiled.compiledLines[idx];
                for (offset = 0; offset < compiledLine.code.length; offset++) {
                    this.cpu.poke(compiledLine.address + offset, compiledLine.code[offset]);
                    totalBytes += 1;
                }
            }
            this.consoleService.log(totalBytes.toString(10) + " bytes of code loaded to memory.");
            this.cpu.rPC = this.pcAddress; // most recent address set in source
        }
        catch (e) {
            this.consoleService.log(e);
            return false;
        }

        return true;
    }
    
    // parses out labels but compiles as it goes because it needs to know the size
    // of the current line to keep track of labels
    private parseLabels(lines: string[]): ICompilerResult {
        
        var address: number = Constants.Memory.DefaultStart;
        var label: string;
        var opCodeLabel: string;
        var buffer: number[] = [];
        var memoryLabels: number = 0;
        var actualLabels: number = 0;
        var idx: number;
        var parameter: string;
        var instance: ILabel; 
        var target: ILabel; 

        var result: ICompilerResult = {
            labels: [],
            compiledLines: []
        };

        this.consoleService.log("Starting compilation pass 1.");          
        
        for (idx = 0; idx < lines.length; idx++) {
            
            var input = lines[idx].toUpperCase();
            
            // split any comments off 
            if (input.indexOf(";") >= 0) {
                input = input.split(";")[0];
            }

            input = this.trimLine(input);

            if(!input.match(this.notWhitespace)) {
                continue;
            }

            // check if the user is setting the address
            var testAddress: number = this.moveAddress(input);

            // if so, update that and continue
            if (!(isNaN(testAddress))) {
                this.pcAddress = testAddress;
                address = testAddress;
                continue;
            }
    
            // check to see if label math is being performed
            if (input.match(this.labelMath)) {
                var matches: RegExpExecArray = this.labelMath.exec(input);
                if (matches.length !== 5) {
                    throw "Invalid label math at line " + (idx+1) + ": " + input; 
                }
                label = matches[1];
                var otherLabel = matches[2];
                
                if (this.labelExists(label, result.labels)) {
                    throw "Duplicate label " + label + " found at line " + (idx+1);
                }

                if (label === otherLabel) {
                    throw "Cannot redefine label " + label + " at line " + (idx+1);
                }

                var offset: number = parseInt(matches[4], 10);
                
                if (matches[3] === "-") {
                    offset *= -1; 
                }

                result.labels.push({
                    address: address,
                    labelName: label,
                    dependentLabelName: otherLabel,
                    offset: offset
                });

                actualLabels++;
                continue;
            }
                    
            if(input.match(this.memoryLabelHex) || input.match(this.memoryLabelDec)) {
                
                memoryLabels++;                    
                var hex: boolean = !!input.match(this.memoryLabelHex);
                label = hex ? this.memoryLabelHex.exec(input)[1] : this.memoryLabelDec.exec(input)[1];
                
                // strip the label out 
                input = input.replace(label + ":", "");

                // strip hex out if applicable
                label = label.replace("$", "");
                address = parseInt(label, hex ? 16 : 10); 
                
                if (address < 0 || address > Constants.Memory.Max) {
                    throw "Address out of range: " + label; 
                }                                    
                
                this.pcAddress = address;   
            }
            else {
                if (input.match(this.regularLabel)) {
                    label = this.regularLabel.exec(input)[1];
                    if (this.labelExists(label, result.labels)) {
                        throw "Duplicate label " + label + " found at line " + (idx+1);
                    }
                    result.labels.push({
                        address: address,
                        labelName: label,
                        dependentLabelName: undefined,
                        offset: 0
                    });
                    actualLabels++;
                    input = input.replace(label + ":", "");
                }    
            }

            // skip whitespace only
            if (!input.match(this.notWhitespace)) {
                continue;
            }

            // check for op code 
            try {                
                var compiledLine: ICompiledLine = this.compileLine(result.labels, address, input);
                result.compiledLines.push(compiledLine);
                address += compiledLine.code.length;
            }
            catch(e) {
                throw e + " Line: " + (idx + 1);
            }                                
        }

        // now update labels that are based on math 
        for(idx = 0; idx < result.labels.length; idx++) {
            instance = result.labels[idx]; 
            if (instance.dependentLabelName === undefined) {
                continue;
            }
            target = this.findLabel(instance.dependentLabelName, result.labels);
            if (target === null) {
                throw "Unable to process label " + instance.labelName + ": missing dependent label " +
                instance.dependentLabelName;
            }
            instance.address = (target.address + instance.offset) & Constants.Memory.Max;
            instance.dependentLabelName = undefined;
        }
    
        this.consoleService.log("Parsed " + memoryLabels + " memory tags and " + actualLabels + " labels.");            
    
        return result;
    }

    private compileLine(labels: ILabel[], address: number, input: string): ICompiledLine {
        
        var result: ICompiledLine = {
            address: address,
            code: [],
            operation: null,
            processed: false,
            label: "",
            high: false
        };

        if (input.match(this.opCode)) {
            result = this.parseOpCode(labels, input, result);
        }
        else {
            throw "Invalid assembly " + input;
        }
        
        return result;
    }

    private trimLine(input: string): string {

        // only whitespace
        if (!this.notWhitespace.test(input)) {
            return "";
        }

        // trim the line 
        input = input.replace(this.whitespaceTrim, "").replace(this.whitespaceTrimEnd, "");

        return input;
    }

    private moveAddress(input: string): number {  
    
        var parameter: string;
        var address: number = NaN;

        if (input.match(this.memorySet)) {
            parameter = input.replace(this.setAddress, "");
            if(parameter[0] === "$" ) {
                parameter = parameter.replace("$", "");
                address = parseInt(parameter, 16);
            } 
            else {
                address = parseInt(parameter, 10);
            }
            
            if((address < 0) || (address > Constants.Memory.Max)) {
                throw "Address out of range";
            }
        }
        
        return address;        
    }

    private getOperationForMode(operations: IOperation[], addressMode: number): IOperation {
        var idx: number = 0;
        
        for (idx = 0; idx < operations.length; idx++) {
            if (operations[idx].addressingMode === addressMode) {
                return operations[idx];
            }
        }

        return null;
    }

    private parseOpCode(labels: ILabel[], opCodeExpression: string, compiledLine: ICompiledLine): ICompiledLine {
        
        var matches: RegExpExecArray = this.opCode.exec(opCodeExpression);
        var matchArray: string[];
        var idx: number;
        var hex: boolean;
        var rawValue: string;
        var values: string[];
        var value: number;
        var entry: string;
        var xIndex: string;
        var yIndex: string;
        var opCodeName: string = matches[1];
        var operations: IOperation[] = [];
        var parameter: string;
        var labelReady: boolean;
        var label: string;
        var labelInstance: ILabel;
        var processed: boolean;
        var test: RegExp;
        var radix: number = 10;

        if (opCodeName in this.opCodeCache) {
            operations = this.opCodeCache[opCodeName];
        }
        else {
            operations = OpCodes.LoadOpCodesByName(opCodeName);
            if (operations.length > 0) {
                this.opCodeCache[opCodeName] = operations;
            }
            else {
                throw "Invalid op code: " + opCodeName; 
            }
        }

        processed = true;

        parameter = this.trimLine(opCodeExpression.replace(opCodeName, ""));

        if (opCodeName === "DCB") {
            // dcb simply loads bytes 
            compiledLine.processed = true;
            compiledLine.operation = operations[0];
            var values = parameter.split(","); 
            if (values.length === 0) {
                throw "DCB requires a list of bytes to be inserted into the compilation stream.";
            }
            for(idx = 0; idx < values.length; idx++) {
                if (values[idx] === undefined || values[idx] === null || values[idx].length === 0) {
                    throw "DCB with invalid value list: " + parameter; 
                }    
                entry = values[idx];
                hex = entry.indexOf("$") >= 0;
                if (hex) {
                    entry = entry.replace("$", ""); 
                    value = parseInt(entry, 16);
                }
                else {
                    value = parseInt(entry, 10);
                }
                if (value < 0 || value > Constants.Memory.ByteMask) {
                    throw "DCB with value out of range: " + parameter;
                }
                compiledLine.code.push(value);
            }
            compiledLine.operation.sizeBytes = compiledLine.code.length; 
            return compiledLine;
        }

        hex = parameter.indexOf("$") >= 0;

        if (hex) {
            parameter = parameter.replace("$", "");
            radix = 16;
        }

        // branches 
        if (operations[0].addressingMode ===  OpCodes.ModeRelative) {
    
            test = hex ? this.absoluteHex : this.absolute;
                
            // absolute with label 
            compiledLine.processed = true;
            parameter = this.parseAbsoluteLabel(parameter, compiledLine, labels, test, this.absoluteLabel);
            processed = compiledLine.processed;

            // absolute mode
            if (matchArray = parameter.match(test)) {
                rawValue = matchArray[1];
                value = parseInt(rawValue, radix);
                if (value < 0 || value > Constants.Memory.Size) {
                    throw "Absolute value of out range: " + value;
                }

                parameter = this.trimLine(parameter.replace(rawValue, ""));
                if (parameter.match(this.notWhitespace)) {
                    throw "Invalid assembly: " + opCodeExpression;
                }

                compiledLine.operation = operations[0];

                compiledLine.code.push(compiledLine.operation.opCode);

                var offset: number;

                if (value <= compiledLine.address) {
                    offset = Constants.Memory.ByteMask - ((compiledLine.address + 1) - value); 
                }
                else {
                    offset = (value - compiledLine.address) - 2;
                }

                compiledLine.code.push(offset & Constants.Memory.ByteMask);
                compiledLine.processed = processed;
                return compiledLine;
            }
            else {
                throw "Invalid branch.";
            } 
        }

        // single only 
        if (!parameter.match(this.notWhitespace)) {
            compiledLine.operation = this.getOperationForMode(operations, OpCodes.ModeSingle);
            if (compiledLine.operation === null) {
                throw "Opcode requires a parameter " + opCodeName;
            }
            compiledLine.code.push(compiledLine.operation.opCode);
            compiledLine.processed = processed;
            return compiledLine;
        }

        // indexed indirect X 
        test = hex ? this.indirectXHex : this.indirectX;
        if (matchArray = parameter.match(test)) {
            rawValue = matchArray[1];
            xIndex = matchArray[2];
            value = parseInt(rawValue, radix);
            if (value < 0 || value > Constants.Memory.ByteMask) {
                throw "Indirect X-Indexed value of out range: " + value;
            }

            // strip the index and parenthesis 
            parameter = parameter.replace("(", "").replace(")", "");
            parameter = parameter.replace(xIndex, "");
            parameter = this.trimLine(parameter.replace(rawValue, ""));
            if (parameter.match(this.notWhitespace)) {
                throw "Invalid assembly: " + opCodeExpression;
            }
            
            compiledLine.operation = this.getOperationForMode(operations, OpCodes.ModeIndexedIndirectX);
            if (compiledLine.operation === null) {
                throw "Opcode doesn't support indirect X-indexed mode " + opCodeName;
            }

            compiledLine.code.push(compiledLine.operation.opCode);
            compiledLine.code.push(value & Constants.Memory.ByteMask);
            compiledLine.processed = processed;
            return compiledLine;
        }

        // indirect indexed Y 
        test = hex ? this.indirectYHex : this.indirectY;
        if (matchArray = parameter.match(test)) {
            rawValue = matchArray[1];
            yIndex = matchArray[2];
            value = parseInt(rawValue, radix);
            if (value < 0 || value > Constants.Memory.ByteMask) {
                throw "Indexed Indirect-Y value of out range: " + value;
            }

            // strip the index and parenthesis 
            parameter = parameter.replace("(", "").replace(")", "");
            parameter = parameter.replace(yIndex, "");
            parameter = this.trimLine(parameter.replace(rawValue, ""));
            if (parameter.match(this.notWhitespace)) {
                throw "Invalid assembly: " + opCodeExpression;
            }
            
            compiledLine.operation = this.getOperationForMode(operations, OpCodes.ModeIndexedIndirectY);
            if (compiledLine.operation === null) {
                throw "Opcode doesn't support indirected indexed-Y mode " + opCodeName;
            }

            compiledLine.code.push(compiledLine.operation.opCode);
            compiledLine.code.push(value & Constants.Memory.ByteMask);
            compiledLine.processed = processed;
            return compiledLine;
        }

        // immediate with label 
        test = hex ? this.immediateHex : this.immediate;
        if (!parameter.match(test)) {
            if (matchArray = parameter.match(this.immediateLabel)) {
                compiledLine.high = matchArray[1] === ">"; 
                label = matchArray[2];
                labelInstance = this.findLabel(label, labels);
                if (labelInstance !== null) {
                    value = compiledLine.high ? (labelInstance.address >> Constants.Memory.BitsInByte) : 
                        labelInstance.address;
                    parameter = parameter.replace(matchArray[0], "#" + (value & Constants.Memory.ByteMask).toString(10));
                }
                else {
                    compiledLine.label = label;
                    processed = false;
                    parameter = parameter.replace(matchArray[0], "#0");
                }
            }
        }

        // immediate mode 
        if (matchArray = parameter.match(test)) {
            
            rawValue = matchArray[1];
            value = parseInt(rawValue, radix);
            if (value < 0 || value > Constants.Memory.ByteMask) {
                throw "Immediate value of out range: " + value;
            }

            // strip the value to find what's remaining 
            parameter = parameter.replace("#", "");
            parameter = this.trimLine(parameter.replace(rawValue, ""));
            if (parameter.match(this.notWhitespace)) {
                throw "Invalid assembly: " + opCodeExpression;
            }
            
            compiledLine.operation = this.getOperationForMode(operations, OpCodes.ModeImmediate);
            if (compiledLine.operation === null) {
                throw "Opcode doesn't support immediate mode " + opCodeName;
            }

            compiledLine.code.push(compiledLine.operation.opCode);
            compiledLine.code.push(value);
            compiledLine.processed = processed;
            return compiledLine;
        }

        // absolute with X-index mode 
        test = hex ? this.absoluteXHex : this.absoluteX; 
        
        compiledLine.processed = true;
        parameter = this.parseAbsoluteLabel(parameter, compiledLine, labels, test, this.absoluteXLabel);
        processed = compiledLine.processed; 
        
        if (matchArray = parameter.match(test)) {
            rawValue = matchArray[1];
            xIndex = matchArray[2];
            value = parseInt(rawValue, radix);
            if (value < 0 || value > Constants.Memory.Size) {
                throw "Absolute X-Indexed value of out range: " + value;
            }

            // strip the index
            parameter = parameter.replace(xIndex, "");
            parameter = this.trimLine(parameter.replace(rawValue, ""));
            if (parameter.match(this.notWhitespace)) {
                throw "Invalid assembly: " + opCodeExpression;
            }
            
            compiledLine.operation = this.getOperationForMode(operations,  OpCodes.ModeAbsoluteX);
            if (compiledLine.operation === null) {
                throw "Opcode doesn't support absolute X-indexed mode " + opCodeName;
            }

            compiledLine.code.push(compiledLine.operation.opCode);
            compiledLine.code.push(value & Constants.Memory.ByteMask);
            compiledLine.code.push((value >> Constants.Memory.BitsInByte) & Constants.Memory.ByteMask); 
            compiledLine.processed = processed;
            return compiledLine;
        }

        // absolute with Y-index label 
        test = hex ? this.absoluteYHex : this.absoluteY;
        
        compiledLine.processed = true;
        parameter = this.parseAbsoluteLabel(parameter, compiledLine, labels, test, this.absoluteYLabel);
        processed = compiledLine.processed;

        // absolute with Y-index mode 
        if (matchArray = parameter.match(test)) {
            rawValue = matchArray[1];
            yIndex = matchArray[2];
            value = parseInt(rawValue, radix);
            if (value < 0 || value > Constants.Memory.Size) {
                throw "Absolute Y-Indexed value of out range: " + value;
            }

            // strip the index
            parameter = parameter.replace(yIndex, "");
            parameter = this.trimLine(parameter.replace(rawValue, ""));
            if (parameter.match(this.notWhitespace)) {
                throw "Invalid assembly: " + opCodeExpression;
            }
            
            compiledLine.operation = this.getOperationForMode(operations,  OpCodes.ModeAbsoluteY);
            if (compiledLine.operation === null) {
                throw "Opcode doesn't support absolute Y-indexed mode " + opCodeName;
            }

            compiledLine.code.push(compiledLine.operation.opCode);
            compiledLine.code.push(value & Constants.Memory.ByteMask);
            compiledLine.code.push((value >> Constants.Memory.BitsInByte) & Constants.Memory.ByteMask); 
            compiledLine.processed = true;
            return compiledLine;
        }

        // indirect with label 
        test = hex ? this.indirectHex : this.indirect;

        compiledLine.processed = true;
        parameter = this.parseAbsoluteLabel(parameter, compiledLine, labels, test, this.indirectLabel);
        processed = compiledLine.processed;

        // indirect mode
        if (matchArray = parameter.match(test)) {
            rawValue = matchArray[1];
            value = parseInt(rawValue, radix);
            if (value < 0 || value > Constants.Memory.Size) {
                throw "Absolute value of out range: " + value;
            }

            parameter = parameter.replace("(", "").replace(")", "");
            parameter = this.trimLine(parameter.replace(rawValue, ""));
            if (parameter.match(this.notWhitespace)) {
                throw "Invalid assembly: " + opCodeExpression;
            }

            compiledLine.operation = this.getOperationForMode(operations,OpCodes.ModeIndirect);
            if (compiledLine.operation === null) {
                throw "Opcode doesn't support indirect mode " + opCodeName;
            }

            compiledLine.code.push(compiledLine.operation.opCode);
            compiledLine.code.push(value & Constants.Memory.ByteMask);
            compiledLine.code.push((value >> Constants.Memory.BitsInByte) & Constants.Memory.ByteMask); 
            compiledLine.processed = processed;
            return compiledLine;
        }

        // absolute with label 
        test = hex ? this.absoluteHex : this.absolute;

        compiledLine.processed = true;
        parameter = this.parseAbsoluteLabel(parameter, compiledLine, labels, test, this.absoluteLabel);
        processed = compiledLine.processed;

        // absolute mode 
        if (matchArray = parameter.match(test)) {
            rawValue = matchArray[1];
            value = parseInt(rawValue, radix);
            if (value < 0 || value > Constants.Memory.Size) {
                throw "Absolute value of out range: " + value;
            }

            parameter = this.trimLine(parameter.replace(rawValue, ""));
            if (parameter.match(this.notWhitespace)) {
                throw "Invalid assembly: " + opCodeExpression;
            }

            var mode: number = value <= Constants.Memory.ByteMask ? OpCodes.ModeZeroPage : OpCodes.ModeAbsolute;
            
            compiledLine.operation = this.getOperationForMode(operations, mode);
            if (compiledLine.operation === null) {
                throw "Opcode doesn't support absolute mode " + opCodeName;
            }

            compiledLine.code.push(compiledLine.operation.opCode);
            compiledLine.code.push(value & Constants.Memory.ByteMask);
            
            if (mode ===  OpCodes.ModeAbsolute) {
                compiledLine.code.push((value >> Constants.Memory.BitsInByte) & Constants.Memory.ByteMask); 
            }
            compiledLine.processed = processed;
            return compiledLine;
        }

        throw "Unable to parse " + opCodeExpression;
    }

    
    private compileSource(compilerResult: ICompilerResult): ICompilerResult {

        this.consoleService.log("Starting compilation pass 2.");

        var idx: number;

        for (idx = 0; idx < compilerResult.compiledLines.length; idx ++) {
            var compiledLine = compilerResult.compiledLines[idx];
            if (!compiledLine.processed) {
                var labelInstance: ILabel = this.findLabel(compiledLine.label, compilerResult.labels);
                if (labelInstance === null) {
                    throw "Label not defined: " + compiledLine.label;
                }                        
                if (compiledLine.operation.sizeBytes === 2) {

                    if (compiledLine.operation.addressingMode ===  OpCodes.ModeRelative) {
                        var offset: number;

                        if (labelInstance.address <= compiledLine.address) {
                            offset = Constants.Memory.ByteMask - ((compiledLine.address + 1) - labelInstance.address); 
                        }
                        else {
                            offset = (labelInstance.address - compiledLine.address) - 2;
                        }
                        compiledLine.code[1] = offset & Constants.Memory.ByteMask;
                    }
                    else { 
                        var value: number = compiledLine.high ? (labelInstance.address >> Constants.Memory.BitsInByte) : 
                            labelInstance.address;
                        compiledLine.code[1] = value & Constants.Memory.ByteMask;
                    }
                    compiledLine.processed = true;
                    continue;
                }
                else if (compiledLine.operation.sizeBytes === 3) {
                    compiledLine.code[1] = labelInstance.address & Constants.Memory.ByteMask;
                    compiledLine.code[2] = (labelInstance.address >> Constants.Memory.BitsInByte) & Constants.Memory.ByteMask;
                    compiledLine.processed = true;
                    continue;
                }
                throw "Not implemented";
            }
        }

        return compilerResult;
    }

    private labelExists(label: string, labels: ILabel[]): boolean {
        return this.findLabel(label, labels) !== null;
    }
    
    private findLabel(label: string, labels: ILabel[]): ILabel {
        var index: number; 
        for (index = 0; index < labels.length; index++) {
            if (labels[index].labelName === label && labels[index].dependentLabelName === undefined) {
                return labels[index];
            }
        }
        return null;
    }    
    
    private parseAbsoluteLabel(
        parameter: string, 
        compiledLine: ICompiledLine, 
        labels: ILabel[], 
        targetExpr: RegExp, 
        labelExpr: RegExp): string {
        var matchArray: string[];
        
        if (!parameter.match(targetExpr)) {
            if (matchArray = parameter.match(labelExpr)) {
                var label: string = matchArray[1];
                var labelInstance: ILabel = this.findLabel(label, labels);
                if (labelInstance !== null) {
                    var value: number = labelInstance.address;
                    parameter = parameter.replace(matchArray[1], value.toString(10));
                }
                else {
                    compiledLine.label = label;
                    compiledLine.processed = false;
                    parameter = parameter.replace(matchArray[1], "65535");
                }
            }
        }
        return parameter;
    }
}