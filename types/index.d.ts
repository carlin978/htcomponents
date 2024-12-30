export interface Config extends Record<string, string> {
    srcDir: string;
    outDir: string;
    componentDir: string;
}
export declare const configKeys: readonly string[];
export declare function loadConfig(): Promise<Config>;
export declare function ensureDirs(config: Config): Promise<void>;
export declare function recreateFileStructure(config: Config): Promise<void>;
