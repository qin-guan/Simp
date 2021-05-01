import * as React from "react";
import { useCallback, useEffect, useState } from "react";

import { useParams } from "react-router";
import { Box, Flex, Heading, Spinner, } from "@chakra-ui/react";

import Classroom from "../../models/Classroom";
import LessonInstance from "../../models/Lesson";
import Status from "../../models/Status";
import LessonType from "../../models/LessonType";
import AssignmentInstance from "../../models/Assignment";
import SubmissionInstance from "../../models/Submission";

import classroomsApi from "../../api/http/classrooms";
import lessonsApi from "../../api/http/lessons";

import authorizationService from "../../oidc/AuthorizationService";

import AppNavBar from "../../components/app/AppNavBar";

const Assignment = (): React.ReactElement => {
    const {
        classroomId,
        lessonId,
        assignmentId
    } = useParams<{ classroomId: string; lessonId: string; assignmentId: string }>();

    const [isTeacher, setIsTeacher] = useState(false);
    const [classroom, setClassroom] = useState<Classroom>({ Id: "", Name: "" });
    const [lesson, setLesson] = useState<LessonInstance>({
        Id: "",
        Name: "",
        Description: "",
        LessonType: LessonType.InPerson,
        StartDate: 0,
        EndDate: 0,
        MeetingUri: "",
        Teachers: []
    });
    const [assignment, setAssignment] = useState<AssignmentInstance>({
        Id: "",
        Name: "",
        Description: "",
        DueDate: 0,
        Points: 0
    });
    const [submissions, setSubmissions] = useState<SubmissionInstance[]>([{
        Id: "",
        Link: "",
        Approved: false,
        ApprovalDescription: ""
    }]);
    const [status, setStatus] = useState(Status.Loading);

    const fetchSubmissions = useCallback(async () => {
        try {
            const submissions = await lessonsApi.getAssignmentSubmissions(classroomId, lessonId, assignmentId);
            setSubmissions(submissions);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId, assignmentId]);

    const fetchAssignment = useCallback(async () => {
        try {
            const assignment = await lessonsApi.findAssignment(classroomId, lessonId, assignmentId);
            setAssignment(assignment);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId, assignmentId]);

    const fetchClassroom = useCallback(async () => {
        try {
            const classroom = await classroomsApi.find(classroomId);
            setClassroom(classroom);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId]);

    const fetchLesson = useCallback(async () => {
        try {
            const lesson = await lessonsApi.find(classroomId, lessonId);
            const profile = await authorizationService.getUserProfile();
            if (lesson.Teachers.filter(t => t.Id === profile.sub).length > 0) {
                setIsTeacher(true);
            }

            setLesson(lesson);
        } catch {
            setStatus(Status.Error);
        }
    }, [classroomId, lessonId]);

    useEffect(() => {
        fetchClassroom();
        fetchLesson();
        fetchAssignment();
        fetchSubmissions();
        setStatus(Status.Done);
    }, [fetchClassroom, fetchLesson]);

    return (
        <Flex w={"full"} h={"full"} direction={"column"}>
            <AppNavBar breadcrumbs={[{ name: classroom.Name, path: `/app/classrooms/${classroomId}` }, {
                name: lesson.Name,
                path: `/app/classrooms/${classroomId}/lessons/${lessonId}`
            }, { name: assignment.Name, path: "#" }]}/>
            <Flex justifyContent={"center"} p={4} style={{ flex: 1 }}>
                {{
                    [Status.Loading]: <Spinner alignSelf={"center"}/>,
                    [Status.Empty]: (
                        <Flex direction={"column"} alignItems={"center"} alignSelf={"center"}>
                            <Heading size={"lg"}>This error was not supposed to happen</Heading>
                        </Flex>
                    ),
                    [Status.Error]: <Heading size={"lg"} alignSelf={"center"}>An unknown error occurred</Heading>,
                    [Status.Done]: (
                        <Flex>
                            done
                        </Flex>
                    )
                }[status]}
                {isTeacher && (
                    <Box borderWidth={1} borderRadius={"lg"} p={4} ml={5}>
                    </Box>
                )}
            </Flex>
        </Flex>
    );
};

export default Assignment;