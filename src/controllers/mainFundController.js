const MainFund = require('../models/MainFund'); // Adjust the path if necessary

// Controller to get the current MainFund balance
const getMainFundBalance = async (req, res) => {
    try {
        const mainFund = await MainFund.findOne();  // Fetch the first (and only) MainFund document
        if (!mainFund) {
            return res.status(404).json({ message: 'Main fund not found' });
        }

        res.json({ balance: mainFund.balance });
    } catch (error) {
        console.error('Error fetching MainFund balance:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMainFundBalance
};
