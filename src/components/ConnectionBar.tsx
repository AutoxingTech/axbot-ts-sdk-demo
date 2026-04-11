import type { ConnectionConfig, ProxyInfo } from '../hooks/useRobotApi';

type ConnectionBarProps = {
    configured: boolean;
    connection: ConnectionConfig;
    proxyInfo: ProxyInfo | null;
    loading: boolean;
    onConnectionChange: (next: ConnectionConfig) => void;
    onApply: () => Promise<void>;
};

export function ConnectionBar({
    configured,
    connection,
    proxyInfo,
    loading,
    onConnectionChange,
    onApply,
}: ConnectionBarProps) {
    return (
        <div className="card">
            <h2 className="card-title">Connection Settings & Proxy</h2>
            <div className="grid">
                <div className="control-group">
                    <label className="control-label">REST Base URL</label>
                    <input 
                        className="input" 
                        value={connection.restBaseUrl} 
                        onChange={e => onConnectionChange({ ...connection, restBaseUrl: e.target.value })} 
                        placeholder="https://192.168.1.100" 
                    />
                </div>
                <div className="control-group">
                    <label className="control-label">WebSocket URL</label>
                    <input 
                        className="input" 
                        value={connection.wsUrl} 
                        onChange={e => onConnectionChange({ ...connection, wsUrl: e.target.value })} 
                        placeholder="Optional. Defaults to ws(s)://host/ws/v2/topics" 
                    />
                </div>
            </div>

            <div className="control-group mt-4">
                <label className="control-label">Cookie / Token</label>
                <textarea 
                    className="input" 
                    rows={3} 
                    value={connection.cookie} 
                    onChange={e => onConnectionChange({ ...connection, cookie: e.target.value })} 
                    style={{ resize: 'vertical' }}
                    placeholder="Paste the full Cookie header value here..."
                />
            </div>

            <div className="flex-row mt-4" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex-row">
                    <button className="btn btn-primary" disabled={loading} onClick={() => void onApply()}>
                        {loading ? 'Applying...' : 'Apply Connection'}
                    </button>
                    
                    <span className={`status-badge ${configured ? 'status-connected' : 'status-disconnected'}`}>
                        {configured ? 'Proxy ready' : 'Not configured'}
                    </span>

                    {proxyInfo && proxyInfo.wsUrl && (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>WS: {proxyInfo.wsUrl}</span>
                    )}
                </div>
            </div>

            {!configured && (
                <div style={{ marginTop: '1rem', backgroundColor: '#f0f9ff', color: '#0369a1', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: '1px solid #bae6fd', fontSize: '0.875rem' }}>
                    <strong>Setup:</strong> The SDK calls a local proxy (`/robot-api`). The Vite dev server will forward requests to the URL above, injecting your Cookie for authentication.
                </div>
            )}
        </div>
    );
}
