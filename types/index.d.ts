export declare const CONFIG_FILE = "htcomponents.json";
export declare const ACCEPTED_EXTENSIONS: readonly string[];
export interface ConfigJson {
    srcDir: string;
    outDir: string;
    componentDir: string;
    additionalExtensions?: string[];
}
export declare class Config {
    srcDir: string;
    outDir: string;
    componentDir: string;
    additionalExtensions: string[];
    static readonly dirKeys: readonly string[];
    static absolutifyPath(configPath: string): string;
    constructor(srcDir: string, outDir: string, componentDir: string, additionalExtensions?: string[]);
    static load(): Promise<Config>;
    static isValidJson(config: any): config is ConfigJson;
}
export declare function ensureDirs(config: Config): Promise<void>;
export declare function recreateFileStructure(config: Config): Promise<void>;
