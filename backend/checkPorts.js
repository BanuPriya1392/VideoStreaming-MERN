const { execSync } = require('child_process');

try {
    const nodePids = execSync('powershell -command "Get-Process node | Select-Object -ExpandProperty Id"').toString().trim().split(/\s+/);
    console.log(`Checking Node PIDs: ${nodePids.join(', ')}`);
    
    const netstat = execSync('netstat -ano').toString();
    const lines = netstat.split('\n');
    
    nodePids.forEach(pid => {
        const matches = lines.filter(line => line.includes(pid) && line.includes('LISTENING'));
        if (matches.length > 0) {
            console.log(`PID ${pid} is LISTENING on:`);
            matches.forEach(m => console.log(`  ${m.trim()}`));
        }
    });
} catch (err) {
    console.error(err.message);
}
