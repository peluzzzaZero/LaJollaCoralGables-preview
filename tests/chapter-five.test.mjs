import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('assets/venue/cinematic/chapter-five-source.json',root),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
test('chapter 05 uses recorded references and silent, bounded, faststart cuts',()=>{
 const html=readFileSync(new URL('index.html',root),'utf8');
 assert.doesNotMatch(html,/data-cinema-film="hall"|hall-mobile-(?:poster|source)/);
 for(const source of Object.values(manifest.sources)) assert.equal(hash(readFileSync(new URL(source.path,root))),source.sha256);
 for(const [name,record] of Object.entries(manifest.assets)){
  const bytes=readFileSync(new URL('assets/venue/cinematic/'+name,root));assert.equal(hash(bytes),record.sha256,name);assert.equal(bytes.length,record.bytes);
  assert.ok(bytes.length<(name.endsWith('.webp')?150000:2500000),name);
  if(!record.streams)continue;
  assert.equal(record.streams.length,1);assert.equal(record.streams[0].codec_type,'video');assert.ok(record.duration_seconds>=4.9&&record.duration_seconds<=5.1);
  if(name.endsWith('.mp4')){assert.equal(record.streams[0].codec_name,'h264');assert.ok(bytes.indexOf(Buffer.from('moov'))<bytes.indexOf(Buffer.from('mdat')));}
 }
});
