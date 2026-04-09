import {
    ActivityIndicator,
    Button,
    ComboBox,
    Input,
    NumberInput,
    TabPanel,
    TabPanels,
    Tabs,
} from '@kingsimba/nc-ui';
import { useMemo, useState } from 'react';
import { robotApi } from '@kingsimba/axbot-sdk/robotApi';
import type { ExecuteRobotCall } from '../hooks/useRobotApi';

type ResultSetter = (result: { title: string; value: unknown }) => void;

type RestPanelProps = {
    configured: boolean;
    loadingLabel: string | null;
    onResult: ResultSetter;
    execute: ExecuteRobotCall;
};

const moveTypeOptions = [
    { label: 'standard', value: 'standard' },
    { label: 'charge', value: 'charge' },
    { label: 'along_given_route', value: 'along_given_route' },
    { label: 'align_with_rack', value: 'align_with_rack' },
    { label: 'to_unload_point', value: 'to_unload_point' },
    { label: 'follow_target', value: 'follow_target' },
];

const bagPrefixOptions = [
    { label: 'bags', value: 'bags' },
    { label: 'recording', value: 'recording' },
];

const restTabs = [
    { id: 'device', label: 'Device' },
    { id: 'moves', label: 'Moves' },
    { id: 'mapping', label: 'Mapping' },
    { id: 'services', label: 'Services' },
    { id: 'files', label: 'Files' },
];

const serviceActions: Array<{ label: string; run: () => Promise<unknown> }> = [
    { label: 'Wake Device', run: () => robotApi.wakeDevice() },
    { label: 'Set Remote Mode', run: () => robotApi.setControlMode('remote') },
    { label: 'Emergency Stop', run: () => robotApi.setEmergencyStop(true) },
    { label: 'Resume From E-Stop', run: () => robotApi.setEmergencyStop(false) },
    { label: 'Jack Up', run: () => robotApi.jackUp() },
    { label: 'Jack Down', run: () => robotApi.jackDown() },
    { label: 'Towing Hook Lock', run: () => robotApi.towingHookLock() },
    { label: 'Towing Hook Release', run: () => robotApi.towingHookRelease() },
    { label: 'Calibrate IMU Bias', run: () => robotApi.calibrateImuBias() },
    { label: 'Calibrate Gyro Scale', run: () => robotApi.calibrateGyroScale() },
    { label: 'Probe V2X Beacons', run: () => robotApi.probeV2xBeacons() },
    { label: 'Global Positioning', run: () => robotApi.startGlobalPositioning() },
    { label: 'Clear Wheel Errors', run: () => robotApi.clearWheelErrors() },
    { label: 'Reset Wheels', run: () => robotApi.resetWheels() },
    { label: 'Reset Costmap', run: () => robotApi.resetCostmap() },
];

export function RestPanel({ configured, loadingLabel, onResult, execute }: RestPanelProps) {
    const [activeTab, setActiveTab] = useState('device');
    const [moveType, setMoveType] = useState('standard');
    const [targetX, setTargetX] = useState(0);
    const [targetY, setTargetY] = useState(0);
    const [targetOri, setTargetOri] = useState(0);
    const [moveId, setMoveId] = useState(1);
    const [continueMapping, setContinueMapping] = useState('false');
    const [mappingId, setMappingId] = useState(1);
    const [mapName, setMapName] = useState('demo-map');
    const [bagFilename, setBagFilename] = useState('');
    const [bagPrefix, setBagPrefix] = useState<'bags' | 'recording'>('bags');
    const [bagStartTime, setBagStartTime] = useState(0);
    const [bagEndTime, setBagEndTime] = useState(10);

    const busy = useMemo(() => Boolean(loadingLabel), [loadingLabel]);

    async function runAction(label: string, action: () => Promise<unknown>) {
        const value = await execute(label, action);
        if (value !== undefined) {
            onResult({ title: label, value });
        }
    }

    return (
        <div className="rest-panel">
            <Tabs active={activeTab} onChange={setActiveTab} tabs={restTabs} />
            {busy ? <ActivityIndicator size="small" /> : null}

            <TabPanels active={activeTab} keepMounted>
                <TabPanel tab="device">
                    <div className="action-grid">
                        <Button onClick={() => void runAction('Get Device Info', () => robotApi.getDeviceInfo())} disabled={!configured}>
                            Get Device Info
                        </Button>
                        <Button onClick={() => void runAction('Get Boot Progress', () => robotApi.getBootProgress())} disabled={!configured}>
                            Get Boot Progress
                        </Button>
                        <Button onClick={() => void runAction('Get Wi-Fi Info', () => robotApi.getWifiInfo())} disabled={!configured}>
                            Get Wi-Fi Info
                        </Button>
                        <Button onClick={() => void runAction('Get Effective Settings', () => robotApi.getEffectiveSettings())} disabled={!configured}>
                            Get Effective Settings
                        </Button>
                        <Button onClick={() => void runAction('Get Settings Schema', () => robotApi.getSettingsSchema())} disabled={!configured}>
                            Get Settings Schema
                        </Button>
                    </div>
                </TabPanel>

                <TabPanel tab="moves">
                    <div className="form-grid">
                        <ComboBox
                            label="Move type"
                            value={moveType}
                            onChange={(value) => setMoveType(value || 'standard')}
                            options={moveTypeOptions}
                            clearable={false}
                        />
                        <NumberInput label="Target X" value={targetX} onChange={setTargetX} step={0.1} />
                        <NumberInput label="Target Y" value={targetY} onChange={setTargetY} step={0.1} />
                        <NumberInput label="Target Ori" value={targetOri} onChange={setTargetOri} step={0.1} />
                    </div>
                    <div className="inline-row">
                        <Button
                            onClick={() =>
                                void runAction('Create Move', () =>
                                    robotApi.createMove({
                                        type: moveType,
                                        target_x: targetX,
                                        target_y: targetY,
                                        target_ori: targetOri,
                                    }),
                                )
                            }
                            disabled={!configured}
                        >
                            Create Move
                        </Button>
                        <Button onClick={() => void runAction('Get Moves', () => robotApi.getMoves())} disabled={!configured}>
                            List Moves
                        </Button>
                        <Button onClick={() => void runAction('Cancel Current Move', () => robotApi.cancelCurrentMove())} disabled={!configured}>
                            Cancel Current Move
                        </Button>
                    </div>
                    <div className="inline-row">
                        <NumberInput label="Move ID" value={moveId} onChange={setMoveId} min={1} step={1} />
                        <Button onClick={() => void runAction('Get Move By ID', () => robotApi.getMoveById(moveId))} disabled={!configured}>
                            Get Move By ID
                        </Button>
                    </div>
                </TabPanel>

                <TabPanel tab="mapping">
                    <div className="inline-row">
                        <ComboBox
                            label="Continue mapping"
                            value={continueMapping}
                            onChange={(value) => setContinueMapping(value || 'false')}
                            options={[
                                { label: 'false', value: 'false' },
                                { label: 'true', value: 'true' },
                            ]}
                            clearable={false}
                        />
                        <Button onClick={() => void runAction('Start Mapping', () => robotApi.startMapping(continueMapping === 'true'))} disabled={!configured}>
                            Start Mapping
                        </Button>
                        <Button onClick={() => void runAction('Stop Mapping', () => robotApi.stopMapping())} disabled={!configured}>
                            Stop Mapping
                        </Button>
                        <Button onClick={() => void runAction('Abort Mapping', () => robotApi.abortMapping())} disabled={!configured}>
                            Abort Mapping
                        </Button>
                    </div>
                    <div className="form-grid">
                        <NumberInput label="Mapping ID" value={mappingId} onChange={setMappingId} min={1} step={1} />
                        <Input label="Map name" value={mapName} onChange={setMapName} clearable />
                    </div>
                    <div className="inline-row">
                        <Button
                            onClick={() => void runAction('Save Mapping As Map', () => robotApi.saveMappingAsMap(mappingId, mapName))}
                            disabled={!configured}
                        >
                            Save Mapping As Map
                        </Button>
                        <Button onClick={() => void runAction('Delete Mapping Task', () => robotApi.deleteMappingTask(mappingId))} disabled={!configured}>
                            Delete Mapping Task
                        </Button>
                        <Button onClick={() => void runAction('Delete Map', () => robotApi.deleteMap(mappingId))} disabled={!configured}>
                            Delete Map
                        </Button>
                    </div>
                </TabPanel>

                <TabPanel tab="services">
                    <div className="action-grid">
                        {serviceActions.map((action) => (
                            <Button key={action.label} onClick={() => void runAction(action.label, action.run)} disabled={!configured}>
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </TabPanel>

                <TabPanel tab="files">
                    <div className="form-grid">
                        <Input label="Filename" value={bagFilename} onChange={setBagFilename} clearable />
                        <ComboBox
                            label="Bag prefix"
                            value={bagPrefix}
                            onChange={(value) => setBagPrefix((value as 'bags' | 'recording') || 'bags')}
                            options={bagPrefixOptions}
                            clearable={false}
                        />
                        <NumberInput label="Start time" value={bagStartTime} onChange={setBagStartTime} step={1} />
                        <NumberInput label="End time" value={bagEndTime} onChange={setBagEndTime} step={1} />
                    </div>
                    <div className="action-grid">
                        <Button onClick={() => void runAction('Save Bag', () => robotApi.saveBag())} disabled={!configured}>
                            Save Bag
                        </Button>
                        <Button onClick={() => void runAction('Delete Bag', () => robotApi.removeBag(bagFilename || undefined))} disabled={!configured}>
                            Delete Bag
                        </Button>
                        <Button
                            onClick={() => void runAction('Delete Recording', () => robotApi.removeRecording(bagFilename || undefined))}
                            disabled={!configured}
                        >
                            Delete Recording
                        </Button>
                        <Button onClick={() => void runAction('Delete Video', () => robotApi.removeVideo(bagFilename || undefined))} disabled={!configured}>
                            Delete Video
                        </Button>
                        <Button
                            onClick={() => void runAction('Bag Player Metadata', () => robotApi.getBagPlayerMetadata(bagFilename, bagPrefix))}
                            disabled={!configured || !bagFilename}
                        >
                            Bag Metadata
                        </Button>
                        <Button
                            onClick={() =>
                                void runAction('Bag Player Chunk', () => robotApi.getBagPlayerChunk(bagFilename, bagStartTime, bagEndTime, bagPrefix))
                            }
                            disabled={!configured || !bagFilename}
                        >
                            Bag Chunk
                        </Button>
                    </div>
                </TabPanel>
            </TabPanels>
        </div>
    );
}