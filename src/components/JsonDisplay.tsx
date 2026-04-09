type JsonDisplayProps = {
    title: string;
    value: unknown;
};

function formatValue(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }

    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

export function JsonDisplay({ title, value }: JsonDisplayProps) {
    return (
        <div className="output-panel">
            <div className="output-header">
                <h2 className="h3">{title}</h2>
            </div>
            <pre className="code-block output-code">{formatValue(value)}</pre>
        </div>
    );
}