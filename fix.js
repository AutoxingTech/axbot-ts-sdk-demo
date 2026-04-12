const fs = require('fs');
let code = fs.readFileSync('src/components/RestPanel.tsx', 'utf8');

const hr = '<hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid var(--border)", opacity: 0.3 }} />';

code = code.replace(/<h4 style=\{\{ marginTop: 0 \}\}>Get Move<\/h4>/g, hr + '\n                        <h4 style={{ marginTop: 0 }}>Get Move</h4>');
code = code.replace(/<h4 style=\{\{ marginTop: 0 \}\}>Create Move<\/h4>/g, hr + '\n                        <h4 style={{ marginTop: 0 }}>Create Move</h4>');
code = code.replace(/<h4 style=\{\{ marginTop: 0 \}\}>Manage Mapping Task<\/h4>/g, hr + '\n                        <h4 style={{ marginTop: 0 }}>Manage Mapping Task</h4>');
code = code.replace(/<h4 style=\{\{ marginTop: 0 \}\}>Create Mapping Task<\/h4>/g, hr + '\n                        <h4 style={{ marginTop: 0 }}>Create Mapping Task</h4>');
code = code.replace(/<h4 style=\{\{ marginTop: 0 \}\}>Save Mapping as a Map<\/h4>/g, hr + '\n                        <h4 style={{ marginTop: 0 }}>Save Mapping as a Map</h4>');
code = code.replace(/<h4 style=\{\{ marginTop: 0 \}\}>Save Mapping as Map<\/h4>/g, hr + '\n                        <h4 style={{ marginTop: 0 }}>Save Mapping as Map</h4>');

fs.writeFileSync('src/components/RestPanel.tsx', code);
