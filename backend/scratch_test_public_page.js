const fetch = require('node-fetch');

async function testWidgets() {
  try {
    const res = await fetch('https://cp.streamo.ng:2020/public/andradio');
    const html = await res.text();
    
    // Find any iframe src or widget URLs
    const matches = html.match(/(src|href)=['"]([^'"]+)['"]/g);
    if (matches) {
      console.log('Found URLs on public page:');
      matches.filter(m => m.includes('widget') || m.includes('chart') || m.includes('map') || m.includes('recent'))
             .forEach(m => console.log(m));
    } else {
      console.log('No matches found.');
    }
    
  } catch (e) {
    console.error(e);
  }
}

testWidgets().then(() => process.exit(0));
