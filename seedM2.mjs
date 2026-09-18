import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'esquematica-ui',
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedM2() {
  const snapshot = await getDocs(collection(db, 'setups'));
  let i = 0;
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    // Generate dummy/progressive data for M2
    data['mod2-1'] = Math.floor(Math.random() * 100); 
    data['mod2-2'] = Math.floor(Math.random() * 100); 
    data['mod2-3'] = Math.floor(Math.random() * 100); 
    data['mod2-4'] = Math.floor(Math.random() * 100); 
    data['mod2-5'] = Math.random() > 0.5;
    data['mod2-6'] = Math.random() > 0.5;
    data['mod2-7'] = Math.random() > 0.5;
    data['mod2-8'] = Math.random() > 0.5;
    data['mod2-9'] = Math.floor(Math.random() * 100); 
    data['mod2-10'] = Math.floor(Math.random() * 100);
    data['mod2-11'] = Math.floor(Math.random() * 100);
    data['mod2-12'] = Math.random() > 0.5; 
    data['mod2-13'] = Math.random() > 0.5; 
    data['mod2-14'] = Math.random() > 0.5; 
    data['mod2-15'] = Math.floor(Math.random() * 100); 
    data['mod2-16'] = Math.floor(Math.random() * 100); 
    data['mod2-17'] = Math.random() > 0.5; 

    // M3
    for(let j=1; j<=20; j++) data['mod3-'+j] = Math.floor(Math.random() * 100);

    await setDoc(docSnap.ref, data, { merge: true });
    i++;
  }
  console.log('Seeded M2 & M3 for ' + i + ' users.');
  process.exit(0);
}
seedM2();
