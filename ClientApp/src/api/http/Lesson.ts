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

const lessons = {
    get,
    find,
    create,
};

export default lessons;