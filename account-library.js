// Account Generation Library

// Institution numbers for major Canadian banks
const INSTITUTION_NUMBERS = {
    bmo: '001',
    cibc: '010', 
    rbc: '003',
    scotia: '002',
    td: '004'
};

// Generate random Canadian bank account number (7-12 digits)
function generateAccountNumber() {
    const length = Math.floor(Math.random() * 6) + 7; // 7-12 digits
    let account = '';
    
    // First digit cannot be 0
    account += Math.floor(Math.random() * 9) + 1;
    
    // Add remaining digits
    for (let i = 1; i < length; i++) {
        account += Math.floor(Math.random() * 10);
    }
    
    return account;
}

// Extract transit number from branch data
function extractTransitNumber(branchData) {
    if (branchData.transitNumber) {
        // Extract first 5 digits from transit number like "25039-001" or "01729-010"
        const parts = branchData.transitNumber.split('-');
        return parts[0].padStart(5, '0');
    }
    
    // Fallback: generate random 5-digit transit
    return Math.floor(Math.random() * 90000 + 10000).toString().padStart(5, '0');
}

// Get all bank data with proper error handling
function getAllBankData() {
    const bankData = {};
    
    // Check each bank data with multiple possible variable names
    if (typeof bmoData !== 'undefined' && bmoData.bmo) {
        bankData.bmo = bmoData.bmo;
    }
    
    if (typeof cibcData !== 'undefined' && cibcData.cibc) {
        bankData.cibc = cibcData.cibc;
    }
    
    if (typeof rbcData !== 'undefined' && rbcData.rbc) {
        bankData.rbc = rbcData.rbc;
    }
    
    if (typeof scotiaData !== 'undefined' && scotiaData.scotia) {
        bankData.scotia = scotiaData.scotia;
    }
    
    if (typeof tdData !== 'undefined' && tdData.td) {
        bankData.td = tdData.td;
    }
    
    console.log('Available bank data:', Object.keys(bankData));
    return bankData;
}

// Get random branch data from selected banks
function getRandomBranchData(selectedBanks = []) {
    const allBankData = getAllBankData();
    
    let availableBanks;
    
    if (selectedBanks.length > 0) {
        // Filter to selected banks only
        availableBanks = selectedBanks.filter(bank => 
            allBankData[bank] && allBankData[bank].length > 0
        );
    } else {
        // Use all banks with data
        availableBanks = Object.keys(allBankData).filter(bank => 
            allBankData[bank] && allBankData[bank].length > 0
        );
    }
    
    if (availableBanks.length === 0) {
        console.error('No bank data available. Available banks:', Object.keys(allBankData));
        console.error('Selected banks:', selectedBanks);
        return null;
    }
    
    // Select random bank
    const selectedBank = availableBanks[Math.floor(Math.random() * availableBanks.length)];
    const bankBranches = allBankData[selectedBank];
    
    // Select random branch
    const selectedBranch = bankBranches[Math.floor(Math.random() * bankBranches.length)];
    
    console.log('Selected bank:', selectedBank, 'Branch:', selectedBranch.branch);
    
    return {
        bank: selectedBank,
        branchData: selectedBranch,
        institutionNumber: INSTITUTION_NUMBERS[selectedBank]
    };
}

// Generate complete account information
function generateCompleteAccount(selectedBanks = []) {
    const branchInfo = getRandomBranchData(selectedBanks);
    
    if (!branchInfo) {
        return null;
    }
    
    const transitNumber = extractTransitNumber(branchInfo.branchData);
    const accountNumber = generateAccountNumber();
    
    return {
        bank: branchInfo.bank.toUpperCase(),
        transit: transitNumber,
        institution: branchInfo.institutionNumber,
        account: accountNumber,
        branchData: branchInfo.branchData
    };
}

// Bank name mapping
const BANK_NAMES = {
    bmo: 'BMO Bank of Montreal',
    cibc: 'CIBC',
    rbc: 'Royal Bank of Canada',
    scotia: 'Scotiabank',
    td: 'TD Bank'
};

// Get formatted bank name
function getBankDisplayName(bankCode) {
    return BANK_NAMES[bankCode.toLowerCase()] || bankCode.toUpperCase();
}
