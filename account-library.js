// Account Generation Library - Fixed for your data structure

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
        // Your format: "10152-004" -> extract "10152"
        const parts = branchData.transitNumber.split('-');
        return parts[0].padStart(5, '0');
    }
    // Fallback to random
    return Math.floor(Math.random() * 90000 + 10000).toString().padStart(5, '0');
}

function getRandomBranchData(selectedBanks = []) {
    console.log('🔍 Checking available bank data...');
    
    // Check what data variables are actually available
    const allBankData = {};
    
    // Your TD Bank data structure: { "tdBank": [...] }
    if (typeof tdBankData !== 'undefined' && tdBankData.tdBank) {
        allBankData.td = tdBankData.tdBank;
        console.log('✅ TD Bank data found:', allBankData.td.length, 'branches');
    }
    
    // Check for other banks (similar pattern expected)
    if (typeof bmoData !== 'undefined' && bmoData.bmo) {
        allBankData.bmo = bmoData.bmo;
        console.log('✅ BMO data found:', allBankData.bmo.length, 'branches');
    }
    
    if (typeof cibcData !== 'undefined' && cibcData.cibc) {
        allBankData.cibc = cibcData.cibc;
        console.log('✅ CIBC data found:', allBankData.cibc.length, 'branches');
    }
    
    if (typeof rbcData !== 'undefined' && rbcData.rbc) {
        allBankData.rbc = rbcData.rbc;
        console.log('✅ RBC data found:', allBankData.rbc.length, 'branches');
    }
    
    if (typeof scotiaData !== 'undefined' && scotiaData.scotia) {
        allBankData.scotia = scotiaData.scotia;
        console.log('✅ Scotia data found:', allBankData.scotia.length, 'branches');
    }
    
    console.log('📊 Total banks available:', Object.keys(allBankData).length);
    
    let availableBanks;
    if (selectedBanks.length > 0) {
        availableBanks = selectedBanks.filter(bank => allBankData[bank] && allBankData[bank].length > 0);
        console.log('🎯 Selected banks:', selectedBanks, '→ Available:', availableBanks);
    } else {
        availableBanks = Object.keys(allBankData).filter(bank => allBankData[bank] && allBankData[bank].length > 0);
        console.log('🌟 Using all available banks:', availableBanks);
    }
    
    if (availableBanks.length === 0) {
        console.error('❌ No bank data available!');
        console.error('Available data objects:', {
            tdBankData: typeof tdBankData,
            bmoData: typeof bmoData,
            cibcData: typeof cibcData,
            rbcData: typeof rbcData,
            scotiaData: typeof scotiaData
        });
        return null;
    }
    
    const selectedBank = availableBanks[Math.floor(Math.random() * availableBanks.length)];
    const bankBranches = allBankData[selectedBank];
    const selectedBranch = bankBranches[Math.floor(Math.random() * bankBranches.length)];
    
    console.log('🏦 Selected bank:', selectedBank);
    console.log('🏢 Selected branch:', selectedBranch.branch || 'Unknown branch');
    
    return {
        bank: selectedBank,
        branchData: selectedBranch,
        institutionNumber: INSTITUTION_NUMBERS[selectedBank]
    };
}

function generateCompleteAccount(selectedBanks = []) {
    console.log('🎯 Generating account for banks:', selectedBanks.length ? selectedBanks : 'ALL');
    
    const branchInfo = getRandomBranchData(selectedBanks);
    if (!branchInfo) {
        console.error('❌ Failed to get branch info');
        return null;
    }
    
    const result = {
        bank: branchInfo.bank.toUpperCase(),
        transit: extractTransitNumber(branchInfo.branchData),
        institution: branchInfo.institutionNumber,
        account: generateAccountNumber(),
        branchData: branchInfo.branchData
    };
    
    console.log('✅ Generated account:', result);
    return result;
}

function getBankDisplayName(bankCode) {
    return BANK_NAMES[bankCode.toLowerCase()] || bankCode.toUpperCase();
}
