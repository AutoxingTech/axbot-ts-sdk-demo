import { Alert, TabPanel, TabPanels, Tabs } from '@kingsimba/nc-ui';
import { useMemo, useState } from 'react';
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
    const [activeTab, setActiveTab] = useState('rest');
    const [result, setResult] = useState<ResultState | null>(null);
    const {
        connection,
        setConnection,
        configured,
        proxyInfo,
        lastError,
        loadingLabel,
        applyConnectionConfig,
        execute,
    } = useRobotApi();

    const tabs = useMemo(
        () => [
            { id: 'rest', label: 'REST API' },
            { id: 'ws', label: 'WebSocket' },
        ],
        [],
    );

    return (
        <div className="app-shell">
            <div className="app-hero">
                <p className="eyebrow">axbot TypeScript SDK</p>
                <h1>Robot API Demo</h1>
                <p className="lede">
                    Use the SDK through a local dev proxy, inspect JSON responses, and subscribe to live topics without any Three.js
                    rendering.
                </p>
            </div>

            <ConnectionBar
                configured={configured}
                connection={connection}
                proxyInfo={proxyInfo}
                loading={loadingLabel === 'Apply connection'}
                onConnectionChange={setConnection}
                onApply={applyConnectionConfig}
            />

            <div className="panel-stack">
                <Alert
                    code={1}
                    type="warning"
                    text="This demo is intended for diagnostics and API verification. Keep the robot in a safe state while testing service calls."
                />

                {lastError ? <Alert code={2} type="error" text={lastError} /> : null}

                <div className="app-tabs block">
                    <Tabs active={activeTab} onChange={setActiveTab} tabs={tabs} />

                    <TabPanels active={activeTab} keepMounted>
                        <TabPanel tab="rest">
                            <RestPanel
                                configured={configured}
                                loadingLabel={loadingLabel}
                                onResult={setResult}
                                execute={execute}
                            />
                        </TabPanel>
                        <TabPanel tab="ws">
                            <WsPanel configured={configured} onResult={setResult} />
                        </TabPanel>
                    </TabPanels>
                </div>

                <div className="block latest-output-section">
                    <div className="latest-output-header">
                        <p className="eyebrow">Latest Result</p>
                        <p className="weak">The newest REST response or WebSocket snapshot always appears here.</p>
                    </div>
                    <JsonDisplay title={result?.title ?? 'No output yet'} value={result?.value ?? null} />
                </div>
            </div>
        </div>
    );
}