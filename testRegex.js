const dbName = 'Snapmaker Artisan Premium 3-In-1 3D Printer (Dual Extrusion. 200W CNC. 40W Laser)';
const identifier = 'Snapmaker-Artisan-Premium-3-In-1-3D-Printer-(Dual-Extrusion%2C-200W-CNC%2C-40W-Laser)';

const decodedName = decodeURIComponent(identifier);
const escapedName = decodedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const searchPattern = escapedName.replace(/[-\s]/g, '[\\-\\s]').replace(/\\?\.|,/g, '[\\.,]');

console.log('Search pattern:', searchPattern);

const regex = new RegExp('^' + searchPattern + '$', 'i');
console.log('Regex matches?', regex.test(dbName));
