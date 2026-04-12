import { useState, useEffect } from 'react';
import { robotApi, MapItem, MappingTaskItem, MoveAction } from '@kingsimba/axbot-sdk/robotApi';
import type { ExecuteRobotCall } from '../hooks/useRobotApi';


type ResultSetter = (result: { title: string; value: unknown } | null) => void;

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
    const [moveId, setMoveId] = useState<number | ''>('');
    const [availableMoves, setAvailableMoves] = useState<MoveAction[]>([]);
    const [continueMapping, setContinueMapping] = useState('false');
    const [mappingId, setMappingId] = useState<number | ''>('');
    const [availableMappings, setAvailableMappings] = useState<MappingTaskItem[]>([]);
    const [mapName, setMapName] = useState('demo-map');
    const [mapId, setMapId] = useState<number | ''>('');
    const [availableMaps, setAvailableMaps] = useState<MapItem[]>([]);
    const [selectedPowerAction, setSelectedPowerAction] = useState('restart_service');

    useEffect(() => {
        if (activeSection === 'maps' && configured) {
            robotApi.getMaps().then(setAvailableMaps).catch(console.error);
        }
        if (activeSection === 'mapping' && configured) {
            robotApi.getMappingTasks().then(setAvailableMappings).catch(console.error);
        }
        if (activeSection === 'moves' && configured) {
            robotApi.getMoves().then(setAvailableMoves).catch(console.error);
        }
    }, [activeSection, configured]);

    async function runAction(label: string, action: () => Promise<unknown>) {
        onResult(null);
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

                        <hr className="separator" style={{ gridColumn: '1 / -1' }} />
                        <h4 style={{ marginTop: 0, gridColumn: '1 / -1' }}>Power Control</h4>
                        <div className="flex-row" style={{ gridColumn: '1 / -1' }}>
                            <div className="control-group">
                                <select className="input select" value={selectedPowerAction} onChange={e => setSelectedPowerAction(e.target.value)}>
                                    <option value="restart_service">Restart Service</option>
                                    <option value="reboot">Reboot</option>
                                    <option value="shutdown">Shutdown</option>
                                    <option value="reboot_main_board">Reboot Main Board</option>
                                    <option value="restart_py_axbot">Restart PyAxbot</option>
                                </select>
                            </div>
                            <button className="btn btn-danger" onClick={() => void runAction(`Power Execute: ${selectedPowerAction}`, async () => {
                                switch (selectedPowerAction) {
                                    case 'restart_service': return robotApi.restartAxbot();
                                    case 'reboot': return robotApi.shutdownDevice('main_power_supply', true);
                                    case 'shutdown': return robotApi.shutdownDevice('main_power_supply', false);
                                    case 'reboot_main_board': return robotApi.shutdownDevice('main_computing_unit', true);
                                    case 'restart_py_axbot': return robotApi.restartPyAxbot();
                                }
                            })} disabled={!configured}>Execute</button>
                        </div>
                    </div>
                )}

                {activeSection === 'moves' && (
                    <div className="flex-col">
                        <h4 style={{ marginTop: 0 }}>List Moves</h4>
                        <div className="flex-row">
                            <button className="btn" onClick={() => void runAction('Get Moves', async () => {
                                const moves = await robotApi.getMoves();
                                setAvailableMoves(moves);
                                return moves;
                            })} disabled={!configured}>List Moves</button>
                        </div>



                        <hr className="separator" />

                        <h4 style={{ marginTop: 0 }}>Get Move</h4>
                        <div className="flex-row">
                            <div className="control-group">
                                <label className="control-label">Move ID</label>
                                <select className="input select" value={moveId} onChange={e => setMoveId(e.target.value === '' ? '' : Number(e.target.value))}>
                                    <option value="" disabled>Select a move</option>
                                    {availableMoves.map(m => (
                                        <option key={m.id} value={m.id}>{m.type} (ID: {m.id}, state: {m.state})</option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn" style={{ marginTop: '1.25rem' }} onClick={() => typeof moveId === 'number' && void runAction('Get Move By ID', () => robotApi.getMoveById(moveId))} disabled={!configured || moveId === ''}>Get Move By ID</button>
                        </div>



                        <hr className="separator" />

                        <h4 style={{ marginTop: 0 }}>Create Move</h4>
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
                            <button className="btn btn-danger" onClick={() => void runAction('Cancel Current Move', () => robotApi.cancelCurrentMove())} disabled={!configured}>Cancel Current Move</button>
                        </div>
                    </div>
                )}

                {activeSection === 'mapping' && (
                    <div className="flex-col">
                        <h4 style={{ marginTop: 0 }}>List Mapping Tasks</h4>
                        <div className="flex-row">
                            <button className="btn" onClick={() => void runAction('List Mapping Tasks', async () => {
                                const mappings = await robotApi.getMappingTasks();
                                setAvailableMappings(mappings);
                                return mappings;
                            })} disabled={!configured}>List Mappings</button>
                        </div>



                        <hr className="separator" />

                        <h4 style={{ marginTop: 0 }}>Manage Mapping Task</h4>
                        <div className="grid">
                            <div className="control-group">
                                <label className="control-label">Mapping ID</label>
                                <select className="input select" value={mappingId} onChange={e => setMappingId(e.target.value === '' ? '' : Number(e.target.value))}>
                                    <option value="" disabled>Select a mapping task</option>
                                    {availableMappings.map(m => (
                                        <option key={m.id} value={m.id}>{m.start_time ? new Date(m.start_time * 1000).toLocaleString() : 'Task'} (ID: {m.id}, state: {m.state})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex-row">
                            <button className="btn" style={{ marginTop: '1.25rem' }} onClick={() => typeof mappingId === 'number' && void runAction('Get Mapping Task', () => robotApi.getMappingTask(mappingId))} disabled={!configured || mappingId === ''}>Get Mapping Task</button>
                            <button className="btn btn-danger" style={{ marginTop: '1.25rem' }} onClick={() => typeof mappingId === 'number' && void runAction('Delete Mapping Task', () => robotApi.deleteMappingTask(mappingId))} disabled={!configured || mappingId === ''}>Delete Mapping Task</button>
                        </div>

                        <hr className="separator" />

                        <h4 style={{ marginTop: 0 }}>Create Mapping Task</h4>
                        <div className="flex-row">
                            <div className="control-group">
                                <label className="control-label">Continue Mapping</label>
                                <select className="input select" value={continueMapping} onChange={(e) => setContinueMapping(e.target.value)}>
                                    <option value="false">false</option>
                                    <option value="true">true</option>
                                </select>
                            </div>
                            <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Start Mapping', () => robotApi.startMapping({ continue_mapping: continueMapping === 'true' }))} disabled={!configured}>Start Mapping</button>
                            <button className="btn btn-success" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Stop Mapping', () => robotApi.stopMapping())} disabled={!configured}>Stop Mapping</button>
                            <button className="btn btn-warning" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Abort Mapping', () => robotApi.abortMapping())} disabled={!configured}>Abort Mapping</button>
                        </div>

                        <hr className="separator" />

                        <h4 style={{ marginTop: 0 }}>Save Mapping as Map</h4>
                        <div className="grid">
                            <div className="control-group">
                                <label className="control-label">Mapping ID</label>
                                <select className="input select" value={mappingId} onChange={e => setMappingId(e.target.value === '' ? '' : Number(e.target.value))}>
                                    <option value="" disabled>Select a mapping task</option>
                                    {availableMappings.filter(m => m.state === 'finished').map((m: MappingTaskItem) => (
                                        <option key={m.id} value={m.id}>{m.start_time ? new Date(m.start_time * 1000).toLocaleString() : 'Task'} (ID: {m.id})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="control-group">
                                <label className="control-label">Map Name</label>
                                <input className="input" value={mapName} onChange={e => setMapName(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex-row">
                            <button className="btn btn-primary" onClick={() => typeof mappingId === 'number' && void runAction('Save Mapping As Map', () => robotApi.saveMappingAsMap(mappingId, mapName))} disabled={!configured || mappingId === ''}>Save Mapping As Map</button>
                        </div>
                    </div>
                )}

                {activeSection === 'maps' && (
                    <div className="flex-col">
                        <h4 style={{ marginTop: 0 }}>List Maps</h4>
                        <div className="flex-row">
                            <button className="btn btn-primary" onClick={() => void runAction('List Maps', async () => {
                                const maps = await robotApi.getMaps();
                                setAvailableMaps(maps);
                                return maps;
                            })} disabled={!configured}>List Maps</button>
                        </div>

                        <hr className="separator" />

                        <h4 style={{ marginTop: 0 }}>Manage Map</h4>
                        <div className="flex-row">
                            <div className="control-group">
                                <label className="control-label">Map ID</label>
                                <select className="input select" value={mapId} onChange={e => setMapId(e.target.value === '' ? '' : Number(e.target.value))}>
                                    <option value="" disabled>Select a map</option>
                                    {availableMaps.map((m: MapItem) => (
                                        <option key={m.id} value={m.id}>{m.map_name} (ID: {m.id})</option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn" style={{ marginTop: '1.25rem' }} onClick={() => typeof mapId === 'number' && void runAction('Get Map', () => robotApi.getMap(mapId))} disabled={!configured || mapId === ''}>Get Map</button>
                            <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => typeof mapId === 'number' && void runAction('Use Map', () => robotApi.setMap(mapId))} disabled={!configured || mapId === ''}>Use Map</button>
                            <button className="btn" style={{ marginTop: '1.25rem' }} onClick={() => void runAction('Set Pose (Origin)', () => robotApi.setPose(0, 0, 0))} disabled={!configured}>Set Pose (Origin)</button>
                        </div>
                        <hr className="separator" />

                        <h4 style={{ marginTop: 0 }}>Delete Map</h4>
                        <div className="flex-row">
                            <div className="control-group">
                                <label className="control-label">Map ID</label>
                                <select className="input select" value={mapId} onChange={e => setMapId(e.target.value === '' ? '' : Number(e.target.value))}>
                                    <option value="" disabled>Select a map</option>
                                    {availableMaps.map((m: MapItem) => (
                                        <option key={m.id} value={m.id}>{m.map_name} (ID: {m.id})</option>
                                    ))}
                                </select>
                            </div>
                            <button className="btn btn-danger" style={{ marginTop: '1.25rem' }} onClick={() => typeof mapId === 'number' && void runAction('Delete Map', () => robotApi.deleteMap(mapId))} disabled={!configured || mapId === ''}>Delete Map</button>
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
