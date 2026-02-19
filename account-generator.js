// Account Generator Main Logic

let selectedAdvanceOptions = [];
let accountHistory = JSON.parse(localStorage.getItem('accountHistory') || '[]');

document.addEventListener('DOMContentLoaded', function() {
    updateHistoryDisplay();
    updateGenerateButtonState();
    
    // Test data loading after page loads
    setTimeout(() => {
        console.log('Testing data loading...');
        const testData = getRandomBranchData([]);
        if (testData) {
            console.log('✅ Data loading successful!');
        } else {
            console.log('❌ Data loading failed!');
        }
    }, 100);
});

function toggleAdvance() {
    const options = document.getElementById('advanceOptions');
    const arrow = document.getElementById('advanceArrow');
    
    if (options.classList.contains('show')) {
        options.classList.remove('show');
        arrow.innerHTML = '▶';
        arrow.classList.remove('rotated');
        
        // Clear selections
        selectedAdvanceOptions = [];
        document.querySelectorAll('#advanceOptions input[type="checkbox"]').forEach(cb => cb.checked = false);
    } else {
        options.classList.add('show');
        arrow.innerHTML = '▼';
        arrow.classList.add('rotated');
    }
    
    updateGenerateButtonState();
}

function updateAdvanceSelection() {
    selectedAdvanceOptions = [];
    document.querySelectorAll('#advanceOptions input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            selectedAdvanceOptions.push(checkbox.value);
        }
    });
    updateGenerateButtonState();
}

function updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    const advanceOptions = document.getElementById('advanceOptions');
    const isAdvanceOpen = advanceOptions.classList.contains('show');
    
    if (isAdvanceOpen && selectedAdvanceOptions.length === 0) {
        generateBtn.disabled = true;
        generateBtn.classList.add('disabled');
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
    }
}

function generateAccount() {
    const isAdvanceMode = document.getElementById('advanceOptions').classList.contains('show');
    const banksToUse = isAdvanceMode ? selectedAdvanceOptions : [];
    
    console.log('Generating account for banks:', banksToUse);
    
    const accountData = generateCompleteAccount(banksToUse);
    
    if (!accountData) {
        alert('Error generating account. Please check the console for details.');
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
    updateHistoryDisplay();
}

function showBankDetails(accountData) {
    const bankDetails = document.getElementById('bankDetails');
    document.getElementById('bankName').textContent = getBankDisplayName(accountData.bank);
    document.getElementById('branchName').textContent = accountData.branchData.branch || 'Main Branch';
    document.getElementById('bankAddress').textContent = accountData.branchData.address || '';
    
    let location = '';
    if (accountData.branchData.city) location += accountData.branchData.city;
    if (accountData.branchData.state) location += (location ? ', ' : '') + accountData.branchData.state;
    document.getElementById('bankLocation').textContent = location;
    
    bankDetails.style.display = 'block';
}

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
    if (accountHistory.length > 100) {
        accountHistory = accountHistory.slice(0, 100);
    }
    localStorage.setItem('accountHistory', JSON.stringify(accountHistory));
}

function toggleHistory() {
    const modal = document.getElementById('historyModal');
    modal.classList.toggle('show');
    if (modal.classList.contains('show')) {
        updateHistoryDisplay();
    }
}

function updateHistoryDisplay() {
    const tbody = document.getElementById('historyTableBody');
    
    if (accountHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No accounts generated yet.</td></tr>';
        return;
    }
    
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

document.addEventListener('click', function(event) {
    const modal = document.getElementById('historyModal');
    if (event.target === modal) {
        toggleHistory();
    }
});
