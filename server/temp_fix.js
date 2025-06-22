const fs = require('fs');

// Read the file
const filePath = 'controllers/authController.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the imports
content = content.replace(
  'import jwt from \'jsonwebtoken\';',
  'import jwt, { SignOptions } from \'jsonwebtoken\';'
);

// Fix the generateAccessToken method
content = content.replace(
  /private generateAccessToken\(.*?\) {[\s\S]*?return jwt\.sign\(\s*{[\s\S]*?}\s*,\s*this\.JWT_SECRET\s*,\s*{[\s\S]*?}\s*\);/m,
  `private generateAccessToken(tenantId: string, userId: number, role: string): string {
    return jwt.sign(
      { tenantId, userId, role, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as SignOptions
    );`
);

// Fix the generateRefreshToken method
content = content.replace(
  /private generateRefreshToken\(.*?\) {[\s\S]*?return jwt\.sign\(\s*{[\s\S]*?}\s*,\s*this\.JWT_SECRET\s*,\s*{[\s\S]*?}\s*\);/m,
  `private generateRefreshToken(tenantId: string, userId: number): string {
    return jwt.sign(
      { tenantId, userId, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN } as SignOptions
    );`
);

// Write the file back
fs.writeFileSync(filePath, content);
console.log('authController.ts fixed successfully');
