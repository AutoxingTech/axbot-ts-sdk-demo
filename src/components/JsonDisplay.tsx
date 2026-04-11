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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%', minHeight: 0 }}>
            <div className="json-header">
                {title}
            </div>
            <pre className="json-display" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
                <code>{formatValue(value)}</code>
            </pre>
        </div>
    );
}
