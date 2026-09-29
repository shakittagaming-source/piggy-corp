const fs = require('fs');

function updateCss(filePath) {
  let css = fs.readFileSync(filePath, 'utf8');

  // Colors
  css = css.replace(/#06131d/g, '#f8fafc'); // Root background
  css = css.replace(/#071722/g, '#f1f5f9'); // Body background
  css = css.replace(/#0b1622/g, '#e2e8f0'); // Gradient end
  css = css.replace(/#edf6ff/g, '#0f172a'); // Main text
  css = css.replace(/#dfeaf8/g, '#1e293b'); // Secondary text
  css = css.replace(/#b5cce3/g, '#475569'); // Muted text
  css = css.replace(/rgba\(7, 23, 34, 0.8\)/g, 'rgba(255, 255, 255, 0.9)'); // Topbar bg
  css = css.replace(/rgba\(15, 23, 42, 0.8\)/g, 'rgba(255, 255, 255, 0.8)'); // Panels bg
  css = css.replace(/rgba\(8, 47, 73, 0.34\)/g, 'rgba(56, 189, 248, 0.15)'); // Badges
  css = css.replace(/rgba\(125, 211, 252, 0.22\)/g, 'rgba(14, 165, 233, 0.4)'); // Badge borders
  css = css.replace(/rgba\(30, 64, 175, 0.2\)/g, 'rgba(219, 234, 254, 0.8)'); // Light blue backgrounds
  css = css.replace(/#0f172a/g, '#ffffff'); // Some dark card backgrounds to white
  css = css.replace(/#1e293b/g, '#f8fafc'); // Slightly lighter dark to light slate
  css = css.replace(/#334155/g, '#e2e8f0'); // Borders
  
  // Specific tweaks
  css = css.replace(/background: radial-gradient\(circle at top left, rgba\(59, 130, 246, 0.14\), transparent 22%\),\n\s+radial-gradient\(circle at bottom right, rgba\(45, 212, 191, 0.18\), transparent 25%\),\n\s+#071722;/gs, 
    'background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.15), transparent 25%), radial-gradient(circle at bottom right, rgba(45, 212, 191, 0.15), transparent 25%), #f8fafc;');
  
  // Keep primary text white on buttons
  css = css.replace(/color: #0f172a;\s*\/\*\s*keep\s+primary\s*\*\//g, 'color: #ffffff;');

  fs.writeFileSync(filePath, css);
}

['src/App.css', 'src/AcademyPages.css', 'src/SocialHub.css', 'src/MoneyQuest.css', 'src/MoneyAssistant.css', 'src/AuthScreen.css', 'src/CharacterStudio.css'].forEach(file => {
  if(fs.existsSync(file)) {
    updateCss(file);
    console.log("Updated", file);
  }
});
