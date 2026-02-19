// Account Generator - Complete Working Version
// Built to handle real bank data with robust error checking

let selectedAdvanceOptions = [];
let accountHistory = JSON.parse(localStorage.getItem('accountHistory')) || [];
let dataReady = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Account Generator loading...');
    
    // Give data files time to load
    setTimeout(() => {
        checkDataAvailability();
        loadHistory();
        updateGenerateButtonState();
    }, 1500);
});

function checkDataAvailability() {
    console.log('🔍 Checking data availability...');
    
    const bankVariables = {
        'TD': 'tdBankData',
        'RBC': 'rbcData', 
        'BMO': 'bmoData',
        'Scotia': 'scotiaData',
        'CIBC': 'cibcData'
    };
    
    let foundData = [];
    
    Object.entries(bankVariables).forEach(([bankName, varName]) => {
        if (typeof window[varName] !== 'undefined') {
            const data = window[varName];
            console.log(`✅ ${bankName}: Variable ${varName} found`);
            
            // Check what keys are available
            const keys = Object.keys(data);
            console.log(`📋 ${bankName} keys:`, keys);
            
            // Find arrays in the data
            keys.forEach(key => {
                if (Array.isArray(data[key]) && data[key].length > 0) {
                    console.log(`📊 ${bankName}.${key}: ${data[key].length} branches`);
                    foundData.push({
                        bank: bankName,
                        variable: varName,
                        key: key,
                        count: data[key].length
                    });
                }
            });
        } else {
            console.warn(`⚠️ ${bankName}: Variable ${varName} not found`);
        }
    });
    
    if (foundData.length > 0) {
        dataReady = true;
        console.log(`✅ Data ready! Found ${foundData.length} bank datasets`);
    } else {
        console.error('❌ No bank data found!');
    }
}

function generateAccount() {
    console.log('🎯 Generate button clicked');
    
    if (!dataReady) {
        console.warn('⚠️ Data not ready, retrying...');
        checkDataAvailability();
        
        if (!dataReady) {
            alert('❌ Bank data is not loaded yet. Please wait and try again.');
            return;
        }
    }
    
    try {
        const advanceOptions = document.getElementById('advanceOptions');
        const isAdvanceOpen = advanceOptions && advanceOptions.classList.contains('show');
        
        // Determine which banks to use
        let banksToUse = ['td']; // Default to TD
        
        if (isAdvanceOpen && selectedAdvanceOptions.length > 0) {
            banksToUse = selectedAdvanceOptions;
            console.log('🎯 Using selected banks:', banksToUse);
        } else {
            console.log('🎯 Using default bank: TD');
        }
        
        const accountData = generateCompleteAccount(banksToUse);
        
        if (!accountData) {
            console.error('❌ Failed to generate account data');
            alert('Failed to generate account. Please check console and try again.');
            return;
        }
        
        displayAccountData(accountData);
        saveToHistory(accountData);
        console.log('✅ Account generated successfully!');
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        alert('Error generating account: ' + error.message);
    }
}

function generateCompleteAccount(selectedBanks) {
    console.log('🏦 Generating account for banks:', selectedBanks);
    
    // Bank configuration with multiple possible key names
    const bankConfigs = {
        'td': { 
            variable: 'tdBankData', 
            possibleKeys: ['tdBank', 'branches', 'data'],
            institution: '004', 
            name: 'TD Bank' 
        },
        'rbc': { 
            variable: 'rbcData', 
            possibleKeys: ['rbcBank', 'branches', 'data'],
            institution: '003', 
            name: 'Royal Bank of Canada' 
        },
        'bmo': { 
            variable: 'bmoData', 
            possibleKeys: ['bmoBank', 'branches', 'data'],
            institution: '001', 
            name: 'BMO Bank of Montreal' 
        },
        'scotia': { 
            variable: 'scotiaData', 
            possibleKeys: ['scotiaBank', 'branches', 'data'],
            institution: '002', 
            name: 'Scotiabank' 
        },
        'cibc': { 
            variable: 'cibcData', 
            possibleKeys: ['cibcBank', 'branches', 'data'],
            institution: '010', 
            name: 'CIBC' 
        }
    };
    
    const availableBanks = [];
    
    // Find available banks with data
    for (const bankCode of selectedBanks) {
        const config = bankConfigs[bankCode];
        if (!config) {
            console.warn(`⚠️ Unknown bank code: ${bankCode}`);
            continue;
        }
        
        const bankData = window[config.variable];
        if (!bankData) {
            console.warn(`⚠️ ${bankCode}: Data variable ${config.variable} not found`);
            continue;
        }
        
        // Try different possible key names
        let branches = null;
        let usedKey = null;
        
        for (const key of config.possibleKeys) {
            if (bankData[key] && Array.isArray(bankData[key]) && bankData[key].length > 0) {
                branches = bankData[key];
                usedKey = key;
                break;
            }
        }
        
        // If no predefined keys work, search all keys
        if (!branches) {
            const allKeys = Object.keys(bankData);
            for (const key of allKeys) {
                if (Array.isArray(bankData[key]) && bankData[key].length > 0) {
                    branches = bankData[key];
                    usedKey = key;
                    break;
                }
            }
        }
        
        if (branches && branches.length > 0) {
            availableBanks.push({
                code: bankCode,
                name: config.name,
                institution: config.institution,
                branches: branches,
                dataKey: usedKey
            });
            console.log(`✅ ${bankCode.toUpperCase()}: Found ${branches.length} branches using key '${usedKey}'`);
        } else {
            console.warn(`⚠️ ${bankCode}: No valid branch data found`);
        }
    }
    
    if (availableBanks.length === 0) {
        console.error('❌ No banks available with valid data');
        return null;
    }
    
    // Select random bank and branch
    const selectedBank = availableBanks[Math.floor(Math.random() * availableBanks.length)];
    const branches = selectedBank.branches;
    const selectedBranch = branches[Math.floor(Math.random() * branches.length)];
    
    console.log('🏦 Selected bank:', selectedBank.name);
    console.log('🏢 Selected branch:', selectedBranch.branch || selectedBranch.name || 'Branch');
    console.log('📍 Branch location:', `${selectedBranch.city || 'Unknown'}, ${selectedBranch.state || selectedBranch.province || 'Unknown'}`);
    
    // Extract transit number
    let transit = '00000';
    if (selectedBranch.transitNumber) {
        // Format: "12345-004" -> take "12345"
        const parts = selectedBranch.transitNumber.split('-');
        if (parts.length > 0) {
            transit = parts[0].padStart(5, '0');
        }
    } else if (selectedBranch.transit) {
        transit = selectedBranch.transit.toString().padStart(5, '0');
    }
    
    // Generate random account number (7-12 digits)
    const accountLength = Math.floor(Math.random() * 6) + 7;
    let account = Math.floor(Math.random() * 9) + 1; // First digit 1-9
    for (let i = 1; i < accountLength; i++) {
        account = account * 10 + Math.floor(Math.random() * 10);
    }
    
    return {
        bank: selectedBank.code.toUpperCase(),
        bankName: selectedBank.name,
        transit: transit,
        institution: selectedBank.institution,
        account: account.toString(),
        branchData: selectedBranch
    };
}

function displayAccountData(data) {
    // Update the input fields
    const transitEl = document.getElementById('transitResult');
    const institutionEl = document.getElementById('institutionResult');
    const accountEl = document.getElementById('accountResult');
    
    if (transitEl) transitEl.value = data.transit;
    if (institutionEl) institutionEl.value = data.institution;
    if (accountEl) accountEl.value = data.account;
    
    // Show bank information
    showBankInfo(data);
    
    console.log('📋 Account displayed:', {
        transit: data.transit,
        institution: data.institution,
        account: data.account,
        bank: data.bankName
    });
}

function showBankInfo(data) {
    const bankDetails = document.getElementById('bankDetails');
    const bankName = document.getElementById('bankName');
    const branchName = document.getElementById('branchName');
    const bankAddress = document.getElementById('bankAddress');
    const bankLocation = document.getElementById('bankLocation');
    
    if (!bankDetails) {
        console.warn('⚠️ Bank details elements not found in HTML');
        return;
    }
    
    const branch = data.branchData;
    
    if (bankName) bankName.textContent = data.bankName || data.bank;
    if (branchName) branchName.textContent = branch.branch || branch.name || 'Main Branch';
    if (bankAddress) bankAddress.textContent = branch.address || 'Address not available';
    if (bankLocation) bankLocation.textContent = `${branch.city || 'Unknown'}, ${branch.state || branch.province || 'Unknown'}`;
    
    bankDetails.style.display = 'block';
    
    console.log('🏦 Bank info displayed');
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
    
    // Keep only last 100 entries
    if (accountHistory.length > 100) {
        accountHistory = accountHistory.slice(0, 100);
    }
    
    localStorage.setItem('accountHistory', JSON.stringify(accountHistory));
    console.log('💾 Saved to history');
}

// HTML-called functions
function updateBankSelection() {
    const selectedBank = document.querySelector('input[name="bank-choice"]:checked');
    const generateBtn = document.getElementById('generateBtn');
    
    // Update the selected options array for the new radio button logic
    if (selectedBank) {
        selectedAdvanceOptions = [selectedBank.value]; // Single selection
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
        console.log('✅ Bank selected:', selectedBank.value, '- Generate button ENABLED');
    } else {
        selectedAdvanceOptions = [];
        // Only disable if advance is open
        const advanceOptions = document.getElementById('advanceOptions');
        if (advanceOptions && advanceOptions.classList.contains('show')) {
            generateBtn.disabled = true;
            generateBtn.classList.add('disabled');
            console.log('❌ No bank selected - Generate button DISABLED');
        }
    }
}



function toggleAdvance() {
    const options = document.getElementById('advanceOptions');
    const arrow = document.getElementById('advanceArrow');
    
    if (!options || !arrow) {
        console.error('❌ Advance elements not found');
        return;
    }
    
    if (options.classList.contains('show')) {
        // Close advance options
        options.classList.remove('show');
        arrow.innerHTML = '▶';
        
        // Clear selections
        selectedAdvanceOptions = [];
        document.querySelectorAll('#advanceOptions input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    } else {
        // Open advance options
        options.classList.add('show');
        arrow.innerHTML = '▼';
    }
    
    updateGenerateButtonState();
}

function updateAdvanceSelection() {
    // Alternative function name that might be called
    updateBankSelection();
}

function updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    const advanceOptions = document.getElementById('advanceOptions');
    
    if (!generateBtn || !advanceOptions) return;
    
    const isAdvanceOpen = advanceOptions.classList.contains('show');
    const selectedBank = document.querySelector('input[name="bank-choice"]:checked');
    
    if (isAdvanceOpen && !selectedBank) {
        // Advance is open but no bank selected - disable button
        generateBtn.disabled = true;
        generateBtn.classList.add('disabled');
        console.log('❌ Advance open, no bank selected - DISABLED');
    } else {
        // Either advance is closed OR a bank is selected - enable button
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
        console.log('✅ Generate button ENABLED');
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
    const historyTable = document.getElementById('historyTable');
    
    if (!tableBody || !noHistoryMsg) {
        console.warn('⚠️ History elements not found');
        return;
    }
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (accountHistory.length === 0) {
        noHistoryMsg.style.display = 'block';
        if (historyTable) historyTable.style.display = 'none';
    } else {
        noHistoryMsg.style.display = 'none';
        if (historyTable) historyTable.style.display = 'table';
        
        // Add history entries to table
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
    
    console.log(`📚 History loaded: ${accountHistory.length} entries`);
}

function closeHistory() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

console.log('🚀 Account Generator script fully loaded');
