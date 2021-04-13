import { apiClient } from "./Base";
import Lesson from "../../models/Lesson";

export const get = async (classroomId: string): Promise<Lesson[]> => {
    return await apiClient.get(`Lessons/${classroomId}/`).json<Lesson[]>();
};

export const find = async(classroomId: string, lessonId: string): Promise<Lesson> => {
    return await apiClient.get(`Lessons/${classroomId}/${lessonId}`).json<Lesson>();
};

export const create = async (classroomId: string, lesson: Lesson): Promise<Lesson> => {
    return await apiClient.post(`Lessons/${classroomId}/`, { json: lesson }).json<Lesson>();
};

export const getAttendanceCode = async (classroomId: string, lessonId: string): Promise<number> => {
    return await apiClient.get(`Lessons/${classroomId}/${lessonId}/attendance`).json<number>();
};

const lessons = {
    get,
    find,
    create,
    getAttendanceCode
};

export default lessons;