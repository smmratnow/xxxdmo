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
    "YT": "Yukon",
    "temp": "Temporary Residence"
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
function generateSINNumber() {
    let sin;
    let sinProvince = "Random";
    
    if (isAdvanceMode && selectedProvinces.length > 0) {
        // Generate based on selected provinces
        if (selectedProvinces.includes('temp')) {
            // Generate temporary resident SIN (starts with 9)
            const options = {
                startsWith: 9
            };
            sin = SocialInsuranceNumber.generate(options);
            sinProvince = "Temporary Residence";
        } else {
            // Generate for specific province
            const randomProvince = selectedProvinces[Math.floor(Math.random() * selectedProvinces.length)];
            const options = {
                province: randomProvince
            };
            sin = SocialInsuranceNumber.generate(options);
            sinProvince = provinceNames[randomProvince];
        }
    } else {
        // Generate random SIN
        sin = SocialInsuranceNumber.generate();
        // Determine province from generated SIN
        const sinObj = new SocialInsuranceNumber(sin);
        const provinces = sinObj.provinces();
        sinProvince = provinces.length > 0 ? provinceNames[provinces[0]] : "Unknown";
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
function verifySINNumber() {
    const sinInput = document.getElementById('sinInput').value;
    const resultDiv = document.getElementById('verificationResult');
    
    if (!sinInput.trim()) {
        resultDiv.innerHTML = '<div class="error-result">Please enter a SIN number</div>';
        return;
    }
    
    // Remove formatting and validate
    const cleanSIN = sinInput.replace(/\D/g, '');
    
    if (cleanSIN.length !== 9) {
        resultDiv.innerHTML = '<div class="error-result">SIN must be exactly 9 digits</div>';
        return;
    }
    
    // Use your SIN library for verification
    const sinObj = new SocialInsuranceNumber(cleanSIN);
    const isValid = sinObj.isValid();
    
    if (isValid) {
        const provinces = sinObj.provinces();
        const isTemp = sinObj.isTemporary();
        const isBusiness = sinObj.isBusinessNumber();
        
        let provinceText = "Unknown";
        if (isTemp) {
            provinceText = "Temporary Residence";
        } else if (isBusiness) {
            provinceText = "Business Number";
        } else if (provinces.length > 0) {
            provinceText = provinces.map(p => provinceNames[p] || p).join(", ");
        }
        
        resultDiv.innerHTML = `
            <div class="valid-result">
                <h4>✅ Valid SIN</h4>
                <div class="sin-details">
                    <p><strong>SIN:</strong> ${sinInput}</p>
                    <p><strong>Province(s):</strong> ${provinceText}</p>
                    <p><strong>Type:</strong> ${isTemp ? 'Temporary Resident' : isBusiness ? 'Business Number' : 'Regular'}</p>
                </div>
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="invalid-result">
                <h4>❌ Invalid SIN</h4>
                <p>The SIN number <strong>${sinInput}</strong> is not valid according to the Luhn algorithm.</p>
            </div>
        `;
    }
}

// Add to generation history
function addToHistory(sin, province) {
    const now = new Date();
    const entry = {
        sin: sin,
        province: province,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
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
    const modal = document.getElementById('historyModal');
    modal.classList.toggle('show');
}

// Update history display
function updateHistoryDisplay() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return; // Not on generator page
    
    tbody.innerHTML = '';
    
    if (generationHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-history">No generation history yet</td></tr>';
        return;
    }
    
    generationHistory.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="sin-cell">${entry.sin}</td>
            <td>${entry.province}</td>
            <td>${entry.date}</td>
            <td>${entry.time}</td>
        `;
        tbody.appendChild(row);
    });
}
