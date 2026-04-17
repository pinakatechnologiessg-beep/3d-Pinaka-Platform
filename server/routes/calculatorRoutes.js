import express from 'express';
import upload3d from '../middleware/upload3d.js';
const router = express.Router();

// Configuration Constants (Indian Market Rates) - Updated as per client request
const PRICING_CONFIG = {
    materials: {
        "PLA": 2,    // ₹2 per gram
        "ABS": 2.5,    // ₹2.50 per gram
        "PETG": 2.8,   // ₹2.80 per gram
        "Resin": 4.0,   // ₹4.00 per gram
        "TPU": 3.0     // ₹3.00 per gram
    },
    machineHourlyRate: 30, // ₹30 per hour (depreciation + electricity)
    laborHourlyRate: 190,  // ₹190 per hour (file prep + post-processing)
    failureBuffer: 0.10,   // 10% buffer
    standardMarkup: 2.8,   // 2.8x markup for one-offs
    gstRate: 0.18          // 18% GST
};

router.post('/calculate-price', upload3d.single('file'), (req, res) => {

    try {
        const { materialType, material, weightGrams, printHours, laborHours, quality, infill, rotationX, rotationY } = req.body;

        // Use either new parameter names or legacy ones
        const selectedMaterial = materialType || material || "PLA";
        
        // Logic for estimating missing values if not provided by client (Lite-weight version)
        const QUALITY_FACTORS = { '0.2': 1, '0.15': 1.3, '0.1': 1.6 };
        const qualityFactor = QUALITY_FACTORS[quality] || 1;
        const infillFactor = (parseInt(infill) || 20) / 100;
        const BASE_VOLUME = 100; // Expected average volume in cm3
        
        // If values aren't provided, estimate them
        const calcWeight = weightGrams || (BASE_VOLUME * (infillFactor + 0.1)); 
        const calcPrintHours = printHours || (qualityFactor * (BASE_VOLUME / 20) * (infillFactor + 0.5));
        const calcLaborHours = laborHours || 0.5; // Default 30 mins for prep/post if not specified

        // 1. Calculate Base Costs
        const materialRate = PRICING_CONFIG.materials[selectedMaterial] || PRICING_CONFIG.materials["PLA"];
        const materialCost = calcWeight * materialRate;
        const machineCost = calcPrintHours * PRICING_CONFIG.machineHourlyRate;
        const laborCost = calcLaborHours * PRICING_CONFIG.laborHourlyRate;

        // 2. Total Direct Cost with Failure Buffer
        const directCost = (materialCost + machineCost + laborCost) * (1 + PRICING_CONFIG.failureBuffer);

        // 3. Final Price Calculation
        const priceBeforeTax = directCost * PRICING_CONFIG.standardMarkup;
        const taxAmount = priceBeforeTax * PRICING_CONFIG.gstRate;
        const finalPrice = Math.ceil(priceBeforeTax + taxAmount); // Round up to nearest Rupee

        res.json({
            status: "success",
            success: true, // Keep for backward compatibility
            price: finalPrice, // Keep for backward compatibility
            fileUploaded: !!req.file,
            fileName: req.file ? req.file.filename : null,
            breakdown: {
                materialCost: materialCost.toFixed(2),
                machineCost: machineCost.toFixed(2),
                laborCost: laborCost.toFixed(2),
                tax: taxAmount.toFixed(2)
            },
            totalPrice: finalPrice
        });
    } catch (error) {
        console.error('Calculation Error:', error);
        res.status(500).json({ status: "error", success: false, message: error.message });
    }
});

export default router;

