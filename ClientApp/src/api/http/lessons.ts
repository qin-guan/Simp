import { apiClient } from "./base";
import Lesson from "../../models/Lesson";
import User from "../../models/User";
import Venue from "../../models/Venue";

export const get = async (classroomId: string): Promise<Lesson[]> => {
    return await apiClient.get(`Lessons/${classroomId}/`).json<Lesson[]>();
};

export const getVenue = async(classroomId: string, lessonId: string): Promise<Venue | undefined> => {
    return await apiClient.get(`Lessons/${classroomId}/${lessonId}/Venue`).json<Venue | undefined>();
};

export const find = async (classroomId: string, lessonId: string): Promise<Lesson> => {
    return await apiClient.get(`Lessons/${classroomId}/${lessonId}`).json<Lesson>();
};

export const create = async (classroomId: string, lesson: Lesson): Promise<Lesson> => {
    return await apiClient.post(`Lessons/${classroomId}/`, { json: lesson }).json<Lesson>();
};

export const addVenue = async (classroomId: string, lessonId: string, venueId: string): Promise<Venue> => {
    return await apiClient.post(`Classrooms/${classroomId}/Venues/${venueId}/Lessons/${lessonId}`).json<Venue>();
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
    getVenue,
    find,
    create,
    addVenue,
    createAttendance,
    getAttendanceCode,
    getAttendees,
    getAttendance,
    deleteAttendance
};

export default lessons;