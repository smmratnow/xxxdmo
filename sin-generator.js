// SIN Generator & Verify using Professional SIN Library

// Global variables
let isAdvanceMode = false;
let selectedProvinces = [];
let generationHistory = JSON.parse(localStorage.getItem('sinHistory')) || [];

// Province display names
const provinceNames = {
    "AB": "Alberta",
    "BC": "British Columbia", 
    "MB": "Manitoba",
    "NB": "New Brunswick",
    "NF": "Newfoundland",
    "NS": "Nova Scotia",
    "NT": "Northwest Territories",
    "NU": "Nunavut",
    "ON": "Ontario",
    "PE": "Prince Edward Island",
    "QC": "Quebec",
    "SK": "Saskatchewan",
    "YT": "Yukon"
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateHistoryDisplay();
});

// Toggle advance options
function toggleAdvance() {
    const advanceOptions = document.getElementById('advanceOptions');
    const advanceArrow = document.getElementById('advanceArrow');
    const generateBtn = document.getElementById('generateBtn');
    
    isAdvanceMode = !isAdvanceMode;
    
    if (isAdvanceMode) {
        advanceOptions.classList.add('show');
        advanceArrow.classList.add('down');
        generateBtn.disabled = true;
        generateBtn.style.opacity = '0.5';
    } else {
        advanceOptions.classList.remove('show');
        advanceArrow.classList.remove('down');
        generateBtn.disabled = false;
        generateBtn.style.opacity = '1';
        // Clear all checkboxes
        const checkboxes = advanceOptions.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        selectedProvinces = [];
    }
}

// Update advance selection
function updateAdvanceSelection() {
    const checkboxes = document.querySelectorAll('#advanceOptions input[type="checkbox"]:checked');
    selectedProvinces = Array.from(checkboxes).map(cb => cb.value);
    
    const generateBtn = document.getElementById('generateBtn');
    if (isAdvanceMode) {
        generateBtn.disabled = selectedProvinces.length === 0;
        generateBtn.style.opacity = selectedProvinces.length === 0 ? '0.5' : '1';
    }
}

// Generate SIN using your library
function generateSIN() {
    let sin;
    let sinProvince = "Random";
    
    if (isAdvanceMode && selectedProvinces.length > 0) {
        // Generate based on selected provinces
        if (selectedProvinces.includes('temp')) {
            // Generate temporary resident SIN (starts with 9)
            const options = { startsWith: 9 };
            sin = SocialInsuranceNumber.generate(options);
            sinProvince = "Temporary Residence";
        } else {
            // Generate for specific province
            const randomProvince = selectedProvinces[Math.floor(Math.random() * selectedProvinces.length)];
            const options = { province: randomProvince };
            sin = SocialInsuranceNumber.generate(options);
            sinProvince = provinceNames[randomProvince];
        }
    } else {
        // Generate random SIN
        sin = SocialInsuranceNumber.generate();
        // Determine province from generated SIN
        const sinObj = new SocialInsuranceNumber(sin);
        const provinces = sinObj.provinces();
        if (sinObj.isTemporary()) {
            sinProvince = "Temporary Residence";
        } else if (provinces.length > 0) {
            sinProvince = provinceNames[provinces[0]] || provinces[0];
        }
    }
    
    // Format SIN with dashes
    const formattedSIN = `${sin.slice(0,3)}-${sin.slice(3,6)}-${sin.slice(6,9)}`;
    
    // Display result
    document.getElementById('sinResult').value = formattedSIN;
    
    // Add to history
    addToHistory(formattedSIN, sinProvince);
}

// Format SIN input in verify page
function formatSINInput(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.slice(0,3) + '-' + value.slice(3,6) + '-' + value.slice(6,9);
    } else if (value.length >= 3) {
        value = value.slice(0,3) + '-' + value.slice(3,6);
    }
    
    input.value = value;
}

// Verify SIN using your library
function verifySIN() {
    const sinInput = document.getElementById('sinInput').value;
    const resultDiv = document.getElementById('verificationResult');
    
    if (!sinInput.trim()) {
        showVerificationResult(false, 'Please enter a SIN number');
        return;
    }
    
    // Remove formatting and validate
    const cleanSIN = sinInput.replace(/\D/g, '');
    
    if (cleanSIN.length !== 9) {
        showVerificationResult(false, 'SIN must be exactly 9 digits');
        return;
    }
    
    // Use your SIN library for verification
    const sinObj = new SocialInsuranceNumber(cleanSIN);
    const isValid = sinObj.isValid();
    
    if (isValid) {
        const provinces = sinObj.provinces();
        const isTemp = sinObj.isTemporary();
        const isBusiness = sinObj.isBusinessNumber();
        
        let categoryText = "Regular SIN";
        let provinceText = "Unknown";
        
        if (isTemp) {
            categoryText = "Temporary Resident SIN";
            provinceText = "Temporary Residence";
        } else if (isBusiness) {
            categoryText = "Business Number";
            provinceText = "Business Registration";
        } else if (provinces.length > 0) {
            provinceText = provinces.map(p => provinceNames[p] || p).join(", ");
        }
        
        const message = `This SIN is classified as: ${categoryText}. Region: ${provinceText}`;
        showVerificationResult(true, message);
    } else {
        showVerificationResult(false, `This SIN number is not valid according to the Luhn algorithm.`);
    }
}

// Show verification result
function showVerificationResult(isValid, message) {
    const resultDiv = document.getElementById('verificationResult');
    
    if (isValid) {
        resultDiv.innerHTML = `
            <div class="result-valid">
                <div class="check-icon">✓</div>
                <div class="result-text">
                    <h3>Valid SIN Number</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="result-invalid">
                <div class="cross-icon">✕</div>
                <div class="result-text">
                    <h3>Invalid SIN Number</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
}

// Add to generation history
function addToHistory(sin, province) {
    const now = new Date();
    const entry = {
        sin: sin,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: province,
        timestamp: now.getTime()
    };
    
    generationHistory.unshift(entry); // Add to beginning
    
    // Keep only last 50 entries
    if (generationHistory.length > 50) {
        generationHistory = generationHistory.slice(0, 50);
    }
    
    localStorage.setItem('sinHistory', JSON.stringify(generationHistory));
    updateHistoryDisplay();
}

// Toggle history modal
function toggleHistory() {
    const historyModal = document.getElementById('historyModal');
    if (historyModal) {
        historyModal.classList.toggle('show');
    }
}

// Update history display
function updateHistoryDisplay() {
    const historyTableBody = document.getElementById('historyTableBody');
    if (!historyTableBody) return;
    
    if (generationHistory.length === 0) {
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-history">No generation history available</td>
            </tr>
        `;
        return;
    }
    
    historyTableBody.innerHTML = generationHistory
        .map(entry => `
            <tr>
                <td>${entry.sin}</td>
                <td>${entry.date}</td>
                <td>${entry.time}</td>
                <td>${entry.type}</td>
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
