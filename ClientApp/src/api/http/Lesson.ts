import { apiClient } from "./Base";
import Lesson from "../../models/Lesson";
import User from "../../models/User";

export const get = async (classroomId: string): Promise<Lesson[]> => {
    return await apiClient.get(`Lessons/${classroomId}/`).json<Lesson[]>();
};

export const find = async (classroomId: string, lessonId: string): Promise<Lesson> => {
    return await apiClient.get(`Lessons/${classroomId}/${lessonId}`).json<Lesson>();
};

export const create = async (classroomId: string, lesson: Lesson): Promise<Lesson> => {
    return await apiClient.post(`Lessons/${classroomId}/`, { json: lesson }).json<Lesson>();
};

export const createAttendance = async (classroomId: string, lessonId: string, code: number): Promise<boolean> => {
    return await apiClient.post(`Lessons/${classroomId}/${lessonId}/Attendance`, { json: code }).json<boolean>();
};

export const getAttendanceCode = async (classroomId: string, lessonId: string): Promise<number> => {
    return await apiClient.get(`Lessons/${classroomId}/${lessonId}/Code`).json<number>();
};

export const getAttendees = async (classroomId: string, lessonId: string): Promise<User[]> => {
    return await apiClient.get(`Lessons/${classroomId}/${lessonId}/Attendees`).json<User[]>();
};

export const getAttendance = async (classroomId: string, lessonId: string): Promise<boolean> => {
    return await apiClient.get(`Lessons/${classroomId}/${lessonId}/Attendance`).json<boolean>();
};

export const deleteAttendance = async (classroomId: string, lessonId: string, userId: string): Promise<void> => {
    await apiClient.delete(`Lessons/${classroomId}/${lessonId}/Attendance`, { json: userId });
};

const lessons = {
    get,
    find,
    create,
    createAttendance,
    getAttendanceCode,
    getAttendees,
    getAttendance,
    deleteAttendance
};

export default lessons;