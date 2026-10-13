require('@next/env').loadEnvConfig(process.cwd());
const fs=require('node:fs');
const {PrismaClient}=require('@prisma/client');
const prisma=new PrismaClient();
const statements=fs.readFileSync('prisma/migrations/20261012010000_candidate_profiles/migration.sql','utf8').split(';').map(s=>s.trim()).filter(Boolean);
prisma.$transaction(statements.map(sql=>prisma.$executeRawUnsafe(sql))).then(()=>console.log('Additive candidate-profile columns applied; existing profiles and history preserved.')).catch(error=>{console.error('Candidate profile upgrade failed:',error.code||error.name);process.exitCode=1;}).finally(()=>prisma.$disconnect());
