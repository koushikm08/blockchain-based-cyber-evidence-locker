const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Evidence = require('./models/Evidence');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
    try {
        await User.deleteMany();
        await Evidence.deleteMany();

        console.log('🗑️  Data cleared...');

        // Create users (passwords will be hashed by the pre-save middleware)
        const users = await User.create([
            {
                fullName: 'Detective John Smith',
                email: 'john@lawenforcement.gov',
                password: 'password123',
                organization: 'Federal Law Enforcement Agency',
                role: 'investigator'
            },
            {
                fullName: 'Agent Sarah Johnson',
                email: 'sarah@cybercrime.gov',
                password: 'password123',
                organization: 'Cyber Crime Division',
                role: 'investigator'
            },
            {
                fullName: 'Admin User',
                email: 'admin@evidence.gov',
                password: 'admin123',
                organization: 'Evidence Management',
                role: 'admin'
            }
        ]);

        console.log('✅ Users created...');

        // Create sample evidence
        const crypto = require('crypto');
        const evidence = [];

        for (let i = 0; i < 5; i++) {
            const ev = await Evidence.create({
                fileName: `evidence-${i + 1}.jpg`,
                fileSize: Math.floor(Math.random() * 5000000) + 100000,
                fileHash: crypto.randomBytes(32).toString('hex'),
                ipfsCid: `Qm${crypto.randomBytes(32).toString('hex').substring(0, 44)}`,
                blockchainTx: `0x${crypto.randomBytes(32).toString('hex')}`,
                blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
                uploader: users[i % 2]._id,
                status: ['verified', 'pending'][i % 2],
                verificationCount: Math.floor(Math.random() * 10)
            });
            evidence.push(ev);
        }

        console.log('✅ Sample evidence created...');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Evidence: ${evidence.length}`);
        console.log('\n🔐 Login Credentials:');
        console.log('   Investigator: john@lawenforcement.gov / password123');
        console.log('   Investigator: sarah@cybercrime.gov / password123');
        console.log('   Admin: admin@evidence.gov / admin123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
