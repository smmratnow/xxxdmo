// Account Generation Library

const INSTITUTION_NUMBERS = {
    bmo: '001',
    cibc: '010',
    rbc: '003',
    scotia: '002',
    td: '004'
};

const BANK_NAMES = {
    bmo: 'BMO Bank of Montreal',
    cibc: 'CIBC',
    rbc: 'Royal Bank of Canada',
    scotia: 'Scotiabank',
    td: 'TD Bank'
};

function generateAccountNumber() {
    const length = Math.floor(Math.random() * 6) + 7; // 7-12 digits
    let account = '';
    account += Math.floor(Math.random() * 9) + 1; // First digit cannot be 0
    for (let i = 1; i < length; i++) {
        account += Math.floor(Math.random() * 10);
    }
    return account;
}

function extractTransitNumber(branchData) {
    if (branchData.transitNumber) {
        const parts = branchData.transitNumber.split('-');
        return parts[0].padStart(5, '0');
    }
    return Math.floor(Math.random() * 90000 + 10000).toString().padStart(5, '0');
}

function getRandomBranchData(selectedBanks = []) {
    // Access your bank data directly by variable names
    const allBankData = {
        bmo: (typeof bmoData !== 'undefined' && bmoData.bmo) ? bmoData.bmo : [],
        cibc: (typeof cibcData !== 'undefined' && cibcData.cibc) ? cibcData.cibc : [],
        rbc: (typeof rbcData !== 'undefined' && rbcData.rbc) ? rbcData.rbc : [],
        scotia: (typeof scotiaData !== 'undefined' && scotiaData.scotia) ? scotiaData.scotia : [],
        td: (typeof tdData !== 'undefined' && tdData.td) ? tdData.td : []
    };
    
    console.log('Bank data loaded:');
    Object.keys(allBankData).forEach(bank => {
        console.log(`${bank}: ${allBankData[bank].length} branches`);
    });
    
    let availableBanks;
    if (selectedBanks.length > 0) {
        availableBanks = selectedBanks.filter(bank => allBankData[bank] && allBankData[bank].length > 0);
    } else {
        availableBanks = Object.keys(allBankData).filter(bank => allBankData[bank] && allBankData[bank].length > 0);
    }
    
    if (availableBanks.length === 0) {
        console.error('No bank data available!');
        console.error('Available data:', allBankData);
        return null;
    }
    
    const selectedBank = availableBanks[Math.floor(Math.random() * availableBanks.length)];
    const bankBranches = allBankData[selectedBank];
    const selectedBranch = bankBranches[Math.floor(Math.random() * bankBranches.length)];
    
    console.log(`Selected: ${selectedBank} - ${selectedBranch.branch}`);
    
    return {
        bank: selectedBank,
        branchData: selectedBranch,
        institutionNumber: INSTITUTION_NUMBERS[selectedBank]
    };
}

function generateCompleteAccount(selectedBanks = []) {
    const branchInfo = getRandomBranchData(selectedBanks);
    if (!branchInfo) return null;
    
    return {
        bank: branchInfo.bank.toUpperCase(),
        transit: extractTransitNumber(branchInfo.branchData),
        institution: branchInfo.institutionNumber,
        account: generateAccountNumber(),
        branchData: branchInfo.branchData
    };
}

function getBankDisplayName(bankCode) {
    return BANK_NAMES[bankCode.toLowerCase()] || bankCode.toUpperCase();
}
