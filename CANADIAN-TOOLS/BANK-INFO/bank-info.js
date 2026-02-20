// Add these functions to existing bank-info.js

// Update selectBank function to add visual states
function selectBank(bank) {
    console.log('🏦 Bank selected:', bank);
    
    selectedBank = bank;
    selectedProvince = null;
    selectedCity = null;
    currentBankData = bankDataMap[bank];
    
    if (!currentBankData || currentBankData.length === 0) {
        console.error('❌ No data available for bank:', bank);
        alert(`No data available for ${bank}. Please check if the data file is loaded.`);
        return;
    }
    
    // Update visual states
    document.getElementById('bankText').textContent = bank;
    document.getElementById('bankBtn').classList.add('selected');
    
    document.getElementById('provinceText').textContent = 'Province';
    document.getElementById('provinceBtn').classList.remove('selected');
    
    document.getElementById('cityText').textContent = 'CITY';
    document.getElementById('cityBtn').classList.remove('selected');
    
    // Reset other sections
    resetProvinceSection();
    resetCitySection();
    resetGenerateButton();
    hideBankInfo();
    hideAllOptions();
    
    // Populate provinces and enable province selection
    populateProvinces();
    
    console.log(`✅ ${bank} selected with ${currentBankData.length} branches`);
}

// Update selectProvince function
function selectProvince(province) {
    console.log('🗺️ Province selected:', province);
    
    selectedProvince = province;
    selectedCity = null;
    
    // Update visual states
    document.getElementById('provinceText').textContent = provinceNames[province] || province;
    document.getElementById('provinceBtn').classList.add('selected');
    
    document.getElementById('cityText').textContent = 'CITY';
    document.getElementById('cityBtn').classList.remove('selected');
    
    // Reset city section
    resetCitySection();
    resetGenerateButton();
    hideBankInfo();
    hideAllOptions();
    
    // Populate cities
    populateCities();
}

// Update selectCity function
function selectCity(city) {
    console.log('🏙️ City selected:', city);
    
    selectedCity = city;
    
    // Update visual states
    document.getElementById('cityText').textContent = city.toUpperCase();
    document.getElementById('cityBtn').classList.add('selected');
    
    // Enable generate button
    document.getElementById('generateBtn').classList.remove('disabled');
    
    hideBankInfo();
    hideAllOptions();
}

// Updated displayBankInfo function - Image 2 Format
function displayBankInfo(branch) {
    const display = document.getElementById('bankInfoDisplay');
    const bankName = document.getElementById('displayBankName');
    const accountNumber = document.getElementById('displayAccountNumber');
    const transitNumber = document.getElementById('displayTransitNumber');
    const institutionNumber = document.getElementById('displayInstitutionNumber');
    const branchName = document.getElementById('displayBranchName');
    const bankAddress = document.getElementById('displayBankAddress');
    const bankLocation = document.getElementById('displayBankLocation');
    
    // Generate account details
    const generatedAccount = Math.floor(1000000 + Math.random() * 9000000).toString();
    const generatedTransit = branch.transitNumber ? branch.transitNumber.split('-')[0] : String(Math.floor(10000 + Math.random() * 90000));
    const generatedInstitution = branch.routingNumber ? branch.routingNumber.substring(0, 3) : getInstitutionNumber(selectedBank);
    
    // Update display - Image 2 Format
    if (bankName) bankName.textContent = getBankFullName(selectedBank);
    if (accountNumber) accountNumber.textContent = generatedAccount;
    if (transitNumber) transitNumber.textContent = generatedTransit;
    if (institutionNumber) institutionNumber.textContent = generatedInstitution;
    if (branchName) branchName.textContent = branch.branch || branch.name || 'Main Branch';
    if (bankAddress) bankAddress.textContent = branch.address || 'Address not available';
    if (bankLocation) bankLocation.textContent = `${branch.city}, ${branch.state}`;
    
    display.style.display = 'block';
    
    console.log('🏦 Bank info displayed for:', branch.branch);
    
    // Store generated data for history
    currentGeneratedData = {
        account: generatedAccount,
        transit: generatedTransit,
        institution: generatedInstitution
    };
}

// Updated saveToHistory function
function saveToHistory(bank, city, province, branch) {
    const now = new Date();
    const historyEntry = {
        bank: bank,
        city: city,
        province: provinceNames[province] || province,
        branch: branch.branch || branch.name || 'Main Branch',
        account: currentGeneratedData.account,
        transit: currentGeneratedData.transit,
        institution: currentGeneratedData.institution,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        timestamp: now.getTime()
    };
    
    bankInfoHistory.unshift(historyEntry);
    
    // Keep only last 100 entries
    if (bankInfoHistory.length > 100) {
        bankInfoHistory = bankInfoHistory.slice(0, 100);
    }
    
    localStorage.setItem('bankInfoHistory', JSON.stringify(bankInfoHistory));
    console.log('💾 Saved to history');
}

// Updated loadHistory function for new columns
function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    const noHistoryMsg = document.getElementById('noHistory');
    const historyTable = document.getElementById('historyTable');
    
    if (!tableBody || !noHistoryMsg) return;
    
    tableBody.innerHTML = '';
    
    if (bankInfoHistory.length === 0) {
        noHistoryMsg.style.display = 'block';
        if (historyTable) historyTable.style.display = 'none';
    } else {
        noHistoryMsg.style.display = 'none';
        if (historyTable) historyTable.style.display = 'table';
        
        bankInfoHistory.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.bank}</td>
                <td>${entry.city}</td>
                <td>${entry.province}</td>
                <td>${entry.branch}</td>
                <td>${entry.account || 'N/A'}</td>
                <td>${entry.transit || 'N/A'}</td>
                <td>${entry.institution || 'N/A'}</td>
                <td>${entry.date}</td>
                <td>${entry.time}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    console.log(`📚 History loaded: ${bankInfoHistory.length} entries`);
}

// Helper function for institution numbers
function getInstitutionNumber(bank) {
    const institutionNumbers = {
        'TD': '004',
        'CIBC': '010', 
        'SCOTIA': '002',
        'RBC': '003',
        'BMO': '001'
    };
    return institutionNumbers[bank] || '000';
}

// Add global variable for generated data
let currentGeneratedData = null;
