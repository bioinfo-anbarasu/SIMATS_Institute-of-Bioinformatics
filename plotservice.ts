import { db } from "../firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

export interface SavedPlot {
    plotType: string;
    data: any[];
    fileName: string;
    createdAt?: any;
}

export const savePlotToCloud = async (plotType: string, data: any[], fileName: string): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, "plots"), {
            plotType,
            data,
            fileName,
            createdAt: serverTimestamp()
        });
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const loadPlotFromCloud = async (plotId: string): Promise<SavedPlot | null> => {
    try {
        const docRef = doc(db, "plots", plotId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as SavedPlot;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error getting document: ", e);
        throw e;
    }
};
