import fs from 'node:fs/promises';
import vm from 'node:vm';
const code=await fs.readFile('products.js','utf8');const ctx={window:{}};vm.createContext(ctx);vm.runInContext(code,ctx);
const data=ctx.window.CATALOG_DATA;let missing=[];for(const c of data)for(const p of c.items){try{await fs.access(p.image)}catch{missing.push(p.image)}}
const html=await fs.readFile('index.html','utf8');const css=await fs.readFile('styles.css','utf8');const app=await fs.readFile('app.js','utf8');
if(!html.includes('products.js')||!html.includes('app.js'))throw new Error('script links missing');if(!css.includes('@media')||!app.includes('categoryCard'))throw new Error('responsive/category UI missing');
console.log(JSON.stringify({categories:data.length,products:data.reduce((n,c)=>n+c.items.length,0),missingImages:missing.length,categoryCounts:Object.fromEntries(data.map(c=>[c.id,c.items.length]))},null,2));if(missing.length)process.exitCode=1;
