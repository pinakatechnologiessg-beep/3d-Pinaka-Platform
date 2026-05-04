import express from 'express';
import Popup from '../models/Popup.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// GET /api/popup
router.get('/', async (req, res) => {
  try {
    let popup = await Popup.findOne();
    if (!popup) {
      popup = await Popup.create({ title: 'Welcome Sale', isActive: false });
    }
    res.json(popup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/popup
router.put('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'templateImage', maxCount: 1 }]), async (req, res) => {
  console.log("PUT /api/popup called");
  console.log("Body:", req.body);
  console.log("Files:", req.files);
  
  try {
    const { title, link, isActive, showOnce, useTemplate, templateType, templateData } = req.body;
    let popup = await Popup.findOne();
    
    const updateData = {
      title: title || (popup ? popup.title : 'Promo'),
      link: link || (popup ? popup.link : ''),
      isActive: isActive === 'true' || isActive === true,
      showOnce: showOnce === 'true' || showOnce === true,
      useTemplate: useTemplate === 'true' || useTemplate === true,
      templateType: templateType || 'sale',
      templateData: typeof templateData === 'string' ? JSON.parse(templateData) : templateData
    };

    if (req.files) {
      if (req.files.image) {
        updateData.image = req.files.image[0].path;
      }
      if (req.files.templateImage) {
        updateData.templateImage = req.files.templateImage[0].path;
      }
    }

    if (!popup) {
      popup = await Popup.create(updateData);
    } else {
      popup = await Popup.findByIdAndUpdate(popup._id, updateData, { new: true });
    }
    
    console.log("Popup updated successfully:", popup._id);
    res.json(popup);
  } catch (error) {
    console.error("Popup update error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
