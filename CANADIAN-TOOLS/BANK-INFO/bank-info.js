// Bank Info Generator - Fixed for TD Data Structure
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

// Select Bank
function selectBank(bank) {
    console.log('🏦 Bank selected:', bank);
    
    // Clear previous selections
    document.querySelectorAll('.selection-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    selectedBank = bank;
    selectedProvince = null;
    selectedCity = null;
    currentBankData = bankDataMap[bank];
    
    if (!currentBankData || currentBankData.length === 0) {
        console.error('❌ No data available for bank:', bank);
        alert(`No data available for ${bank}. Please check if the data file is loaded.`);
        return;
    }
    
    // Highlight selected bank
    document.getElementById(`bankBtn-${bank}`).classList.add('selected');
    
    // Reset other sections
    resetProvinceSection();
    resetCitySection();
    resetGenerateButton();
    clearBankInfoDisplay();
    
    // Populate provinces
    populateProvinces();
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
    
    const provinceContainer = document.getElementById('provinceButtons');
    provinceContainer.classList.remove('disabled');
    provinceContainer.innerHTML = provinces.map(province => 
        `<button class="selection-btn" onclick="selectProvince('${province}')">${provinceNames[province] || province} ▶</button>`
    ).join('');
    
    console.log('🗺️ Populated provinces for', selectedBank, ':', provinces);
}

// Select Province
function selectProvince(province) {
    console.log('🗺️ Province selected:', province);
    
    // Clear previous province selections
    document.querySelectorAll('#provinceButtons .selection-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    selectedProvince = province;
    selectedCity = null;
    
    // Highlight selected province
    event.target.classList.add('selected');
    
    // Reset other sections
    resetCitySection();
    resetGenerateButton();
    clearBankInfoDisplay();
    
    // Populate cities
    populateCities();
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
    
    const cityContainer = document.getElementById('cityButtons');
    cityContainer.classList.remove('disabled');
    cityContainer.innerHTML = cities.map(city => 
        `<button class="selection-btn" onclick="selectCity('${city}')">${city} ▶</button>`
    ).join('');
    
    console.log('🏙️ Populated', cities.length, 'cities for', selectedBank, 'in', selectedProvince);
}

// Select City
function selectCity(city) {
    console.log('🏙️ City selected:', city);
    
    // Clear previous city selections
    document.querySelectorAll('#cityButtons .selection-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    selectedCity = city;
    
    // Highlight selected city
    event.target.classList.add('selected');
    
    // Enable generate button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.classList.remove('disabled');
    
    clearBankInfoDisplay();
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
        <div class="bank-info-card">
            <div class="bank-title">${getBankFullName(selectedBank)}</div>
            
            <div class="info-section">
                <div class="info-label">ACCOUNT NUMBER</div>
                <div class="info-value">${accountNumber}</div>
            </div>
            
            <div class="info-section">
                <div class="info-label">TRANSIT NUMBER</div>
                <div class="info-value">${transitNumber}</div>
            </div>
            
            <div class="info-section">
                <div class="info-label">INSTITUTION NUMBER</div>
                <div class="info-value">${institutionNumber}</div>
            </div>
            
            <div class="info-section">
                <div class="info-label">ADDRESS</div>
                <div class="info-address">
                    <div><strong>${branch.branch}</strong></div>
                    <div>${branch.address}</div>
                    <div>${branch.city}, ${branch.state}</div>
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
    const provinceContainer = document.getElementById('provinceButtons');
    provinceContainer.classList.add('disabled');
    provinceContainer.innerHTML = '';
}

function resetCitySection() {
    const cityContainer = document.getElementById('cityButtons');
    cityContainer.classList.add('disabled');
    cityContainer.innerHTML = '';
}

function resetGenerateButton() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.classList.add('disabled');
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

// Close modal when clicking outside
window.onclick = function(event) {
    const historyModal = document.getElementById('historyModal');
    if (event.target === historyModal) {
        historyModal.classList.remove('show');
    }
}
