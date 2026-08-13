const fs = require('fs');

const filePath = 'client/src/pages/AdminDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the import statement
content = content.replace(/import AdminClients from '\.\.\/components\/AdminClients';[\r\n]*/, '');

// 2. Remove the nav item
content = content.replace(/[\r\n]*\s*\{ name: 'Clients', icon: <Handshake size=\{24\} \/> \},/, '');

// 3. Remove the active tab block
const activeTabRegex = /[\r\n]*\s*\{\s*activeTab === 'Clients' && \(\s*<AdminClients \/>\s*\)\s*\}/;
content = content.replace(activeTabRegex, '');

fs.writeFileSync(filePath, content);
console.log('Successfully removed AdminClients from AdminDashboard.jsx');
