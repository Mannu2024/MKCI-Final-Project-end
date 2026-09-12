import { db } from "./src/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

async function run() {
  const docRef = doc(db, "settings", "websiteContent");
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    if (data.contactInfo) {
      await updateDoc(docRef, {
        "contactInfo.mapUrl": "https://maps.google.com/maps?q=8W8G%2B2F5%2C%20Rampur%20Taluka%20Mungari%2C%20Uttar%20Pradesh%20212301&t=&z=15&ie=UTF8&iwloc=&output=embed"
      });
      console.log("Updated mapUrl in Firestore");
    }
  } else {
    console.log("No document found, default takes over.");
  }
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
