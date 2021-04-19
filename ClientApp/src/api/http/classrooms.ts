import { apiClient } from "./base";
import Classroom from "../../models/Classroom";
import User from "../../models/User";
import Venue from "../../models/Venue";

export const get = async (): Promise<Classroom[]> => {
    return await apiClient.get("Classrooms/").json<Classroom[]>();
};

export const find = async(classroomId: string): Promise<Classroom> => {
    return await apiClient.get(`Classrooms/${classroomId}`).json<Classroom>();
};

export const create = async (json: Classroom): Promise<Classroom> => {
    return await apiClient.post("Classrooms/", { json }).json<Classroom>();
};

export const createVenue = async (classroomId: string, json: Venue): Promise<Venue> => {
    return await apiClient.post(`Classrooms/${classroomId}/Venues`, { json }).json<Venue>();
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

export const getVenues = async(classroomId: string): Promise<Venue[]> => {
    return await apiClient.get(`Classrooms/${classroomId}/Venues`).json<Venue[]>();
};

export const deleteVenue = async (classroomId: string, venueId: string): Promise<boolean> => {
    return await apiClient.delete(`Classrooms/${classroomId}/Venues/${venueId}`).json<boolean>();
};

const classrooms = {
    get,
    find,
    create,
    createVenue,
    join,
    isPrivileged,
    getJoinCode,
    getUsers,
    getVenues,
    deleteVenue
};

export default classrooms;