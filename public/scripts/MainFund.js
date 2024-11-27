document.addEventListener('DOMContentLoaded', () => {
    // Elements for total expenses
    const totalExpensesElement = document.getElementById('total-expenses');
    const totalExpensesDateElement = document.getElementById('total-expenses-date');

    // Elements for MainFund balance
    const mainFundBalanceElement = document.getElementById('main-fund-balance');
    const mainFundDateElement = document.getElementById('main-fund-date');

    // Function to fetch total expenses
    const loadTotalExpenses = async () => {
        try {
            const response = await fetch('/api/expenses/total');
            console.log('Raw Response:', response); // Log the raw response for debugging
    
            if (response.ok) {
                const data = await response.json();
                console.log('Parsed Data:', data); // Log the parsed data
    
                totalExpensesElement.querySelector('h1').textContent = `₱${data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                totalExpensesDateElement.textContent = new Date().toLocaleDateString();
            } else {
                console.error('Failed to fetch total expenses');
            }
        } catch (error) {
            console.error('Error fetching total expenses:', error);
        }
    };
    

    // Function to fetch MainFund balance
    const loadMainFundBalance = async () => {
        try {
            const response = await fetch('/api/mainfund/balance');
            if (response.ok) {
                const data = await response.json();
                mainFundBalanceElement.querySelector('h1').textContent = `₱${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                mainFundDateElement.textContent = new Date().toLocaleDateString();
            } else {
                console.error('Failed to fetch MainFund balance');
            }
        } catch (error) {
            console.error('Error fetching MainFund balance:', error);
        }
    };

    // Load data for both total expenses and MainFund balance
    loadTotalExpenses();
    loadMainFundBalance();
});
