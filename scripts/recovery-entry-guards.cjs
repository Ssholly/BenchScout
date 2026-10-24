// Pure target checks shared by the private entry form and recovery runner.
function validateRecoveryEntries(values,config){
 if(Object.values(values).some(v=>typeof v!=='string'||!v||v.length>2048||/[\x00-\x1f\x7f]/.test(v)))throw new Error('Recovery entry format rejected');
 const db=new URL(values.databaseUrl);
 if(!['postgres:','postgresql:'].includes(db.protocol)||!config.allowedDatabaseHosts.includes(db.hostname)||decodeURIComponent(db.pathname)!=='/benchscout_testing'||!db.password)throw new Error('Recovery database target rejected');
 const storeId=t=>/^vercel_blob_rw_[^_]+_/.test(t)?t.split('_')[3].toLowerCase():'';
 if(storeId(values.sourceToken)!==config.sourceStoreId.toLowerCase()||storeId(values.backupToken)!==config.backupStoreId.toLowerCase()||config.sourceStoreId.toLowerCase()===config.backupStoreId.toLowerCase())throw new Error('Testing storage target rejected');
 if(!/^[a-f0-9]{64}$/i.test(values.encryptionKey)||values.candidatePassword.length<12||Buffer.byteLength(values.candidatePassword)>72)throw new Error('Recovery key/password format rejected');
}
module.exports={validateRecoveryEntries};
