const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Test 1: Double Navbar Issues Fixed
function testDoubleNavbarFixes() {
  log('\n🔍 Testing Double Navbar Fixes...', 'blue');
  log('='.repeat(50), 'cyan');
  
  const pagesToCheck = [
    'client/src/pages/Settings.tsx',
    'client/src/pages/Screening.tsx', 
    'client/src/pages/Backtesting.tsx',
    'client/src/pages/RiskManagement.tsx',
    'client/src/pages/Community.tsx'
  ];
  
  let passedTests = 0;
  let totalTests = pagesToCheck.length;
  let detailedResults = [];
  
  pagesToCheck.forEach(pagePath => {
    const content = readFileContent(pagePath);
    if (!content) {
      log(`❌ ${path.basename(pagePath)}: File not found`, 'red');
      detailedResults.push({ file: path.basename(pagePath), status: 'FAILED', reason: 'File not found' });
      return;
    }
    
    const fileName = path.basename(pagePath);
    
    // Check for Header component import/usage (should be removed)
    const hasHeaderImport = content.includes('import { Header }') || 
                           content.includes('from "@/components/Layout/Header"') ||
                           content.includes("from '@/components/Layout/Header'");
    
    const hasHeaderUsage = content.includes('<Header') || 
                          content.includes('Header>') ||
                          content.includes('Header ') ||
                          content.includes('Header/');
    
    // Check for proper inline title structure
    const hasInlineTitle = content.includes('<h1 className="text-3xl font-bold') && 
                          (content.includes('text-gray-900 dark:text-white') ||
                           content.includes('text-gray-900'));
    
    // Check for proper page structure
    const hasProperStructure = content.includes('className="p-6"') || 
                              content.includes('className="p-6 space-y-6"');
    
    let issues = [];
    if (hasHeaderImport) issues.push('Header import found');
    if (hasHeaderUsage) issues.push('Header component usage found');
    if (!hasInlineTitle) issues.push('Missing proper inline title');
    if (!hasProperStructure) issues.push('Missing proper page structure');
    
    if (issues.length === 0) {
      log(`✅ ${fileName}: Double navbar fixed`, 'green');
      detailedResults.push({ file: fileName, status: 'PASSED', reason: 'All checks passed' });
      passedTests++;
    } else {
      log(`❌ ${fileName}: Issues found`, 'red');
      issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
      detailedResults.push({ file: fileName, status: 'FAILED', reason: issues.join(', ') });
    }
  });
  
  log(`\n📊 Double Navbar Test Results: ${passedTests}/${totalTests} PASSED`, passedTests === totalTests ? 'green' : 'yellow');
  return { passed: passedTests === totalTests, score: passedTests, total: totalTests, details: detailedResults };
}

// Test 2: Professional Placeholder Components
function testProfessionalComponents() {
  log('\n🎨 Testing Professional Component Design...', 'blue');
  log('='.repeat(50), 'cyan');
  
  const appTsxPath = 'client/src/App.tsx';
  const content = readFileContent(appTsxPath);
  
  if (!content) {
    log('❌ App.tsx file not found', 'red');
    return { passed: false, score: 0, total: 8, details: [] };
  }
  
  const componentsToCheck = [
    'ThresholdConfig',
    'Compliance', 
    'MarketData',
    'SentimentAnalysis',
    'CorrelationMatrix',
    'Notifications',
    'AuditLogs',
    'PricingBilling'
  ];
  
  let passedTests = 0;
  let totalTests = componentsToCheck.length;
  let detailedResults = [];
  
  // Check for Shadcn/UI imports
  const requiredImports = [
    'from "@/components/ui/card"',
    'from "@/components/ui/button"', 
    'from "@/components/ui/badge"',
    'from "lucide-react"'
  ];
  
  const hasAllImports = requiredImports.every(imp => content.includes(imp));
  
  if (!hasAllImports) {
    log('❌ Missing required Shadcn/UI component imports', 'red');
    log('   Required imports: Card, Button, Badge, Lucide Icons', 'yellow');
  } else {
    log('✅ Required Shadcn/UI imports found', 'green');
  }
  
  componentsToCheck.forEach(componentName => {
    // Check if component uses professional Shadcn/UI patterns
    const componentRegex = new RegExp(`const ${componentName} = \\(\\) => \\([\\s\\S]*?\\);`, 'g');
    const componentMatch = content.match(componentRegex);
    
    if (componentMatch) {
      const componentCode = componentMatch[0];
      
      // Check for professional design patterns
      const hasCard = componentCode.includes('<Card') && 
                     (componentCode.includes('trading-card') || componentCode.includes('className="trading-card"'));
      
      const hasCardHeader = componentCode.includes('<CardHeader>') && 
                           componentCode.includes('<CardTitle');
      
      const hasProperStructure = componentCode.includes('className="p-6 space-y-6"') ||
                                componentCode.includes('space-y-6') ||
                                componentCode.includes('space-y-4');
      
      const hasIcons = componentCode.includes('className="text-primary"') ||
                      componentCode.includes('text-primary');
      
      const hasModernStyling = componentCode.includes('text-gray-900 dark:text-white') ||
                              componentCode.includes('text-muted-foreground') ||
                              componentCode.includes('dark:text-white');
      
      let score = 0;
      let maxScore = 5;
      let issues = [];
      
      if (hasCard) score++; else issues.push('Missing Card component');
      if (hasCardHeader) score++; else issues.push('Missing CardHeader structure');
      if (hasProperStructure) score++; else issues.push('Missing proper spacing');
      if (hasIcons) score++; else issues.push('Missing icon styling');
      if (hasModernStyling) score++; else issues.push('Missing modern styling');
      
      if (score >= 4) {
        log(`✅ ${componentName}: Professional design (${score}/${maxScore})`, 'green');
        detailedResults.push({ component: componentName, status: 'PASSED', score: `${score}/${maxScore}` });
        passedTests++;
      } else {
        log(`❌ ${componentName}: Needs improvement (${score}/${maxScore})`, 'red');
        issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
        detailedResults.push({ component: componentName, status: 'FAILED', score: `${score}/${maxScore}`, issues });
      }
    } else {
      log(`❌ ${componentName}: Component not found`, 'red');
      detailedResults.push({ component: componentName, status: 'FAILED', score: '0/5', issues: ['Component not found'] });
    }
  });
  
  log(`\n📊 Professional Component Test Results: ${passedTests}/${totalTests} PASSED`, passedTests === totalTests ? 'green' : 'yellow');
  return { passed: passedTests === totalTests, score: passedTests, total: totalTests, details: detailedResults };
}

// Test 3: Profile Page Shadcn/UI Conversion
function testProfilePageConversion() {
  log('\n👤 Testing Profile Page Conversion...', 'blue');
  log('='.repeat(50), 'cyan');
  
  const profilePath = 'client/src/components/profile/ProfilePage.jsx';
  const content = readFileContent(profilePath);
  
  if (!content) {
    log('❌ ProfilePage.jsx file not found', 'red');
    return { passed: false, score: 0, total: 7, details: [] };
  }
  
  let passedTests = 0;
  let totalTests = 7;
  let detailedResults = [];
  
  // Test 1: CSS import removed
  const noCssImport = !content.includes("import './ProfileSection.css'") && 
                     !content.includes("from './ProfileSection.css'");
  if (noCssImport) {
    log('✅ CSS import removed', 'green');
    detailedResults.push({ test: 'CSS Import Removal', status: 'PASSED' });
    passedTests++;
  } else {
    log('❌ CSS import still present', 'red');
    detailedResults.push({ test: 'CSS Import Removal', status: 'FAILED' });
  }
  
  // Test 2: Shadcn/UI imports present
  const requiredImports = [
    'from "@/components/ui/card"',
    'from "@/components/ui/tabs"',
    'from "@/components/ui/avatar"',
    'from "@/components/ui/button"'
  ];
  
  const hasShadcnImports = requiredImports.every(imp => content.includes(imp));
  if (hasShadcnImports) {
    log('✅ Shadcn/UI imports present', 'green');
    detailedResults.push({ test: 'Shadcn/UI Imports', status: 'PASSED' });
    passedTests++;
  } else {
    log('❌ Missing required Shadcn/UI imports', 'red');
    detailedResults.push({ test: 'Shadcn/UI Imports', status: 'FAILED' });
  }
  
  // Test 3: Toast hook usage
  const usesToastHook = content.includes('from "@/hooks/use-toast"') &&
                       content.includes('const { toast } = useToast()');
  if (usesToastHook) {
    log('✅ Toast hook properly implemented', 'green');
    detailedResults.push({ test: 'Toast Hook', status: 'PASSED' });
    passedTests++;
  } else {
    log('❌ Toast hook not properly implemented', 'red');
    detailedResults.push({ test: 'Toast Hook', status: 'FAILED' });
  }
  
  // Test 4: Card components usage
  const usesCardComponents = content.includes('<Card') &&
                            content.includes('<CardHeader>') &&
                            content.includes('<CardContent>');
  if (usesCardComponents) {
    log('✅ Card components properly used', 'green');
    detailedResults.push({ test: 'Card Components', status: 'PASSED' });
    passedTests++;
  } else {
    log('❌ Card components not properly implemented', 'red');
    detailedResults.push({ test: 'Card Components', status: 'FAILED' });
  }
  
  // Test 5: Tabs implementation
  const usesTabsCorrectly = content.includes('<Tabs value={activeTab}') &&
                           content.includes('<TabsList') &&
                           content.includes('<TabsContent');
  if (usesTabsCorrectly) {
    log('✅ Tabs properly implemented', 'green');
    detailedResults.push({ test: 'Tabs Implementation', status: 'PASSED' });
    passedTests++;
  } else {
    log('❌ Tabs not properly implemented', 'red');
    detailedResults.push({ test: 'Tabs Implementation', status: 'FAILED' });
  }
  
  // Test 6: Avatar component
  const usesAvatar = content.includes('<Avatar') &&
                    content.includes('<AvatarImage') &&
                    content.includes('<AvatarFallback');
  if (usesAvatar) {
    log('✅ Avatar component properly used', 'green');
    detailedResults.push({ test: 'Avatar Component', status: 'PASSED' });
    passedTests++;
  } else {
    log('❌ Avatar component not properly implemented', 'red');
    detailedResults.push({ test: 'Avatar Component', status: 'FAILED' });
  }
  
  // Test 7: CSS classes replaced
  const oldCssClasses = [
    'className="profile-section"',
    'className="main-content-area"',
    'className="notification"',
    'className="edit-button"'
  ];
  
  const noCssClasses = !oldCssClasses.some(cssClass => content.includes(cssClass));
  if (noCssClasses) {
    log('✅ Old CSS classes removed', 'green');
    detailedResults.push({ test: 'CSS Classes Removal', status: 'PASSED' });
    passedTests++;
  } else {
    log('❌ Old CSS classes still present', 'red');
    detailedResults.push({ test: 'CSS Classes Removal', status: 'FAILED' });
  }
  
  log(`\n📊 Profile Page Test Results: ${passedTests}/${totalTests} PASSED`, passedTests === totalTests ? 'green' : 'yellow');
  return { passed: passedTests === totalTests, score: passedTests, total: totalTests, details: detailedResults };
}

// Test 4: UI Consistency Check
function testUIConsistency() {
  log('\n🎯 Testing UI Consistency...', 'blue');
  log('='.repeat(50), 'cyan');
  
  const filesToCheck = [
    { path: 'client/src/App.tsx', name: 'App.tsx' },
    { path: 'client/src/pages/Settings.tsx', name: 'Settings.tsx' },
    { path: 'client/src/components/profile/ProfilePage.jsx', name: 'ProfilePage.jsx' },
    { path: 'client/src/pages/Community.tsx', name: 'Community.tsx' },
    { path: 'client/src/pages/RiskManagement.tsx', name: 'RiskManagement.tsx' }
  ];
  
  let passedTests = 0;
  let totalTests = filesToCheck.length;
  let detailedResults = [];
  
  filesToCheck.forEach(file => {
    const content = readFileContent(file.path);
    if (!content) {
      log(`❌ ${file.name}: File not found`, 'red');
      detailedResults.push({ file: file.name, status: 'FAILED', reason: 'File not found' });
      return;
    }
    
    // Check for consistent styling patterns
    const hasConsistentStyling = content.includes('trading-card') ||
                                content.includes('text-gray-900 dark:text-white') ||
                                content.includes('text-muted-foreground');
    
    const hasProperSpacing = content.includes('space-y-6') || 
                           content.includes('space-y-4') ||
                           content.includes('gap-6');
    
    const hasIconUsage = content.includes('className="text-primary"') || 
                        content.includes('text-primary') ||
                        content.includes('size={20}') ||
                        content.includes('size={16}');
    
    const hasCardStructure = content.includes('<Card') ||
                           content.includes('CardContent') ||
                           content.includes('CardHeader');
    
    let score = 0;
    let maxScore = 4;
    let issues = [];
    
    if (hasConsistentStyling) score++; else issues.push('Missing consistent styling');
    if (hasProperSpacing) score++; else issues.push('Missing proper spacing');
    if (hasIconUsage) score++; else issues.push('Missing icon usage');
    if (hasCardStructure) score++; else issues.push('Missing card structure');
    
    if (score >= 3) {
      log(`✅ ${file.name}: Consistent UI patterns (${score}/${maxScore})`, 'green');
      detailedResults.push({ file: file.name, status: 'PASSED', score: `${score}/${maxScore}` });
      passedTests++;
    } else {
      log(`❌ ${file.name}: Inconsistent UI patterns (${score}/${maxScore})`, 'red');
      issues.forEach(issue => log(`   - ${issue}`, 'yellow'));
      detailedResults.push({ file: file.name, status: 'FAILED', score: `${score}/${maxScore}`, issues });
    }
  });
  
  log(`\n📊 UI Consistency Test Results: ${passedTests}/${totalTests} PASSED`, passedTests === totalTests ? 'green' : 'yellow');
  return { passed: passedTests === totalTests, score: passedTests, total: totalTests, details: detailedResults };
}

// Test 5: File Structure and Dependencies
function testFileStructure() {
  log('\n📁 Testing File Structure and Dependencies...', 'blue');
  log('='.repeat(50), 'cyan');
  
  const criticalFiles = [
    'client/src/App.tsx',
    'client/src/pages/Settings.tsx',
    'client/src/components/profile/ProfilePage.jsx',
    'client/src/components/ui/card.tsx',
    'client/src/components/ui/button.tsx',
    'client/src/hooks/use-toast.ts'
  ];
  
  let passedTests = 0;
  let totalTests = criticalFiles.length;
  let detailedResults = [];
  
  criticalFiles.forEach(filePath => {
    const exists = fs.existsSync(filePath);
    const fileName = path.basename(filePath);
    
    if (exists) {
      log(`✅ ${fileName}: File exists`, 'green');
      detailedResults.push({ file: fileName, status: 'EXISTS' });
      passedTests++;
    } else {
      log(`❌ ${fileName}: File missing`, 'red');
      detailedResults.push({ file: fileName, status: 'MISSING' });
    }
  });
  
  log(`\n📊 File Structure Test Results: ${passedTests}/${totalTests} PASSED`, passedTests === totalTests ? 'green' : 'yellow');
  return { passed: passedTests === totalTests, score: passedTests, total: totalTests, details: detailedResults };
}

// Main validation function
function validateStep4() {
  log('🚀 STEP 4: UI Design Inconsistencies Fix - COMPREHENSIVE VALIDATION', 'bold');
  log('=' .repeat(80), 'magenta');
  
  const startTime = Date.now();
  
  // Run all tests
  const results = {
    doubleNavbar: testDoubleNavbarFixes(),
    professionalComponents: testProfessionalComponents(),
    profilePage: testProfilePageConversion(),
    uiConsistency: testUIConsistency(),
    fileStructure: testFileStructure()
  };
  
  // Calculate overall score
  let totalScore = 0;
  let maxTotalScore = 0;
  let allTestsPassed = true;
  
  Object.values(results).forEach(result => {
    totalScore += result.score;
    maxTotalScore += result.total;
    if (!result.passed) allTestsPassed = false;
  });
  
  const overallPercentage = Math.round((totalScore / maxTotalScore) * 100);
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  log('\n' + '='.repeat(80), 'magenta');
  log('📋 COMPREHENSIVE STEP 4 VALIDATION SUMMARY', 'bold');
  log('='.repeat(80), 'magenta');
  
  // Detailed results
  log(`\n🔍 Double Navbar Fixes: ${results.doubleNavbar.passed ? 'PASSED' : 'FAILED'} (${results.doubleNavbar.score}/${results.doubleNavbar.total})`, 
      results.doubleNavbar.passed ? 'green' : 'red');
  
  log(`🎨 Professional Components: ${results.professionalComponents.passed ? 'PASSED' : 'FAILED'} (${results.professionalComponents.score}/${results.professionalComponents.total})`, 
      results.professionalComponents.passed ? 'green' : 'red');
  
  log(`👤 Profile Page Conversion: ${results.profilePage.passed ? 'PASSED' : 'FAILED'} (${results.profilePage.score}/${results.profilePage.total})`, 
      results.profilePage.passed ? 'green' : 'red');
  
  log(`🎯 UI Consistency: ${results.uiConsistency.passed ? 'PASSED' : 'FAILED'} (${results.uiConsistency.score}/${results.uiConsistency.total})`, 
      results.uiConsistency.passed ? 'green' : 'red');
  
  log(`📁 File Structure: ${results.fileStructure.passed ? 'PASSED' : 'FAILED'} (${results.fileStructure.score}/${results.fileStructure.total})`, 
      results.fileStructure.passed ? 'green' : 'red');
  
  log('\n' + '='.repeat(80), 'magenta');
  log(`📊 OVERALL SCORE: ${totalScore}/${maxTotalScore} (${overallPercentage}%)`, overallPercentage >= 90 ? 'green' : overallPercentage >= 70 ? 'yellow' : 'red');
  log(`⏱️  Test Duration: ${duration} seconds`, 'cyan');
  log('=' .repeat(80), 'magenta');
  
  // Final verdict
  if (overallPercentage >= 95) {
    log('🎉 STEP 4: UI Design Inconsistencies Fix - EXCELLENT COMPLETION!', 'green');
    log('✅ All major requirements have been successfully implemented', 'green');
    log('✅ Professional UI design achieved across all components', 'green');
    log('✅ Ready for production deployment', 'green');
  } else if (overallPercentage >= 85) {
    log('🎯 STEP 4: UI Design Inconsistencies Fix - GOOD COMPLETION!', 'yellow');
    log('✅ Most requirements have been successfully implemented', 'green');
    log('⚠️  Some minor improvements may be needed', 'yellow');
  } else if (overallPercentage >= 70) {
    log('⚠️  STEP 4: UI Design Inconsistencies Fix - PARTIAL COMPLETION', 'yellow');
    log('✅ Basic requirements met', 'green');
    log('❌ Several areas need improvement', 'red');
  } else {
    log('❌ STEP 4: UI Design Inconsistencies Fix - NEEDS WORK', 'red');
    log('❌ Major requirements not met', 'red');
    log('🔧 Significant improvements needed before proceeding', 'yellow');
  }
  
  log('=' .repeat(80), 'magenta');
  
  return {
    success: overallPercentage >= 85,
    score: overallPercentage,
    details: results,
    duration: duration
  };
}

// Run comprehensive validation
const testResult = validateStep4();
process.exit(testResult.success ? 0 : 1); 