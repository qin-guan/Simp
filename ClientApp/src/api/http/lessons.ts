﻿import { apiClient } from "./base";
import Lesson from "../../models/Lesson";
import User from "../../models/User";
import Venue from "../../models/Venue";
import Assignment from "../../models/Assignment";
import Submission from "../../models/Submission";

export const get = async (classroomId: string): Promise<Lesson[]> => {
    return await apiClient.get(`Classrooms/${classroomId}/Lessons/`).json<Lesson[]>();
};

export const getVenue = async (classroomId: string, lessonId: string): Promise<Venue | undefined> => {
    const venue = await apiClient.get(`Classrooms/${classroomId}/Lessons/${lessonId}/Venue`).json<Venue>();
    if (!venue.Name) return;
    return venue;
};

export const find = async (classroomId: string, lessonId: string): Promise<Lesson> => {
    return await apiClient.get(`Classrooms/${classroomId}/Lessons/${lessonId}`).json<Lesson>();
};

export const findAssignment = async (classroomId: string, lessonId: string, assignmentId: string): Promise<Assignment> => {
    return await apiClient.get(`Classrooms/${classroomId}/Lessons/${lessonId}/Assignments/${assignmentId}`).json<Assignment>();
};

export const create = async (classroomId: string, lesson: Lesson): Promise<Lesson> => {
    return await apiClient.post(`Classrooms/${classroomId}/Lessons`, { json: lesson }).json<Lesson>();
};

export const addVenue = async (classroomId: string, lessonId: string, venueId: string): Promise<Venue> => {
    return await apiClient.post(`Classrooms/${classroomId}/Venues/${venueId}/Lessons/${lessonId}`).json<Venue>();
};

export const createAttendance = async (classroomId: string, lessonId: string, code: number): Promise<boolean> => {
    return await apiClient.post(`Classrooms/${classroomId}/Lessons/${lessonId}/Attendance`, { json: code }).json<boolean>();
};

export const createAssignment = async (classroomId: string, lessonId: string, assignment: Assignment): Promise<Assignment> => {
    return await apiClient.post(`Classrooms/${classroomId}/Lessons/${lessonId}/Assignments`, { json: assignment }).json<Assignment>();
};

export const getAttendanceCode = async (classroomId: string, lessonId: string): Promise<number> => {
    return await apiClient.get(`Classrooms/${classroomId}/Lessons/${lessonId}/Code`).json<number>();
};

export const getAttendees = async (classroomId: string, lessonId: string): Promise<User[]> => {
    return await apiClient.get(`Classrooms/${classroomId}/Lessons/${lessonId}/Attendees`).json<User[]>();
};

export const getAttendance = async (classroomId: string, lessonId: string): Promise<boolean> => {
    return await apiClient.get(`Classrooms/${classroomId}/Lessons/${lessonId}/Attendance`).json<boolean>();
};

export const deleteAttendance = async (classroomId: string, lessonId: string, userId: string): Promise<void> => {
    await apiClient.delete(`Classrooms/${classroomId}/Lessons/${lessonId}/Attendance`, { json: userId });
};

export const getAssignments = async (classroomId: string, lessonId: string): Promise<Assignment[]> => {
    return await apiClient.get(`Classrooms/${classroomId}/Lessons/${lessonId}/Assignments`).json<Assignment[]>();
};

export const getAssignmentSubmissions = async (classroomId: string, lessonId: string, assignmentId: string): Promise<Submission[]> => {
    return await apiClient.get(`Classrooms/${classroomId}/Lessons/${lessonId}/Assignments/${assignmentId}/Submissions`).json<Submission[]>();
};

const lessons = {
    get,
    getVenue,
    find,
    findAssignment,
    create,
    addVenue,
    createAttendance,
    createAssignment,
    getAttendanceCode,
    getAttendees,
    getAttendance,
    deleteAttendance,
    getAssignments,
    getAssignmentSubmissions
};

export default lessons;