const fs = require('fs');
const path = require('path');

// 創建輸出目錄
const outputDir = path.join(__dirname, '..', 'assets', 'sprites');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 檢查 canvas 是否可用
let Canvas;
try {
  Canvas = require('canvas');
} catch (e) {
  console.log('⚠️  未安裝 canvas 套件');
  console.log('請執行: npm install canvas');
  console.log('');
  console.log('或者使用 tools/sprite-generator.html 在瀏覽器中生成：');
  console.log('1. 用瀏覽器打開 tools/sprite-generator.html');
  console.log('2. 點擊每個動畫的「下載」按鈕');
  console.log('3. 將下載的 PNG 檔案放到 assets/sprites/ 目錄');
  process.exit(0);
}

// 顏色定義
const COLORS = {
  fur: '#ff8c42',
  furDark: '#e67e22',
  belly: '#ffe4c4',
  white: '#ffffff',
  black: '#333333',
  pink: '#ffb6c1',
  darkPink: '#ff6b6b',
  food: '#8b4513',
  sleep: '#87ceeb'
};

// 繪製狐狸
function drawFox(ctx, state, frame = 0) {
  const centerX = 100;
  const centerY = 140;
  const width = 200;
  const height = 250;
  
  // 清除畫布
  ctx.fillStyle = '#2d3561';
  ctx.fillRect(0, 0, width, height);
  
  // 動畫偏移
  let bounceY = 0;
  if (state === 'idle') bounceY = Math.sin(frame * 0.1) * 3;
  if (state === 'happy') bounceY = Math.abs(Math.sin(frame * 0.2)) * -10;
  if (state === 'eating') bounceY = Math.sin(frame * 0.3) * 2;
  
  const y = centerY + bounceY;
  
  // 繪製尾巴
  ctx.save();
  ctx.translate(centerX + 40, y + 30);
  if (state === 'happy') ctx.rotate(Math.sin(frame * 0.2) * 0.3);
  ctx.fillStyle = COLORS.fur;
  ctx.beginPath();
  ctx.ellipse(0, 0, 35, 50, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.ellipse(5, 20, 15, 20, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // 繪製身體
  ctx.fillStyle = COLORS.fur;
  ctx.beginPath();
  ctx.ellipse(centerX, y + 40, 45, 55, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 肚皮
  ctx.fillStyle = COLORS.belly;
  ctx.beginPath();
  ctx.ellipse(centerX, y + 45, 25, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 繪製頭部
  ctx.fillStyle = COLORS.fur;
  ctx.beginPath();
  ctx.arc(centerX, y - 20, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // 耳朵
  const earOffset = state === 'sad' ? 0.2 : -0.2;
  
  // 左耳
  ctx.save();
  ctx.translate(centerX - 30, y - 55);
  ctx.rotate(earOffset);
  ctx.fillStyle = COLORS.fur;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-15, -35);
  ctx.lineTo(15, -5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.pink;
  ctx.beginPath();
  ctx.moveTo(-2, -5);
  ctx.lineTo(-8, -25);
  ctx.lineTo(5, -8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // 右耳
  ctx.save();
  ctx.translate(centerX + 30, y - 55);
  ctx.rotate(-earOffset);
  ctx.fillStyle = COLORS.fur;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(15, -35);
  ctx.lineTo(-15, -5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = COLORS.pink;
  ctx.beginPath();
  ctx.moveTo(2, -5);
  ctx.lineTo(8, -25);
  ctx.lineTo(-5, -8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  
  // 臉部表情
  const eyeY = y - 25;
  
  if (state === 'sleeping') {
    // 閉眼睡覺
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX - 20, eyeY, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX + 20, eyeY, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();
    
    // 睡覺泡泡
    ctx.fillStyle = COLORS.sleep;
    ctx.beginPath();
    ctx.arc(centerX + 45, y - 40, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 55, y - 50, 5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 眼睛
    const eyeOpen = state === 'eating' && frame % 20 < 5 ? 0.1 : 1;
    
    ctx.fillStyle = COLORS.black;
    ctx.beginPath();
    ctx.ellipse(centerX - 20, eyeY, 8, 12 * eyeOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 20, eyeY, 8, 12 * eyeOpen, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼神光
    ctx.fillStyle = COLORS.white;
    ctx.beginPath();
    ctx.arc(centerX - 17, eyeY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 23, eyeY - 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 鼻子
  ctx.fillStyle = COLORS.black;
  ctx.beginPath();
  ctx.arc(centerX, y - 5, 5, 0, Math.PI * 2);
  ctx.fill();
  
  // 嘴巴
  ctx.strokeStyle = COLORS.black;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (state === 'happy' || state === 'talking') {
    ctx.arc(centerX, y + 5, 10, 0, Math.PI);
    ctx.stroke();
  } else if (state === 'sad') {
    ctx.arc(centerX, y + 15, 8, Math.PI, 0);
    ctx.stroke();
  } else if (state === 'eating') {
    ctx.fillStyle = COLORS.darkPink;
    ctx.beginPath();
    ctx.arc(centerX, y + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    ctx.arc(centerX, y - 5, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.arc(centerX, y + 8, 8, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  
  // 臉頰紅暈
  if (state === 'happy' || state === 'idle') {
    ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
    ctx.beginPath();
    ctx.arc(centerX - 35, y - 5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 35, y - 5, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // 手
  ctx.fillStyle = COLORS.fur;
  ctx.beginPath();
  ctx.ellipse(centerX - 35, y + 30, 12, 18, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(centerX + 35, y + 30, 12, 18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // 腳
  ctx.fillStyle = COLORS.furDark;
  ctx.beginPath();
  ctx.ellipse(centerX - 20, y + 85, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(centerX + 20, y + 85, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

// 生成靜態精靈圖
function generateStaticSprites() {
  const states = ['idle', 'happy', 'eating', 'sleeping', 'talking', 'sad'];
  
  console.log('🦊 生成狐狸精靈圖...\n');
  
  states.forEach(state => {
    const canvas = Canvas.createCanvas(200, 250);
    const ctx = canvas.getContext('2d');
    
    drawFox(ctx, state, 0);
    
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(outputDir, `${state}.png`);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ ${state}.png 已生成`);
  });
  
  console.log(`\n📁 輸出目錄: ${outputDir}`);
}

// 生成動畫精靈圖（多幀）
function generateAnimatedSprites() {
  const animations = {
    idle: { frames: 4, speed: 1 },
    happy: { frames: 4, speed: 2 },
    eating: { frames: 6, speed: 3 },
    sleeping: { frames: 4, speed: 0.5 },
    talking: { frames: 4, speed: 2 },
    sad: { frames: 2, speed: 0.5 }
  };
  
  console.log('\n🎬 生成動畫精靈圖（精靈表）...\n');
  
  Object.entries(animations).forEach(([state, config]) => {
    const frameWidth = 200;
    const frameHeight = 250;
    const totalWidth = frameWidth * config.frames;
    
    const canvas = Canvas.createCanvas(totalWidth, frameHeight);
    const ctx = canvas.getContext('2d');
    
    for (let i = 0; i < config.frames; i++) {
      ctx.save();
      ctx.translate(i * frameWidth, 0);
      drawFox(ctx, state, i * 10);
      ctx.restore();
    }
    
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(outputDir, `${state}_sheet.png`);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ ${state}_sheet.png (${config.frames} 幀)`);
  });
}

// 生成圖示
function generateIcons() {
  console.log('\n🎨 生成應用程式圖示...\n');
  
  const sizes = [16, 32, 64, 128, 256, 512];
  
  sizes.forEach(size => {
    const canvas = Canvas.createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#ff8c42';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 簡化狐狸臉
    const scale = size / 64;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(size/2 - 8*scale, size/2 - 4*scale, 6*scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size/2 + 8*scale, size/2 - 4*scale, 6*scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(size/2, size/2 + 8*scale, 4*scale, 0, Math.PI * 2);
    ctx.fill();
    
    const buffer = canvas.toBuffer('image/png');
    const outputPath = path.join(outputDir, '..', `icon_${size}.png`);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ icon_${size}.png`);
  });
  
  // 系統托盤圖示 (16x16)
  const trayCanvas = Canvas.createCanvas(16, 16);
  const trayCtx = trayCanvas.getContext('2d');
  trayCtx.fillStyle = '#ff8c42';
  trayCtx.beginPath();
  trayCtx.arc(8, 8, 7, 0, Math.PI * 2);
  trayCtx.fill();
  const trayBuffer = trayCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, '..', 'tray-icon.png'), trayBuffer);
  console.log('✅ tray-icon.png');
}

// 主程式
console.log('='.repeat(50));
console.log('🦊 Desktop Fox 精靈圖生成器');
console.log('='.repeat(50));

generateStaticSprites();
generateAnimatedSprites();
generateIcons();

console.log('\n' + '='.repeat(50));
console.log('🎉 所有資源已生成完成！');
console.log('='.repeat(50));
