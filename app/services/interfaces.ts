import {ICompiler, ICpuExtended} from '../emulator/interfaces';

export interface IConsoleService {
    lines: string[];
    log(message: string);
}
    
export interface ICpuService {
    getCpu(): ICpuExtended;    
    getCompiler(): ICompiler;    
}
    
export interface IDisplayService {
    pixels: number[];
    draw(address: number, value: number): void;
    callback: (address: number, value: number) => void;
}