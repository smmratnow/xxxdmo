// Account Generator - Data Loading Fix

let selectedAdvanceOptions = [];
let accountHistory = JSON.parse(localStorage.getItem('accountHistory')) || [];
let dataLoaded = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded, waiting for bank data...');
    waitForBankData();
    loadHistory();
    updateGenerateButtonState();
});

function waitForBankData() {
    const maxAttempts = 50;
    let attempts = 0;
    
    const checkData = () => {
        attempts++;
        console.log(`🔄 Checking data attempt ${attempts}...`);
        
        const dataVars = ['tdBankData', 'rbcData', 'bmoData', 'scotiaData', 'cibcData'];
        const loadedData = dataVars.filter(varName => {
            const data = window[varName];
            if (data && typeof data === 'object') {
                const keys = Object.keys(data);
                return keys.some(key => Array.isArray(data[key]) && data[key].length > 0);
            }
            return false;
        });
        
        console.log(`📊 Loaded data: [${loadedData.join(', ')}]`);
        
        if (loadedData.length > 0) {
            dataLoaded = true;
            console.log(`✅ Data loaded! Found ${loadedData.length} bank datasets`);
            testDataStructure();
            return;
        }
        
        if (attempts < maxAttempts) {
            console.log('⏳ Still waiting for data...');
            setTimeout(checkData, 200);
        } else {
            console.error('❌ Timeout waiting for bank data');
            alert('Error: Bank data failed to load. Please refresh the page.');
        }
    };
    
    checkData();
}

function testDataStructure() {
    console.log('🔍 FINAL DATA STRUCTURE TEST:');
    
    const banks = {
        'TD': { var: 'tdBankData', keys: ['tdBank'] },
        'RBC': { var: 'rbcData', keys: ['rbcBank'] },
        'BMO': { var: 'bmoData', keys: ['bmoBank'] },
        'Scotia': { var: 'scotiaData', keys: ['scotiaBank'] },
        'CIBC': { var: 'cibcData', keys: ['cibcBank'] }
    };
    
    Object.entries(banks).forEach(([bankName, config]) => {
        const data = window[config.var];
        if (data) {
            const actualKeys = Object.keys(data);
            console.log(`📋 ${bankName} actual keys:`, actualKeys);
            
            for (const key of actualKeys) {
                if (Array.isArray(data[key])) {
                    console.log(`✅ ${bankName}.${key}: ${data[key].length} branches`);
                }
            }
        }
    });
}

function generateAccount() {
    console.log('🎯 Generate clicked');
    
    if (!dataLoaded) {
        alert('⏳ Please wait for data to load...');
        waitForBankData();
        return;
    }
    
    try {
        const advanceOptions = document.getElementById('advanceOptions');
        const isAdvanceOpen = advanceOptions && advanceOptions.classList.contains('show');
        
        let banksToUse = ['td'];
        
        if (isAdvanceOpen && selectedAdvanceOptions.length > 0) {
            banksToUse = selectedAdvanceOptions;
        }
        
        console.log('🎯 Generating for:', banksToUse);
        
        const accountData = generateCompleteAccount(banksToUse);
        
        if (!accountData) {
            console.error('❌ No account data generated');
            alert('Failed to generate account. Check console.');
            return;
        }
        
        displayAccountData(accountData);
        saveToHistory(accountData);
        console.log('✅ Account generated successfully!');
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        alert('Error: ' + error.message);
    }
}

function generateCompleteAccount(selectedBanks) {
    console.log('🏦 Starting generation for:', selectedBanks);
    
    // Try to find ANY working bank data
    const possibleBanks = [
        { code: 'td', variable: 'tdBankData', institution: '004', name: 'TD Bank' },
        { code: 'rbc', variable: 'rbcData', institution: '003', name: 'Royal Bank of Canada' },
        { code: 'bmo', variable: 'bmoData', institution: '001', name: 'BMO Bank of Montreal' },
        { code: 'scotia', variable: 'scotiaData', institution: '002', name: 'Scotiabank' },
        { code: 'cibc', variable: 'cibcData', institution: '010', name: 'CIBC' }
    ];
    
    const availableBanks = [];
    
    for (const bankInfo of possibleBanks) {
        if (!selectedBanks.includes(bankInfo.code)) continue;
        
        const data = window[bankInfo.variable];
        if (!data) {
            console.warn(`⚠️ ${bankInfo.code}: No variable ${bankInfo.variable}`);
            continue;
        }
        
        // Find ANY array in the data
        let branches = null;
        const keys = Object.keys(data);
        
        for (const key of keys) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
                branches = data[key];
                console.log(`✅ ${bankInfo.code}: Using ${key} with ${branches.length} branches`);
                break;
            }
        }
        
        if (branches) {
            availableBanks.push({
                code: bankInfo.code,
                name: bankInfo.name,
                institution: bankInfo.institution,
                branches: branches
            });
        }
    }
    
    if (availableBanks.length === 0) {
        console.error('❌ No available banks found');
        return null;
    }
    
    // Pick random bank and branch
    const selectedBank = availableBanks[Math.floor(Math.random() * availableBanks.length)];
    const selectedBranch = selectedBank.branches[Math.floor(Math.random() * selectedBank.branches.length)];
    
    console.log('🏦 Selected:', selectedBank.name);
    console.log('🏢 Branch:', selectedBranch.branch || selectedBranch.name || 'Unknown');
    
    // Extract transit
    let transit = '00000';
    if (selectedBranch.transitNumber) {
        const parts = selectedBranch.transitNumber.split('-');
        if (parts.length > 0) {
            transit = parts[0].padStart(5, '0');
        }
    }
    
    // Generate account
    const accountLength = Math.floor(Math.random() * 6) + 7;
    let account = Math.floor(Math.random() * 9) + 1;
    for (let i = 1; i < accountLength; i++) {
        account = account * 10 + Math.floor(Math.random() * 10);
    }
    
    return {
        bank: selectedBank.code.toUpperCase(),
        transit: transit,
        institution: selectedBank.institution,
        account: account.toString(),
        branchData: selectedBranch
    };
}

function displayAccountData(data) {
    // Fill the input fields
    const transitEl = document.getElementById('transitResult');
    const institutionEl = document.getElementById('institutionResult');
    const accountEl = document.getElementById('accountResult');
    
    if (transitEl) transitEl.value = data.transit;
    if (institutionEl) institutionEl.value = data.institution;
    if (accountEl) accountEl.value = data.account;
    
    showBankInfo(data);
}

function showBankInfo(data) {
    const bankDetails = document.getElementById('bankDetails');
    const bankName = document.getElementById('bankName');
    const branchName = document.getElementById('branchName');
    const bankAddress = document.getElementById('bankAddress');
    const bankLocation = document.getElementById('bankLocation');
    
    if (!bankDetails) {
        console.warn('⚠️ No bankDetails element found');
        return;
    }
    
    const bankNames = {
        'TD': 'TD Bank',
        'RBC': 'Royal Bank of Canada',
        'BMO': 'BMO Bank of Montreal',
        'SCOTIA': 'Scotiabank',
        'CIBC': 'CIBC'
    };
    
    const branch = data.branchData;
    
    if (bankName) bankName.textContent = bankNames[data.bank] || data.bank;
    if (branchName) branchName.textContent = branch.branch || branch.name || 'Main Branch';
    if (bankAddress) bankAddress.textContent = branch.address || 'Address not available';
    if (bankLocation) bankLocation.textContent = `${branch.city || 'Unknown'}, ${branch.state || 'Unknown'}`;
    
    bankDetails.style.display = 'block';
    
    console.log('📋 Bank info displayed');
}

function saveToHistory(accountData) {
    const now = new Date();
    const historyEntry = {
        transit: accountData.transit,
        institution: accountData.institution,
        account: accountData.account,
        bank: accountData.bank,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        timestamp: now.getTime()
    };
    
    accountHistory.unshift(historyEntry);
    
    if (accountHistory.length > 100) {
        accountHistory = accountHistory.slice(0, 100);
    }
    
    localStorage.setItem('accountHistory', JSON.stringify(accountHistory));
    console.log('💾 Saved to history');
}

// Missing function that HTML is calling
function updateBankSelection() {
    console.log('🔄 updateBankSelection called');
    selectedAdvanceOptions = [];
    const checkboxes = document.querySelectorAll('#advanceOptions input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedAdvanceOptions.push(checkbox.value);
    });
    
    console.log('📋 Selected banks:', selectedAdvanceOptions);
    updateGenerateButtonState();
}

function toggleAdvance() {
    const options = document.getElementById('advanceOptions');
    const arrow = document.getElementById('advanceArrow');
    
    if (!options || !arrow) return;
    
    if (options.classList.contains('show')) {
        options.classList.remove('show');
        arrow.innerHTML = '▶';
        selectedAdvanceOptions = [];
        document.querySelectorAll('#advanceOptions input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    } else {
        options.classList.add('show');
        arrow.innerHTML = '▼';
    }
    
    updateGenerateButtonState();
}

function updateAdvanceSelection() {
    updateBankSelection();
}

function updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    const advanceOptions = document.getElementById('advanceOptions');
    
    if (!generateBtn || !advanceOptions) return;
    
    const isAdvanceOpen = advanceOptions.classList.contains('show');
    
    if (isAdvanceOpen && selectedAdvanceOptions.length === 0) {
        generateBtn.disabled = true;
        generateBtn.classList.add('disabled');
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
    }
}

function toggleHistory() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.toggle('show');
        if (modal.classList.contains('show')) {
            loadHistory();
        }
    }
}

function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    const noHistoryMsg = document.getElementById('noHistory');
    
    if (!tableBody || !noHistoryMsg) return;
    
    tableBody.innerHTML = '';
    
    if (accountHistory.length === 0) {
        noHistoryMsg.style.display = 'block';
        const historyTable = document.getElementById('historyTable');
        if (historyTable) historyTable.style.display = 'none';
    } else {
        noHistoryMsg.style.display = 'none';
        const historyTable = document.getElementById('historyTable');
        if (historyTable) historyTable.style.display = 'table';
        
        accountHistory.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.transit}</td>
                <td>${entry.institution}</td>
                <td>${entry.account}</td>
                <td>${entry.bank}</td>
                <td>${entry.date}</td>
                <td>${entry.time}</td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function closeHistory() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

console.log('🚀 Account Generator script loaded');
