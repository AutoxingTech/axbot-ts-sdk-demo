import { useMemo, useState, useEffect } from 'react';
import { robotApi } from '@kingsimba/axbot-sdk/robotApi';
import { ConnectionBar } from './components/ConnectionBar';
import { JsonDisplay } from './components/JsonDisplay';
import { RestPanel } from './components/RestPanel';
import { WsPanel } from './components/WsPanel';
import { useRobotApi } from './hooks/useRobotApi';

type ResultState = {
    title: string;
    value: unknown;
};

export function App() {
    const [activeTab, setActiveTab] = useState<'connection' | 'rest' | 'ws'>('connection');
    const [result, setResult] = useState<ResultState | null>(null);
    useEffect(() => { console.log("ROBOT API IN APP.TSX IS", window.robotApi = robotApi); }, []);
    const {
        connection,
        setConnection,
        configured,
        proxyInfo,
        connectionLoading,
        connectionError,
        apiLoadingLabel,
        apiError,
        lastApiCall,
        applyConnectionConfig,
        execute,
    } = useRobotApi();

    return (
        <div className="app-container">
            <header className="top-nav">
                <div className="top-nav-brand">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>
                    AxBot SDK Demo
                </div>
            </header>

            <div className="tabs">
                <div
                    className={`tab ${activeTab === 'connection' ? 'active' : ''}`}
                    onClick={() => setActiveTab('connection')}
                >
                    Connection
                </div>
                <div
                    className={`tab ${activeTab === 'rest' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rest')}
                >
                    REST API
                </div>
                <div
                    className={`tab ${activeTab === 'ws' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ws')}
                >
                    WebSocket
                </div>
            </div>

            <main className="main-content">
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                    <div style={{ display: activeTab === 'connection' ? 'block' : 'none', minHeight: '500px' }}>
                        {connectionError && (
                            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)', border: '1px solid #f87171', marginBottom: '1rem' }}>
                                <strong>Error:</strong> {connectionError}
                            </div>
                        )}
                        <ConnectionBar
                            configured={configured}
                            connection={connection}
                            proxyInfo={proxyInfo}
                            loading={connectionLoading}
                            onConnectionChange={setConnection}
                            onApply={applyConnectionConfig}
                        />
                    </div>

                    <div style={{ display: activeTab === 'rest' ? 'block' : 'none' }}>
                        {apiError && (
                            <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius)', border: '1px solid #f87171', marginBottom: '1rem' }}>
                                <strong>Error:</strong> {apiError}
                            </div>
                        )}

                        <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: '1px solid #fcd34d', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            <strong>Note:</strong> This demo is intended for diagnostics and API verification. Keep the robot in a safe state while testing service calls.
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 500px', gap: '1.5rem', alignItems: 'start' }}>
                            <div style={{ minHeight: '500px' }}>
                                <RestPanel
                                    configured={configured}
                                    loadingLabel={apiLoadingLabel}
                                    onResult={setResult}
                                    execute={execute}
                                />
                            </div>

                            <div className="card" style={{ position: 'sticky', top: '0', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 220px)', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', minHeight: '24px' }}>
                                    <h3 className="card-title" style={{ margin: 0, border: 'none', padding: 0 }}>Latest Result</h3>
                                </div>
                                {(lastApiCall || apiLoadingLabel) && (
                                    <div style={{
                                        backgroundColor: 'var(--bg-page)',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: 'var(--radius)',
                                        marginBottom: '1rem',
                                        fontSize: '0.8125rem',
                                        fontFamily: 'monospace',
                                        wordBreak: 'break-all',
                                        color: 'var(--text-muted)',
                                        position: 'relative',
                                        flexShrink: 0
                                    }}>
                                        {lastApiCall && (
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <strong style={{ color: 'var(--primary)' }}>{lastApiCall.method}</strong> {lastApiCall.url}
                                                    </div>
                                                    {lastApiCall.status !== undefined && (
                                                        <div style={{
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            backgroundColor: lastApiCall.status >= 200 && lastApiCall.status < 300 ? '#dcfce7' : '#fee2e2',
                                                            color: lastApiCall.status >= 200 && lastApiCall.status < 300 ? '#166534' : '#991b1b',
                                                            fontWeight: 'bold',
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            {lastApiCall.status}
                                                        </div>
                                                    )}
                                                </div>
                                                {lastApiCall.payload && (
                                                    <details style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                                                        <summary style={{ cursor: 'pointer', userSelect: 'none', fontWeight: 'bold', color: 'var(--text)' }}>Request Payload</summary>
                                                        <pre style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '0.75rem', background: 'transparent', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                                                            {lastApiCall.payload instanceof FormData ? '[FormData]' : typeof lastApiCall.payload === 'string' ? lastApiCall.payload : JSON.stringify(lastApiCall.payload, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </div>
                                        )}
                                        {apiLoadingLabel && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                left: 0,
                                                height: '2px',
                                                width: '40%',
                                                backgroundColor: 'var(--primary)',
                                                animation: 'slide-progress 1.2s ease-in-out infinite'
                                            }} />
                                        )}
                                    </div>
                                )}
                                {!result && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', flexShrink: 0 }}>The newest REST response appears here.</p>}
                                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                    <JsonDisplay title={result?.title ?? ''} value={result?.value ?? 'No output yet'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: activeTab === 'ws' ? 'block' : 'none', height: 'calc(100vh - 140px)' }}>
                        <WsPanel configured={configured} onResult={setResult} />
                    </div>
                </div>
            </main>
        </div>
    );
}
