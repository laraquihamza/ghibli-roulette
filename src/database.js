import { getDatabase } from "firebase/database";
import { firebaseApp } from "./firebase";

export const database = getDatabase(firebaseApp); // Initialize the Realtime Database