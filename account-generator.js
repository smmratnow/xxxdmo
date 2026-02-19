// Account Generator Main Logic

let selectedBanks = [];
let accountHistory = JSON.parse(localStorage.getItem('accountHistory') || '[]');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateHistoryDisplay();
    updateGenerateButtonState();
    
    // Test data loading
    setTimeout(() => {
        const testData = getAllBankData();
        console.log('Data loaded:', Object.keys(testData));
    }, 100);
});

// Toggle advance options
function toggleAdvance() {
    const options = document.getElementById('advanceOptions');
    const arrow = document.getElementById('advanceArrow');
    
    if (options.style.display === 'none' || options.style.display === '') {
        options.style.display = 'block';
        arrow.innerHTML = '▼';
        arrow.classList.add('rotated');
        updateGenerateButtonState();
    } else {
        options.style.display = 'none';
        arrow.innerHTML = '▶';
        arrow.classList.remove('rotated');
        
        // Clear selections when closing
        selectedBanks = [];
        const checkboxes = document.querySelectorAll('#advanceOptions input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = false);
        updateGenerateButtonState();
    }
}

// Update bank selection
function updateBankSelection() {
    const checkboxes = document.querySelectorAll('#advanceOptions input[type="checkbox"]');
    selectedBanks = [];
    
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedBanks.push(checkbox.value);
        }
    });
    
    updateGenerateButtonState();
}

// Update generate button state
function updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    const advanceOptions = document.getElementById('advanceOptions');
    const isAdvanceOpen = advanceOptions.style.display === 'block';
    
    if (isAdvanceOpen) {
        // In advance mode: enable only if banks are selected
        if (selectedBanks.length > 0) {
            generateBtn.disabled = false;
            generateBtn.classList.remove('disabled');
        } else {
            generateBtn.disabled = true;
            generateBtn.classList.add('disabled');
        }
    } else {
        // Normal mode: always enabled
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
    }
}

// Generate account
function generateAccount() {
    const advanceOptions = document.getElementById('advanceOptions');
    const isAdvanceMode = advanceOptions.style.display === 'block';
    
    // Use selected banks in advance mode, or empty array for random
    const banksToUse = isAdvanceMode ? selectedBanks : [];
    
    console.log('Generating account for banks:', banksToUse);
    
    const accountData = generateCompleteAccount(banksToUse);
    
    if (!accountData) {
        alert('Error generating account. Please check console for details.');
        return;
    }
    
    // Display results
    document.getElementById('transitResult').value = accountData.transit;
    document.getElementById('institutionResult').value = accountData.institution;
    document.getElementById('accountResult').value = accountData.account;
    
    // Show bank details
    showBankDetails(accountData);
    
    // Save to history
    saveToHistory(accountData);
    
    // Update history display
    updateHistoryDisplay();
}

// Show bank details
function showBankDetails(accountData) {
    const bankDetails = document.getElementById('bankDetails');
    const bankName = document.getElementById('bankName');
    const branchName = document.getElementById('branchName');
    const bankAddress = document.getElementById('bankAddress');
    const bankLocation = document.getElementById('bankLocation');
    
    // Set bank information
    bankName.textContent = getBankDisplayName(accountData.bank);
    branchName.textContent = accountData.branchData.branch || 'Main Branch';
    bankAddress.textContent = accountData.branchData.address || '';
    
    // Format location
    let location = '';
    if (accountData.branchData.city) {
        location += accountData.branchData.city;
    }
    if (accountData.branchData.state) {
        location += (location ? ', ' : '') + accountData.branchData.state;
    }
    bankLocation.textContent = location;
    
    // Show the details section
    bankDetails.style.display = 'block';
}

// Save to history
function saveToHistory(accountData) {
    const now = new Date();
    const historyEntry = {
        transit: accountData.transit,
        institution: accountData.institution,
        account: accountData.account,
        bank: getBankDisplayName(accountData.bank),
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: now.getTime()
    };
    
    accountHistory.unshift(historyEntry);
    
    // Keep only last 100 entries
    if (accountHistory.length > 100) {
        accountHistory = accountHistory.slice(0, 100);
    }
    
    localStorage.setItem('accountHistory', JSON.stringify(accountHistory));
}

// Toggle history modal
function toggleHistory() {
    const modal = document.getElementById('historyModal');
    modal.classList.toggle('show');
    
    if (modal.classList.contains('show')) {
        updateHistoryDisplay();
    }
}

// Update history display
function updateHistoryDisplay() {
    const tbody = document.getElementById('historyTableBody');
    const noHistory = document.getElementById('noHistory');
    
    if (accountHistory.length === 0) {
        tbody.innerHTML = '';
        if (noHistory) noHistory.style.display = 'block';
        return;
    }
    
    if (noHistory) noHistory.style.display = 'none';
    
    tbody.innerHTML = accountHistory.map(entry => `
        <tr>
            <td>${entry.transit}</td>
            <td>${entry.institution}</td>
            <td>${entry.account}</td>
            <td>${entry.bank}</td>
            <td>${entry.date}</td>
            <td>${entry.time}</td>
        </tr>
    `).join('');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('historyModal');
    if (event.target === modal) {
        toggleHistory();
    }
});
