import { execSync } from 'child_process';

const userAddr = '0x13a7e97dbfd966d12d9f99d0b8302ac92934c170f79ac514219fb9618e5780a8';
const rpcUrl = 'https://rpc-testnet.onelabs.cc:443';

async function findInHistory() {
    console.log(`🔍 Ищем транзакции деплоера ${userAddr}...`);
    
    const body = {
        jsonrpc: "2.0",
        id: 1,
        method: "suix_queryTransactionBlocks",
        params: [
            { filter: { FromAddress: userAddr } },
            null, 10, true
        ]
    };

    const cmd = `(Invoke-WebRequest -Uri "${rpcUrl}" -Method POST -ContentType "application/json" -Body '${JSON.stringify(body).replace(/'/g, "''")}' -UseBasicParsing).Content`;
    
    try {
        const result = execSync(cmd, { shell: 'powershell.exe', encoding: 'utf-8' });
        const data = JSON.parse(result);
        
        if (data.result && data.result.data) {
            for (const tx of data.result.data) {
                const created = tx.effects?.created || [];
                for (const obj of created) {
                    // Мы не знаем типа здесь (его нет в блоке), но мы можем проверить каждый объект
                    // Попробуем найти объект, который имеет Shared owner
                    if (obj.owner === "Shared") {
                         console.log("FOUND POTENTIAL REGISTRY (SHARED OBJECT):", obj.reference.objectId);
                    }
                }
            }
        }
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

findInHistory();
