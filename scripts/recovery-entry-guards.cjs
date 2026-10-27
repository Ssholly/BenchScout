// Pure target checks shared by the private entry form and recovery runner.
// Error messages are fixed labels only; never include submitted values.
const entryErrors={
 databaseUrl:'Recovery DATABASE_URL: copy the connection URL from the new recovery branch, not the source testing branch.',
 sourceToken:'Testing documents token: copy only the token value from the testing documents store.',
 backupToken:'Testing backups token: copy only the token value from the testing backups store.',
 encryptionKey:'Testing encryption key: use the existing 64 hexadecimal characters only, without quotes or spaces.',
 candidatePassword:'QA candidate password: enter the existing password of 12 to 72 bytes.',
 config:'Approved recovery configuration is invalid. Return to chat.'
};
function reject(field){throw new Error(entryErrors[field]);}
function validateRecoveryEntries(values,config){
 for(const field of ['databaseUrl','sourceToken','backupToken','encryptionKey','candidatePassword']){
  const value=values[field];
  if(typeof value!=='string'||!value||value.length>2048||/[\x00-\x1f\x7f]/.test(value))reject(field);
 }
 let db;try{db=new URL(values.databaseUrl);}catch{reject('databaseUrl');}
 if(!['postgres:','postgresql:'].includes(db.protocol)||!config.allowedDatabaseHosts.includes(db.hostname)||db.pathname!=='/benchscout_testing'||!db.password)reject('databaseUrl');
 const storeId=t=>/^vercel_blob_rw_[^_]+_/.test(t)?t.split('_')[3].toLowerCase():'';
 if(config.sourceStoreId.toLowerCase()===config.backupStoreId.toLowerCase())reject('config');
 if(storeId(values.sourceToken)!==config.sourceStoreId.toLowerCase())reject('sourceToken');
 if(storeId(values.backupToken)!==config.backupStoreId.toLowerCase())reject('backupToken');
 if(!/^[a-f0-9]{64}$/i.test(values.encryptionKey))reject('encryptionKey');
 if(values.candidatePassword.length<12||Buffer.byteLength(values.candidatePassword)>72)reject('candidatePassword');
}
module.exports={validateRecoveryEntries,entryErrors};
