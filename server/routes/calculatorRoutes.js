import express from 'express';
const router = express.Router();

// Constants as per requirements
const MATERIAL_RATES = {
    PLA: 0.05,
    ABS: 0.07,
    PETG: 0.06,
    TPU: 0.08
};

const QUALITY_FACTORS = {
    '0.2': 1,
    '0.15': 1.3,
    '0.1': 1.6
};

const MACHINE_RATE = 10; // per unit time
const BASE_VOLUME = 100; // mock value
const PROFIT_MARGIN = 200; // base profit in INR

router.post('/calculate-price', (req, res) => {
    try {
        const { material, quality, infill } = req.body;

        if (!material || !quality || !infill) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const materialRate = MATERIAL_RATES[material] || MATERIAL_RATES.PLA;
        const qualityFactor = QUALITY_FACTORS[quality] || QUALITY_FACTORS['0.2'];
        const infillFactor = parseInt(infill) / 100;

        // Formula: price = (base_volume * infill_factor * material_rate) + (time_estimate * machine_rate) + profit_margin
        const timeEstimate = qualityFactor * (BASE_VOLUME / 10) * (infillFactor + 0.5);
        
        const materialCost = BASE_VOLUME * infillFactor * materialRate;
        const laborCost = timeEstimate * MACHINE_RATE;
        
        let calculatedPrice = materialCost + laborCost + PROFIT_MARGIN;
        calculatedPrice = Math.round(calculatedPrice);

        res.json({ 
            success: true, 
            price: calculatedPrice,
            currency: 'INR',
            breakdown: {
                materialCost: Math.round(materialCost),
                laborCost: Math.round(laborCost),
                baseProfit: PROFIT_MARGIN
            }
        });
    } catch (error) {
        console.error('Calculation Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
