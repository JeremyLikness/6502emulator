export module Constants {

    export class Memory {
        public static Max: number = 0xFFFF;
        public static Size: number = Memory.Max + 0x01;
        public static ByteMask: number = 0xFF; 
        public static NibbleMask: number = 0x0F; 
        public static HighNibbleMask: number = 0xF0; 
        public static Stack: number = 0x0100;
        public static BitsInByte: number = 8;
        public static DefaultStart: number = 0x0200;
        public static BranchBack: number = 0x7F; 
        public static BranchOffset: number = 0x100;
        public static MaxInstructionsDecompile: number = 50;
        public static ZeroPageTimerSeconds: number = 0xFB; 
        public static ZeroPageTimerMilliseconds: number = 0xFC;
        public static ZeroPageRandomNumberGenerator: number = 0xFD;
        public static ZeroPageCharacterOutput: number = 0xFE; 
        public static ZeroPageCharacterInput: number = 0xFF; 
    }

    export class Display {
        public static Max: number = 0x3FF; 
        public static Size: number = Display.Max + 0x01; 
        public static XMax: number = 0x20; 
        public static YMax: number = 0x20; 
        public static CanvasXMax: number = 0xC0;
        public static CanvasYMax: number = 0xC0; 
        public static XFactor: number = Display.CanvasXMax / Display.XMax; 
        public static YFactor: number = Display.CanvasYMax / Display.YMax;
        public static DisplayStart: number = 0xFC00;
        public static ConsoleLines: number = 100;
    }

    export class ProcessorStatus {
        public static CarryFlagSet: number = 0x01; 
        public static CarryFlagReset: number = Memory.ByteMask - ProcessorStatus.CarryFlagSet;
        public static ZeroFlagSet: number = 0x02;
        public static ZeroFlagReset: number = Memory.ByteMask - ProcessorStatus.ZeroFlagSet; 
        public static DecimalFlagSet: number = 0x08;
        public static DecimalFlagReset: number = Memory.ByteMask - ProcessorStatus.DecimalFlagSet;
        public static OverflowFlagSet: number = 0x40; 
        public static OverflowFlagReset: number = Memory.ByteMask - ProcessorStatus.OverflowFlagSet;
        public static NegativeFlagSet: number = 0x80;
        public static NegativeFlagReset: number = Memory.ByteMask - ProcessorStatus.NegativeFlagSet;
    }
}
