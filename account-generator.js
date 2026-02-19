// Account Generator - Complete Working Version

// Global variables
let selectedAdvanceOptions = [];
let accountHistory = JSON.parse(localStorage.getItem('accountHistory')) || [];

// Document ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Account Generator loaded');
    loadHistory();
    updateGenerateButtonState();
});

// Generate account function
function generateAccount() {
    console.log('🎯 Generating account...');
    console.log('📋 Selected banks:', selectedAdvanceOptions);
    
    // Determine which banks to use
    let banksToUse = [];
    const advanceOptions = document.getElementById('advanceOptions');
    const isAdvanceOpen = advanceOptions && advanceOptions.classList.contains('show');
    
    if (isAdvanceOpen && selectedAdvanceOptions.length > 0) {
        banksToUse = selectedAdvanceOptions;
        console.log('🎯 Using selected banks:', banksToUse);
    } else {
        // Use all available banks if no selection
        banksToUse = ['td']; // Default to TD since we know it exists
        console.log('🌟 Using default bank: TD');
    }
    
    // Generate account data
    const accountData = generateCompleteAccount(banksToUse);
    
    if (!accountData) {
        console.error('❌ Failed to generate account data');
        alert('Failed to generate account. Please check console for details.');
        return;
    }
    
    // Display generated data
    displayAccountData(accountData);
    
    // Save to history
    saveToHistory(accountData);
    
    console.log('✅ Account generated successfully:', accountData);
}

function displayAccountData(data) {
    // Update form fields
    document.getElementById('transitResult').value = data.transit;
    document.getElementById('institutionResult').value = data.institution;
    document.getElementById('accountResult').value = data.account;
    
    // Show bank information
    showBankInfo(data);
}

function showBankInfo(data) {
    const bankDetails = document.getElementById('bankDetails');
    const bankName = document.getElementById('bankName');
    const branchName = document.getElementById('branchName');
    const bankAddress = document.getElementById('bankAddress');
    const bankLocation = document.getElementById('bankLocation');
    
    // Set bank information
    bankName.textContent = getBankDisplayName(data.bank);
    
    if (data.branchData) {
        branchName.textContent = data.branchData.branch || 'Main Branch';
        bankAddress.textContent = data.branchData.address || 'Address not available';
        bankLocation.textContent = `${data.branchData.city || 'Unknown'}, ${data.branchData.state || 'Unknown'}`;
    } else {
        branchName.textContent = 'Main Branch';
        bankAddress.textContent = 'Address not available';
        bankLocation.textContent = 'Location not available';
    }
    
    // Show the bank details section
    bankDetails.style.display = 'block';
}

function generateCompleteAccount(selectedBanks = []) {
    console.log('🏦 Starting account generation for banks:', selectedBanks);
    
    // Bank data mapping
    const bankDataMap = {
        'td': 'tdBankData',
        'rbc': 'rbcData',
        'bmo': 'bmoData',
        'scotia': 'scotiaData',
        'cibc': 'cibcData'
    };
    
    const institutionMap = {
        'td': '004',
        'rbc': '003',
        'bmo': '001',
        'scotia': '002',
        'cibc': '010'
    };
    
    const bankNameMap = {
        'td': 'TD Bank',
        'rbc': 'Royal Bank of Canada',
        'bmo': 'BMO Bank of Montreal',
        'scotia': 'Scotiabank',
        'cibc': 'CIBC'
    };
    
    // Find available banks with data
    const availableBanks = [];
    
    selectedBanks.forEach(bankCode => {
        const dataVarName = bankDataMap[bankCode];
        console.log(`🔍 Checking ${bankCode} data (${dataVarName})...`);
        
        try {
            const bankData = window[dataVarName];
            if (bankData && bankData[bankCode + 'Bank'] && bankData[bankCode + 'Bank'].length > 0) {
                availableBanks.push({
                    code: bankCode,
                    data: bankData[bankCode + 'Bank'],
                    institution: institutionMap[bankCode],
                    name: bankNameMap[bankCode]
                });
                console.log(`✅ ${bankCode.toUpperCase()} data found: ${bankData[bankCode + 'Bank'].length} branches`);
            } else if (bankData && bankData.tdBank && bankCode === 'td') {
                // Special case for TD Bank data structure
                availableBanks.push({
                    code: bankCode,
                    data: bankData.tdBank,
                    institution: institutionMap[bankCode],
                    name: bankNameMap[bankCode]
                });
                console.log(`✅ TD data found: ${bankData.tdBank.length} branches`);
            } else {
                console.warn(`⚠️ No data found for ${bankCode}`);
            }
        } catch (error) {
            console.error(`❌ Error accessing ${bankCode} data:`, error);
        }
    });
    
    if (availableBanks.length === 0) {
        console.error('❌ No bank data available for selected banks:', selectedBanks);
        return null;
    }
    
    // Select random bank and branch
    const selectedBank = availableBanks[Math.floor(Math.random() * availableBanks.length)];
    const selectedBranch = selectedBank.data[Math.floor(Math.random() * selectedBank.data.length)];
    
    console.log('🏦 Selected bank:', selectedBank.name);
    console.log('🏢 Selected branch:', selectedBranch.branch);
    
    // Extract transit number
    let transit = '00000';
    if (selectedBranch.transitNumber) {
        const parts = selectedBranch.transitNumber.split('-');
        transit = parts[0].padStart(5, '0');
    }
    
    // Generate account number
    const accountLength = Math.floor(Math.random() * 6) + 7; // 7-12 digits
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

function getBankDisplayName(bankCode) {
    const names = {
        'TD': 'TD Bank',
        'RBC': 'Royal Bank of Canada',
        'BMO': 'BMO Bank of Montreal',
        'SCOTIA': 'Scotiabank',
        'CIBC': 'CIBC'
    };
    return names[bankCode.toUpperCase()] || bankCode.toUpperCase();
}

function saveToHistory(accountData) {
    const now = new Date();
    const historyEntry = {
        transit: accountData.transit,
        institution: accountData.institution,
        account: accountData.account,
        bank: accountData.bank.toUpperCase(),
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
    console.log('💾 Saved to history:', historyEntry);
}

// Advance section functions
function toggleAdvance() {
    console.log('🔧 Toggle advance clicked');
    const options = document.getElementById('advanceOptions');
    const arrow = document.getElementById('advanceArrow');
    
    if (options.classList.contains('show')) {
        options.classList.remove('show');
        arrow.innerHTML = '▶';
        selectedAdvanceOptions = [];
        // Uncheck all checkboxes
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
    
    console.log('📋 Updated selection:', selectedAdvanceOptions);
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
        console.log('🚫 Generate button disabled - no banks selected');
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
        console.log('✅ Generate button enabled');
    }
}

// History functions
function toggleHistory() {
    console.log('📜 Toggle history clicked');
    const modal = document.getElementById('historyModal');
    modal.classList.toggle('show');
    if (modal.classList.contains('show')) {
        loadHistory();
    }
}

function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    const noHistoryMsg = document.getElementById('noHistory');
    
    if (!tableBody || !noHistoryMsg) return;
    
    tableBody.innerHTML = '';
    
    if (accountHistory.length === 0) {
        noHistoryMsg.style.display = 'block';
        document.getElementById('historyTable').style.display = 'none';
    } else {
        noHistoryMsg.style.display = 'none';
        document.getElementById('historyTable').style.display = 'block';
        
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
    document.getElementById('historyModal').classList.remove('show');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('historyModal');
    if (event.target === modal) {
        closeHistory();
    }
});
