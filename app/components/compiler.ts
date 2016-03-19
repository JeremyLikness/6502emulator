import {Component, Inject} from 'angular2/core';
import {FORM_DIRECTIVES, ControlGroup, FormBuilder, Validators, Control, AbstractControl} from 'angular2/common';

import {Hexadecimal} from '../pipes/hexadecimal';
import {ICpu, ICompiler} from '../emulator/interfaces';
import {Cpu} from '../emulator/cpu';
import {Compiler as CompilerService} from '../emulator/compiler';
import {IConsoleService} from '../services/interfaces';
import {ConsoleService} from '../services/consoleService';
import {Constants} from '../globalconstants';

@Component({
    selector: 'compiler',
    templateUrl: 'templates/compiler.html',
    directives: [FORM_DIRECTIVES],
    pipes: [Hexadecimal]
}) 
export class Compiler {
    
    public compilerForm: ControlGroup;
    public sources: string[] = ["palette scroll"];
    private pc: AbstractControl;
    private compilerInfo: AbstractControl;
    private selectedSource: AbstractControl;
    
    constructor(
        @Inject(Cpu)public cpu: ICpu,
        @Inject(ConsoleService)private consoleService: IConsoleService,
        @Inject(CompilerService)private compiler: ICompiler) {
        
        var fb = new FormBuilder();
        this.compilerForm = fb.group({
            'pc': [Constants.Memory.DefaultStart.toString(16).toUpperCase(), 
                Validators.compose([Validators.required, this.pcValidator])],
            'compilerInfo': ['', Validators.required],
            'selectedSource': [this.sources[0]]
        });     
        
        this.pc = this.compilerForm.controls["pc"];
        this.compilerInfo = this.compilerForm.controls["compilerInfo"];
        this.selectedSource = this.compilerForm.controls["selectedSoruce"];  
    }  
    
    private pcValidator(ctrl: Control): { [s: string]: boolean} {
        var address: number = parseInt(ctrl.value, 16);
        var isValid: boolean = !isNaN(address) && address >= 0 && address < Constants.Memory.Size;
        return isValid ? null : {
            invalidProgramCounter: true
        };                 
    }
    
    public loadSource(): void {
        
    }  
    
    public setPc(): void {
        if (this.pc.valid) {
            this.cpu.rPC = parseInt(this.pc.value, 16);
        }
    }
    
    public decompile(): void {
        try {
            if (this.pc.valid) {
                this.compilerInfo.value = this.compiler.decompile(parseInt(this.pc.value, 16));
                this.compilerInfo.updateValueAndValidity();
            }
        }
        catch (e) {
            this.compilerInfo = e;
        }
    }
    
    public dump(): void {
        try {
            if (this.pc.valid) {
                this.compilerInfo.value = this.compiler.dump(parseInt(this.pc.value, 16));
                this.compilerInfo.updateValueAndValidity();
            }
        }
        catch (e) {
            this.compilerInfo = e;
        }
    }
    
    public compile(): void {
        var source: string = this.compilerInfo.value;
        this.compiler.compile(source);
    }
    
} 