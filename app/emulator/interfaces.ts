export interface ICompiler {
    compile(source: string): boolean;
    decompile(startAddress: number): string;
    dump(startAddress: number): string;
}

// label includes the name for the label and its address
export interface ILabel {
    address: number;
    labelName: string;
    dependentLabelName: string;
    offset: number;
}

// a compiled line including the address it is at, any code, whether the 
// label has been processed, the name of the label, and a high flag indicator
// for resolving immediate mode labels (i.e. #<label and #>label)
export interface ICompiledLine {
    address: number;
    operation: IOperation;
    code: number[];
    processed: boolean;
    label: string;
    high: boolean;
}

// the result of a compilation, which includes labels and compiled lines
export interface ICompilerResult {
    labels: ILabel[];
    compiledLines: ICompiledLine[];
}

export interface IOpcodeSupport {
    addrAbsoluteX(): number;
    addrAbsoluteY(): number; 
    addrIndirect(): number;
    addrIndexedIndirectX(): number;
    addrIndirectIndexedY(): number;
    addrZeroPageX(): number;
    addrZeroPageY(): number;
}

export interface ICpu extends IOpcodeSupport {

    debug: boolean;

    rA: number;
    rX: number;
    rY: number;
    rP: number;
    rPC: number;
    rSP: number;

    started: Date; 
    elapsedMilliseconds: number;
    instructionsPerSecond: number;

    autoRefresh: boolean;
    runningState: boolean; 
    errorState: boolean;
    log(msg: string): void;
    reset(): void;
    halt(): void;
    stop(): void;
    step(): void;
    run(): void;
    
    addrPop(): number;
    addrPopWord(): number; 
    stackPush(value: number): boolean;
    stackPop(): number;
    stackRts(): void;
    poke(address: number, value: number): void;
    peek(address: number): number;
    setFlags(value: number): void;
    compareWithFlags(registerValue: number, value: number): void;
    setFlag(flag: number, setFlag: boolean);    
    checkFlag(flag: number): boolean;
}

export interface IOperation {
    execute(cpu: ICpu): void;
    addressingMode: number;
    opCode: number;
    opName: string;
    sizeBytes: number; 
    decompile(address: number, bytes: number[]): string;
}

export interface ICpuExtended extends ICpu {
    getOperation(value: number): IOperation;        
}