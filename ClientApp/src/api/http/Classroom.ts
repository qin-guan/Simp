import { apiClient } from "./Base";
import Classroom from "../../models/Classroom";
import User from "../../models/User";

export const get = async (): Promise<Classroom[]> => {
    return await apiClient.get("Classrooms/").json<Classroom[]>();
};

export const find = async(classroomId: string): Promise<Classroom> => {
    return await apiClient.get(`Classrooms/${classroomId}`).json<Classroom>();
};

export const create = async (json: Classroom): Promise<Classroom> => {
    return await apiClient.post("Classrooms/", { json }).json<Classroom>();
};

export const join = async(code: string): Promise<Classroom> => {
    return await apiClient.get(`Classrooms/Join/${code}`).json<Classroom>();
};

export const isPrivileged = async (classroomId: string): Promise<boolean> => {
    return await apiClient.get(`Classrooms/${classroomId}/Privileged`).json<boolean>();
};

export const getJoinCode = async (classroomId: string): Promise<string> => {
    return await apiClient.get(`Classrooms/${classroomId}/Code`).json<string>();
};

export const getUsers = async (classroomId: string): Promise<User[]> => {
    return await apiClient.get(`Classrooms/${classroomId}/Users`).json<User[]>();
};

const classrooms = {
    get,
    find,
    create,
    join,
    isPrivileged,
    getJoinCode,
    getUsers
};

export default classrooms;