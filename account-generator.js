// Account Generator - Fixed Data Structure Version

let selectedAdvanceOptions = [];
let accountHistory = JSON.parse(localStorage.getItem('accountHistory')) || [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Account Generator loaded');
    
    // Test data availability immediately
    setTimeout(() => {
        console.log('🔍 Testing data availability...');
        console.log('tdBankData:', typeof tdBankData, tdBankData ? 'LOADED' : 'MISSING');
        console.log('rbcData:', typeof rbcData, rbcData ? 'LOADED' : 'MISSING');
        console.log('bmoData:', typeof bmoData, bmoData ? 'LOADED' : 'MISSING');
        console.log('scotiaData:', typeof scotiaData, scotiaData ? 'LOADED' : 'MISSING');
        console.log('cibcData:', typeof cibcData, cibcData ? 'LOADED' : 'MISSING');
    }, 100);
    
    loadHistory();
    updateGenerateButtonState();
});

function generateAccount() {
    console.log('🎯 Generate button clicked');
    
    try {
        // Get selected banks
        const advanceOptions = document.getElementById('advanceOptions');
        const isAdvanceOpen = advanceOptions && advanceOptions.classList.contains('show');
        
        let banksToUse = ['td']; // Default to TD
        
        if (isAdvanceOpen && selectedAdvanceOptions.length > 0) {
            banksToUse = selectedAdvanceOptions;
            console.log('🎯 Using selected banks:', banksToUse);
        } else {
            console.log('🌟 Using default bank: TD');
        }
        
        // Generate account data
        const accountData = generateCompleteAccount(banksToUse);
        
        if (!accountData) {
            console.error('❌ Failed to generate account data');
            alert('Failed to generate account. Check console for details.');
            return;
        }
        
        // Display results
        displayAccountData(accountData);
        
        // Save to history
        saveToHistory(accountData);
        
    } catch (error) {
        console.error('❌ Error in generateAccount:', error);
        alert('Error generating account: ' + error.message);
    }
}

function generateCompleteAccount(selectedBanks) {
    console.log('🏦 Generating for banks:', selectedBanks);
    
    // Bank data mapping with CORRECT variable names
    const bankDataMap = {
        'td': { variable: 'tdBankData', property: 'tdBank', institution: '004', name: 'TD Bank' },
        'rbc': { variable: 'rbcData', property: 'rbcBank', institution: '003', name: 'Royal Bank of Canada' },
        'bmo': { variable: 'bmoData', property: 'bmoBank', institution: '001', name: 'BMO Bank of Montreal' },
        'scotia': { variable: 'scotiaData', property: 'scotiaBank', institution: '002', name: 'Scotiabank' },
        'cibc': { variable: 'cibcData', property: 'cibcBank', institution: '010', name: 'CIBC' }
    };
    
    const availableBanks = [];
    
    for (const bankCode of selectedBanks) {
        const bankConfig = bankDataMap[bankCode];
        if (!bankConfig) {
            console.warn(`⚠️ Unknown bank code: ${bankCode}`);
            continue;
        }
        
        try {
            const bankData = window[bankConfig.variable];
            console.log(`🔍 Checking ${bankCode}:`, typeof bankData, bankData ? 'EXISTS' : 'MISSING');
            
            if (bankData && bankData[bankConfig.property] && bankData[bankConfig.property].length > 0) {
                availableBanks.push({
                    code: bankCode,
                    data: bankData[bankConfig.property],
                    institution: bankConfig.institution,
                    name: bankConfig.name
                });
                console.log(`✅ ${bankCode.toUpperCase()}: ${bankData[bankConfig.property].length} branches loaded`);
            } else {
                console.warn(`⚠️ ${bankCode.toUpperCase()}: No data found`);
            }
        } catch (error) {
            console.error(`❌ Error loading ${bankCode}:`, error);
        }
    }
    
    if (availableBanks.length === 0) {
        console.error('❌ No banks available with data');
        return null;
    }
    
    // Select random bank and branch
    const selectedBank = availableBanks[Math.floor(Math.random() * availableBanks.length)];
    const branches = selectedBank.data;
    const selectedBranch = branches[Math.floor(Math.random() * branches.length)];
    
    console.log('🏦 Selected:', selectedBank.name);
    console.log('🏢 Branch:', selectedBranch.branch);
    
    // Extract transit number
    let transit = '00000';
    if (selectedBranch.transitNumber) {
        const parts = selectedBranch.transitNumber.split('-');
        transit = parts[0].padStart(5, '0');
    }
    
    // Generate account number (7-12 digits)
    const accountLength = Math.floor(Math.random() * 6) + 7;
    let account = Math.floor(Math.random() * 9) + 1; // First digit 1-9
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
    document.getElementById('transitResult').value = data.transit;
    document.getElementById('institutionResult').value = data.institution;
    document.getElementById('accountResult').value = data.account;
    
    showBankInfo(data);
}

function showBankInfo(data) {
    const bankDetails = document.getElementById('bankDetails');
    const bankName = document.getElementById('bankName');
    const branchName = document.getElementById('branchName');
    const bankAddress = document.getElementById('bankAddress');
    const bankLocation = document.getElementById('bankLocation');
    
    // Check if elements exist
    if (!bankDetails || !bankName || !branchName || !bankAddress || !bankLocation) {
        console.warn('⚠️ Bank info elements missing from HTML');
        return;
    }
    
    // Set bank information
    const bankNames = {
        'TD': 'TD Bank',
        'RBC': 'Royal Bank of Canada',
        'BMO': 'BMO Bank of Montreal',
        'SCOTIA': 'Scotiabank',
        'CIBC': 'CIBC'
    };
    
    bankName.textContent = bankNames[data.bank] || data.bank;
    branchName.textContent = data.branchData.branch || 'Main Branch';
    bankAddress.textContent = data.branchData.address || 'Address not available';
    bankLocation.textContent = `${data.branchData.city || 'Unknown'}, ${data.branchData.state || 'Unknown'}`;
    
    bankDetails.style.display = 'block';
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
    console.log('💾 Saved to history:', historyEntry);
}

function toggleAdvance() {
    const options = document.getElementById('advanceOptions');
    const arrow = document.getElementById('advanceArrow');
    
    if (!options || !arrow) {
        console.error('❌ Advance elements not found');
        return;
    }
    
    if (options.classList.contains('show')) {
        options.classList.remove('show');
        arrow.innerHTML = '▶';
        selectedAdvanceOptions = [];
        // Clear all checkboxes
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
    selectedAdvanceOptions = [];
    const checkboxes = document.querySelectorAll('#advanceOptions input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        selectedAdvanceOptions.push(checkbox.value);
    });
    
    console.log('📋 Selected banks:', selectedAdvanceOptions);
    updateGenerateButtonState();
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
        if (historyTable) historyTable.style.display = 'block';
        
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
