import { Alert, Button, Input } from '@kingsimba/nc-ui';
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
        <div className="block connection-panel">
            <div className="connection-grid">
                <Input
                    label="REST base URL"
                    value={connection.restBaseUrl}
                    onChange={(value) => onConnectionChange({ ...connection, restBaseUrl: value })}
                    placeholder="https://xxx"
                    clearable
                />
                <Input
                    label="WebSocket URL"
                    value={connection.wsUrl}
                    onChange={(value) => onConnectionChange({ ...connection, wsUrl: value })}
                    placeholder="Optional. Defaults to ws(s)://host/ws/v2/topics"
                    clearable
                />
            </div>

            <Input
                label="Cookie header"
                multiline
                rows={3}
                value={connection.cookie}
                onChange={(value) => onConnectionChange({ ...connection, cookie: value })}
                placeholder="Paste the full Cookie header value here, for example token=..."
            />

            <div className="connection-actions">
                <Button variant="primary" loading={loading} onClick={() => void onApply()}>
                    Apply Connection
                </Button>
                <div className="connection-status">
                    <span className={configured ? 'tag green' : 'tag yellow'}>{configured ? 'Proxy ready' : 'Not configured'}</span>
                    {proxyInfo ? <span className="weak">WS: {proxyInfo.wsUrl || 'not set'}</span> : null}
                </div>
            </div>

            {!configured ? (
                <Alert
                    code={10}
                    type="warning"
                    text="The SDK calls the local /robot-api proxy. The Vite dev server forwards requests to the robot URL you apply here and injects the cookie for auth."
                />
            ) : null}
        </div>
    );
}