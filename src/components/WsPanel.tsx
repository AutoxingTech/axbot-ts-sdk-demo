import { useEffect, useState, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import * as wsExports from '@kingsimba/axbot-sdk/ws';
const { wsClient, WsMessageStore } = wsExports;

const PREDEFINED_COLORS: Record<string, string> = {
  '/horizontal_laser_2d/scan': '#ffd966',
  '/depth_camera/forward/points2': '#ffe599',
  '/depth_camera/downward/points2': '#93c47d',
};

const rawTopics = Object.values(wsExports)
  .filter((v: any) => v && (typeof v.topicName === 'string' || typeof v.topic === 'string'))
  .map((v: any) => v.topicName || v.topic);

const TOPICS: { name: string; color: string }[] = Array.from(new Set(rawTopics))
  .map(name => ({ name, color: PREDEFINED_COLORS[name] || '' }))
  .sort((a, b) => a.name.localeCompare(b.name));


type WsPanelProps = {
  configured: boolean;
  onResult: (result: { title: string; value: unknown }) => void;
};

// Global cache to reuse stores and keep subscribers
const storeCache = new Map<string, any>();
function getOrCreateStore(topic: string) {
  if (!storeCache.has(topic)) {
    storeCache.set(topic, new WsMessageStore(topic));
  }
  return storeCache.get(topic);
}

function TopicCard({ topic, onClose }: { topic: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const store = getOrCreateStore(topic);
    const unsubscribe = store.subscribe((msg: any) => {
      setData(msg);
    });
    return () => unsubscribe();
  }, [topic]);

  const renderDataRows = () => {
    if (!data) return <tr><td colSpan={2} style={{ color: '#888' }}>Waiting for data...</td></tr>;
    if (typeof data !== 'object') {
      return <tr><td colSpan={2}>{String(data)}</td></tr>;
    }
    return Object.keys(data).map(key => {
      let valDisplay = data[key];
      if (typeof valDisplay === 'object' && valDisplay !== null) {
        if (valDisplay instanceof Uint8Array || ArrayBuffer.isView(valDisplay)) {
          valDisplay = '<binary data>';
        } else {
          valDisplay = JSON.stringify(valDisplay);
        }
      }
      return (
        <tr key={key}>
          <td style={{ padding: '4px 8px', borderRight: '1px solid #f0f0f0', color: '#555', verticalAlign: 'top' }}>{key}</td>
          <td style={{ padding: '4px 8px', wordBreak: 'break-all', fontFamily: 'monospace' }}>{String(valDisplay)}</td>
        </tr>
      );
    });
  };

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      minWidth: '280px',
      maxWidth: '400px',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '8px 12px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'bold',
        fontFamily: 'monospace'
      }}>
        <span>{topic}</span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888' }}
        >
          &times;
        </button>
      </div>
      <div style={{ padding: '0', maxHeight: '300px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            {renderDataRows()}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function WsPanel({ configured, onResult }: WsPanelProps) {
  const { connected, setShouldConnect, shouldConnect } = useWebSocket({ enabled: configured });
  const [activeTopics, setActiveTopics] = useState<string[]>([]);
  const [topicFilter, setTopicFilter] = useState('');

  const addTopic = (topic: string) => {
    if (!activeTopics.includes(topic)) {
      setActiveTopics([...activeTopics, topic]);
    }
  };

  const removeTopic = (topic: string) => {
    setActiveTopics(activeTopics.filter(t => t !== topic));
  };

  const filteredTopics = TOPICS.filter(t => t.name.toLowerCase().includes(topicFilter.toLowerCase()));

  const groupedTopics = useMemo(() => {
    const groups: Record<string, typeof TOPICS> = {
      'Ungrouped': [],
      'Laser 2D': [],
      'Laser 3D': [],
      'Depth Camera': [],
      'RGB': []
    };
    filteredTopics.forEach(t => {
      const name = t.name.toLowerCase();
      if (name.includes('laser_2d')) {
        groups['Laser 2D'].push(t);
      } else if (name.includes('laser_3d')) {
        groups['Laser 3D'].push(t);
      } else if (name.includes('depth')) {
        groups['Depth Camera'].push(t);
      } else if (name.includes('rgb')) {
        groups['RGB'].push(t);
      } else {
        groups['Ungrouped'].push(t);
      }
    });
    return groups;
  }, [filteredTopics]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f0f2f5' }}>
          {activeTopics.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>
              No topics added. Select topics from the right panel.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
              {activeTopics.map(t => (
                <TopicCard key={t} topic={t} onClose={() => removeTopic(t)} />
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ width: '280px', marginLeft: '10px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', minHeight: '24px' }}>
            <h3 className="card-title" style={{ margin: 0, border: 'none', padding: 0 }}>WebSocket</h3>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }} >
            <button
              className={`btn ${shouldConnect ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => setShouldConnect(!shouldConnect)}
              disabled={!configured}
              style={{ padding: '0.5rem 1.5rem', fontWeight: 600 }}
            >
              {shouldConnect ? 'Disconnect' : 'Connect'}
            </button>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: connected ? '#166534' : '#991b1b',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: connected ? '#22c55e' : '#ef4444',
                boxShadow: connected ? '0 0 0 2px rgba(34, 197, 94, 0.2)' : '0 0 0 2px rgba(239, 68, 68, 0.2)'
              }} />
              {connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <h3 style={{ marginTop: 0, color: '#666', fontSize: '14px', marginBottom: '12px' }}>Add Topic</h3>
            <input
              type="text"
              className="filter-input"
              placeholder="Filter topics..."
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
            />
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.entries(groupedTopics).map(([group, topics]) => topics.length > 0 && (
                <li key={group} style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#555', padding: '4px 0', borderBottom: '1px solid #ddd', marginBottom: '4px' }}>
                    {group}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {topics.map(item => (
                      <li key={item.name} style={{ marginBottom: '2px' }}>
                        <button
                          onClick={() => addTopic(item.name)}
                          disabled={activeTopics.includes(item.name) || !connected}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: (activeTopics.includes(item.name) || !connected) ? 'not-allowed' : 'pointer',
                            color: (activeTopics.includes(item.name) || !connected) ? '#bbb' : '#333',
                            textAlign: 'left',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px',
                            width: '100%',
                            borderRadius: '4px'
                          }}
                          onMouseOver={(e) => {
                            if (!activeTopics.includes(item.name) && connected) e.currentTarget.style.backgroundColor = '#f0f0f0';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {item.color && (
                            <span style={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: item.color,
                              display: 'inline-block',
                              marginRight: '6px',
                              borderRadius: item.name.includes('horizontal_laser_2d') ? '50%' : '2px'
                            }}></span>
                          )}
                          {!item.color && <span style={{ marginRight: '4px' }}>+</span>}
                          {item.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div >
  );
}
