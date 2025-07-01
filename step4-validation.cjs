const fs = require('fs');
const path = require('path');

console.log('🚀 STEP 4: UI Design Inconsistencies Fix - VALIDATION TEST');
console.log('================================================================');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Test 1: Double Navbar Issues
console.log('\n1️⃣  Testing Double Navbar Fixes...');
console.log('----------------------------------');

const pages = [
  'client/src/pages/Settings.tsx',
  'client/src/pages/Screening.tsx', 
  'client/src/pages/Backtesting.tsx',
  'client/src/pages/RiskManagement.tsx',
  'client/src/pages/Community.tsx'
];

let navbarTestsPassed = 0;
pages.forEach(pagePath => {
  const content = readFile(pagePath);
  const fileName = path.basename(pagePath);
  
  if (!content) {
    console.log(`❌ ${fileName}: File not found`);
    return;
  }
  
  const hasHeaderImport = content.includes('import { Header }') || content.includes('from "@/components/Layout/Header"');
  const hasHeaderUsage = content.includes('<Header');
  const hasInlineTitle = content.includes('<h1 className="text-3xl font-bold');
  
  if (!hasHeaderImport && !hasHeaderUsage && hasInlineTitle) {
    console.log(`✅ ${fileName}: Double navbar fixed`);
    navbarTestsPassed++;
  } else {
    console.log(`❌ ${fileName}: Issues found`);
    if (hasHeaderImport) console.log(`   - Header import found`);
    if (hasHeaderUsage) console.log(`   - Header usage found`);
    if (!hasInlineTitle) console.log(`   - Missing inline title`);
  }
});

console.log(`Result: ${navbarTestsPassed}/${pages.length} pages fixed`);

// Test 2: Professional Components
console.log('\n2️⃣  Testing Professional Component Design...');
console.log('--------------------------------------------');

const appContent = readFile('client/src/App.tsx');
if (!appContent) {
  console.log('❌ App.tsx not found');
} else {
  const components = ['ThresholdConfig', 'Compliance', 'MarketData', 'SentimentAnalysis', 'CorrelationMatrix', 'Notifications', 'AuditLogs', 'PricingBilling'];
  let componentTestsPassed = 0;
  
  // Check for required imports
  const hasShadcnImports = appContent.includes('from "@/components/ui/card"') && 
                          appContent.includes('from "@/components/ui/button"');
  
  if (hasShadcnImports) {
    console.log('✅ Shadcn/UI imports found');
  } else {
    console.log('❌ Missing Shadcn/UI imports');
  }
  
  components.forEach(componentName => {
    const componentRegex = new RegExp(`const ${componentName} = \\(\\) => \\(`, 'g');
    const hasComponent = componentRegex.test(appContent);
    
    if (hasComponent) {
      const componentStart = appContent.indexOf(`const ${componentName}`);
      const componentEnd = appContent.indexOf(');', componentStart) + 2;
      const componentCode = appContent.substring(componentStart, componentEnd);
      
      const hasCard = componentCode.includes('<Card');
      const hasCardHeader = componentCode.includes('<CardHeader>');
      const hasIcons = componentCode.includes('text-primary');
      const hasSpacing = componentCode.includes('space-y-6') || componentCode.includes('space-y-4');
      
      if (hasCard && hasCardHeader && hasIcons && hasSpacing) {
        console.log(`✅ ${componentName}: Professional design`);
        componentTestsPassed++;
      } else {
        console.log(`❌ ${componentName}: Missing professional elements`);
        if (!hasCard) console.log(`   - Missing Card component`);
        if (!hasCardHeader) console.log(`   - Missing CardHeader`);
        if (!hasIcons) console.log(`   - Missing icon styling`);
        if (!hasSpacing) console.log(`   - Missing proper spacing`);
      }
    } else {
      console.log(`❌ ${componentName}: Component not found`);
    }
  });
  
  console.log(`Result: ${componentTestsPassed}/${components.length} components professional`);
}

// Test 3: Profile Page Conversion
console.log('\n3️⃣  Testing Profile Page Conversion...');
console.log('------------------------------------');

const profileContent = readFile('client/src/components/profile/ProfilePage.jsx');
if (!profileContent) {
  console.log('❌ ProfilePage.jsx not found');
} else {
  let profileTestsPassed = 0;
  const totalProfileTests = 6;
  
  // Test CSS import removal
  if (!profileContent.includes("import './ProfileSection.css'")) {
    console.log('✅ CSS import removed');
    profileTestsPassed++;
  } else {
    console.log('❌ CSS import still present');
  }
  
  // Test Shadcn/UI imports
  if (profileContent.includes('from "@/components/ui/card"') && 
      profileContent.includes('from "@/components/ui/tabs"')) {
    console.log('✅ Shadcn/UI imports present');
    profileTestsPassed++;
  } else {
    console.log('❌ Missing Shadcn/UI imports');
  }
  
  // Test Toast hook
  if (profileContent.includes('from "@/hooks/use-toast"') && 
      profileContent.includes('const { toast } = useToast()')) {
    console.log('✅ Toast hook implemented');
    profileTestsPassed++;
  } else {
    console.log('❌ Toast hook missing');
  }
  
  // Test Card usage
  if (profileContent.includes('<Card') && profileContent.includes('<CardContent>')) {
    console.log('✅ Card components used');
    profileTestsPassed++;
  } else {
    console.log('❌ Card components missing');
  }
  
  // Test Tabs implementation
  if (profileContent.includes('<Tabs') && profileContent.includes('<TabsContent')) {
    console.log('✅ Tabs implemented');
    profileTestsPassed++;
  } else {
    console.log('❌ Tabs missing');
  }
  
  // Test Avatar component
  if (profileContent.includes('<Avatar') && profileContent.includes('<AvatarImage')) {
    console.log('✅ Avatar component used');
    profileTestsPassed++;
  } else {
    console.log('❌ Avatar component missing');
  }
  
  console.log(`Result: ${profileTestsPassed}/${totalProfileTests} profile tests passed`);
}

// Test 4: File Structure
console.log('\n4️⃣  Testing File Structure...');
console.log('----------------------------');

const criticalFiles = [
  'client/src/App.tsx',
  'client/src/pages/Settings.tsx',
  'client/src/components/profile/ProfilePage.jsx'
];

let fileTestsPassed = 0;
criticalFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${path.basename(filePath)}: Exists`);
    fileTestsPassed++;
  } else {
    console.log(`❌ ${path.basename(filePath)}: Missing`);
  }
});

console.log(`Result: ${fileTestsPassed}/${criticalFiles.length} critical files present`);

// Final Summary
console.log('\n================================================================');
console.log('📊 STEP 4 VALIDATION SUMMARY');
console.log('================================================================');

const totalTests = pages.length + 8 + 6 + criticalFiles.length;
const totalPassed = navbarTestsPassed + (appContent ? componentTestsPassed || 0 : 0) + 
                   (profileContent ? profileTestsPassed || 0 : 0) + fileTestsPassed;

console.log(`\n📈 Overall Score: ${totalPassed} tests passed out of ${totalTests} total tests`);
console.log(`📋 Test Categories:`);
console.log(`   🔍 Double Navbar Fixes: ${navbarTestsPassed}/${pages.length}`);
console.log(`   🎨 Professional Components: ${appContent ? componentTestsPassed || 0 : 0}/8`);
console.log(`   👤 Profile Page Conversion: ${profileContent ? profileTestsPassed || 0 : 0}/6`);
console.log(`   📁 File Structure: ${fileTestsPassed}/${criticalFiles.length}`);

const successRate = Math.round((totalPassed / totalTests) * 100);
console.log(`\n🎯 Success Rate: ${successRate}%`);

if (successRate >= 90) {
  console.log('\n🎉 STEP 4: EXCELLENT COMPLETION!');
  console.log('✅ UI Design Inconsistencies Fix successfully implemented');
  console.log('✅ Ready for Step 5');
} else if (successRate >= 75) {
  console.log('\n✅ STEP 4: GOOD COMPLETION!');
  console.log('✅ Most UI issues fixed');
  console.log('⚠️  Minor improvements may be needed');
} else {
  console.log('\n⚠️  STEP 4: NEEDS IMPROVEMENT');
  console.log('❌ Several issues remain');
  console.log('🔧 Additional work required');
}

console.log('\n================================================================'); 