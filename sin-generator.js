// SIN Generator & Verify JavaScript

// Global variables
let isAdvanceMode = false;
let selectedOptions = [];
let generationHistory = JSON.parse(localStorage.getItem('sinHistory')) || [];

// Province ranges for SIN generation
const provinceRanges = {
    temp: { ranges: [[900, 999]], name: "Temporary Residence" },
    atlantic: { ranges: [[100, 199]], name: "Atlantic Provinces" },
    ontario: { ranges: [[400, 499]], name: "Ontario" },
    quebec: { ranges: [[200, 299]], name: "Quebec" },
    bc: { ranges: [[700, 799]], name: "British Columbia / Yukon" },
    prairie: { ranges: [[500, 699]], name: "Alberta / Manitoba / Saskatchewan / NT / NU" }
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
        selectedOptions = [];
    }
}

// Update advance selection
function updateAdvanceSelection() {
    const checkboxes = document.querySelectorAll('#advanceOptions input[type="checkbox"]:checked');
    selectedOptions = Array.from(checkboxes).map(cb => cb.value);
    
    const generateBtn = document.getElementById('generateBtn');
    if (isAdvanceMode) {
        generateBtn.disabled = selectedOptions.length === 0;
        generateBtn.style.opacity = selectedOptions.length === 0 ? '0.5' : '1';
    }
}

// Generate SIN number
function generateSIN() {
    let sinNumber;
    let sinType = "Random";
    
    if (isAdvanceMode && selectedOptions.length > 0) {
        // Generate based on selected province/territory
        const randomOption = selectedOptions[Math.floor(Math.random() * selectedOptions.length)];
        const provinceData = provinceRanges[randomOption];
        const randomRange = provinceData.ranges[Math.floor(Math.random() * provinceData.ranges.length)];
        const firstThree = Math.floor(Math.random() * (randomRange[1] - randomRange[0] + 1)) + randomRange[0];
        
        sinNumber = generateValidSIN(firstThree.toString().padStart(3, '0'));
        sinType = provinceData.name;
    } else {
        // Generate random SIN
        let firstThree;
        do {
            firstThree = Math.floor(Math.random() * 900) + 100; // 100-999
        } while (firstThree.toString().startsWith('000') || firstThree.toString().startsWith('666') || firstThree.toString().startsWith('900'));
        
        sinNumber = generateValidSIN(firstThree.toString());
    }
    
    // Display result
    const resultField = document.getElementById('sinResult');
    resultField.value = formatSIN(sinNumber);
    
    // Add to history
    addToHistory(sinNumber, sinType);
}

// Generate valid SIN using Luhn algorithm
function generateValidSIN(firstThree) {
    let sin = firstThree;
    
    // Generate next 5 random digits
    for (let i = 0; i < 5; i++) {
        sin += Math.floor(Math.random() * 10);
    }
    
    // Calculate check digit using Luhn algorithm
    let sum = 0;
    for (let i = 0; i < 8; i++) {
        let digit = parseInt(sin[i]);
        if (i % 2 === 1) { // Even position (0-indexed), so multiply by 2
            digit *= 2;
            if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
        }
        sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return sin + checkDigit.toString();
}

// Verify SIN number
function verifySIN() {
    const sinInput = document.getElementById('sinInput').value.replace(/\D/g, '');
    const resultDiv = document.getElementById('verificationResult');
    
    if (sinInput.length !== 9) {
        showVerificationResult(false, 'Invalid SIN length. SIN must be 9 digits.');
        return;
    }
    
    // Validate using Luhn algorithm
    let sum = 0;
    for (let i = 0; i < 8; i++) {
        let digit = parseInt(sinInput[i]);
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
        }
        sum += digit;
    }
    
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    const actualCheckDigit = parseInt(sinInput[8]);
    
    if (calculatedCheckDigit === actualCheckDigit) {
        const sinType = getSINType(sinInput);
        showVerificationResult(true, `This SIN number ${formatSIN(sinInput)} is valid. It is classified as a ${sinType} SIN.`);
    } else {
        showVerificationResult(false, `This SIN number ${formatSIN(sinInput)} is not valid.`);
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

// Get SIN type based on first three digits
function getSINType(sin) {
    const firstThree = parseInt(sin.substring(0, 3));
    
    if (firstThree >= 900 && firstThree <= 999) return "Temporary Residence";
    if (firstThree >= 100 && firstThree <= 199) return "Atlantic Provinces";
    if (firstThree >= 200 && firstThree <= 299) return "Quebec";
    if (firstThree >= 400 && firstThree <= 499) return "Ontario";
    if (firstThree >= 500 && firstThree <= 699) return "Alberta / Manitoba / Saskatchewan / NT / NU";
    if (firstThree >= 700 && firstThree <= 799) return "British Columbia / Yukon";
    
    return "Unknown Region";
}

// Format SIN number with dashes
function formatSIN(sin) {
    const cleanSIN = sin.replace(/\D/g, '');
    if (cleanSIN.length === 9) {
        return `${cleanSIN.substring(0, 3)}-${cleanSIN.substring(3, 6)}-${cleanSIN.substring(6, 9)}`;
    }
    return cleanSIN;
}

// Format SIN input as user types
function formatSINInput(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 3) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    }
    if (value.length >= 7) {
        value = value.substring(0, 7) + '-' + value.substring(7, 10);
    }
    input.value = value;
}

// Add to history
function addToHistory(sin, type) {
    const now = new Date();
    const entry = {
        sin: formatSIN(sin),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        type: type,
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
