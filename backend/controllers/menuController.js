const Menu = require('../models/Menu');

// 1. Saare Menu Items Get Karne Ke Liye (For Website Front-end)
exports.getAllMenu = async (req, res) => {
    try {
        const menuItems = await Menu.find();
        res.status(200).json(menuItems);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 2. Naya Food Item Menu Mein Add Karne Ke Liye
exports.addMenuItem = async (req, res) => {
    try {
        const { name, category, price, isAvailable, image } = req.body;
        
        const newItem = new Menu({
            name,
            category,
            price,
            isAvailable,
            image
        });

        await newItem.save();
        res.status(201).json({ message: "Food item added successfully!", newItem });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};