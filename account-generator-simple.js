// SUPER SIMPLE VERSION - TD ONLY

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Simple version loaded');
    
    // Wait 2 seconds for data, then test
    setTimeout(() => {
        testTDData();
    }, 2000);
});

function testTDData() {
    console.log('🔍 Testing TD data...');
    
    if (typeof tdBankData === 'undefined') {
        console.error('❌ tdBankData not found');
        return;
    }
    
    console.log('✅ tdBankData exists');
    console.log('📋 Keys:', Object.keys(tdBankData));
    
    // Find the data array
    const keys = Object.keys(tdBankData);
    for (const key of keys) {
        const value = tdBankData[key];
        if (Array.isArray(value) && value.length > 0) {
            console.log(`✅ Found array: ${key} with ${value.length} items`);
            console.log('📝 Sample branch:', value[0]);
            break;
        }
    }
}

function generateAccount() {
    console.log('🎯 SIMPLE Generate clicked');
    
    try {
        // Just get TD data
        if (!window.tdBankData) {
            alert('❌ TD data not loaded');
            return;
        }
        
        // Get the array (we know it's tdBank)
        const branches = tdBankData.tdBank;
        if (!branches || !Array.isArray(branches)) {
            alert('❌ TD branches not found');
            return;
        }
        
        // Pick random branch
        const randomBranch = branches[Math.floor(Math.random() * branches.length)];
        console.log('🏢 Selected:', randomBranch.branch);
        
        // Generate simple numbers
        const transit = '12345';
        const institution = '004';
        const account = '1234567890';
        
        // Display
        document.getElementById('transitResult').value = transit;
        document.getElementById('institutionResult').value = institution;
        document.getElementById('accountResult').value = account;
        
        console.log('✅ SIMPLE generation complete');
        alert('✅ Simple generation worked!');
        
    } catch (error) {
        console.error('❌ Simple error:', error);
        alert('❌ Error: ' + error.message);
    }
}

// Dummy functions for HTML
function updateBankSelection() { console.log('updateBankSelection called'); }
function toggleAdvance() { console.log('toggleAdvance called'); }
function updateAdvanceSelection() { console.log('updateAdvanceSelection called'); }
function updateGenerateButtonState() { console.log('updateGenerateButtonState called'); }
function toggleHistory() { console.log('toggleHistory called'); }
function loadHistory() { console.log('loadHistory called'); }
function closeHistory() { console.log('closeHistory called'); }

console.log('🚀 Simple script loaded');
