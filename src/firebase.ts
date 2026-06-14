/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAVjIO-vSX-soCA40c5iCAzh9ormCfKp58",
  authDomain: "swati-labels.firebaseapp.com",
  projectId: "swati-labels",
  storageBucket: "swati-labels.firebasestorage.app",
  messagingSenderId: "348170742348",
  appId: "1:348170742348:web:ae200a83e05a7b5850a2e9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
