// Bank Info Generator - Exact Style Match
let selectedBank = null;
let selectedProvince = null;
let selectedCity = null;
let currentBankData = null;
let searchHistory = JSON.parse(localStorage.getItem('bankInfoHistory')) || [];

// Fixed Bank Data Mapping - Corrected TD structure
const bankDataMap = {
    'TD': (typeof tdBankData !== 'undefined' && tdBankData?.tdBank) ? tdBankData.tdBank : [],
    'CIBC': (typeof cibcData !== 'undefined' && cibcData?.cibc) ? cibcData.cibc : [],
    'SCOTIA': (typeof scotiaData !== 'undefined' && scotiaData?.scotia) ? scotiaData.scotia : [],
    'RBC': (typeof rbcData !== 'undefined' && rbcData?.rbc) ? rbcData.rbc : [],
    'BMO': (typeof bmoData !== 'undefined' && bmoData?.bmo) ? bmoData.bmo : []
};

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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏦 Bank Info page loaded');
    console.log('📊 Available bank data:');
    Object.keys(bankDataMap).forEach(bank => {
        console.log(`   ${bank}: ${bankDataMap[bank].length} branches`);
    });
    
    updateHistoryDisplay();
});

// Toggle Bank Selection
function toggleBankSelection() {
    const bankOptions = document.getElementById('bankOptions');
    const provinceOptions = document.getElementById('provinceOptions');
    const cityOptions = document.getElementById('cityOptions');
    
    // Hide other options
    provinceOptions.classList.remove('show');
    cityOptions.classList.remove('show');
    
    // Toggle bank options
    bankOptions.classList.toggle('show');
}

// Toggle Province Selection  
function toggleProvinceSelection() {
    if (document.getElementById('provinceBtn').classList.contains('disabled')) return;
    
    const bankOptions = document.getElementById('bankOptions');
    const provinceOptions = document.getElementById('provinceOptions');
    const cityOptions = document.getElementById('cityOptions');
    
    // Hide other options
    bankOptions.classList.remove('show');
    cityOptions.classList.remove('show');
    
    // Toggle province options
    provinceOptions.classList.toggle('show');
}

// Toggle City Selection
function toggleCitySelection() {
    if (document.getElementById('cityBtn').classList.contains('disabled')) return;
    
    const bankOptions = document.getElementById('bankOptions');
    const provinceOptions = document.getElementById('provinceOptions');
    const cityOptions = document.getElementById('cityOptions');
    
    // Hide other options
    bankOptions.classList.remove('show');
    provinceOptions.classList.remove('show');
    
    // Toggle city options
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
    
    // Update button text
    document.getElementById('bankText').textContent = bank;
    document.getElementById('provinceText').textContent = 'PROVINCE';
    document.getElementById('cityText').textContent = 'CITY';
    
    // Reset and enable province
    resetProvinceSection();
    resetCitySection();
    resetGenerateButton();
    clearBankInfoDisplay();
    hideAllOptions();
    
    // Populate and enable province selection
    populateProvinces();
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
    clearBankInfoDisplay();
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
    
    clearBankInfoDisplay();
    hideAllOptions();
}

// Populate Provinces
function populateProvinces() {
    if (!currentBankData || currentBankData.length === 0) return;
    
    // Get unique provinces
    const provinces = [...new Set(currentBankData.map(branch => branch.state))];
    provinces.sort();
    
    const container = document.getElementById('provinceOptionsContent');
    container.innerHTML = provinces.map(province => 
        `<label class="option-checkbox">
            <input type="radio" name="province-choice" value="${province}" onchange="selectProvince('${province}')">
            <span class="checkmark">${provinceNames[province] || province}</span>
        </label>`
    ).join('');
    
    // Enable province button
    document.getElementById('provinceBtn').classList.remove('disabled');
}

// Populate Cities
function populateCities() {
    if (!currentBankData || !selectedProvince) return;
    
    // Get unique cities for selected province
    const cities = [...new Set(
        currentBankData
            .filter(branch => branch.state === selectedProvince)
            .map(branch => branch.city)
    )];
    cities.sort();
    
    const container = document.getElementById('cityOptionsContent');
    container.innerHTML = cities.map(city => 
        `<label class="option-checkbox">
            <input type="radio" name="city-choice" value="${city}" onchange="selectCity('${city}')">
            <span class="checkmark">${city.toUpperCase()}</span>
        </label>`
    ).join('');
    
    // Enable city button
    document.getElementById('cityBtn').classList.remove('disabled');
}

// Generate Bank Info
function generateBankInfo() {
    if (!selectedBank || !selectedProvince || !selectedCity) return;
    
    // Find matching branches
    const matchingBranches = currentBankData.filter(branch => 
        branch.state === selectedProvince && branch.city === selectedCity
    );
    
    if (matchingBranches.length === 0) {
        alert(`No ${selectedBank} branches found in ${selectedCity}`);
        return;
    }
    
    // Select random branch
    const selectedBranch = matchingBranches[Math.floor(Math.random() * matchingBranches.length)];
    
    displayBankInfo(selectedBranch);
    addToHistory(selectedBank, selectedCity, selectedProvince);
}

// Display Bank Information
function displayBankInfo(branch) {
    const display = document.getElementById('bankInfoDisplay');
    
    // Generate random account number (7 digits)
    const accountNumber = Math.floor(1000000 + Math.random() * 9000000).toString();
    
    // Extract transit number
    const transitNumber = branch.transitNumber.split('-')[0];
    
    // Extract institution number
    const institutionNumber = branch.routingNumber.substring(0, 3);
    
    display.innerHTML = `
        <div class="result-card">
            <div class="result-title">${getBankFullName(selectedBank)}</div>
            <div class="result-divider"></div>
            
            <div class="result-item">
                <div class="result-label">ACCOUNT NUMBER</div>
                <div class="result-value">${accountNumber}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">TRANSIT NUMBER</div>
                <div class="result-value">${transitNumber}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">INSTITUTION NUMBER</div>
                <div class="result-value">${institutionNumber}</div>
            </div>
            
            <div class="result-item">
                <div class="result-label">ADDRESS</div>
                <div class="result-address">
                    ${branch.branch}<br>
                    ${branch.address}<br>
                    ${branch.city}, ${branch.state}
                </div>
            </div>
        </div>
    `;
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

function clearBankInfoDisplay() {
    document.getElementById('bankInfoDisplay').innerHTML = '';
}

// Add to History
function addToHistory(bank, city, province) {
    const now = new Date();
    const entry = {
        bank: bank,
        city: city,
        province: provinceNames[province] || province,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        timestamp: now.getTime()
    };
    
    searchHistory.unshift(entry);
    if (searchHistory.length > 50) {
        searchHistory = searchHistory.slice(0, 50);
    }
    
    localStorage.setItem('bankInfoHistory', JSON.stringify(searchHistory));
    updateHistoryDisplay();
}

// Toggle History
function toggleHistory() {
    document.getElementById('historyModal').classList.toggle('show');
}

// Update History Display
function updateHistoryDisplay() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    
    if (searchHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-history">No search history available</td></tr>';
        return;
    }
    
    tbody.innerHTML = searchHistory.map(entry => `
        <tr>
            <td>${entry.bank}</td>
            <td>${entry.city}</td>
            <td>${entry.province}</td>
            <td>${entry.date}</td>
            <td>${entry.time}</td>
        </tr>
    `).join('');
}

// Close options when clicking outside
window.onclick = function(event) {
    if (!event.target.closest('.bank-info-btn') && !event.target.closest('.advance-options')) {
        hideAllOptions();
    }
    
    const historyModal = document.getElementById('historyModal');
    if (event.target === historyModal) {
        historyModal.classList.remove('show');
    }
}
