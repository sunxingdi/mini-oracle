import { readFileSync } from 'fs';
import { join } from 'path';
import fs from 'fs';

const buildingPath  = join(__dirname, '..', 'building');

if (!fs.existsSync(buildingPath)){fs.mkdirSync(buildingPath);}

export const ConsumerContractAbiFile  = join(buildingPath, 'ConsumerAbi.json');
export const ConsumerContractAttrFile = join(buildingPath, 'ConsumerAttr.json');

export const MiniOracleContractAbiFile  = join(buildingPath, 'MiniOracleAbi.json');
export const MiniOracleContractAttrFile = join(buildingPath, 'MiniOracleAttr.json');