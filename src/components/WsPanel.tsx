import { Alert, Button, ComboBox, Input, Toggle } from '@kingsimba/nc-ui';
import { useState } from 'react';
import { JsonDisplay } from './JsonDisplay';
import { useWebSocket } from '../hooks/useWebSocket';

type ResultSetter = (result: { title: string; value: unknown }) => void;

type WsPanelProps = {
    configured: boolean;
    onResult: ResultSetter;
};

const topicOptions = [
    { label: '/tracked_pose', value: '/tracked_pose' },
    { label: '/slam/state', value: '/slam/state' },
    { label: '/planning_state', value: '/planning_state' },
    { label: '/wheel_state', value: '/wheel_state' },
    { label: '/battery_state', value: '/battery_state' },
    { label: '/alerts', value: '/alerts' },
    { label: '/path', value: '/path' },
    { label: '/map', value: '/map' },
    { label: '/trajectory', value: '/trajectory' },
    { label: '/robot_model', value: '/robot_model' },
    { label: '/global_positioning_state', value: '/global_positioning_state' },
];

export function WsPanel({ configured, onResult }: WsPanelProps) {
    const [topic, setTopic] = useState('/tracked_pose');
    const {
        connected,
        error,
        messages,
        subscribedTopics,
        setShouldConnect,
        subscribe,
        unsubscribe,
        clearMessages,
    } = useWebSocket({ enabled: configured });

    return (
        <div className="ws-panel">
            <div className="inline-row ws-toolbar">
                <Toggle checked={connected} onChange={setShouldConnect} label="Connect" disabled={!configured} />
                <ComboBox
                    label="Topic preset"
                    value={topic}
                    onChange={(value) => setTopic(value || '')}
                    options={topicOptions}
                    allowTyping
                />
                <Input label="Custom topic" value={topic} onChange={setTopic} clearable />
            </div>

            <div className="inline-row">
                <Button onClick={() => subscribe(topic)} disabled={!connected || !topic}>
                    Subscribe
                </Button>
                <Button onClick={() => unsubscribe(topic)} disabled={!connected || !topic}>
                    Unsubscribe
                </Button>
                <Button onClick={clearMessages} disabled={messages.length === 0}>
                    Clear Messages
                </Button>
            </div>

            {error ? <Alert code={20} type="error" text={error} /> : null}
            {subscribedTopics.length > 0 ? <p className="weak">Subscribed: {subscribedTopics.join(', ')}</p> : null}

            <JsonDisplay title="Latest WebSocket messages" value={messages} />

            <div className="action-grid compact-actions">
                <Button onClick={() => onResult({ title: 'Latest WebSocket messages', value: messages })} disabled={messages.length === 0}>
                    Send To Output Tab
                </Button>
            </div>
        </div>
    );
}