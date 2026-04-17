import fs from 'fs';

export const parseSTL = (filePath) => {
    const buffer = fs.readFileSync(filePath);
    const fileName = filePath.toLowerCase();

    // Check if it's an OBJ file
    if (fileName.endsWith('.obj')) {
        return parseOBJ(buffer.toString('utf8'));
    }

    // Check if it's binary or ASCII STL
    const isBinary = (buffer) => {
        if (buffer.length < 84) return false;
        const faceCount = buffer.readUInt32LE(80);
        const expectedSize = 84 + (faceCount * 50);
        // Sometimes binary STL has extra padding, but it should have at least expectedSize
        if (buffer.length >= expectedSize && faceCount > 0) return true;
        // Check if starts with 'solid' which usually indicates ASCII
        const start = buffer.toString('utf8', 0, 5);
        return start !== 'solid';
    };

    if (isBinary(buffer)) {
        return parseBinarySTL(buffer);
    } else {
        return parseAsciiSTL(buffer.toString('utf8'));
    }
};

const parseBinarySTL = (buffer) => {
    let volume = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    
    const triangleCount = buffer.readUInt32LE(80);
    let offset = 84;

    for (let i = 0; i < triangleCount; i++) {
        if (offset + 50 > buffer.length) break;
        
        offset += 12; // Skip normal
        const v1 = { x: buffer.readFloatLE(offset), y: buffer.readFloatLE(offset + 4), z: buffer.readFloatLE(offset + 8) };
        const v2 = { x: buffer.readFloatLE(offset + 12), y: buffer.readFloatLE(offset + 16), z: buffer.readFloatLE(offset + 20) };
        const v3 = { x: buffer.readFloatLE(offset + 24), y: buffer.readFloatLE(offset + 28), z: buffer.readFloatLE(offset + 32) };
        offset += 38; // 3 vertices (36) + attribution (2)

        [v1, v2, v3].forEach(v => {
            minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
            minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
            minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
        });

        volume += (-v3.x * v2.y * v1.z + v2.x * v3.y * v1.z + v3.x * v1.y * v2.z - v1.x * v3.y * v2.z - v2.x * v1.y * v3.z + v1.x * v2.y * v3.z) / 6;
    }

    return formatResult(volume, triangleCount, minX, maxX, minY, maxY, minZ, maxZ);
};

const parseAsciiSTL = (text) => {
    let volume = 0;
    let triangleCount = 0;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    // Regex to find facets more reliably
    const facetRegex = /facet[\s\S]*?outer loop([\s\S]*?)endloop/gi;
    const vertexRegex = /vertex\s+(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\s+(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\s+(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/gi;

    let facetMatch;
    while ((facetMatch = facetRegex.exec(text)) !== null) {
        const verticesText = facetMatch[1];
        const vertices = [];
        let vMatch;
        while ((vMatch = vertexRegex.exec(verticesText)) !== null) {
            const v = { x: parseFloat(vMatch[1]), y: parseFloat(vMatch[2]), z: parseFloat(vMatch[3]) };
            vertices.push(v);
            minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
            minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
            minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z);
        }

        if (vertices.length === 3) {
            const [v1, v2, v3] = vertices;
            volume += (-v3.x * v2.y * v1.z + v2.x * v3.y * v1.z + v3.x * v1.y * v2.z - v1.x * v3.y * v2.z - v2.x * v1.y * v3.z + v1.x * v2.y * v3.z) / 6;
            triangleCount++;
        }
    }

    return formatResult(volume, triangleCount, minX, maxX, minY, maxY, minZ, maxZ);
};

const parseOBJ = (text) => {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let triangleCount = 0;
    // Volume calculation for OBJ is complex because it lacks explicit connectivity for signed volume easily
    // We'll estimate it or just provide dimensions/triangles for now
    
    const lines = text.split('\n');
    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] === 'v') {
            const x = parseFloat(parts[1]), y = parseFloat(parts[2]), z = parseFloat(parts[3]);
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
            minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
        } else if (parts[0] === 'f') {
            triangleCount++;
        }
    });

    // Simple bounding box volume for OBJ fallback
    const vol = (maxX - minX) * (maxY - minY) * (maxZ - minZ) * 0.4; // 0.4 is a rough fudge factor for non-manifold/solid models

    return formatResult(vol, triangleCount, minX, maxX, minY, maxY, minZ, maxZ);
};

const formatResult = (vol, tri, minX, maxX, minY, maxY, minZ, maxZ) => {
    const hasData = minX !== Infinity;
    return {
        volume: hasData ? Math.abs(vol) : 0,
        triangles: tri,
        dimensions: {
            x: hasData ? maxX - minX : 10, // Fallback to 10mm if no data
            y: hasData ? maxY - minY : 10,
            z: hasData ? maxZ - minZ : 10
        },
        boundingBox: { minX, maxX, minY, maxY, minZ, maxZ }
    };
};
