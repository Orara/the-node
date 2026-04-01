const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Change bg-slate-50 to bg-white
content = content.replace(/bg-slate-50/g, 'bg-white');

// Add tracking-wide leading-relaxed to main containers
content = content.replace(/className="min-h-screen flex bg-white font-sans/g, 'className="min-h-screen flex bg-white font-sans tracking-wide leading-relaxed');
content = content.replace(/className="min-h-screen bg-white flex justify-center font-sans/g, 'className="min-h-screen bg-white flex justify-center font-sans tracking-wide leading-relaxed');

// Make sure inputs and cards have smooth rounded corners
content = content.replace(/rounded-xl/g, 'rounded-2xl');
content = content.replace(/rounded-lg/g, 'rounded-xl');

// Change bottom bar to fixed bottom bar with thin border
content = content.replace(/className="md:hidden fixed z-50 left-0 bottom-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center pb-\[calc\(12px\+env\(safe-area-inset-bottom\)\)\]"/g, 'className="md:hidden fixed z-50 left-0 bottom-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center pb-[calc(12px+env(safe-area-inset-bottom))]"');

fs.writeFileSync('src/App.tsx', content);
console.log('Refactoring complete 2');
