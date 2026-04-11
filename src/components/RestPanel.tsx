import { useState } from 'react';
import { robotApi } from '@kingsimba/axbot-sdk/robotApi';
import type { ExecuteRobotCall } from '../hooks/useRobotApi';


type ResultSetter = (result: { title: string; value: unknown }) => void;

type RestPanelProps = {
    configured: boolean;
    loadingLabel: string | null;
    onResult: ResultSetter;
    execute: ExecuteRobotCall;
};

const moveTypeOptions: Array<{ label: string; value: string }> = [
    { label: 'standard', value: 'standard' },
    { label: 'charge', value: 'charge' },
    { label: 'along_given_route', value: 'along_given_route' },
    { label: 'align_with_rack', value: 'align_with_rack' },
    { label: 'to_unload_point', value: 'to_unload_point' },
    { label: 'follow_target', value: 'follow_target' },
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
    const [activeSection, setActiveSection] = useState('device');
    const [moveType, setMoveType] = useState('standard');
    const [targetX, setTargetX] = useState(0);
    const [targetY, setTargetY] = useState(0);
    const [targetOri, setTargetOri] = useState(0);
    const [moveId, setMoveId] = useState(1);
    const [continueMapping, setContinueMapping] = useState('false');
    const [mappingId, setMappingId] = useState(1);
    const [mapName, setMapName] = useState('demo-map');
    const [mapId, setMapId] = useState(1);

    async function runAction(label: string, action: () => Promise<unknown>) {
        const value = await execute(label, action);
        if (value !== undefined) {
            onResult({ title: label, value });
        }
    }

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="tabs" style={{ padding: 0, marginBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                {['device', 'moves', 'mapping', 'maps', 'services'].map(tab => (
                    <div
                        key={tab}
                        className={`tab ${activeSection === tab ? 'active' : ''}`}
                        onClick={() => setActiveSection(tab)}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {tab}
                    </div>
                ))}
            </div>


            <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeSection === 'device' && (
                    <div className="grid">
                        <button className="btn" onClick={() => void runAction('Get Device Info', () => robotApi.getDeviceInfo())} disabled={!configured}>Get Device Info</button>
                        <button className="btn" onClick={() => void runAction('Get Boot Progress', () => robotApi.getBootProgress())} disabled={!configured}>Get Boot Progress</button>
                        <button className="btn" onClick={() => void runAction('Get Wi-Fi Info', () => robotApi.getWifiInfo())} disabled={!configured}>Get Wi-Fi Info</button>
                        <button className="btn" onClick={() => void runAction('Get Effective Settings', () => robotApi.getEffectiveSettings())} disabled={!configured}>Get Effective Settings</button>
                        <button className="btn" onClick={() => void runAction('Get Settings Schema', () => robotApi.getSettingsSchema())} disabled={!configured}>Get Settings Schema</button>
                    </div>
                )}

                {activeSection === 'moves' && (
                    <div className="flex-col">
                        <div className="grid">
                            <div className="control-group">
                                <label className="control-label">Move Type</label>
                                <select className="input select" value={moveType} onChange={(e) => setMoveType(e.target.value)}>
                                    {moveTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                            <div className="control-group">
                                <label className="control-label">Target X</label>
                                <input type="number" className="input" value={targetX} onChange={e => setTargetX(Number(e.target.value))} step={0.1} />
                            </div>
                            <div className="control-group">
                                <label className="control-label">Target Y</label>
                                <input type="number" className="input" value={targetY} onChange={e => setTargetY(Number(e.target.value))} step={0.1} />
                            </div>
                            <div className="control-group">
                                <label className="control-label">Target Ori</label>
                                <input type="number" className="input" value={targetOri} onChange={e => setTargetOri(Number(e.target.value))} step={0.1} />
                            </div>
                        </div>
                        <div className="flex-row">
                            <button className="btn btn-primary" onClick={() => void runAction('Create Move', () => robotApi.createMove({ type: moveType as any, target_x: targetX, target_y: targetY, target_ori: targetOri }))} disabled={!configured}>Create Move</button>
                            <button className="btn" onClick={() => void runAction('Get Moves', () => robotApi.getMoves())} disabled={!configured}>List Moves</button>
                            <button className="btn btn-danger" onClick={() => void runAction('Cancel Current Move', () => robotApi.cancelCurrentMove())} disabled={!configured}>Cancel Current Move</button>
                        </div>

                        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

                        <div className="flex-row">
                            <div className="control-group">
                                <label className="control-label">Move ID</label>
                                <input type="number" className="input" value={moveId} onChange={e => setMoveId(Number(e.target.value))} min={1} />
                            </div>
                            <button className="btn" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Get Move By ID', () => robotApi.getMoveById(moveId))} disabled={!configured}>Get Move By ID</button>
                        </div>
                    </div>
                )}

                {activeSection === 'mapping' && (
                    <div className="flex-col">
                        <div className="flex-row">
                            <div className="control-group">
                                <label className="control-label">Continue Mapping</label>
                                <select className="input select" value={continueMapping} onChange={(e) => setContinueMapping(e.target.value)}>
                                    <option value="false">false</option>
                                    <option value="true">true</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Start Mapping', () => robotApi.startMapping({ continue_mapping: continueMapping === 'true' }))} disabled={!configured}>Start Mapping</button>
                            <button className="btn btn-danger" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Stop Mapping', () => robotApi.stopMapping())} disabled={!configured}>Stop Mapping</button>
                            <button className="btn btn-danger" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Abort Mapping', () => robotApi.abortMapping())} disabled={!configured}>Abort Mapping</button>
                        </div>

                        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

                        <div className="grid">
                            <div className="control-group">
                                <label className="control-label">Mapping ID</label>
                                <input type="number" className="input" value={mappingId} onChange={e => setMappingId(Number(e.target.value))} min={1} />
                            </div>
                        </div>
                        <div className="flex-row">
                            <button className="btn btn-danger" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Delete Mapping Task', () => robotApi.deleteMappingTask(mappingId))} disabled={!configured}>Delete Mapping Task</button>
                        </div>
                    </div>
                )}

                {activeSection === 'maps' && (
                    <div className="flex-col">
                        <div className="flex-row">
                            <button className="btn btn-primary" onClick={() => void runAction('List Maps', () => robotApi.getMaps())} disabled={!configured}>List Maps</button>
                        </div>
                        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
                        <h4 style={{ marginTop: 0 }}>Save Map from Mapping</h4>
                        <div className="grid">
                            <div className="control-group">
                                <label className="control-label">Mapping ID</label>
                                <input type="number" className="input" value={mappingId} onChange={e => setMappingId(Number(e.target.value))} min={1} />
                            </div>
                            <div className="control-group">
                                <label className="control-label">Map Name</label>
                                <input className="input" value={mapName} onChange={e => setMapName(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex-row">
                            <button className="btn btn-primary" onClick={() => void runAction('Save Mapping As Map', () => robotApi.saveMappingAsMap(mappingId, mapName))} disabled={!configured}>Save Mapping As Map</button>
                        </div>

                        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

                        <div className="flex-row">
                            <div className="control-group">
                                <label className="control-label">Map ID</label>
                                <input type="number" className="input" value={mapId} onChange={e => setMapId(Number(e.target.value))} min={1} />
                            </div>
                            <button className="btn btn-danger" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Delete Map', () => robotApi.deleteMap(mapId))} disabled={!configured}>Delete Map</button>
                        </div>
                    </div>
                )}

                {activeSection === 'services' && (
                    <div className="grid">
                        {serviceActions.map(action => (
                            <button key={action.label} className="btn" onClick={() => void runAction(action.label, action.run)} disabled={!configured}>
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
