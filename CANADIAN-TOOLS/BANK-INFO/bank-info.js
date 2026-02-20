// Bank Info Generator - Using SIN Generator Style
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
    'AB': 'Alberta',
    'BC': 'British Columbia',
    'MB': 'Manitoba',
    'NB': 'New Brunswick',
    'NL': 'Newfoundland and Labrador',
    'NS': 'Nova Scotia',
    'NT': 'Northwest Territories',
    'NU': 'Nunavut',
    'ON': 'Ontario',
    'PE': 'Prince Edward Island',
    'QC': 'Quebec',
    'SK': 'Saskatchewan',
    'YT': 'Yukon'
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

// Toggle Bank Dropdown
function toggleBankDropdown() {
    const dropdown = document.getElementById('bankDropdown');
    const isOpen = dropdown.classList.contains('show');
    
    // Close all dropdowns first
    closeAllDropdowns();
    
    if (!isOpen) {
        dropdown.classList.add('show');
    }
}

// Toggle Province Dropdown
function toggleProvinceDropdown() {
    if (document.getElementById('provinceBtn').classList.contains('disabled')) return;
    
    const dropdown = document.getElementById('provinceDropdown');
    const isOpen = dropdown.classList.contains('show');
    
    closeAllDropdowns();
    
    if (!isOpen) {
        dropdown.classList.add('show');
    }
}

// Toggle City Dropdown
function toggleCityDropdown() {
    if (document.getElementById('cityBtn').classList.contains('disabled')) return;
    
    const dropdown = document.getElementById('cityDropdown');
    const isOpen = dropdown.classList.contains('show');
    
    closeAllDropdowns();
    
    if (!isOpen) {
        dropdown.classList.add('show');
    }
}

// Close all dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-options').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
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
    document.getElementById('bankBtnText').textContent = bank;
    document.getElementById('provinceBtnText').textContent = 'Province';
    document.getElementById('cityBtnText').textContent = 'CITY';
    
    // Reset other sections
    resetProvinceSection();
    resetCitySection();
    resetGenerateButton();
    clearBankInfoDisplay();
    closeAllDropdowns();
    
    // Populate provinces
    populateProvinces();
}

// Select Province
function selectProvince(province) {
    console.log('🗺️ Province selected:', province);
    
    selectedProvince = province;
    selectedCity = null;
    
    // Update button text
    document.getElementById('provinceBtnText').textContent = provinceNames[province] || province;
    document.getElementById('cityBtnText').textContent = 'CITY';
    
    // Reset other sections
    resetCitySection();
    resetGenerateButton();
    clearBankInfoDisplay();
    closeAllDropdowns();
    
    // Populate cities
    populateCities();
}

// Select City
function selectCity(city) {
    console.log('🏙️ City selected:', city);
    
    selectedCity = city;
    
    // Update button text
    document.getElementById('cityBtnText').textContent = city;
    
    // Enable generate button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.classList.remove('disabled');
    
    clearBankInfoDisplay();
    closeAllDropdowns();
}

// Populate Provinces for Selected Bank
function populateProvinces() {
    if (!currentBankData || currentBankData.length === 0) {
        console.error('❌ No bank data available');
        return;
    }
    
    // Get unique provinces from bank data
    const provinces = [...new Set(currentBankData.map(branch => branch.state))];
    provinces.sort();
    
    const provinceDropdown = document.getElementById('provinceDropdown');
    provinceDropdown.innerHTML = provinces.map(province => 
        `<div class="option-item" onclick="selectProvince('${province}')">${provinceNames[province] || province}</div>`
    ).join('');
    
    // Enable province button
    document.getElementById('provinceBtn').classList.remove('disabled');
    
    console.log('🗺️ Populated provinces for', selectedBank, ':', provinces);
}

// Populate Cities for Selected Bank and Province
function populateCities() {
    if (!currentBankData || !selectedProvince) {
        console.error('❌ Missing bank data or province');
        return;
    }
    
    // Filter branches by selected bank and province, get unique cities
    const cities = [...new Set(
        currentBankData
            .filter(branch => branch.state === selectedProvince)
            .map(branch => branch.city)
    )];
    
    // Sort alphabetically
    cities.sort();
    
    const cityDropdown = document.getElementById('cityDropdown');
    cityDropdown.innerHTML = cities.map(city => 
        `<div class="option-item" onclick="selectCity('${city}')">${city}</div>`
    ).join('');
    
    // Enable city button
    document.getElementById('cityBtn').classList.remove('disabled');
    
    console.log('🏙️ Populated', cities.length, 'cities for', selectedBank, 'in', selectedProvince);
}

// Generate Bank Info
function generateBankInfo() {
    if (!selectedBank || !selectedProvince || !selectedCity) {
        console.error('❌ Missing selections');
        return;
    }
    
    // Find matching branches
    const matchingBranches = currentBankData.filter(branch => 
        branch.state === selectedProvince && branch.city === selectedCity
    );
    
    if (matchingBranches.length === 0) {
        console.error('❌ No branches found');
        alert(`No ${selectedBank} branches found in ${selectedCity}, ${provinceNames[selectedProvince] || selectedProvince}`);
        return;
    }
    
    // Select random branch
    const selectedBranch = matchingBranches[Math.floor(Math.random() * matchingBranches.length)];
    
    displayBankInfo(selectedBranch);
    addToHistory(selectedBank, selectedCity, selectedProvince);
    
    console.log('✅ Bank info generated for:', selectedBranch.branch);
}

// Display Bank Information
function displayBankInfo(branch) {
    const display = document.getElementById('bankInfoDisplay');
    
    // Generate random account number (7 digits)
    const accountNumber = Math.floor(1000000 + Math.random() * 9000000).toString();
    
    // Extract transit number (5 digits from transitNumber field)
    const transitNumber = branch.transitNumber.split('-')[0];
    
    // Extract institution number from routing number (first 3 digits)
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

// Reset Functions
function resetProvinceSection() {
    document.getElementById('provinceBtn').classList.add('disabled');
    document.getElementById('provinceDropdown').innerHTML = '';
}

function resetCitySection() {
    document.getElementById('cityBtn').classList.add('disabled');
    document.getElementById('cityDropdown').innerHTML = '';
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
    
    // Keep only last 50 entries
    if (searchHistory.length > 50) {
        searchHistory = searchHistory.slice(0, 50);
    }
    
    localStorage.setItem('bankInfoHistory', JSON.stringify(searchHistory));
    updateHistoryDisplay();
}

// Toggle History Modal
function toggleHistory() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.toggle('show');
    }
}

// Update History Display
function updateHistoryDisplay() {
    const historyTableBody = document.getElementById('historyTableBody');
    if (!historyTableBody) return;
    
    if (searchHistory.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-history">No search history available</td>
            </tr>
        `;
        return;
    }
    
    historyTableBody.innerHTML = searchHistory
        .map(entry => `
            <tr>
                <td>${entry.bank}</td>
                <td>${entry.city}</td>
                <td>${entry.province}</td>
                <td>${entry.date}</td>
                <td>${entry.time}</td>
            </tr>
        `)
        .join('');
}

// Close dropdowns when clicking outside
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-btn')) {
        closeAllDropdowns();
    }
    
    const historyModal = document.getElementById('historyModal');
    if (event.target === historyModal) {
        historyModal.classList.remove('show');
    }
}
