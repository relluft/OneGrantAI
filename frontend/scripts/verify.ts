import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { execSync } from 'child_process';

globalThis.fetch = async (url: any, options: any) => {
    const body = options?.body ? options.body.toString().replace(/'/g, "''") : '';
    const command = `(Invoke-WebRequest -Uri "${url}" -Method POST -ContentType "application/json" -Body '${body}' -UseBasicParsing).Content`;
    try {
        const result = execSync(command, { shell: 'powershell.exe', encoding: 'utf-8' });
        return new Response(result.trim(), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (e: any) {
        return new Response(JSON.stringify({ error: 'powershell_request_failed' }), { status: 502 });
    }
};

const rpcUrl = 'https://rpc-testnet.onelabs.cc:443';
const client = new SuiClient({ url: rpcUrl });
const packageId = '0xe3eefc47a6d4e643e86f4c17bc430c07bfff2d8ef75320ec3f32560027ff21df';

async function verifyContract() {
    console.log(`Запрашиваем структуру контракта ${packageId} из блокчейна...`);
    
    try {
        const modules = await client.getNormalizedMoveModulesByPackage({ package: packageId });
        
        console.log('\n✅ Контракт найден в сети!');
        
        for (const [moduleName, moduleInfo] of Object.entries(modules)) {
            console.log(`\n📦 Модуль: ${moduleName}`);
            
            console.log('📝 Функции:');
            for (const funcName of Object.keys(moduleInfo.exposedFunctions)) {
                console.log(`  - ${funcName}()`);
            }
            
            console.log('🏛️ Структуры:');
            for (const structName of Object.keys(moduleInfo.structs)) {
                console.log(`  - ${structName}`);
            }
        }
    } catch (e) {
        console.error('\n❌ Ошибка получения контракта:', e);
    }
}

verifyContract();
