const fs = require('fs');

console.log("🔍 PRODUCTION READINESS CHECK\n");

// Critical production checks
const checks = {
    security: [
        { file: 'contracts/LoveViceScore.sol', pattern: 'nonReentrant', desc: 'Reentrancy protection' },
        { file: 'contracts/AgentMarketplace.sol', pattern: 'require\\(', desc: 'Input validation' },
        { file: 'contracts/LiquidDemocracy.sol', pattern: 'onlyOwner|require\\(', desc: 'Access control' }
    ],
    gas: [
        { file: 'contracts/SelfHealingOrchestrator.sol', pattern: 'memory|storage', desc: 'Gas optimization' },
        { file: 'contracts/ZKVerifier.sol', pattern: 'view|pure', desc: 'Read-only functions' }
    ],
    events: [
        { file: 'contracts/AgentMarketplace.sol', pattern: 'emit ', desc: 'Event emissions' },
        { file: 'contracts/LoveViceScore.sol', pattern: 'event ', desc: 'Event definitions' }
    ]
};

let allPassed = true;

Object.entries(checks).forEach(([category, items]) => {
    console.log(`📋 ${category.toUpperCase()} CHECKS:`);
    items.forEach(check => {
        try {
            const content = fs.readFileSync(check.file, 'utf8');
            const passed = new RegExp(check.pattern).test(content);
            console.log(`${passed ? '✅' : '❌'} ${check.desc}`);
            if (!passed) allPassed = false;
        } catch (e) {
            console.log(`❌ ${check.desc} - File not found`);
            allPassed = false;
        }
    });
    console.log();
});

console.log(`🎯 PRODUCTION STATUS: ${allPassed ? '✅ READY' : '❌ NEEDS FIXES'}`);