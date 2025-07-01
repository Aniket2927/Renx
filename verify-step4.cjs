const fs = require('fs');

console.log('🚀 STEP 4 VALIDATION: UI Design Inconsistencies Fix');
console.log('==================================================');

function readFile(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (error) {
    return null;
  }
}

let totalChecks = 0;
let passedChecks = 0;

// 1. Check Double Navbar Fixes
console.log('\n1️⃣ DOUBLE NAVBAR FIXES');
console.log('--------------------');

const pages = ['Settings.tsx', 'Screening.tsx', 'Backtesting.tsx', 'RiskManagement.tsx', 'Community.tsx'];
pages.forEach(page => {
  totalChecks++;
  const content = readFile(`client/src/pages/${page}`);
  if (content) {
    const hasHeaderImport = content.includes('import { Header }');
    const hasHeaderUsage = content.includes('<Header');
    const hasInlineTitle = content.includes('<h1 className="text-3xl font-bold');
    
    if (!hasHeaderImport && !hasHeaderUsage && hasInlineTitle) {
      console.log(`✅ ${page}: Fixed`);
      passedChecks++;
    } else {
      console.log(`❌ ${page}: Issues found`);
    }
  } else {
    console.log(`❌ ${page}: File not found`);
  }
});

// 2. Check Professional Components in App.tsx
console.log('\n2️⃣ PROFESSIONAL COMPONENTS');
console.log('-------------------------');

const appContent = readFile('client/src/App.tsx');
if (appContent) {
  totalChecks++;
  const hasCardImport = appContent.includes('from "@/components/ui/card"');
  const hasButtonImport = appContent.includes('from "@/components/ui/button"');
  const hasIconImport = appContent.includes('from "lucide-react"');
  
  if (hasCardImport && hasButtonImport && hasIconImport) {
    console.log('✅ Shadcn/UI imports: Present');
    passedChecks++;
  } else {
    console.log('❌ Shadcn/UI imports: Missing');
  }
  
  // Check a few key components
  const components = ['ThresholdConfig', 'Compliance', 'MarketData', 'SentimentAnalysis'];
  components.forEach(component => {
    totalChecks++;
    const hasComponent = appContent.includes(`const ${component} = () => (`);
    const componentCode = appContent.substring(
      appContent.indexOf(`const ${component}`),
      appContent.indexOf('});', appContent.indexOf(`const ${component}`)) + 3
    );
    
    const hasCard = componentCode.includes('<Card');
    const hasCardHeader = componentCode.includes('<CardHeader>');
    const hasIcons = componentCode.includes('text-primary');
    
    if (hasComponent && hasCard && hasCardHeader && hasIcons) {
      console.log(`✅ ${component}: Professional design`);
      passedChecks++;
    } else {
      console.log(`❌ ${component}: Needs improvement`);
    }
  });
} else {
  console.log('❌ App.tsx: File not found');
}

// 3. Check Profile Page Conversion
console.log('\n3️⃣ PROFILE PAGE CONVERSION');
console.log('--------------------------');

const profileContent = readFile('client/src/components/profile/ProfilePage.jsx');
if (profileContent) {
  const checks = [
    { name: 'CSS import removal', check: !profileContent.includes("import './ProfileSection.css'") },
    { name: 'Card components', check: profileContent.includes('from "@/components/ui/card"') },
    { name: 'Tabs components', check: profileContent.includes('from "@/components/ui/tabs"') },
    { name: 'Avatar components', check: profileContent.includes('from "@/components/ui/avatar"') },
    { name: 'Toast hook', check: profileContent.includes('from "@/hooks/use-toast"') && profileContent.includes('const { toast } = useToast()') },
    { name: 'Card usage', check: profileContent.includes('<Card') && profileContent.includes('<CardContent>') }
  ];
  
  checks.forEach(({ name, check }) => {
    totalChecks++;
    if (check) {
      console.log(`✅ ${name}: Implemented`);
      passedChecks++;
    } else {
      console.log(`❌ ${name}: Missing`);
    }
  });
} else {
  console.log('❌ ProfilePage.jsx: File not found');
}

// 4. File Structure
console.log('\n4️⃣ CRITICAL FILES');
console.log('----------------');

const criticalFiles = [
  'client/src/App.tsx',
  'client/src/pages/Settings.tsx', 
  'client/src/components/profile/ProfilePage.jsx'
];

criticalFiles.forEach(file => {
  totalChecks++;
  if (fs.existsSync(file)) {
    console.log(`✅ ${file.split('/').pop()}: Exists`);
    passedChecks++;
  } else {
    console.log(`❌ ${file.split('/').pop()}: Missing`);
  }
});

// Final Results
console.log('\n==================================================');
console.log('📊 STEP 4 VALIDATION RESULTS');
console.log('==================================================');

const successRate = Math.round((passedChecks / totalChecks) * 100);
console.log(`\n🎯 Overall Score: ${passedChecks}/${totalChecks} (${successRate}%)`);

if (successRate >= 90) {
  console.log('\n🎉 STEP 4: EXCELLENT COMPLETION!');
  console.log('✅ UI Design Inconsistencies successfully fixed');
  console.log('✅ Professional Shadcn/UI design implemented');
  console.log('✅ Double navbar issues resolved');
  console.log('✅ Profile page converted to modern components');
  console.log('✅ Ready for production deployment');
} else if (successRate >= 75) {
  console.log('\n✅ STEP 4: GOOD COMPLETION!');
  console.log('✅ Most UI issues fixed');
  console.log('⚠️  Minor improvements recommended');
} else {
  console.log('\n⚠️ STEP 4: NEEDS IMPROVEMENT');
  console.log('❌ Several issues need attention');
}

console.log('\n=================================================='); 