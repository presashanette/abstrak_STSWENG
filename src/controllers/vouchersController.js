const Voucher = require('../models/Voucher');

const getVouchers = async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: 'Voucher code is required' });
    }

    console.log(code);

    try {
        const voucher = await Voucher.findOne({ code: code.trim() });
        if (!voucher) {
            return res.status(404).json({ error: 'Voucher not found' });
        }

        if (new Date(voucher.expirationDate) < new Date()) {
            return res.status(400).json({ error: 'Voucher has expired' });
        }

        res.json(voucher);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = { getVouchers };