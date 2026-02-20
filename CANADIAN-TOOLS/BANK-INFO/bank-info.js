console.log('🚀 Bank Info Script Loading...');

// Global Variables
let selectedBank = null;
let selectedProvince = null;
let selectedCity = null;
let currentBankData = null;
let bankInfoHistory = JSON.parse(localStorage.getItem('bankInfoHistory')) || [];
let currentGeneratedData = null;

// Province name mapping
const provinceNames = {
    'AB': 'ALBERTA', 'BC': 'BRITISH COLUMBIA', 'MB': 'MANITOBA', 'NB': 'NEW BRUNSWICK',
    'NL': 'NEWFOUNDLAND', 'NS': 'NOVA SCOTIA', 'NT': 'NW TERRITORIES',
    'NU': 'NUNAVUT', 'ON': 'ONTARIO', 'PE': 'PRINCE EDWARD ISLAND', 'QC': 'QUEBEC',
    'SK': 'SASKATCHEWAN', 'YT': 'YUKON'
};

// Bank Data Mapping - Wait for data to load
let bankDataMap = {};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Content Loaded');
    
    // Wait for bank data to load
    setTimeout(() => {
        initializeBankData();
        loadHistory();
    }, 1000);
});

function initializeBankData() {
    console.log('🔄 Initializing bank data...');
    
    // Check what data is available
    console.log('🔍 Checking available data:');
    console.log('- tdBankData:', typeof window.tdBankData, window.tdBankData);
    console.log('- rbcData:', typeof window.rbcData, window.rbcData);
    console.log('- bmoData:', typeof window.bmoData, window.bmoData);
    console.log('- scotiaData:', typeof window.scotiaData, window.scotiaData);
    console.log('- cibcData:', typeof window.cibcData, window.cibcData);
    
    bankDataMap = {
        'TD': window.tdBankData || [],
        'RBC': window.rbcData || [],
        'BMO': window.bmoData || [],
        'SCOTIA': window.scotiaData || [],
        'CIBC': window.cibcData || []
    };
    
    let totalBranches = 0;
    Object.keys(bankDataMap).forEach(bank => {
        const data = bankDataMap[bank];
        if (data && data.length > 0) {
            totalBranches += data.length;
            console.log(`✅ ${bank}: ${data.length} branches loaded`);
        } else {
            console.warn(`⚠️ ${bank}: No data available`);
        }
    });
    
    console.log(`📊 Total branches available: ${totalBranches}`);
}

// TOGGLE BANK SELECTION - Main function
function toggleBankSelection() {
    console.log('🏦 toggleBankSelection() called');
    
    const bankOptions = document.getElementById('bankOptions');
    if (!bankOptions) {
        console.error('❌ bankOptions element not found!');
        return;
    }
    
    // Hide other options first
    hideAllOptions();
    
    // Toggle bank options
    const isVisible = bankOptions.classList.contains('show');
    
    if (isVisible) {
        bankOptions.classList.remove('show');
        console.log('👁️ Hiding bank options');
    } else {
        bankOptions.classList.add('show');
        console.log('👁️ Showing bank options');
    }
}

// SELECT BANK
function selectBank(bank) {
    console.log('🏦 Bank selected:', bank);
    
    selectedBank = bank;
    selectedProvince = null;
    selectedCity = null;
    currentBankData = bankDataMap[bank];
    
    if (!currentBankData || currentBankData.length === 0) {
        console.error('❌ No data available for bank:', bank);
        alert(`No data available for ${bank}. Please try refreshing the page.`);
        return;
    }
    
    // Update UI
    updateBankButton(bank);
    resetProvinceButton();
    resetCityButton();
    disableGenerateButton();
    hideAllOptions();
    enableProvinceButton();
    
    console.log(`✅ ${bank} selected with ${currentBankData.length} branches`);
}

// UPDATE BANK BUTTON
function updateBankButton(bank) {
    const bankText = document.getElementById('bankText');
    const bankBtn = document.getElementById('bankBtn');
    
    if (bankText) bankText.textContent = bank;
    if (bankBtn) {
        bankBtn.classList.remove('disabled');
        bankBtn.classList.add('selected');
    }
}

// RESET PROVINCE BUTTON
function resetProvinceButton() {
    const provinceText = document.getElementById('provinceText');
    const provinceBtn = document.getElementById('provinceBtn');
    
    if (provinceText) provinceText.textContent = 'Province';
    if (provinceBtn) {
        provinceBtn.classList.remove('selected');
        provinceBtn.classList.add('disabled');
    }
}

// ENABLE PROVINCE BUTTON
function enableProvinceButton() {
    const provinceBtn = document.getElementById('provinceBtn');
    if (provinceBtn) {
        provinceBtn.classList.remove('disabled');
    }
}

// RESET CITY BUTTON
function resetCityButton() {
    const cityText = document.getElementById('cityText');
    const cityBtn = document.getElementById('cityBtn');
    
    if (cityText) cityText.textContent = 'CITY';
    if (cityBtn) {
        cityBtn.classList.remove('selected');
        cityBtn.classList.add('disabled');
    }
}

// DISABLE GENERATE BUTTON
function disableGenerateButton() {
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.classList.add('disabled');
    }
}

// HIDE ALL OPTIONS
function hideAllOptions() {
    console.log('👁️ Hiding all options');
    
    const allOptions = [
        document.getElementById('bankOptions'),
        document.getElementById('provinceOptions'),
        document.getElementById('cityOptions')
    ];
    
    allOptions.forEach(option => {
        if (option) {
            option.classList.remove('show');
        }
    });
}

// TOGGLE PROVINCE SELECTION
function toggleProvinceSelection() {
    console.log('🗺️ toggleProvinceSelection() called');
    
    if (!selectedBank) {
        console.log('⚠️ No bank selected yet');
        return;
    }
    
    const provinceOptions = document.getElementById('provinceOptions');
    if (!provinceOptions) return;
    
    hideAllOptions();
    
    if (!provinceOptions.classList.contains('show')) {
        populateProvinces();
        provinceOptions.classList.add('show');
    }
}

// POPULATE PROVINCES
function populateProvinces() {
    if (!currentBankData) return;
    
    const provincesSet = new Set();
    currentBankData.forEach(branch => {
        if (branch.state) {
            provincesSet.add(branch.state);
        }
    });
    
    const provinces = Array.from(provincesSet).sort();
    const provinceContent = document.getElementById('provinceOptionsContent');
    
    if (provinceContent) {
        provinceContent.innerHTML = provinces.map(province => 
            `<label class="option-label">
                <input type="radio" name="province-choice" value="${province}" onchange="selectProvince('${province}')">
                ${provinceNames[province] || province}
            </label>`
        ).join('');
    }
    
    console.log('🗺️ Populated provinces:', provinces);
}

// SELECT PROVINCE
function selectProvince(province) {
    console.log('🗺️ Province selected:', province);
    
    selectedProvince = province;
    selectedCity = null;
    
    // Update UI
    const provinceText = document.getElementById('provinceText');
    const provinceBtn = document.getElementById('provinceBtn');
    
    if (provinceText) provinceText.textContent = provinceNames[province] || province;
    if (provinceBtn) {
        provinceBtn.classList.remove('disabled');
        provinceBtn.classList.add('selected');
    }
    
    resetCityButton();
    enableCityButton();
    disableGenerateButton();
    hideAllOptions();
}

// ENABLE CITY BUTTON
function enableCityButton() {
    const cityBtn = document.getElementById('cityBtn');
    if (cityBtn) {
        cityBtn.classList.remove('disabled');
    }
}

// TOGGLE CITY SELECTION
function toggleCitySelection() {
    console.log('🏙️ toggleCitySelection() called');
    
    if (!selectedBank || !selectedProvince) {
        console.log('⚠️ Bank or province not selected yet');
        return;
    }
    
    const cityOptions = document.getElementById('cityOptions');
    if (!cityOptions) return;
    
    hideAllOptions();
    
    if (!cityOptions.classList.contains('show')) {
        populateCities();
        cityOptions.classList.add('show');
    }
}

// POPULATE CITIES
function populateCities() {
    if (!currentBankData || !selectedProvince) return;
    
    const citiesSet = new Set();
    currentBankData.forEach(branch => {
        if (branch.state === selectedProvince && branch.city) {
            citiesSet.add(branch.city);
        }
    });
    
    const cities = Array.from(citiesSet).sort();
    const cityContent = document.getElementById('cityOptionsContent');
    
    if (cityContent) {
        cityContent.innerHTML = cities.map(city => 
            `<label class="option-label">
                <input type="radio" name="city-choice" value="${city}" onchange="selectCity('${city}')">
                ${city.toUpperCase()}
            </label>`
        ).join('');
    }
    
    console.log('🏙️ Populated cities:', cities);
}

// SELECT CITY
function selectCity(city) {
    console.log('🏙️ City selected:', city);
    
    selectedCity = city;
    
    // Update UI
    const cityText = document.getElementById('cityText');
    const cityBtn = document.getElementById('cityBtn');
    const generateBtn = document.getElementById('generateBtn');
    
    if (cityText) cityText.textContent = city.toUpperCase();
    if (cityBtn) {
        cityBtn.classList.remove('disabled');
        cityBtn.classList.add('selected');
    }
    if (generateBtn) {
        generateBtn.classList.remove('disabled');
    }
    
    hideAllOptions();
}

// GENERATE BANK INFO
function generateBankInfo() {
    console.log('🎯 generateBankInfo() called');
    
    if (!selectedBank || !selectedProvince || !selectedCity) {
        console.log('⚠️ Missing selection data');
        return;
    }
    
    // Find matching branches
    const matchingBranches = currentBankData.filter(branch => 
        branch.state === selectedProvince && branch.city === selectedCity
    );
    
    if (matchingBranches.length === 0) {
        console.error('❌ No branches found for selection');
        return;
    }
    
    // Pick random branch
    const branch = matchingBranches[Math.floor(Math.random() * matchingBranches.length)];
    
    displayBankInfo(branch);
    saveToHistory(selectedBank, selectedCity, selectedProvince, branch);
}

// DISPLAY BANK INFO
function displayBankInfo(branch) {
    console.log('🏦 Displaying bank info for:', branch);
    
    // Generate account details
    const generatedAccount = Math.floor(1000000 + Math.random() * 9000000).toString();
    const generatedTransit = Math.floor(10000 + Math.random() * 90000).toString();
    const generatedInstitution = getInstitutionNumber(selectedBank);
    
    // Store for history
    currentGeneratedData = {
        account: generatedAccount,
        transit: generatedTransit,
        institution: generatedInstitution
    };
    
    // Update display
    const display = document.getElementById('bankInfoDisplay');
    if (display) {
        document.getElementById('displayBankName').textContent = getBankFullName(selectedBank);
        document.getElementById('displayAccountNumber').textContent = generatedAccount;
        document.getElementById('displayTransitNumber').textContent = generatedTransit;
        document.getElementById('displayInstitutionNumber').textContent = generatedInstitution;
        document.getElementById('displayBranchName').textContent = branch.branch || 'Main Branch';
        document.getElementById('displayBankAddress').textContent = branch.address || 'Address not available';
        document.getElementById('displayBankLocation').textContent = `${branch.city}, ${branch.state}`;
        
        display.style.display = 'block';
    }
}

// GET BANK FULL NAME
function getBankFullName(bank) {
    const names = {
        'TD': 'TD Canada Trust',
        'RBC': 'Royal Bank of Canada',
        'BMO': 'Bank of Montreal',
        'SCOTIA': 'Scotiabank',
        'CIBC': 'Canadian Imperial Bank of Commerce'
    };
    return names[bank] || bank;
}

// GET INSTITUTION NUMBER
function getInstitutionNumber(bank) {
    const numbers = {
        'TD': '004',
        'RBC': '003',
        'BMO': '001',
        'SCOTIA': '002',
        'CIBC': '010'
    };
    return numbers[bank] || '000';
}

// SAVE TO HISTORY
function saveToHistory(bank, city, province, branch) {
    const now = new Date();
    const historyEntry = {
        bank: bank,
        city: city,
        province: provinceNames[province] || province,
        branch: branch.branch || 'Main Branch',
        account: currentGeneratedData.account,
        transit: currentGeneratedData.transit,
        institution: currentGeneratedData.institution,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        timestamp: now.getTime()
    };
    
    bankInfoHistory.unshift(historyEntry);
    
    if (bankInfoHistory.length > 50) {
        bankInfoHistory = bankInfoHistory.slice(0, 50);
    }
    
    localStorage.setItem('bankInfoHistory', JSON.stringify(bankInfoHistory));
    console.log('💾 Saved to history');
}

// TOGGLE HISTORY
function toggleHistory() {
    const historyModal = document.getElementById('historyModal');
    if (!historyModal) return;
    
    const isVisible = historyModal.style.display === 'block';
    
    if (isVisible) {
        historyModal.style.display = 'none';
    } else {
        loadHistory();
        historyModal.style.display = 'block';
    }
}

// LOAD HISTORY
function loadHistory() {
    const tableBody = document.getElementById('historyTableBody');
    const noHistoryMsg = document.getElementById('noHistory');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (bankInfoHistory.length === 0) {
        if (noHistoryMsg) noHistoryMsg.style.display = 'block';
    } else {
        if (noHistoryMsg) noHistoryMsg.style.display = 'none';
        
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
}

console.log('✅ Bank Info Script Fully Loaded');
