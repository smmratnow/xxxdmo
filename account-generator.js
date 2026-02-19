// Account Generator - Adaptive Data Structure Version

let selectedAdvanceOptions = [];
let accountHistory = JSON.parse(localStorage.getItem('accountHistory')) || [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Account Generator loaded');
    
    setTimeout(() => {
        console.log('🔍 Testing data availability...');
        inspectDataStructure();
    }, 100);
    
    loadHistory();
    updateGenerateButtonState();
});

function inspectDataStructure() {
    const dataSources = ['tdBankData', 'rbcData', 'bmoData', 'scotiaData', 'cibcData'];
    
    dataSources.forEach(source => {
        if (window[source]) {
            console.log(`📋 ${source} structure:`, Object.keys(window[source]));
            const firstKey = Object.keys(window[source])[0];
            if (firstKey) {
                console.log(`📋 ${source} first key "${firstKey}" has ${window[source][firstKey]?.length || 0} items`);
            }
        }
    });
}

function generateAccount() {
    console.log('🎯 Generate button clicked');
    
    try {
        const advanceOptions = document.getElementById('advanceOptions');
        const isAdvanceOpen = advanceOptions && advanceOptions.classList.contains('show');
        
        let banksToUse = ['td'];
        
        if (isAdvanceOpen && selectedAdvanceOptions.length > 0) {
            banksToUse = selectedAdvanceOptions;
            console.log('🎯 Using selected banks:', banksToUse);
        } else {
            console.log('🌟 Using default bank: TD');
        }
        
        const accountData = generateCompleteAccount(banksToUse);
        
        if (!accountData) {
            console.error('❌ Failed to generate account data');
            alert('Failed to generate account. Check console for details.');
            return;
        }
        
        displayAccountData(accountData);
        saveToHistory(accountData);
        
    } catch (error) {
        console.error('❌ Error in generateAccount:', error);
        alert('Error generating account: ' + error.message);
    }
}

function generateCompleteAccount(selectedBanks) {
    console.log('🏦 Generating for banks:', selectedBanks);
    
    // Adaptive data mapping - we'll discover the actual structure
    const bankConfigs = {
        'td': { variable: 'tdBankData', institution: '004', name: 'TD Bank' },
        'rbc': { variable: 'rbcData', institution: '003', name: 'Royal Bank of Canada' },
        'bmo': { variable: 'bmoData', institution: '001', name: 'BMO Bank of Montreal' },
        'scotia': { variable: 'scotiaData', institution: '002', name: 'Scotiabank' },
        'cibc': { variable: 'cibcData', institution: '010', name: 'CIBC' }
    };
    
    const availableBanks = [];
    
    for (const bankCode of selectedBanks) {
        const bankConfig = bankConfigs[bankCode];
        if (!bankConfig) continue;
        
        try {
            const bankData = window[bankConfig.variable];
            console.log(`🔍 Checking ${bankCode}:`, typeof bankData);
            
            if (!bankData) {
                console.warn(`⚠️ ${bankCode}: No data variable found`);
                continue;
            }
            
            // Discover the actual data structure
            const keys = Object.keys(bankData);
            console.log(`🔑 ${bankCode} available keys:`, keys);
            
            let branches = null;
            
            // Try different possible key patterns
            const possibleKeys = [
                `${bankCode}Bank`,     // tdBank
                `${bankCode}_bank`,    // td_bank  
                `${bankCode}Data`,     // tdData
                keys[0]                // First available key
            ];
            
            for (const key of possibleKeys) {
                if (bankData[key] && Array.isArray(bankData[key]) && bankData[key].length > 0) {
                    branches = bankData[key];
                    console.log(`✅ ${bankCode}: Found ${branches.length} branches in key "${key}"`);
                    break;
                }
            }
            
            if (branches) {
                availableBanks.push({
                    code: bankCode,
                    data: branches,
                    institution: bankConfig.institution,
                    name: bankConfig.name
                });
            } else {
                console.warn(`⚠️ ${bankCode}: No array data found in any key`);
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
    
    console.log('🏦 Selected bank:', selectedBank.name);
    console.log('🏢 Selected branch:', selectedBranch);
    
    // Extract transit number (try multiple possible field names)
    let transit = '00000';
    const transitFields = ['transitNumber', 'transit', 'routingNumber'];
    
    for (const field of transitFields) {
        if (selectedBranch[field]) {
            const value = selectedBranch[field];
            if (typeof value === 'string' && value.includes('-')) {
                const parts = value.split('-');
                transit = parts[0].padStart(5, '0');
                break;
            } else if (typeof value === 'string' && value.length >= 5) {
                transit = value.substring(0, 5);
                break;
            }
        }
    }
    
    // Generate account number (7-12 digits)
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
    
    if (!bankDetails || !bankName || !branchName || !bankAddress || !bankLocation) {
        console.warn('⚠️ Bank info elements missing from HTML');
        return;
    }
    
    const bankNames = {
        'TD': 'TD Bank',
        'RBC': 'Royal Bank of Canada',
        'BMO': 'BMO Bank of Montreal',
        'SCOTIA': 'Scotiabank',
        'CIBC': 'CIBC'
    };
    
    // Try multiple possible field names for branch info
    const branch = data.branchData;
    
    bankName.textContent = bankNames[data.bank] || data.bank;
    branchName.textContent = branch.branch || branch.branchName || branch.name || 'Main Branch';
    bankAddress.textContent = branch.address || branch.streetAddress || 'Address not available';
    bankLocation.textContent = `${branch.city || 'Unknown'}, ${branch.state || branch.province || 'Unknown'}`;
    
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
