// SIMPLE TEST VERSION - Account Generator

let selectedAdvanceOptions = [];
let accountHistory = [];

// Test if page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Account Generator page loaded');
    console.log('✅ DOM ready');
    
    // Test basic generation with hardcoded data
    window.testGenerate = function() {
        console.log('🧪 Testing basic generation...');
        
        // Generate test data
        const testData = {
            transit: '12345',
            institution: '003',
            account: '1234567890',
            bank: 'RBC'
        };
        
        // Display in fields
        document.getElementById('transitResult').value = testData.transit;
        document.getElementById('institutionResult').value = testData.institution;
        document.getElementById('accountResult').value = testData.account;
        
        console.log('✅ Test data displayed');
    };
});

function generateAccount() {
    console.log('🎯 Generate button clicked!');
    
    // Simple hardcoded generation for testing
    const transit = Math.floor(Math.random() * 90000 + 10000).toString();
    const institution = '003';
    const account = Math.floor(Math.random() * 9000000000 + 1000000000).toString();
    
    document.getElementById('transitResult').value = transit;
    document.getElementById('institutionResult').value = institution;
    document.getElementById('accountResult').value = account;
    
    console.log('✅ Generated:', { transit, institution, account });
    
    // Show test bank info
    showTestBankInfo();
}

function showTestBankInfo() {
    const bankDetails = document.getElementById('bankDetails');
    document.getElementById('bankName').textContent = 'TEST BANK';
    document.getElementById('branchName').textContent = 'Test Branch';
    document.getElementById('bankAddress').textContent = '123 Test Street';
    document.getElementById('bankLocation').textContent = 'Test City, ON';
    
    bankDetails.style.display = 'block';
    console.log('✅ Bank details shown');
}

function toggleAdvance() {
    console.log('🔧 Advance button clicked');
    const options = document.getElementById('advanceOptions');
    const arrow = document.getElementById('advanceArrow');
    
    if (options.classList.contains('show')) {
        options.classList.remove('show');
        arrow.innerHTML = '▶';
        selectedAdvanceOptions = [];
    } else {
        options.classList.add('show');
        arrow.innerHTML = '▼';
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
    console.log('Selected banks:', selectedAdvanceOptions);
    updateGenerateButtonState();
}

function updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    const advanceOptions = document.getElementById('advanceOptions');
    const isAdvanceOpen = advanceOptions.classList.contains('show');
    
    if (isAdvanceOpen && selectedAdvanceOptions.length === 0) {
        generateBtn.disabled = true;
        generateBtn.classList.add('disabled');
        console.log('🚫 Generate button disabled');
    } else {
        generateBtn.disabled = false;
        generateBtn.classList.remove('disabled');
        console.log('✅ Generate button enabled');
    }
}

function toggleHistory() {
    console.log('📜 History button clicked');
    const modal = document.getElementById('historyModal');
    modal.classList.toggle('show');
}
