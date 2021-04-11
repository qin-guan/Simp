import { apiClient } from "./Base";
import Classroom from "../../models/Classroom";

export const get = async (): Promise<Classroom[]> => {
    return await apiClient.get("Classrooms/").json<Classroom[]>();
};

export const find = async(classroomId: string): Promise<Classroom> => {
    return await apiClient.get(`Classrooms/${classroomId}`).json<Classroom>();
};

export const create = async (json: Classroom): Promise<Classroom> => {
    return await apiClient.post("Classrooms/", { json }).json<Classroom>();
};

const classrooms = {
    get,
    find,
    create
};

export default classrooms;