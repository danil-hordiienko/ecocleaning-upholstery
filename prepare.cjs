// Run after changing styles.css or fonts.css to refresh the embedded stylesheet.
const fs=require('node:fs');
const path=require('node:path');
const root=fs.existsSync(path.join(__dirname,'dist','index.html'))?path.join(__dirname,'dist'):__dirname;
const css=['fonts.css','styles.css'].map(file=>fs.readFileSync(path.join(root,file),'utf8')).join('\n').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\s+/g,' ').replace(/\s*([{}:;,])\s*/g,'$1').trim();
const file=path.join(root,'index.html');
let html=fs.readFileSync(file,'utf8');
const style='<style id="site-styles">'+css+'</style>';
if(html.includes('<style id="site-styles">'))html=html.replace(/<style id="site-styles">[\s\S]*?<\/style>/,style);
else html=html.replace(/<link rel="stylesheet" href="fonts.css">\s*<link rel="stylesheet" href="styles.css">/,style);
fs.writeFileSync(file,html);
console.log('Embedded local styles: '+Buffer.byteLength(css)+' bytes; no blocking stylesheet requests.');
