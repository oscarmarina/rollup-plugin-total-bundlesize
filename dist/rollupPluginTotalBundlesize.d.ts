declare function _default({ showFileDetail, ...boxenOptions }?: {
    showFileDetail?: boolean;
}): {
    name: string;
    generateBundle: (...args: any[]) => Promise<void>;
    closeBundle(): void;
};
export default _default;
