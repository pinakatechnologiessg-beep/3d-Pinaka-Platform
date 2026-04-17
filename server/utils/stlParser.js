import fs from 'fs';

export const parseSTL = (filePath) => {
    const buffer = fs.readFileSync(filePath);
    
    // Check if it's binary or ASCII
    const isBinary = (buffer) => {
        if (buffer.length < 84) return false;
        const faceCount = buffer.readUInt32LE(80);
        const expectedSize = 84 + (faceCount * 50);
        return buffer.length >= expectedSize;
    };

    let volume = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let triangleCount = 0;

    if (isBinary(buffer)) {
        triangleCount = buffer.readUInt32LE(80);
        let offset = 84;
        for (let i = 0; i < triangleCount; i++) {
            // Normal (12 bytes) - ignore
            offset += 12;
            
            // Vertices (3 * 3 * 4 bytes = 36 bytes)
            const v1 = { x: buffer.readFloatLE(offset), y: buffer.readFloatLE(offset + 4), z: buffer.readFloatLE(offset + 8) };
            const v2 = { x: buffer.readFloatLE(offset + 12), y: buffer.readFloatLE(offset + 16), z: buffer.readFloatLE(offset + 20) };
            const v3 = { x: buffer.readFloatLE(offset + 24), y: buffer.readFloatLE(offset + 28), z: buffer.readFloatLE(offset + 32) };
            offset += 36;
            
            // Attributes (2 bytes)
            offset += 2;

            // Bounding box
            [v1, v2, v3].forEach(v => {
                minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
                minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
                minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
            });

            // Volume (signed volume of tetrahedron)
            volume += (-v3.x * v2.y * v1.z + v2.x * v3.y * v1.z + v3.x * v1.y * v2.z - v1.x * v3.y * v2.z - v2.x * v1.y * v3.z + v1.x * v2.y * v3.z) / 6;
        }
    } else {
        // Simple ASCII parser (very basic)
        const text = buffer.toString('utf8');
        const lines = text.split('\n');
        let currentVertices = [];
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts[0] === 'vertex') {
                const v = { x: parseFloat(parts[1]), y: parseFloat(parts[2]), z: parseFloat(parts[3]) };
                currentVertices.push(v);
                minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
                minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
                minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
            } else if (parts[0] === 'endfacet') {
                if (currentVertices.length === 3) {
                    const [v1, v2, v3] = currentVertices;
                    volume += (-v3.x * v2.y * v1.z + v2.x * v3.y * v1.z + v3.x * v1.y * v2.z - v1.x * v3.y * v2.z - v2.x * v1.y * v3.z + v1.x * v2.y * v3.z) / 6;
                    triangleCount++;
                }
                currentVertices = [];
            }
        });
    }

    return {
        volume: Math.abs(volume),
        triangles: triangleCount,
        dimensions: {
            x: minX === Infinity ? 0 : maxX - minX,
            y: minY === Infinity ? 0 : maxY - minY,
            z: minZ === Infinity ? 0 : maxZ - minZ
        },
        boundingBox: { minX, maxX, minY, maxY, minZ, maxZ }
    };
};
