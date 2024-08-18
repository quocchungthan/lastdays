const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

async function generateGitInfo() {
  const git = simpleGit();
  const log = await git.log();
  const hash = log.latest?.hash || 'unknown';
  const buildDate = new Date().toISOString();
  const gitInfo = { hash, buildDate };

  const filePath = path.join(__dirname, 'src', 'assets', 'git-info.json');
  fs.writeFileSync(filePath, JSON.stringify(gitInfo, null, 2));
}

generateGitInfo().catch(err => {
  console.error('Failed to generate Git info:', err);
  process.exit(1);
});
