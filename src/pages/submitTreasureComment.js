// utils/submitTreasureComment.js
import { db } from '../firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';

export const submitTreasureComment = async ({ postId, user, text }) => {
  if (!user || !text.trim()) return;

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const profile = userSnap.exists() ? userSnap.data() : {};

  await addDoc(collection(db, 'TresurePost', postId, 'comments'), {
    text,
    createdAt: serverTimestamp(),
    userId: user.uid,
    displayName: profile.displayName || user.displayName || '匿名',
    userName: profile.userName || 'unknown',
    profileImage: profile.profileImage || '/default-avatar.png',
  });
};
