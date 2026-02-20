// Bank Info Generator - Exact Account Generator Style
let selectedBank = null;
let selectedProvince = null;
let selectedCity = null;
let currentBankData = null;
let bankInfoHistory = JSON.parse(localStorage.getItem('bankInfoHistory')) || [];
let dataReady = false;

// Province name mapping
const provinceNames = {
    'AB': 'ALBERTA',
    'BC': 'BC', 
    'MB': 'MANITOBA',
    'NB': 'NEW BRUNSWICK',
    'NL': 'NEWFOUNDLAND',
    'NS': 'NOVA SCOTIA',
    'NT': 'NW TERRITORIES',
    'NU': 'NUNAVUT',
    'ON': 'ONTARIO',
    'PE': 'PEI',
    'QC': 'QUEBEC',
    'SK': 'SASKATCHEWAN',
    'YT': 'YUKON'
};

// Bank Data Mapping - Corrected structure
const bankDataMap = {
    'TD': (typeof tdBankData !== 'undefined' && tdBankData?.tdBank) ? tdBankData.tdBank : [],
    'CIBC': (typeof cibcData !== 'undefined' && cibcData?.cibc) ? cibcData.cibc : [],
    'SCOTIA': (typeof scotiaData !== 'undefined' && scotiaData?.scotia) ? scotiaData.scotia : [],
    'RBC': (typeof rbcData !== 'undefined' && rbcData?.rbc) ? rbcData.rbc : [],
    'BMO': (typeof bmoData !== 'undefined' && bmoData?.bmo) ? bmoData.bmo : []
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏦 Bank Info page loaded');
    
    // Give data files time to load
    setTimeout(() => {
        checkDataAvailability();
        loadHistory();
    }, 1500);
});

function checkDataAvailability() {
    console.log('🔍 Checking bank data availability...');
    
    let foundData = [];
    Object.keys(bankDataMap).forEach(bank => {
        const data = bankDataMap[bank];
        if (data && data.length > 0) {
            foundData.push(bank);
            console.log(`✅ ${bank}: ${data.length} branches available`);
        } else {
            console.warn(`⚠️ ${bank}: No data found`);
        }
    });
    
    dataReady = foundData.length > 0;
    console.log(`📊 Bank Info ready: ${dataReady} (${foundData.length} banks available)`);
}

// Toggle Bank Selection
function toggleBankSelection() {
    hideAllOptions();
    const bankOptions = document.getElementById('bankOptions');
    bankOptions.classList.toggle('show');
}

// Toggle Province Selection
function toggleProvinceSelection() {
    if (document.getElementById('provinceBtn').classList.contains('disabled')) return;
    
    hideAllOptions();
    const provinceOptions = document.getElementById('provinceOptions');
    provinceOptions.classList.toggle('show');
}

// Toggle City Selection
function toggleCitySelection() {
    if (document.getElementById('cityBtn').classList.contains('disabled')) return;
    
    hideAllOptions();
    const cityOptions = document.getElementById('cityOptions');
    cityOptions.classList.toggle('show');
}

// Select Bank
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
    
    // Update button text and states
    document.getElementById('bankText').textContent = bank;
    document.getElementById('provinceText').textContent = 'PROVINCE';
    document.getElementById('cityText').textContent = 'CITY';
    
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

// Select Province
function selectProvince(province) {
    console.log('🗺️ Province selected:', province);
    
    selectedProvince = province;
    selectedCity = null;
    
    // Update button text
    document.getElementById('provinceText').textContent = provinceNames[province] || province;
    document.getElementById('cityText').textContent = 'CITY';
    
    // Reset city section
    resetCitySection();
    resetGenerateButton();
    hideBankInfo();
    hideAllOptions();
    
    // Populate cities
    populateCities();
}

// Select City
function selectCity(city) {
    console.log('🏙️ City selected:', city);
    
    selectedCity = city;
    
    // Update button text
    document.getElementById('cityText').textContent = city.toUpperCase();
    
    // Enable generate button
    document.getElementById('generateBtn').classList.remove('disabled');
    
    hideBankInfo();
    hideAllOptions();
}

// Populate Provinces
function populateProvinces() {
    if (!currentBankData || currentBankData.length === 0) return;
    
    // Get unique provinces from current bank data
    const provinces = [...new Set(currentBankData.map(branch => branch.state))].sort();
    
    const container = document.getElementById('provinceOptionsContent');
    container.innerHTML = provinces.map(province => 
        `<label class="option-label">
            <input type="radio" name="province-choice" value="${province}" onchange="selectProvince('${province}')"> 
            ${provinceNames[province] || province}
        </label>`
    ).join('');
    
    // Enable province button
    document.getElementById('provinceBtn').classList.remove('disabled');
    
    console.log(`🗺️ Populated ${provinces.length} provinces for ${selectedBank}`);
}

// Populate Cities
function populateCities() {
    if (!currentBankData || !selectedProvince) return;
    
    // Get unique cities for selected bank and province
    const cities = [...new Set(
        currentBankData
            .filter(branch => branch.state === selectedProvince)
            .map(branch => branch.city)
    )].sort();
    
    const container = document.getElementById('cityOptionsContent');
    container.innerHTML = cities.map(city => 
        `<label class="option-label">
            <input type="radio" name="city-choice" value="${city}" onchange="selectCity('${city}')"> 
            ${city.toUpperCase()}
        </label>`
    ).join('');
    
    // Enable city button
    document.getElementById('cityBtn').classList.remove('disabled');
    
    console.log(`🏙️ Populated ${cities.length} cities for ${selectedBank} in ${selectedProvince}`);
}

// Generate Bank Info
function generateBankInfo() {
    console.log('🎯 Generate Bank Info clicked');
    
    if (!selectedBank || !selectedProvince || !selectedCity) {
        console.error('❌ Missing selections:', {selectedBank, selectedProvince, selectedCity});
        return;
    }
    
    if (!dataReady) {
        alert('❌ Bank data is not loaded yet. Please wait and try again.');
        return;
    }
    
    // Find matching branches
    const matchingBranches = currentBankData.filter(branch => 
        branch.state === selectedProvince && 
        branch.city === selectedCity
    );
    
    if (matchingBranches.length === 0) {
        console.error('❌ No branches found');
        alert(`No ${selectedBank} branches found in ${selectedCity}, ${provinceNames[selectedProvince]}`);
        return;
    }
    
    // Select random branch
    const selectedBranch = matchingBranches[Math.floor(Math.random() * matchingBranches.length)];
    
    displayBankInfo(selectedBranch);
    saveToHistory(selectedBank, selectedCity, selectedProvince, selectedBranch);
    
    console.log('✅ Bank info generated successfully');
}

// Display Bank Information
function displayBankInfo(branch) {
    const display = document.getElementById('bankInfoDisplay');
    const bankName = document.getElementById('displayBankName');
    const branchName = document.getElementById('displayBranchName');
    const bankAddress = document.getElementById('displayBankAddress');
    const bankLocation = document.getElementById('displayBankLocation');
    const accountInfo = document.getElementById('displayAccountInfo');
    
    // Generate sample account details
    const accountNumber = Math.floor(1000000 + Math.random() * 9000000).toString();
    const transitNumber = branch.transitNumber ? branch.transitNumber.split('-')[0] : '00000';
    const institutionNumber = branch.routingNumber ? branch.routingNumber.substring(0, 3) : '000';
    
    // Update display
    if (bankName) bankName.textContent = getBankFullName(selectedBank);
    if (branchName) branchName.textContent = branch.branch || branch.name || 'Main Branch';
    if (bankAddress) bankAddress.textContent = branch.address || 'Address not available';
    if (bankLocation) bankLocation.textContent = `${branch.city}, ${branch.state}`;
    if (accountInfo) {
        accountInfo.innerHTML = `
            <strong>Sample Account:</strong> ${accountNumber}<br>
            <strong>Transit:</strong> ${transitNumber} | 
            <strong>Institution:</strong> ${institutionNumber}
        `;
    }
    
    display.style.display = 'block';
    
    console.log('🏦 Bank info displayed for:', branch.branch);
}

// Get Full Bank Name
function getBankFullName(bankCode) {
    const names = {
        'TD': 'TD CANADA TRUST',
        'CIBC': 'CANADIAN IMPERIAL BANK OF COMMERCE',
        'SCOTIA': 'SCOTIABANK',
        'RBC': 'ROYAL BANK OF CANADA',
        'BMO': 'BANK OF MONTREAL'
    };
    return names[bankCode] || bankCode;
}

// Helper Functions
function hideAllOptions() {
    document.querySelectorAll('.advance-options').forEach(option => {
        option.classList.remove('show');
    });
}

function resetProvinceSection() {
    document.getElementById('provinceBtn').classList.add('disabled');
    document.getElementById('provinceOptionsContent').innerHTML = '';
}

function resetCitySection() {
    document.getElementById('cityBtn').classList.add('disabled');
    document.getElementById('cityOptionsContent').innerHTML = '';
}

function resetGenerateButton() {
    document.getElementById('generateBtn').classList.add('disabled');
}

function hideBankInfo() {
    document.getElementById('bankInfoDisplay').style.display = 'none';
}

// Save to History
function saveToHistory(bank, city, province, branch) {
    const now = new Date();
    const historyEntry = {
        bank: bank,
        city: city,
        province: provinceNames[province] || province,
        branch: branch.branch || branch.name || 'Main Branch',
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

// Toggle History
function toggleHistory() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.toggle('show');
        if (modal.classList.contains('show')) {
            loadHistory();
        }
    }
}

// Load History
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
                <td>${entry.date}</td>
                <td>${entry.time}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    console.log(`📚 History loaded: ${bankInfoHistory.length} entries`);
}

// Close options when clicking outside
window.onclick = function(event) {
    if (!event.target.closest('.bank-selection-btn') && !event.target.closest('.advance-options')) {
        hideAllOptions();
    }
    
    const historyModal = document.getElementById('historyModal');
    if (event.target === historyModal) {
        historyModal.classList.remove('show');
    }
}

console.log('🚀 Bank Info script fully loaded');
